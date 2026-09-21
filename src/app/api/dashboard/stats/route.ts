import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, orders, commissions, products, withdrawals } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, count, sum, desc, sql } from 'drizzle-orm';

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

    if (payload.role === 'admin') {
      // Admin dashboard statistics
      const [userStats] = await db
        .select({
          totalUsers: count(),
        })
        .from(users);

      const [orderStats] = await db
        .select({
          totalOrders: count(),
          totalRevenue: sum(orders.totalAmount),
        })
        .from(orders);

      const [commissionStats] = await db
        .select({
          totalCommissions: sum(commissions.amount),
        })
        .from(commissions);

      const [productStats] = await db
        .select({
          totalProducts: count(),
        })
        .from(products)
        .where(eq(products.isActive, true));

      const [withdrawalStats] = await db
        .select({
          pendingWithdrawals: count(),
          totalPendingAmount: sum(withdrawals.amount),
        })
        .from(withdrawals)
        .where(eq(withdrawals.status, 'pending'));

      // Recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          totalAmount: orders.totalAmount,
          status: orders.status,
          createdAt: orders.createdAt,
          userName: users.fullName,
          productName: products.name,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(products, eq(orders.productId, products.id))
        .orderBy(desc(orders.createdAt))
        .limit(5);

      // Top products
      const topProducts = await db
        .select({
          productId: orders.productId,
          productName: products.name,
          totalOrders: count(),
          totalRevenue: sum(orders.totalAmount),
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .groupBy(orders.productId, products.name)
        .orderBy(desc(count()))
        .limit(5);

      return NextResponse.json({
        stats: {
          totalUsers: userStats?.totalUsers || 0,
          totalOrders: orderStats?.totalOrders || 0,
          totalRevenue: orderStats?.totalRevenue || 0,
          totalCommissions: commissionStats?.totalCommissions || 0,
          totalProducts: productStats?.totalProducts || 0,
          pendingWithdrawals: withdrawalStats?.pendingWithdrawals || 0,
          totalPendingAmount: withdrawalStats?.totalPendingAmount || 0,
        },
        recentOrders,
        topProducts,
      });
    } else {
      // User dashboard statistics
      const [user] = await db
        .select({
          walletBalance: users.walletBalance,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      const [orderStats] = await db
        .select({
          totalOrders: count(),
          totalSpent: sum(orders.totalAmount),
        })
        .from(orders)
        .where(eq(orders.userId, payload.userId));

      const [commissionStats] = await db
        .select({
          totalCommissions: sum(commissions.amount),
        })
        .from(commissions)
        .where(eq(commissions.userId, payload.userId));

      const [referralStats] = await db
        .select({
          totalReferrals: count(),
        })
        .from(users)
        .where(eq(users.referredBy, payload.userId));

      // Recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          totalAmount: orders.totalAmount,
          status: orders.status,
          createdAt: orders.createdAt,
          productName: products.name,
          productImageUrl: products.imageUrl,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .where(eq(orders.userId, payload.userId))
        .orderBy(desc(orders.createdAt))
        .limit(5);

      // Recent commissions
      const recentCommissions = await db
        .select({
          id: commissions.id,
          amount: commissions.amount,
          type: commissions.type,
          createdAt: commissions.createdAt,
        })
        .from(commissions)
        .where(eq(commissions.userId, payload.userId))
        .orderBy(desc(commissions.createdAt))
        .limit(5);

      return NextResponse.json({
        stats: {
          walletBalance: user?.walletBalance || 0,
          totalOrders: orderStats?.totalOrders || 0,
          totalSpent: orderStats?.totalSpent || 0,
          totalCommissions: commissionStats?.totalCommissions || 0,
          totalReferrals: referralStats?.totalReferrals || 0,
        },
        recentOrders,
        recentCommissions,
      });
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
