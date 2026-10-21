import { Brochure } from '../models/Brochure.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { saveBufferAsMedia } from './mediaController.js';
import path from 'path';

// Initial default brochures data for seeding if empty
export const defaultBrochuresSeed = [
  {
    title: 'Supplimed Comprehensive Medical & Diagnostic Product Catalogue',
    subtitle: 'Full 2026 Portfolio: Vacuum Blood Collection, Lab-ware & Cold-Chain Logistics',
    category: 'Master Catalogue',
    pages: 48,
    fileSize: '4.8 MB',
    format: 'PDF',
    fileUrl: '/images/hero-lab.jpg', // Default accessible URL until PDF is uploaded
    coverImage: '/images/hero-lab.jpg',
    featured: true,
    status: 'published',
    displayOrder: 1,
    description:
      'The comprehensive master catalogue detailing Supplimed’s complete diagnostic medical device range, automated ISO 13485 manufacturing lines, raw material grades, packaging dimensions, and worldwide ordering codes.',
    highlights: [
      'Complete Vacuum Blood Collection Tube specifications (K2/K3 EDTA, Clot Activator, Fluoride Oxalate, Gel Separator)',
      'Clinical Labware: Graduated centrifuge tubes (15ml & 50ml), urine containers, cryo vials',
      'Phase-change cold-chain transport solutions (Hemo Porter™ 2-8°C)',
      'Cleanroom production protocols and ISO 13485:2016 compliance standards'
    ],
    tableOfContents: [
      'Section 1: Corporate Profile & World-Class Cleanroom Facilities',
      'Section 2: Vacuum Blood Collection Tubes (HemoVac Plus™)',
      'Section 3: Specimen Transport & Temperature-Controlled Coolers',
      'Section 4: Precision Plasticware & Centrifuge Systems',
      'Section 5: Quality Assurance Protocols, Traceability & Certifications',
      'Section 6: Ordering Information, SKUs, and Custom OEM Manufacturing'
    ]
  },
  {
    title: 'HemoVac Plus™ Vacuum Blood Collection Tubes Technical Guide',
    subtitle: 'Clinical Phlebotomy Protocols, Draw Volumes & Inversion Standards',
    category: 'Blood Collection',
    pages: 20,
    fileSize: '3.2 MB',
    format: 'PDF',
    fileUrl: '/images/tubes.jpg',
    coverImage: '/images/tubes.jpg',
    featured: true,
    status: 'published',
    displayOrder: 2,
    description:
      'An exhaustive technical guide for laboratory directors and phlebotomists. Contains international color coding chart, draw volumes (1ml to 10ml), ultrasonic additive spray dispersion data, and centrifugation recommendations.',
    highlights: [
      'Detailed Inversion Protocol Matrix (EDTA: 8-10x, Clot Activator: 5-8x, Fluoride: 8-10x)',
      'Precision spray-coated additives avoiding sample dilution',
      'Medical-grade PET with low gas-permeation ensuring 18-month vacuum retention',
      'Compatibility with major automated clinical chemistry & hematology analyzers'
    ],
    tableOfContents: [
      '1. Overview of HemoVac Plus™ Engineering',
      '2. Additive Chemistry & Biochemical Mechanisms',
      '3. Color Coding Guide & International Cap Standards',
      '4. Draw Volume Accuracy & Vacuum Calibration',
      '5. Specimen Handling & Centrifugation RPM Chart',
      '6. Clinical Validation Reports & Interferences Study'
    ]
  },
  {
    title: 'Clinical Laboratory Plasticware & Centrifuge Labware Brochure',
    subtitle: 'High-G Centrifuge Conical Tubes, Specimen Containers & Liquid Handling',
    category: 'General Labware',
    pages: 16,
    fileSize: '2.6 MB',
    format: 'PDF',
    fileUrl: '/images/centrifuge.jpg',
    coverImage: '/images/centrifuge.jpg',
    featured: false,
    status: 'published',
    displayOrder: 3,
    description:
      'Engineered for maximum durability in high-speed clinical centrifuges. Highlights sterile polypropylene graduated 15ml & 50ml centrifuge tubes capable of withstanding up to 12,000 RCF, urine containers, and micro-tips.',
    highlights: [
      'Withstands high-velocity centrifugation up to 12,000 RCF without micro-cracking',
      'Leak-proof HDPE flat screw-caps with tight sealing ring',
      'Silk-screen white graduations with high-contrast writing windows',
      'Autoclavable at 121°C and freezable down to -80°C'
    ],
    tableOfContents: [
      '1. Materials Science: Ultra-Clear Polypropylene Resins',
      '2. 15ml & 50ml Conical Centrifuge Tubes',
      '3. Sterile & Non-Sterile Urine Collection Containers',
      '4. Cryovials & Microcentrifuge Tubes (0.5ml, 1.5ml, 2.0ml)',
      '5. Chemical Compatibility & Thermal Tolerance Tables'
    ]
  },
  {
    title: 'Hemo Porter™ Specimen Cold-Chain Transport System Technical Guide',
    subtitle: 'Diagnostic Specimen Logistics & Temperature Stability (2-8°C)',
    category: 'Cold Chain Logistics',
    pages: 12,
    fileSize: '2.1 MB',
    format: 'PDF',
    fileUrl: '/images/hemo-porter.jpg',
    coverImage: '/images/hemo-porter.jpg',
    featured: false,
    status: 'published',
    displayOrder: 4,
    description:
      'Complete thermal performance documentation for diagnostic specimen transport boxes. Demonstrates temperature retention curves during summer ambient conditions using high-density polyurethane and phase-change cool packs.',
    highlights: [
      'Guaranteed 2-8°C temperature maintenance up to 24 hours under 43°C ambient',
      'Drop-tested high-density outer shell with impact shock protection',
      'Custom sample tube racks preventing vial breakage or caps loosening',
      'Integrated external digital temperature indicator with max/min memory'
    ],
    tableOfContents: [
      '1. Introduction to Safe Biological Sample Logistics',
      '2. Thermal Insulation Engineering & Foam Density Specs',
      '3. Phase-Change Coolant Pack Pre-conditioning Guidelines',
      '4. Real-World Ambient Stress Test Graphs (24h to 48h)',
      '5. Cleaning, Disinfection & Maintenance Protocols'
    ]
  },
  {
    title: 'Manufacturing Excellence & Regulatory Compliance Portfolio',
    subtitle: 'ISO 13485:2016, ISO 9001:2015 & CDSCO Regulatory Dossier',
    category: 'Quality & Regulatory',
    pages: 14,
    fileSize: '1.9 MB',
    format: 'PDF',
    fileUrl: '/images/cleanroom.jpg',
    coverImage: '/images/cleanroom.jpg',
    featured: false,
    status: 'published',
    displayOrder: 5,
    description:
      'The complete quality assurance dossier for hospital procurement committees, NABH/NABL accredited diagnostic labs, and international medical device importers verifying our manufacturing compliance.',
    highlights: [
      'ISO 13485:2016 Medical Devices Quality Management System scope and certificate',
      'ISO 9001:2015 Quality Management System documentation',
      'Central Drugs Standard Control Organisation (CDSCO) manufacturing licenses',
      'Lot-to-lot bioburden testing, sterility assurance, and pneumatic leak validation'
    ],
    tableOfContents: [
      '1. Quality Policy & Corporate Vision',
      '2. ISO 13485:2016 & ISO 9001:2015 Certification Copies',
      '3. Class 100,000 Cleanroom Operational Protocols',
      '4. In-Process Quality Controls (IPQC) & Final QC Clearance',
      '5. Biological Safety & Pyrogen Testing Standards'
    ]
  }
];

// Helper to auto-seed if collection is empty
const ensureBrochuresSeeded = async () => {
  const count = await Brochure.countDocuments();
  if (count === 0) {
    for (const item of defaultBrochuresSeed) {
      await Brochure.create(item);
    }
  }
};

// Public: Get all published brochures
export const getPublicBrochures = async (req, res, next) => {
  try {
    await ensureBrochuresSeeded();

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
    await ensureBrochuresSeeded();

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
