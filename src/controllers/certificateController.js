import { Certificate } from '../models/Certificate.js';
import { logAuditAction } from '../utils/auditLogger.js';

// Public: Get all published certificates
export const getPublicCertificates = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    const certificates = await Certificate.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    // Extract unique categories for filter tabs
    const categories = await Certificate.distinct('category', { status: 'published' });

    res.status(200).json({
      success: true,
      certificates,
      categories: ['All', ...categories.filter(Boolean)]
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all certificates with pagination & filter
export const getAdminCertificates = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { certificateNumber: { $regex: search.trim(), $options: 'i' } },
        { issuingBody: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [certificates, total, publishedCount, draftCount] = await Promise.all([
      Certificate.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Certificate.countDocuments(query),
      Certificate.countDocuments({ status: 'published' }),
      Certificate.countDocuments({ status: 'draft' })
    ]);

    const allCategories = await Certificate.distinct('category');

    res.status(200).json({
      success: true,
      certificates,
      counts: {
        total,
        published: publishedCount,
        draft: draftCount
      },
      categories: allCategories.filter(Boolean),
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get single certificate
export const getAdminCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create certificate
export const createCertificate = async (req, res, next) => {
  try {
    const {
      title,
      certificateNumber,
      issuingBody,
      category,
      issueDate,
      expiryDate,
      fileUrl,
      fileType,
      thumbnailUrl,
      description,
      status,
      displayOrder,
      downloadable,
      featured
    } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Certificate title and certificate document/file URL are required.'
      });
    }

    const certificate = await Certificate.create({
      title: title.trim(),
      certificateNumber: (certificateNumber || '').trim(),
      issuingBody: (issuingBody || 'ISO / Regulatory Authority').trim(),
      category: (category || 'Quality Management').trim(),
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      fileUrl: fileUrl.trim(),
      fileType: fileType || (fileUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'),
      thumbnailUrl: (thumbnailUrl || fileUrl).trim(),
      description: (description || '').trim(),
      status: status || 'published',
      displayOrder: Number(displayOrder) || 0,
      downloadable: downloadable !== false,
      featured: Boolean(featured)
    });

    await logAuditAction({
      req,
      action: 'CERTIFICATE_CREATED',
      targetType: 'Certificate',
      targetId: certificate._id,
      details: { title: certificate.title, certificateNumber: certificate.certificateNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded and created successfully.',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update certificate
export const updateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.'
      });
    }

    const updatableFields = [
      'title',
      'certificateNumber',
      'issuingBody',
      'category',
      'issueDate',
      'expiryDate',
      'fileUrl',
      'fileType',
      'thumbnailUrl',
      'description',
      'status',
      'displayOrder',
      'downloadable',
      'featured'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        certificate[field] = req.body[field];
      }
    });

    await certificate.save();

    await logAuditAction({
      req,
      action: 'CERTIFICATE_UPDATED',
      targetType: 'Certificate',
      targetId: certificate._id,
      details: { title: certificate.title, status: certificate.status }
    });

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete certificate
export const deleteCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'CERTIFICATE_DELETED',
      targetType: 'Certificate',
      targetId: id,
      details: { title: certificate.title }
    });

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete certificates
export const bulkDeleteCertificates = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No certificate IDs provided.' });
    }
    const result = await Certificate.deleteMany({ _id: { $in: ids } });
    await logAuditAction({
      req,
      action: 'CERTIFICATES_BULK_DELETED',
      targetType: 'Certificate',
      details: { count: result.deletedCount, ids }
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} certificate(s) successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
