import express from 'express';
import { login, logout, getSession, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/logout', requireAuth, logout);
router.get('/session', requireAuth, getSession);
router.patch('/profile', requireAuth, updateProfile);

export default router;
