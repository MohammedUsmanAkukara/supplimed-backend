import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.get('/admin/all', requireAuth, getAdminProducts);
router.get('/admin/:id', requireAuth, getAdminProductById);
router.post('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), createProduct);
router.patch('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), updateProduct);
router.delete('/admin/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), deleteProduct);

export default router;
