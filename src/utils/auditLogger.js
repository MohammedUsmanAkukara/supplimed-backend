import { AuditLog } from '../models/AuditLog.js';

export const logAuditAction = async ({ req, user, action, targetType, targetId, details }) => {
  try {
    const actorUser = user || req?.user;
    const ipAddress = req?.ip || req?.headers['x-forwarded-for'] || '';

    await AuditLog.create({
      user: actorUser?._id || null,
      userName: actorUser?.name || 'System',
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      details: details || {},
      ipAddress
    });
  } catch (err) {
    console.error(`[AuditLog Error] Failed to record audit log: ${err.message}`);
  }
};
