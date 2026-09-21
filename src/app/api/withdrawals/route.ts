import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { withdrawals, users, transactions } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const createWithdrawalSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  paymentDetails: z.string().min(1),
});

// GET - List withdrawals
export async function GET(request: NextRequest) {
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let userWithdrawals;

    if (payload.role === 'admin') {
      // Admin sees all withdrawals
      userWithdrawals = await db
        .select({
          id: withdrawals.id,
          userId: withdrawals.userId,
          amount: withdrawals.amount,
          status: withdrawals.status,
          paymentMethod: withdrawals.paymentMethod,
          paymentDetails: withdrawals.paymentDetails,
          adminNotes: withdrawals.adminNotes,
          createdAt: withdrawals.createdAt,
          processedAt: withdrawals.processedAt,
          userName: users.fullName,
          userEmail: users.email,
        })
        .from(withdrawals)
        .leftJoin(users, eq(withdrawals.userId, users.id))
        .orderBy(desc(withdrawals.createdAt));
    } else {
      // Regular users see only their withdrawals
      userWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.userId, payload.userId))
        .orderBy(desc(withdrawals.createdAt));
    }

    return NextResponse.json({ withdrawals: userWithdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create withdrawal request
export async function POST(request: NextRequest) {
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createWithdrawalSchema.parse(body);

    // Check minimum withdrawal amount
    if (validatedData.amount < 50) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is $50' },
        { status: 400 }
      );
    }

    // Get user's current balance
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (user.walletBalance < validatedData.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const [newWithdrawal] = await db
      .insert(withdrawals)
      .values({
        userId: payload.userId,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        paymentDetails: validatedData.paymentDetails,
      })
      .returning();

    // Deduct amount from wallet (pending withdrawal)
    await db
      .update(users)
      .set({
        walletBalance: sql`${users.walletBalance} - ${validatedData.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: payload.userId,
      type: 'withdrawal',
      amount: -validatedData.amount,
      description: `Withdrawal request #${newWithdrawal.id.substring(0, 8)}`,
      referenceId: newWithdrawal.id,
    });

    return NextResponse.json({ withdrawal: newWithdrawal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
