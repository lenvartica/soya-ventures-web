import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { commissions, orders, products, users } from '@/db/schema';
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

    // Get user's commissions with order details
    const userCommissions = await db
      .select({
        id: commissions.id,
        userId: commissions.userId,
        orderId: commissions.orderId,
        amount: commissions.amount,
        type: commissions.type,
        referralUserId: commissions.referralUserId,
        createdAt: commissions.createdAt,
        orderTotal: orders.totalAmount,
        productName: products.name,
        referralUserName: users.fullName,
      })
      .from(commissions)
      .leftJoin(orders, eq(commissions.orderId, orders.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(commissions.referralUserId, users.id))
      .where(eq(commissions.userId, payload.userId))
      .orderBy(desc(commissions.createdAt));

    // Calculate total commissions
    const [totalStats] = await db
      .select({
        totalCommissions: sum(commissions.amount),
      })
      .from(commissions)
      .where(eq(commissions.userId, payload.userId));

    return NextResponse.json({
      commissions: userCommissions,
      totalCommissions: totalStats?.totalCommissions || 0,
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
