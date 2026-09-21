import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Find referrer if referral code provided
    let referrerId: string | null = null;
    if (validatedData.referralCode) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, validatedData.referralCode))
        .limit(1);

      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(validatedData.password);
    const userReferralCode = generateReferralCode();

    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        referralCode: userReferralCode,
        referredBy: referrerId,
      })
      .returning();

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        referralCode: newUser.referralCode,
        walletBalance: newUser.walletBalance,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
