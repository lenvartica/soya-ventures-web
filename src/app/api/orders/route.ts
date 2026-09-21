import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, users, commissions, transactions } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const createOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(1),
});

// GET - List orders
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

    let userOrders;

    if (payload.role === 'admin') {
      // Admin sees all orders with joined user and product data
      userOrders = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          productId: orders.productId,
          quantity: orders.quantity,
          totalAmount: orders.totalAmount,
          status: orders.status,
          shippingAddress: orders.shippingAddress,
          trackingNumber: orders.trackingNumber,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          userName: users.fullName,
          userEmail: users.email,
          productName: products.name,
          productImageUrl: products.imageUrl,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(products, eq(orders.productId, products.id))
        .orderBy(desc(orders.createdAt));
    } else {
      // Regular users see only their orders
      userOrders = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          productId: orders.productId,
          quantity: orders.quantity,
          totalAmount: orders.totalAmount,
          status: orders.status,
          shippingAddress: orders.shippingAddress,
          trackingNumber: orders.trackingNumber,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          productName: products.name,
          productImageUrl: products.imageUrl,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .where(eq(orders.userId, payload.userId))
        .orderBy(desc(orders.createdAt));
    }

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new order
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
    const validatedData = createOrderSchema.parse(body);

    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    if (product.stockQuantity < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = product.price * validatedData.quantity;

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: payload.userId,
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        totalAmount,
        shippingAddress: validatedData.shippingAddress,
      })
      .returning();

    // Update product stock
    await db
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} - ${validatedData.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, validatedData.productId));

    // Calculate and create commissions
    const commissionAmount = totalAmount * product.commissionRate;

    // Direct commission for the buyer
    await db.insert(commissions).values({
      userId: payload.userId,
      orderId: newOrder.id,
      amount: commissionAmount,
      type: 'direct',
    });

    // Update buyer's wallet
    await db
      .update(users)
      .set({
        walletBalance: sql`${users.walletBalance} + ${commissionAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: payload.userId,
      type: 'commission',
      amount: commissionAmount,
      description: `Commission for order #${newOrder.id.substring(0, 8)}`,
      referenceId: newOrder.id,
    });

    // Check if buyer was referred
    const [buyer] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (buyer.referredBy) {
      // Referral bonus (5% of order amount)
      const referralBonus = totalAmount * 0.05;

      await db.insert(commissions).values({
        userId: buyer.referredBy,
        orderId: newOrder.id,
        amount: referralBonus,
        type: 'referral',
        referralUserId: payload.userId,
      });

      // Update referrer's wallet
      await db
        .update(users)
        .set({
          walletBalance: sql`${users.walletBalance} + ${referralBonus}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, buyer.referredBy));

      // Create transaction record for referrer
      await db.insert(transactions).values({
        userId: buyer.referredBy,
        type: 'referral_bonus',
        amount: referralBonus,
        description: `Referral bonus from order #${newOrder.id.substring(0, 8)}`,
        referenceId: newOrder.id,
      });
    }

    return NextResponse.json({ order: newOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
