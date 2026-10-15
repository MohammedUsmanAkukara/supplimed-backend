import express from 'express';
import {
  getPublicNavigation,
  getAdminNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  reorderNavigationItems
} from '../controllers/navigationController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public
router.get('/', getPublicNavigation);

// Admin
router.get('/admin/all', requireAuth, getAdminNavigation);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), createNavigationItem);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), updateNavigationItem);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deleteNavigationItem);
router.put('/admin/reorder', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), reorderNavigationItems);

export default router;
