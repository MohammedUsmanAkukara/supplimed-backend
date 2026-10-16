import express from 'express';
import {
  getPublicCertificates,
  getAdminCertificates,
  getAdminCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate
} from '../controllers/certificateController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPublicCertificates);

// Admin routes
router.get('/admin/all', requireAuth, getAdminCertificates);
router.get('/admin/:id', requireAuth, getAdminCertificateById);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), createCertificate);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), updateCertificate);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deleteCertificate);

export default router;
