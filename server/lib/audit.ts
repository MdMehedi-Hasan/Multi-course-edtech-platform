import { prisma } from '../db/prisma.js';

export interface AuditLogOptions {
  actorId?: string;
  actorEmail: string;
  action: string;
  target: string;
  metadata?: Record<string, any> | string;
}

export async function recordAuditLog(options: AuditLogOptions) {
  try {
    const metadataStr = typeof options.metadata === 'object'
      ? JSON.stringify(options.metadata)
      : options.metadata || null;

    await prisma.auditLog.create({
      data: {
        actorId: options.actorId || null,
        actorEmail: options.actorEmail,
        action: options.action,
        target: options.target,
        metadata: metadataStr,
      },
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
