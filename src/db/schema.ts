import { pgTable, text, timestamp, uuid, real, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRole = pgEnum('user_role', ['user', 'admin']);
export const orderStatus = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const transactionType = pgEnum('transaction_type', ['commission', 'referral_bonus', 'withdrawal', 'refund']);
export const withdrawalStatus = pgEnum('withdrawal_status', ['pending', 'approved', 'processing', 'completed', 'rejected']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  role: userRole('role').notNull().default('user'),
  referralCode: text('referral_code').unique(),
  referredBy: uuid('referred_by'),
  walletBalance: real('wallet_balance').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  imageUrl: text('image_url'),
  category: text('category').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  commissionRate: real('commission_rate').notNull().default(0.10), // 10% default
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  totalAmount: real('total_amount').notNull(),
  status: orderStatus('status').notNull().default('pending'),
  shippingAddress: text('shipping_address'),
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Commissions Table
export const commissions = pgTable('commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'direct', 'referral'
  referralUserId: uuid('referral_user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: transactionType('type').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  referenceId: text('reference_id'), // Order ID, Withdrawal ID, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Withdrawals Table
export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
  status: withdrawalStatus('status').notNull().default('pending'),
  paymentMethod: text('payment_method').notNull(),
  paymentDetails: text('payment_details').notNull(), // Account number, PayPal email, etc.
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
});

// Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'order', 'commission', 'withdrawal', 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type NewCommission = typeof commissions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type NewWithdrawal = typeof withdrawals.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
