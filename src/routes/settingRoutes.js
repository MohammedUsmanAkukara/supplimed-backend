import express from 'express';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
} from '../controllers/settingController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/', getPublicSettings);

// Admin
router.get('/admin', requireAuth, getAdminSettings);
router.patch('/admin', requireAuth, requireRole('SUPER_ADMIN'), updateAdminSettings);

export default router;
