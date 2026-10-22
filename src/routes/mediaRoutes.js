import express from 'express';
import multer from 'multer';
import {
  uploadMedia,
  uploadMediaBase64,
  getMediaList,
  getPublicGalleryMedia,
  updateMediaAlt,
  deleteMedia,
  bulkDeleteMedia
} from '../controllers/mediaController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const router = express.Router();

// Public: Gallery endpoint accessible without authentication
router.get('/public', getPublicGalleryMedia);

// Authenticated Admin Routes
router.use(requireAuth);

router.get('/', getMediaList);
router.post('/bulk-delete', requireRole('SUPER_ADMIN', 'ADMIN'), bulkDeleteMedia);

// Flexible Multer file upload (accepts any file field name like 'file', 'files', 'image')
router.post(
  '/upload',
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  upload.any(),
  uploadMedia
);

// Dedicated Base64 upload route
router.post(
  '/upload-base64',
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  uploadMediaBase64
);

router.patch('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), updateMediaAlt);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), deleteMedia);

export default router;
