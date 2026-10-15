import express from 'express';
import {
  getPageBySlug,
  getAdminPages,
  getAdminPageById,
  createPage,
  updatePage,
  deletePage
} from '../controllers/pageController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/:slug', getPageBySlug);

// Admin routes
router.get('/admin/all', requireAuth, getAdminPages);
router.get('/admin/:id', requireAuth, getAdminPageById);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), createPage);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), updatePage);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deletePage);

export default router;
