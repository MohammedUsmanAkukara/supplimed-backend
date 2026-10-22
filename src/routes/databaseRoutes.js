import express from 'express';
import { getDatabaseStats, truncateCollection } from '../controllers/databaseController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

router.get('/stats', getDatabaseStats);
router.post('/truncate', truncateCollection);

export default router;
