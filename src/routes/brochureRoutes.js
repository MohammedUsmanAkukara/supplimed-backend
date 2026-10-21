import express from 'express';
import multer from 'multer';
import {
  getPublicBrochures,
  trackBrochureDownload,
  getAdminBrochures,
  getAdminBrochureById,
  createBrochure,
  updateBrochure,
  deleteBrochure
} from '../controllers/brochureController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit for rich PDF catalogues
});

const uploadFields = upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'coverFile', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

const router = express.Router();

// Public Routes
router.get('/', getPublicBrochures);
router.post('/:id/download', trackBrochureDownload);

// Admin Routes (Protected)
router.get('/admin/all', requireAuth, getAdminBrochures);
router.get('/admin/:id', requireAuth, getAdminBrochureById);
router.post(
  '/admin',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  uploadFields,
  createBrochure
);
router.patch(
  '/admin/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  uploadFields,
  updateBrochure
);
router.delete(
  '/admin/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  deleteBrochure
);

export default router;
