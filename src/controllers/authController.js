import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { sendOtpResetEmail, sendPasswordChangedConfirmationEmail } from '../utils/mailer.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + config.cookieMaxAge),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token, // Also return in body for Authorization header flexibility
    user: user.toJSON()
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAuditAction({
      user,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email }
    });

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditAction({
        req,
        action: 'USER_LOGOUT',
        targetType: 'User',
        targetId: req.user._id
      });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toJSON()
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { name, currentPassword, newPassword, avatar } = req.body;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.'
        });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.'
        });
      }
      user.password = newPassword;
    }

    await user.save();

    await logAuditAction({
      req,
      action: 'PROFILE_UPDATED',
      targetType: 'User',
      targetId: user._id
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset OTP via Email
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No administrator account found with this email address.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact Super Administrator.'
      });
    }

    // Generate random 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    user.resetPasswordAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Send email via nodemailer
    try {
      await sendOtpResetEmail({
        to: user.email,
        name: user.name,
        otp
      });
    } catch (emailErr) {
      console.warn('[ForgotPassword Warning] Email dispatch failed:', emailErr.message);
      if (config.nodeEnv === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Failed to dispatch verification email. Please contact administrator.'
        });
      }
    }

    await logAuditAction({
      user,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email }
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}. Please check your inbox.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 6-digit OTP and Reset Password
 */
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, 6-digit OTP, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail })
      .select('+resetPasswordOtp +resetPasswordExpire +resetPasswordAttempts');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request or administrator not found.'
      });
    }

    // Check expiration
    if (!user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired. Please request a new code.'
      });
    }

    // Rate limiting: max 5 attempts
    if (user.resetPasswordAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // Compare OTP
    if (user.resetPasswordOtp !== cleanOtp) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: `Invalid 6-digit OTP code. (${5 - user.resetPasswordAttempts} attempts remaining)`
      });
    }

    // OTP matched! Update password and clear OTP
    user.password = newPassword; // Will be hashed by pre('save') hook
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    // Send confirmation email asynchronously
    sendPasswordChangedConfirmationEmail({
      to: user.email,
      name: user.name
    }).catch(() => {});

    await logAuditAction({
      user,
      action: 'PASSWORD_RESET_SUCCESSFUL',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};
