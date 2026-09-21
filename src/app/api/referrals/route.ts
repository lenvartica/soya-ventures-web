import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, commissions, orders } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';

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

    // Get user's referral code
    const [user] = await db
      .select({
        referralCode: users.referralCode,
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

    // Get referred users
    const referredUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.referredBy, payload.userId))
      .orderBy(desc(users.createdAt));

    // Get referral statistics
    const referralStats = await Promise.all(
      referredUsers.map(async (referredUser) => {
        // Count orders by this referred user
        const [orderStats] = await db
          .select({
            totalOrders: count(),
          })
          .from(orders)
          .where(eq(orders.userId, referredUser.id));

        // Sum commissions from this referred user
        const [commissionStats] = await db
          .select({
            totalCommissions: sum(commissions.amount),
          })
          .from(commissions)
          .where(
            and(
              eq(commissions.userId, payload.userId),
              eq(commissions.referralUserId, referredUser.id)
            )
          );

        return {
          ...referredUser,
          totalOrders: orderStats?.totalOrders || 0,
          totalCommissions: commissionStats?.totalCommissions || 0,
        };
      })
    );

    // Calculate overall stats
    const [overallStats] = await db
      .select({
        totalReferralCommissions: sum(commissions.amount),
      })
      .from(commissions)
      .where(
        and(
          eq(commissions.userId, payload.userId),
          eq(commissions.type, 'referral')
        )
      );

    return NextResponse.json({
      referralCode: user.referralCode,
      referredUsers: referralStats,
      totalReferrals: referredUsers.length,
      totalReferralCommissions: overallStats?.totalReferralCommissions || 0,
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
