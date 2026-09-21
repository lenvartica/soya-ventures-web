# Soya Ventures - Setup Guide

## Quick Start (5 Minutes)

### 1. Prerequisites Check
Ensure you have:
- ✅ Node.js 18 or higher
- ✅ PostgreSQL installed and running
- ✅ npm or yarn package manager

### 2. Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

### 3. Access the Application

Open your browser to: `http://localhost:3000`

### 4. Test Login

**Admin Dashboard:**
- Email: `admin@soyaventures.com`
- Password: `Admin123!`

**User Account:**
- Email: `user@soyaventures.com`
- Password: `User123!`

## Detailed Setup

### Environment Configuration

The `.env` file is pre-configured for local development:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=soya-ventures-secret-key-change-in-production
```

**For Production:**
- Change `JWT_SECRET` to a strong random string
- Update `DATABASE_URL` with your production database credentials
- Set `NODE_ENV=production`

### Database Setup

#### Option 1: Automatic (Recommended)
```bash
npm run db:push   # Creates tables
npm run db:seed   # Adds sample data
```

#### Option 2: Manual
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE app_db;

# Push schema
npm run db:push
```

### Testing the Platform

#### As a Regular User
1. Register a new account at the login page
2. Copy your referral code from the dashboard
3. Browse products and place an order
4. Check your wallet for commission earnings
5. Request a withdrawal (minimum $50)

#### As an Admin
1. Login with admin credentials
2. View platform statistics
3. Create new products
4. Manage orders and update statuses
5. Process withdrawal requests

### Creating Your First Product

1. Login as admin
2. Navigate to Products section
3. Click "Add Product"
4. Fill in:
   - Name
   - Description
   - Price
   - Category
   - Stock Quantity
   - Commission Rate (0.10 = 10%)
5. Save

### Understanding Commission Flow

**Direct Commission (When a user buys a product):**
1. User purchases product for $100
2. Product has 10% commission rate
3. User earns $10 commission
4. $10 is added to user's wallet
5. Transaction is recorded

**Referral Commission (When a referred user buys):**
1. User A refers User B (using referral code)
2. User B purchases product for $100
3. User B earns their direct commission (10% = $10)
4. User A earns referral bonus (5% = $5)
5. Both users' wallets are updated

### Withdrawal Process

**User Side:**
1. User requests withdrawal from wallet
2. Minimum: $50
3. Provide payment method and details
4. Amount is deducted from wallet
5. Status: Pending

**Admin Side:**
1. Admin views withdrawal requests
2. Reviews payment details
3. Approves or rejects
4. If rejected: Amount refunded to user wallet
5. If approved: Process payment externally
6. Mark as completed

## Project Structure

```
soya-ventures/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication
│   │   │   ├── products/   # Product management
│   │   │   ├── orders/     # Order management
│   │   │   ├── wallet/     # Wallet operations
│   │   │   ├── withdrawals/# Withdrawal requests
│   │   │   ├── commissions/# Commission tracking
│   │   │   ├── referrals/  # Referral system
│   │   │   └── dashboard/  # Statistics
│   │   ├── page.tsx        # Main UI
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── ui/             # Reusable UI components
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   └── schema.ts       # Drizzle schema
│   └── lib/
│       ├── auth.ts         # Authentication utilities
│       └── utils.ts        # Helper functions
├── scripts/
│   └── seed.ts             # Database seeding
└── public/                 # Static assets
```

## API Reference

### Authentication

**Register User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "referralCode": "ABC123"  // Optional
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Get Current User**
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Products

**List Products**
```bash
GET /api/products
```

**Create Product (Admin)**
```bash
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Category",
  "stockQuantity": 100,
  "commissionRate": 0.10,
  "imageUrl": "https://example.com/image.jpg"
}
```

### Orders

**Create Order**
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2,
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**List Orders**
```bash
GET /api/orders
Authorization: Bearer <token>
```

### Withdrawals

**Create Withdrawal Request**
```bash
POST /api/withdrawals
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "paymentMethod": "Bank Transfer",
  "paymentDetails": "Account: 1234567890"
}
```

**Update Withdrawal (Admin)**
```bash
PATCH /api/withdrawals/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "completed",
  "adminNotes": "Payment processed"
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
psql -U postgres -l

# Test connection
psql -U postgres -d app_db
```

### Build Errors
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Production Deployment

### 1. Build for Production
```bash
npm run build
```

### 2. Set Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=production
```

### 3. Start Production Server
```bash
npm start
```

### 4. Use Process Manager (PM2)
```bash
npm install -g pm2
pm2 start npm --name "soya-ventures" -- start
pm2 save
pm2 startup
```

## Best Practices

### Security
- ✅ Never commit `.env` files
- ✅ Use strong JWT secrets (min 32 characters)
- ✅ Hash all passwords
- ✅ Validate all inputs
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for API routes

### Database
- ✅ Regular backups
- ✅ Use connection pooling
- ✅ Index frequently queried columns
- ✅ Monitor query performance

### Code Quality
- ✅ Run TypeScript checks: `npm run typecheck`
- ✅ Run linter: `npm run lint`
- ✅ Test before deploying
- ✅ Use Git for version control

## Support

If you encounter any issues:

1. Check the [README.md](README.md) for general information
2. Review this setup guide
3. Check the console for error messages
4. Verify database connection
5. Ensure all dependencies are installed

## Next Steps

After successful setup:

1. ✅ Customize branding and colors
2. ✅ Add more products
3. ✅ Configure email notifications
4. ✅ Set up payment gateway
5. ✅ Deploy to production
6. ✅ Monitor performance and analytics

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000**
