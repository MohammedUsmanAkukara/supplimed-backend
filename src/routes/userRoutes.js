import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers
} from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN', 'ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.post('/bulk-delete', bulkDeleteUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
