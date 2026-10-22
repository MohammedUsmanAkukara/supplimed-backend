import express from 'express';
import {
  createInquiry,
  getAdminInquiries,
  getAdminInquiryById,
  updateAdminInquiry,
  deleteAdminInquiry,
  bulkDeleteInquiries
} from '../controllers/inquiryController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { inquiryLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public submission
router.post('/', inquiryLimiter, createInquiry);

// Admin management
router.get('/admin/all', requireAuth, getAdminInquiries);
router.post('/admin/bulk-delete', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), bulkDeleteInquiries);
router.get('/admin/:id', requireAuth, getAdminInquiryById);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), updateAdminInquiry);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deleteAdminInquiry);

export default router;
