import { Brochure } from '../models/Brochure.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { saveBufferAsMedia } from './mediaController.js';
import path from 'path';

// Initial default brochures data for seeding if empty
export const defaultBrochuresSeed = [];

// Public: Get all published brochures
export const getPublicBrochures = async (req, res, next) => {
  try {

    const { category } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    const brochures = await Brochure.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: brochures.length,
      brochures
    });
  } catch (error) {
    next(error);
  }
};

// Public: Track Brochure download
export const trackBrochureDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brochure = await Brochure.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!brochure) {
      return res.status(404).json({
        success: false,
        message: 'Brochure not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Download tracked successfully.',
      downloadCount: brochure.downloadCount,
      fileUrl: brochure.fileUrl
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all brochures with pagination & filters
export const getAdminBrochures = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subtitle: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [brochures, total, totalDownloads] = await Promise.all([
      Brochure.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Brochure.countDocuments(query),
      Brochure.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }])
    ]);

    const categories = await Brochure.distinct('category');

    res.status(200).json({
      success: true,
      brochures,
      stats: {
        total,
        totalDownloads: totalDownloads[0]?.total || 0,
        categories
      },
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

// Admin: Get brochure by ID
export const getAdminBrochureById = async (req, res, next) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({
        success: false,
        message: 'Brochure not found.'
      });
    }

    res.status(200).json({
      success: true,
      brochure
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create new brochure (supports file upload or URL)
export const createBrochure = async (req, res, next) => {
  try {
    let {
      title,
      subtitle,
      category,
      fileUrl,
      coverImage,
      fileSize,
      pages,
      description,
      highlights,
      tableOfContents,
      status,
      featured,
      displayOrder
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brochure title is required.'
      });
    }

    // Process uploaded PDF file if provided via Multer
    const pdfFile = (req.files && (req.files.pdfFile?.[0] || req.files.file?.[0])) || req.file;
    if (pdfFile) {
      const media = await saveBufferAsMedia({
        buffer: pdfFile.buffer,
        originalname: pdfFile.originalname,
        mimetype: pdfFile.mimetype,
        size: pdfFile.size,
        altText: title,
        category: 'brochures',
        userId: req.user?._id
      });
      fileUrl = media.url;
      fileSize = `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const coverFile = req.files && req.files.coverFile?.[0];
    if (coverFile) {
      const cmedia = await saveBufferAsMedia({
        buffer: coverFile.buffer,
        originalname: coverFile.originalname,
        mimetype: coverFile.mimetype,
        size: coverFile.size,
        altText: `${title} Cover`,
        category: 'brochures',
        userId: req.user?._id
      });
      coverImage = cmedia.url;
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'A PDF file upload or direct PDF URL is required.'
      });
    }

    // Parse array fields if passed as JSON string
    let parsedHighlights = [];
    if (typeof highlights === 'string') {
      try {
        parsedHighlights = JSON.parse(highlights);
      } catch {
        parsedHighlights = highlights.split('\n').filter(Boolean);
      }
    } else if (Array.isArray(highlights)) {
      parsedHighlights = highlights;
    }

    let parsedToc = [];
    if (typeof tableOfContents === 'string') {
      try {
        parsedToc = JSON.parse(tableOfContents);
      } catch {
        parsedToc = tableOfContents.split('\n').filter(Boolean);
      }
    } else if (Array.isArray(tableOfContents)) {
      parsedToc = tableOfContents;
    }

    const brochure = await Brochure.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      category: category ? category.trim() : 'Master Catalogue',
      fileUrl: fileUrl.trim(),
      coverImage: coverImage ? coverImage.trim() : '/images/hero-lab.jpg',
      fileSize: fileSize || '3.5 MB',
      pages: Number(pages) || 1,
      description: description ? description.trim() : '',
      highlights: parsedHighlights,
      tableOfContents: parsedToc,
      status: status || 'published',
      featured: Boolean(featured),
      displayOrder: Number(displayOrder) || 0,
      uploadedBy: req.user?._id || null
    });

    await logAuditAction({
      req,
      action: 'BROCHURE_CREATED',
      targetType: 'Brochure',
      targetId: brochure._id,
      details: { title: brochure.title, category: brochure.category }
    });

    res.status(201).json({
      success: true,
      message: 'Brochure created successfully.',
      brochure
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update brochure
export const updateBrochure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brochure = await Brochure.findById(id);

    if (!brochure) {
      return res.status(404).json({
        success: false,
        message: 'Brochure not found.'
      });
    }

    let {
      title,
      subtitle,
      category,
      fileUrl,
      coverImage,
      fileSize,
      pages,
      description,
      highlights,
      tableOfContents,
      status,
      featured,
      displayOrder
    } = req.body;

    // Process new uploaded files if any
    const pdfFile = (req.files && (req.files.pdfFile?.[0] || req.files.file?.[0])) || req.file;
    if (pdfFile) {
      const media = await saveBufferAsMedia({
        buffer: pdfFile.buffer,
        originalname: pdfFile.originalname,
        mimetype: pdfFile.mimetype,
        size: pdfFile.size,
        altText: title || brochure.title,
        category: 'brochures',
        userId: req.user?._id
      });
      fileUrl = media.url;
      fileSize = `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const coverFile = req.files && req.files.coverFile?.[0];
    if (coverFile) {
      const cmedia = await saveBufferAsMedia({
        buffer: coverFile.buffer,
        originalname: coverFile.originalname,
        mimetype: coverFile.mimetype,
        size: coverFile.size,
        altText: `${title || brochure.title} Cover`,
        category: 'brochures',
        userId: req.user?._id
      });
      coverImage = cmedia.url;
    }

    if (title !== undefined) brochure.title = title.trim();
    if (subtitle !== undefined) brochure.subtitle = subtitle.trim();
    if (category !== undefined) brochure.category = category.trim();
    if (fileUrl !== undefined) brochure.fileUrl = fileUrl.trim();
    if (coverImage !== undefined) brochure.coverImage = coverImage.trim();
    if (fileSize !== undefined) brochure.fileSize = fileSize;
    if (pages !== undefined) brochure.pages = Number(pages);
    if (description !== undefined) brochure.description = description.trim();
    if (status !== undefined) brochure.status = status;
    if (featured !== undefined) brochure.featured = Boolean(featured);
    if (displayOrder !== undefined) brochure.displayOrder = Number(displayOrder);

    if (highlights !== undefined) {
      if (typeof highlights === 'string') {
        try {
          brochure.highlights = JSON.parse(highlights);
        } catch {
          brochure.highlights = highlights.split('\n').filter(Boolean);
        }
      } else if (Array.isArray(highlights)) {
        brochure.highlights = highlights;
      }
    }

    if (tableOfContents !== undefined) {
      if (typeof tableOfContents === 'string') {
        try {
          brochure.tableOfContents = JSON.parse(tableOfContents);
        } catch {
          brochure.tableOfContents = tableOfContents.split('\n').filter(Boolean);
        }
      } else if (Array.isArray(tableOfContents)) {
        brochure.tableOfContents = tableOfContents;
      }
    }

    await brochure.save();

    await logAuditAction({
      req,
      action: 'BROCHURE_UPDATED',
      targetType: 'Brochure',
      targetId: brochure._id,
      details: { title: brochure.title, category: brochure.category }
    });

    res.status(200).json({
      success: true,
      message: 'Brochure updated successfully.',
      brochure
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete brochure
export const deleteBrochure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brochure = await Brochure.findByIdAndDelete(id);

    if (!brochure) {
      return res.status(404).json({
        success: false,
        message: 'Brochure not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'BROCHURE_DELETED',
      targetType: 'Brochure',
      targetId: id,
      details: { title: brochure.title }
    });

    res.status(200).json({
      success: true,
      message: 'Brochure deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete brochures
export const bulkDeleteBrochures = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No brochure IDs provided.' });
    }
    const result = await Brochure.deleteMany({ _id: { $in: ids } });
    await logAuditAction({
      req,
      action: 'BROCHURES_BULK_DELETED',
      targetType: 'Brochure',
      details: { count: result.deletedCount, ids }
    });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} brochure(s) successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
