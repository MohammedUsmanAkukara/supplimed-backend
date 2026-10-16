import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Page } from '../models/Page.js';
import { Inquiry } from '../models/Inquiry.js';
import { Media } from '../models/Media.js';
import { AuditLog } from '../models/AuditLog.js';
import { Certificate } from '../models/Certificate.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      publishedProducts,
      draftProducts,
      totalCategories,
      totalPages,
      totalInquiries,
      newInquiries,
      inProgressInquiries,
      resolvedInquiries,
      totalMedia,
      totalCertificates,
      recentInquiries,
      recentProducts,
      recentActivity
    ] = await Promise.all([
      Product.countDocuments({ status: 'published' }),
      Product.countDocuments({ status: 'draft' }),
      Category.countDocuments(),
      Page.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments({ status: 'in_progress' }),
      Inquiry.countDocuments({ status: 'resolved' }),
      Media.countDocuments(),
      Certificate.countDocuments(),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find().populate('category', 'name').sort({ updatedAt: -1 }).limit(5).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).lean()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        products: {
          published: publishedProducts,
          draft: draftProducts,
          total: publishedProducts + draftProducts
        },
        categories: totalCategories,
        pages: totalPages,
        inquiries: {
          total: totalInquiries,
          new: newInquiries,
          inProgress: inProgressInquiries,
          resolved: resolvedInquiries
        },
        media: totalMedia,
        certificates: totalCertificates,
        analyticsStatus: 'Not Connected (Google Analytics ID not configured in settings)'
      },
      recentInquiries,
      recentProducts,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
