import { Inquiry } from '../models/Inquiry.js';
import { logAuditAction } from '../utils/auditLogger.js';

const generateReference = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SUP-${year}${month}-${random}`;
};

// Public: Submit enquiry
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, company, interest, message, honeypot, source, productId } = req.body;

    // Honeypot spam check: if filled, quietly reject or mark as spam
    if (honeypot) {
      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been received.',
        reference: generateReference()
      });
    }

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required.'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const reference = generateReference();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';

    const inquiry = await Inquiry.create({
      reference,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: (company || '').trim(),
      interest: interest || 'general',
      message: message.trim(),
      source: source || 'contact_page',
      product: productId || null,
      ipAddress,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received successfully. Our team will contact you shortly.',
      reference: inquiry.reference
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all inquiries
export const getAdminInquiries = async (req, res, next) => {
  try {
    const { status, interest, search, page = 1, limit = 20, sort = 'createdAt_desc' } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (interest && interest !== 'all') {
      query.interest = interest;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
        { reference: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [inquiries, total, newCount] = await Promise.all([
      Inquiry.find(query)
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Inquiry.countDocuments(query),
      Inquiry.countDocuments({ status: 'new' })
    ]);

    res.status(200).json({
      success: true,
      inquiries,
      newCount,
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

// Admin: Get inquiry by ID
export const getAdminInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('product', 'name slug featuredImage');
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    res.status(200).json({
      success: true,
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update inquiry status and add notes
export const updateAdminInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, noteText } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    if (status && ['new', 'in_progress', 'resolved', 'spam'].includes(status)) {
      inquiry.status = status;
    }

    if (noteText && noteText.trim()) {
      inquiry.adminNotes.push({
        text: noteText.trim(),
        author: req.user.name,
        createdAt: new Date()
      });
    }

    await inquiry.save();

    await logAuditAction({
      req,
      action: 'INQUIRY_UPDATED',
      targetType: 'Inquiry',
      targetId: inquiry._id,
      details: { reference: inquiry.reference, status: inquiry.status }
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully.',
      inquiry
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete inquiry
export const deleteAdminInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    await logAuditAction({
      req,
      action: 'INQUIRY_DELETED',
      targetType: 'Inquiry',
      targetId: id,
      details: { reference: inquiry.reference }
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
