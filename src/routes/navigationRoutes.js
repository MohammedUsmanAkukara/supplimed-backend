import express from 'express';
import {
  getPublicNavigation,
  getAdminNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  bulkDeleteNavigationItems,
  reorderNavigationItems
} from '../controllers/navigationController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/', getPublicNavigation);

// Admin (Super Admin exclusive)
router.get('/admin/all', requireAuth, requireRole('SUPER_ADMIN'), getAdminNavigation);
router.post('/admin/bulk-delete', requireAuth, requireRole('SUPER_ADMIN'), bulkDeleteNavigationItems);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN'), createNavigationItem);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN'), updateNavigationItem);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN'), deleteNavigationItem);
router.put('/admin/reorder', requireAuth, requireRole('SUPER_ADMIN'), reorderNavigationItems);

export default router;
