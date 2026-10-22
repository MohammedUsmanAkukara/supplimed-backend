import { Media } from '../models/Media.js';
import { uploadMediaStream, deleteMediaAsset } from '../config/cloudinary.js';
import { logAuditAction } from '../utils/auditLogger.js';
import path from 'path';

// Helper to save a file buffer to storage and create a Media document
export const saveBufferAsMedia = async ({
  buffer,
  originalname,
  mimetype,
  size,
  altText,
  category,
  caption,
  userId
}) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf'
  ];

  const resolvedMime = mimetype || 'image/png';
  if (!allowedTypes.includes(resolvedMime)) {
    throw new Error('Unsupported file type. Only JPEG, PNG, WebP, SVG, GIF, and PDF are allowed.');
  }

  const rawExt = path.extname(originalname || '').toLowerCase();
  const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf'
  };
  const ext = rawExt || extMap[resolvedMime] || '.png';
  const safeOriginalName = originalname
    ? originalname
    : `upload-${Date.now()}${ext}`;

  const result = await uploadMediaStream(buffer, {
    resourceType: resolvedMime.startsWith('image/') ? 'image' : 'raw',
    ext
  });

  const validCategories = [
    'general',
    'products',
    'facilities',
    'lab',
    'certifications',
    'brochures',
    'documents'
  ];
  const normalizedCategory =
    category && typeof category === 'string' && validCategories.includes(category.toLowerCase().trim())
      ? category.toLowerCase().trim()
      : 'general';

  const media = await Media.create({
    originalName: safeOriginalName,
    storageKey: result.storageKey,
    url: result.url,
    provider: result.provider,
    mimeType: resolvedMime,
    size: size || buffer.length,
    dimensions: {
      width: result.width || 0,
      height: result.height || 0
    },
    altText: altText || safeOriginalName.split('.')[0],
    caption: caption || '',
    category: normalizedCategory,
    uploadedBy: userId || null
  });

  return media;
};

// Helper to parse Base64 string into buffer and metadata
export const parseBase64 = (base64String, fallbackName = 'upload.png') => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid or empty Base64 string.');
  }

  let mimeType = 'image/png';
  let buffer;

  const matches = base64String.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // Raw Base64 string without data URI prefix
    buffer = Buffer.from(base64String, 'base64');
  }

  const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg'
  };
  const ext = extMap[mimeType] || '.png';
  const nameBase = fallbackName.includes('.')
    ? fallbackName.substring(0, fallbackName.lastIndexOf('.'))
    : fallbackName;
  const originalname = `${nameBase}${ext}`;

  return { buffer, mimeType, originalname, size: buffer.length };
};

// Multer & General Upload Handler (Supports single file, array of files, or Base64 payload)
export const uploadMedia = async (req, res, next) => {
  try {
    const { altText, category, caption, base64, image } = req.body;
    const userId = req.user?._id || null;

    // 1. Check if files are uploaded via Multer
    let filesToProcess = [];
    if (req.file) {
      filesToProcess.push(req.file);
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        filesToProcess = req.files;
      } else {
        // req.files is an object of fields e.g. { file: [...], files: [...] }
        Object.values(req.files).forEach((arr) => {
          if (Array.isArray(arr)) filesToProcess.push(...arr);
        });
      }
    }

    if (filesToProcess.length > 0) {
      const createdMediaList = [];
      for (const f of filesToProcess) {
        const media = await saveBufferAsMedia({
          buffer: f.buffer,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          altText: altText || f.originalname.split('.')[0],
          category,
          caption,
          userId
        });
        createdMediaList.push(media);

        await logAuditAction({
          req,
          action: 'MEDIA_UPLOADED',
          targetType: 'Media',
          targetId: media._id,
          details: { filename: media.originalName, url: media.url, provider: media.provider }
        });
      }

      return res.status(201).json({
        success: true,
        message: filesToProcess.length === 1 ? 'File uploaded successfully.' : `${filesToProcess.length} files uploaded successfully.`,
        media: createdMediaList.length === 1 ? createdMediaList[0] : createdMediaList,
        items: createdMediaList
      });
    }

    // 2. Check if Base64 string was sent instead
    const base64Data = base64 || image;
    if (base64Data) {
      const { buffer, mimeType, originalname, size } = parseBase64(
        base64Data,
        req.body.originalName || `base64-upload-${Date.now()}`
      );

      const media = await saveBufferAsMedia({
        buffer,
        originalname,
        mimetype: mimeType,
        size,
        altText,
        category,
        caption,
        userId
      });

      await logAuditAction({
        req,
        action: 'MEDIA_UPLOADED_BASE64',
        targetType: 'Media',
        targetId: media._id,
        details: { filename: media.originalName, url: media.url }
      });

      return res.status(201).json({
        success: true,
        message: 'Base64 image uploaded successfully.',
        media
      });
    }

    return res.status(400).json({
      success: false,
      message: 'No file or Base64 image payload provided.'
    });
  } catch (error) {
    next(error);
  }
};

// Dedicated Base64 upload controller
export const uploadMediaBase64 = async (req, res, next) => {
  try {
    const { base64, image, originalName, altText, category, caption } = req.body;
    const base64Content = base64 || image;

    if (!base64Content) {
      return res.status(400).json({
        success: false,
        message: 'Base64 image string is required.'
      });
    }

    const { buffer, mimeType, originalname, size } = parseBase64(
      base64Content,
      originalName || `image-${Date.now()}`
    );

    const media = await saveBufferAsMedia({
      buffer,
      originalname,
      mimetype: mimeType,
      size,
      altText,
      category,
      caption,
      userId: req.user?._id || null
    });

    await logAuditAction({
      req,
      action: 'MEDIA_UPLOADED_BASE64',
      targetType: 'Media',
      targetId: media._id,
      details: { filename: media.originalName, url: media.url }
    });

    res.status(201).json({
      success: true,
      message: 'Base64 image uploaded and processed successfully.',
      media
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get paginated media list with search & category filters
export const getMediaList = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 30 } = req.query;

    const query = {};
    if (search && search.trim()) {
      query.$or = [
        { originalName: { $regex: search.trim(), $options: 'i' } },
        { altText: { $regex: search.trim(), $options: 'i' } },
        { caption: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [media, total] = await Promise.all([
      Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Media.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      media,
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

// Public: Gallery endpoint for public website
export const getPublicGalleryMedia = async (req, res, next) => {
  try {
    const { category, limit = 50 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('originalName url altText caption category dimensions createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: media.length,
      media
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update media alt text, category, caption
export const updateMediaAlt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { altText, category, caption } = req.body;

    const updates = {};
    if (altText !== undefined) updates.altText = altText;
    if (category !== undefined) {
      const validCategories = [
        'general',
        'products',
        'facilities',
        'lab',
        'certifications',
        'brochures',
        'documents'
      ];
      updates.category =
        category && typeof category === 'string' && validCategories.includes(category.toLowerCase().trim())
          ? category.toLowerCase().trim()
          : 'general';
    }
    if (caption !== undefined) updates.caption = caption;

    const media = await Media.findByIdAndUpdate(id, updates, { new: true });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Media details updated successfully.',
      media
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete media asset
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.'
      });
    }

    // Delete from storage
    try {
      await deleteMediaAsset(media.storageKey, media.provider);
    } catch (storageErr) {
      console.warn(`[Media Delete Warning] Could not delete from storage provider: ${storageErr.message}`);
    }

    await Media.findByIdAndDelete(id);

    await logAuditAction({
      req,
      action: 'MEDIA_DELETED',
      targetType: 'Media',
      targetId: id,
      details: { filename: media.originalName }
    });

    res.status(200).json({
      success: true,
      message: 'Media asset deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk delete media
export const bulkDeleteMedia = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No media IDs provided.' });
    }

    const items = await Media.find({ _id: { $in: ids } });
    for (const m of items) {
      try {
        await deleteMediaAsset(m.storageKey, m.provider);
      } catch (err) {
        // Continue
      }
    }

    const result = await Media.deleteMany({ _id: { $in: ids } });
    await logAuditAction({
      req,
      action: 'MEDIA_BULK_DELETED',
      targetType: 'Media',
      details: { count: result.deletedCount, ids }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} media asset(s) successfully.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
