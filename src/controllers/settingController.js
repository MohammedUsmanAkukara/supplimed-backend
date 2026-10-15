import { Setting } from '../models/Setting.js';
import { logAuditAction } from '../utils/auditLogger.js';

// Public settings (safe fields only)
export const getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global_settings' }).lean();

    if (!settings) {
      settings = await Setting.create({ key: 'global_settings' });
    }

    // Return only public safe fields
    const safeSettings = {
      websiteName: settings.websiteName,
      websiteTitle: settings.websiteTitle,
      tagline: settings.tagline,
      websiteUrl: settings.websiteUrl,
      logo: settings.logo,
      alternateLogo: settings.alternateLogo,
      favicon: settings.favicon,
      themeColor: settings.themeColor,
      defaultSeoTitle: settings.defaultSeoTitle,
      defaultMetaDescription: settings.defaultMetaDescription,
      defaultKeywords: settings.defaultKeywords,
      defaultOgImage: settings.defaultOgImage,
      canonicalBaseUrl: settings.canonicalBaseUrl,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      socialLinks: settings.socialLinks,
      analytics: {
        isEnabled: settings.analytics?.isEnabled,
        googleAnalyticsId: settings.analytics?.isEnabled ? settings.analytics?.googleAnalyticsId : ''
      }
    };

    res.status(200).json({
      success: true,
      settings: safeSettings
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all settings
export const getAdminSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await Setting.create({ key: 'global_settings' });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update settings
export const updateAdminSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new Setting({ key: 'global_settings' });
    }

    // Allow updating only valid configurable fields
    const allowedFields = [
      'websiteName',
      'websiteTitle',
      'tagline',
      'websiteUrl',
      'logo',
      'alternateLogo',
      'favicon',
      'themeColor',
      'defaultSeoTitle',
      'defaultMetaDescription',
      'defaultKeywords',
      'defaultOgImage',
      'canonicalBaseUrl',
      'contactEmail',
      'contactPhone',
      'address',
      'socialLinks',
      'analytics',
      'maintenanceMode'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    await logAuditAction({
      req,
      action: 'SETTINGS_UPDATED',
      targetType: 'Setting',
      targetId: settings._id
    });

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully.',
      settings
    });
  } catch (error) {
    next(error);
  }
};
