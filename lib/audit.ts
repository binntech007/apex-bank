// lib/audit.ts
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

export async function logSecurityEvent(userId: string, action: string, req?: Request) {
  try {
    // Extract real IP and User-Agent if request object is available
    const ipAddress = req?.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req?.headers.get('user-agent') || 'Unknown Client';

    
    await db.insert(auditLogs).values({
      userId,
      action,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}