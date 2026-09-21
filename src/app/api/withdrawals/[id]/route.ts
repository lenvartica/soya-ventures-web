import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, users, transactions } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const updateWithdrawalSchema = z.object({
  status: z.enum(['pending', 'approved', 'processing', 'completed', 'rejected']),
  adminNotes: z.string().optional(),
});

// PATCH - Update withdrawal status (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateWithdrawalSchema.parse(body);

    // Get the withdrawal
    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // If rejecting, refund the amount to user's wallet
    if (validatedData.status === 'rejected' && withdrawal.status === 'pending') {
      await db
        .update(users)
        .set({
          walletBalance: sql`${users.walletBalance} + ${withdrawal.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, withdrawal.userId));

      // Create refund transaction
      await db.insert(transactions).values({
        userId: withdrawal.userId,
        type: 'refund',
        amount: withdrawal.amount,
        description: `Refund for rejected withdrawal #${id.substring(0, 8)}`,
        referenceId: id,
      });
    }

    // Update withdrawal
    const [updatedWithdrawal] = await db
      .update(withdrawals)
      .set({
        status: validatedData.status,
        adminNotes: validatedData.adminNotes,
        processedAt: validatedData.status === 'completed' ? new Date() : undefined,
      })
      .where(eq(withdrawals.id, id))
      .returning();

    return NextResponse.json({ withdrawal: updatedWithdrawal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
