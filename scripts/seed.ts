import 'dotenv/config';
import { db } from '../src/db';
import { users, products } from '../src/db/schema';
import { hashPassword, generateReferralCode } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('Admin123!');
    const [admin] = await db
      .insert(users)
      .values({
        email: 'admin@soyaventures.com',
        passwordHash: adminPassword,
        fullName: 'Admin User',
        role: 'admin',
        referralCode: 'ADMIN001',
        walletBalance: 0,
      })
      .returning();
    console.log('✅ Admin user created:', admin.email);

    // Create test user
    const userPassword = await hashPassword('User123!');
    const [testUser] = await db
      .insert(users)
      .values({
        email: 'user@soyaventures.com',
        passwordHash: userPassword,
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'user',
        referralCode: generateReferralCode(),
        walletBalance: 100,
      })
      .returning();
    console.log('✅ Test user created:', testUser.email);

    // Create sample products
    const sampleProducts = [
      {
        name: 'Premium Soy Protein Powder',
        description: 'High-quality soy protein isolate for muscle building and recovery. 2lb container.',
        price: 49.99,
        category: 'Supplements',
        stockQuantity: 100,
        commissionRate: 0.15,
        imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d26907f?w=400',
      },
      {
        name: 'Organic Soy Milk',
        description: 'Fresh, organic soy milk. Pack of 6 bottles (32oz each).',
        price: 24.99,
        category: 'Beverages',
        stockQuantity: 200,
        commissionRate: 0.10,
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      },
      {
        name: 'Soy Lecithin Capsules',
        description: 'Natural soy lecithin supplement for heart and brain health. 120 capsules.',
        price: 19.99,
        category: 'Supplements',
        stockQuantity: 150,
        commissionRate: 0.12,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      },
      {
        name: 'Soy-Based Energy Bars',
        description: 'Delicious, nutritious energy bars made with soy protein. Box of 12 bars.',
        price: 29.99,
        category: 'Snacks',
        stockQuantity: 180,
        commissionRate: 0.10,
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
      },
      {
        name: 'Soy Candle Set',
        description: 'Eco-friendly soy wax candles with natural fragrances. Set of 3 large candles.',
        price: 39.99,
        category: 'Home & Living',
        stockQuantity: 75,
        commissionRate: 0.15,
        imageUrl: 'https://images.unsplash.com/photo-1602874801006-47c1c3fdbb56?w=400',
      },
      {
        name: 'Soy Sauce Premium Set',
        description: 'Gourmet soy sauce collection. Includes 3 varieties (16oz each).',
        price: 34.99,
        category: 'Condiments',
        stockQuantity: 120,
        commissionRate: 0.10,
        imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log('✅ Product created:', product.name);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@soyaventures.com / Admin123!');
    console.log('User: user@soyaventures.com / User123!');
    console.log(`User Referral Code: ${testUser.referralCode}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
