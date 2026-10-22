import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Certificate } from '../models/Certificate.js';
import { Brochure } from '../models/Brochure.js';
import { Inquiry } from '../models/Inquiry.js';
import { Media } from '../models/Media.js';
import { Page } from '../models/Page.js';
import { Navigation } from '../models/Navigation.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { Setting } from '../models/Setting.js';
import { logAuditAction } from '../utils/auditLogger.js';

export const getDatabaseStats = async (req, res, next) => {
  try {
    const [
      products,
      categories,
      certificates,
      brochures,
      inquiries,
      media,
      pages,
      navigation,
      auditLogs,
      users
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Certificate.countDocuments(),
      Brochure.countDocuments(),
      Inquiry.countDocuments(),
      Media.countDocuments(),
      Page.countDocuments(),
      Navigation.countDocuments(),
      AuditLog.countDocuments(),
      User.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        products,
        categories,
        certificates,
        brochures,
        inquiries,
        media,
        pages,
        navigation,
        audit_logs: auditLogs,
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

export const truncateCollection = async (req, res, next) => {
  try {
    const { target } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Target collection name or "all" is required.'
      });
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only Super Administrators can truncate database tables.'
      });
    }

    const deletedCounts = {};

    if (target === 'products' || target === 'all') {
      const res = await Product.deleteMany({});
      deletedCounts.products = res.deletedCount;
    }

    if (target === 'categories' || target === 'all') {
      const res = await Category.deleteMany({});
      deletedCounts.categories = res.deletedCount;
    }

    if (target === 'certificates' || target === 'all') {
      const res = await Certificate.deleteMany({});
      deletedCounts.certificates = res.deletedCount;
    }

    if (target === 'brochures' || target === 'all') {
      const res = await Brochure.deleteMany({});
      deletedCounts.brochures = res.deletedCount;
    }

    if (target === 'inquiries' || target === 'all') {
      const res = await Inquiry.deleteMany({});
      deletedCounts.inquiries = res.deletedCount;
    }

    if (target === 'media' || target === 'all') {
      const res = await Media.deleteMany({});
      deletedCounts.media = res.deletedCount;
    }

    if (target === 'pages' || target === 'all') {
      const res = await Page.deleteMany({});
      deletedCounts.pages = res.deletedCount;
    }

    if (target === 'navigation' || target === 'all') {
      const res = await Navigation.deleteMany({});
      deletedCounts.navigation = res.deletedCount;
    }

    if (target === 'audit_logs' || target === 'all') {
      const res = await AuditLog.deleteMany({});
      deletedCounts.audit_logs = res.deletedCount;
    }

    if (target === 'users') {
      // Delete non-super-admins and users other than current caller
      const res = await User.deleteMany({
        role: { $ne: 'SUPER_ADMIN' },
        _id: { $ne: req.user._id }
      });
      deletedCounts.users = res.deletedCount;
    }

    await logAuditAction({
      req,
      action: target === 'all' ? 'DATABASE_FULL_TRUNCATE' : 'DATABASE_COLLECTION_TRUNCATED',
      targetType: 'Database',
      details: { target, deletedCounts }
    });

    res.status(200).json({
      success: true,
      message: target === 'all'
        ? 'All database business collections have been successfully truncated.'
        : `Collection "${target}" truncated successfully.`,
      deletedCounts
    });
  } catch (error) {
    next(error);
  }
};
