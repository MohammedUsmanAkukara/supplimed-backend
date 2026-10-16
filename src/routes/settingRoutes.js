import express from 'express';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
  testSmtpSettings
} from '../controllers/settingController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/', getPublicSettings);

// Admin
router.get('/admin', requireAuth, getAdminSettings);
router.patch('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), updateAdminSettings);
router.post('/admin/test-email', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), testSmtpSettings);

export default router;
