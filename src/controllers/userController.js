import { User } from '../models/User.js';
import { logAuditAction } from '../utils/auditLogger.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'ADMIN'
    });

    await logAuditAction({
      req,
      action: 'USER_CREATED',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;

    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Protect against self-demotion or self-deactivation
    if (String(user._id) === String(req.user._id)) {
      if (role && role !== user.role) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role.'
        });
      }
      if (isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account.'
        });
      }
    }

    if (name) user.name = name;
    if (role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = !!isActive;
    if (password && password.length >= 8) user.password = password;

    await user.save();

    await logAuditAction({
      req,
      action: 'USER_UPDATED',
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, role: user.role, isActive: user.isActive }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    const superAdminCount = await User.countDocuments({ role: 'SUPER_ADMIN' });
    const target = await User.findById(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (target.role === 'SUPER_ADMIN' && superAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only Super Administrator.'
      });
    }

    await User.findByIdAndDelete(id);

    await logAuditAction({
      req,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: id,
      details: { email: target.email }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
