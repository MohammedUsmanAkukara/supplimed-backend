import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', requireAuth, getAdminCategories);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), createCategory);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), updateCategory);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deleteCategory);

export default router;
