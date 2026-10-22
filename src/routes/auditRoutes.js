import express from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN', 'ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action, targetType } = req.query;

    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/bulk-delete', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No audit log IDs provided.' });
    }
    const result = await AuditLog.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} audit log(s).`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

export default router;
