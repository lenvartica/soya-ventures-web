import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, transactions } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, desc, sum } from 'drizzle-orm';

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

    // Get user's current balance
    const [user] = await db
      .select({
        walletBalance: users.walletBalance,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, payload.userId))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // Calculate total earnings and withdrawals
    const stats = await db
      .select({
        totalEarnings: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.userId, payload.userId));

    return NextResponse.json({
      balance: user.walletBalance,
      transactions: recentTransactions,
      stats: stats[0] || { totalEarnings: 0 },
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
