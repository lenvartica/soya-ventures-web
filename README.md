# Soya Ventures - MLM & Referral Commerce Platform

A comprehensive Multi-Level Marketing (MLM) and referral commerce platform built with Next.js, PostgreSQL, and Drizzle ORM.

## 🚀 Features

### User Features
- **Authentication System** - Secure login/registration with JWT tokens
- **Referral System** - Unique referral codes with commission tracking
- **Product Catalog** - Browse and purchase products
- **Order Management** - Track order status and history
- **Commission Tracking** - Earn commissions on purchases and referrals
- **Digital Wallet** - Manage earnings and balance
- **Withdrawal Requests** - Request payouts (minimum $50)
- **Dashboard** - Comprehensive stats and activity overview

### Admin Features
- **User Management** - View and manage all users
- **Product Management** - Create, update, and delete products
- **Order Management** - Update order status and tracking
- **Commission Monitoring** - Track all commissions
- **Withdrawal Processing** - Approve/reject withdrawal requests
- **Analytics Dashboard** - Platform-wide statistics

## 📋 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd soya-ventures
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# .env file is already configured with local PostgreSQL
# Update if needed:
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your-secret-key-here
```

4. **Push database schema**
```bash
npm run db:push
```

5. **Seed the database**
```bash
npm run db:seed
```

This will create:
- Admin user: `admin@soyaventures.com` / `Admin123!`
- Test user: `user@soyaventures.com` / `User123!`
- 6 sample products

6. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Authentication

### Login Credentials

**Admin Account:**
- Email: `admin@soyaventures.com`
- Password: `Admin123!`

**Test User Account:**
- Email: `user@soyaventures.com`
- Password: `User123!`

## 📊 Database Schema

### Tables

1. **users** - User accounts and profiles
2. **products** - Product catalog
3. **orders** - Customer orders
4. **commissions** - Commission records
5. **transactions** - Wallet transactions
6. **withdrawals** - Withdrawal requests
7. **notifications** - User notifications

## 💰 Commission Structure

### Direct Commission
- Users earn a percentage (10-15% based on product) on their own purchases
- Commission is immediately added to wallet balance

### Referral Commission
- Earn 5% on purchases made by referred users
- Referral bonus is added to referrer's wallet
- Tracked separately in commissions table

## 🔄 User Journey

### New User Registration
1. Sign up with email/password
2. Optional: Enter referral code
3. Receive unique referral code
4. Browse and purchase products
5. Earn commissions on purchases
6. Share referral code to earn more
7. Request withdrawals when balance ≥ $50

### Admin Workflow
1. Login to admin dashboard
2. Monitor platform statistics
3. Manage products (add/edit/delete)
4. Update order statuses
5. Process withdrawal requests
6. View commission reports

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (admin)
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order (admin)

### Wallet & Withdrawals
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/withdrawals` - List withdrawals
- `POST /api/withdrawals` - Create withdrawal request
- `PATCH /api/withdrawals/[id]` - Update withdrawal (admin)

### Commissions & Referrals
- `GET /api/commissions` - List user commissions
- `GET /api/referrals` - Get referral statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 UI Components

Custom UI components built with Tailwind CSS:
- Button
- Input
- Card (Header, Title, Description, Content, Footer)

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control (user/admin)
- Input validation with Zod
- SQL injection protection via Drizzle ORM
- Secure API routes with token verification

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly UI elements
- Adaptive navigation

## 🚀 Production Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Environment Variables for Production
```bash
DATABASE_URL=your-production-db-url
JWT_SECRET=strong-random-secret-key
NODE_ENV=production
```

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] Advanced analytics and reporting
- [ ] Multi-level referral tracking (beyond 1 level)
- [ ] Product reviews and ratings
- [ ] Shopping cart functionality
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Product variants and inventory management
- [ ] Promotional campaigns and discounts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@soyaventures.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Drizzle ORM for excellent TypeScript-first ORM
- Tailwind CSS for utility-first styling
- Lucide for beautiful icons

---

**Built with ❤️ for Soya Ventures**
