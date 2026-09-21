# Soya Ventures - Testing Guide

Complete guide for testing the Soya Ventures platform.

## 🧪 Manual Testing Checklist

### ✅ User Registration & Login

#### Test 1: User Registration
1. Open http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Fill in registration form:
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123!
   - Phone: +1234567890 (optional)
   - Referral Code: (leave empty for now)
4. Click "Sign Up"
5. **Expected:** Successfully logged in, redirected to dashboard
6. **Verify:** Referral code is displayed on dashboard

#### Test 2: User Login
1. Logout
2. Click "Already have an account? Sign in"
3. Enter credentials:
   - Email: testuser@example.com
   - Password: TestPass123!
4. Click "Sign In"
5. **Expected:** Successfully logged in to dashboard
6. **Verify:** Dashboard shows user data

#### Test 3: Admin Login
1. Logout
2. Login with admin credentials:
   - Email: admin@soyaventures.com
   - Password: Admin123!
3. **Expected:** Admin dashboard with platform statistics
4. **Verify:** Different stats than user dashboard

---

### ✅ Product Management (Admin)

#### Test 4: View Products (As Admin)
1. Login as admin
2. Navigate to Products section
3. **Expected:** See all 6 sample products
4. **Verify:** Products have names, prices, stock

#### Test 5: Create Product (Admin)
**API Test:**
```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soyaventures.com","password":"Admin123!"}'

# Use the token from response
TOKEN="<your-token-here>"

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "category": "Test Category",
    "stockQuantity": 50,
    "commissionRate": 0.15,
    "imageUrl": "https://via.placeholder.com/400"
  }'
```

**Expected:** Product created successfully

#### Test 6: Update Product (Admin)
```bash
curl -X PATCH http://localhost:3000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 89.99,
    "stockQuantity": 45
  }'
```

**Expected:** Product updated successfully

---

### ✅ Order Placement & Commissions

#### Test 7: Place Order as User
1. Login as regular user (user@soyaventures.com)
2. Note current wallet balance
3. **API Test:**
```bash
# Login as user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@soyaventures.com","password":"User123!"}'

# Get products
curl http://localhost:3000/api/products

# Place order with first product ID
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 1,
    "shippingAddress": "123 Test St, Test City, TS 12345"
  }'
```

4. **Expected:** Order created successfully
5. **Verify:** 
   - Wallet balance increased by commission amount
   - Commission = Product Price × Commission Rate
   - Example: $49.99 × 0.15 = $7.50

#### Test 8: Verify Commission
```bash
# Get commissions
curl http://localhost:3000/api/commissions \
  -H "Authorization: Bearer $USER_TOKEN"

# Get wallet balance
curl http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected:**
- Commission record exists
- Wallet balance shows commission
- Transaction recorded

---

### ✅ Referral System

#### Test 9: Register with Referral Code
1. Logout
2. Get existing user's referral code:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN"
```
3. Register new user with referral code:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "referred@example.com",
    "password": "TestPass123!",
    "fullName": "Referred User",
    "referralCode": "USER_REFERRAL_CODE"
  }'
```

**Expected:** New user registered with referrer linked

#### Test 10: Referral Commission
1. Login as referred user
2. Place an order
3. Login as original user (referrer)
4. Check wallet balance
5. **Expected:** 
   - Referred user got direct commission (10-15%)
   - Referrer got referral bonus (5%)

```bash
# Get referral stats
curl http://localhost:3000/api/referrals \
  -H "Authorization: Bearer $REFERRER_TOKEN"
```

**Expected:**
- 1 referred user shown
- Total referral commissions updated

---

### ✅ Withdrawal System

#### Test 11: Request Withdrawal
1. Login as user with balance ≥ $50
2. **API Test:**
```bash
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "amount": 50.00,
    "paymentMethod": "Bank Transfer",
    "paymentDetails": "Bank: Test Bank\nAccount: 1234567890\nName: Test User"
  }'
```

**Expected:** 
- Withdrawal request created
- Amount deducted from wallet
- Status: pending

#### Test 12: Admin Approve Withdrawal
1. Login as admin
2. **API Test:**
```bash
# Get withdrawals
curl http://localhost:3000/api/withdrawals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve withdrawal
curl -X PATCH http://localhost:3000/api/withdrawals/WITHDRAWAL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "completed",
    "adminNotes": "Payment processed via bank transfer"
  }'
```

**Expected:** Withdrawal marked as completed

#### Test 13: Admin Reject Withdrawal
```bash
curl -X PATCH http://localhost:3000/api/withdrawals/WITHDRAWAL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "rejected",
    "adminNotes": "Invalid bank details"
  }'
```

**Expected:** 
- Withdrawal rejected
- Amount refunded to user wallet
- Refund transaction created

---

### ✅ Dashboard Statistics

#### Test 14: User Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected Response:**
```json
{
  "stats": {
    "walletBalance": 100.00,
    "totalOrders": 5,
    "totalSpent": 250.00,
    "totalCommissions": 150.00,
    "totalReferrals": 2
  },
  "recentOrders": [...],
  "recentCommissions": [...]
}
```

#### Test 15: Admin Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "stats": {
    "totalUsers": 10,
    "totalOrders": 50,
    "totalRevenue": 5000.00,
    "totalCommissions": 750.00,
    "totalProducts": 7,
    "pendingWithdrawals": 3,
    "totalPendingAmount": 150.00
  },
  "recentOrders": [...],
  "topProducts": [...]
}
```

---

### ✅ Order Management (Admin)

#### Test 16: View All Orders (Admin)
```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** All platform orders with user info

#### Test 17: Update Order Status (Admin)
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TRACK123456"
  }'
```

**Expected:** Order updated with new status and tracking

---

### ✅ Error Handling

#### Test 18: Invalid Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'
```

**Expected:** 401 error with "Invalid credentials"

#### Test 19: Unauthorized Access
```bash
# Try to create product without token
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected:** 401 error "Unauthorized"

#### Test 20: Insufficient Balance Withdrawal
```bash
# Try to withdraw more than balance
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "amount": 99999.00,
    "paymentMethod": "Bank",
    "paymentDetails": "Test"
  }'
```

**Expected:** 400 error "Insufficient balance"

#### Test 21: Below Minimum Withdrawal
```bash
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "amount": 10.00,
    "paymentMethod": "Bank",
    "paymentDetails": "Test"
  }'
```

**Expected:** 400 error "Minimum withdrawal amount is $50"

---

## 🔄 End-to-End User Journey

### Complete User Flow Test

1. **Register as User A**
   - Email: usera@example.com
   - Get referral code

2. **Register as User B with User A's referral code**
   - Email: userb@example.com
   - ReferralCode: USER_A_CODE

3. **User B places order for $100 product (15% commission)**
   - User B earns: $15 (direct commission)
   - User A earns: $5 (referral commission)

4. **Verify User B's wallet**
   - Balance should be $15

5. **Verify User A's wallet**
   - Balance should be $5

6. **User A requests withdrawal of $50**
   - Need to place more orders first to reach $50

7. **Admin reviews and approves withdrawal**
   - User A receives payment externally
   - System marks as completed

---

## 📊 Database Verification

### SQL Queries for Verification

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check product count
SELECT COUNT(*) FROM products WHERE is_active = true;

-- Check order count
SELECT COUNT(*) FROM orders;

-- Check commission sum
SELECT SUM(amount) FROM commissions;

-- Check wallet balances
SELECT email, wallet_balance FROM users;

-- Check pending withdrawals
SELECT COUNT(*) FROM withdrawals WHERE status = 'pending';

-- View recent transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- Check referral relationships
SELECT 
  u1.email as referrer,
  u2.email as referred
FROM users u1
JOIN users u2 ON u1.id = u2.referred_by;
```

---

## 🎯 Performance Testing

### Load Testing (with Apache Bench)

```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# Test products endpoint
ab -n 100 -c 10 http://localhost:3000/api/products

# Test health endpoint
ab -n 1000 -c 100 http://localhost:3000/api/health
```

**Expected:**
- Response time < 100ms for simple queries
- No errors
- Consistent performance

---

## ✅ Frontend Testing Checklist

### UI Tests

- [ ] Login form validates email format
- [ ] Login form requires password
- [ ] Registration form enforces password strength
- [ ] Dashboard displays correct user info
- [ ] Wallet balance updates after order
- [ ] Referral code is copyable
- [ ] Order status badges show correct colors
- [ ] Responsive design works on mobile
- [ ] Logout clears session
- [ ] Error messages display properly

### Navigation Tests

- [ ] Cannot access admin routes as user
- [ ] Can access admin routes as admin
- [ ] Redirect to login when not authenticated
- [ ] Redirect to dashboard when authenticated
- [ ] Back button works correctly
- [ ] Quick action buttons work

---

## 🐛 Bug Reporting Template

If you find a bug, report it with:

```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Node Version: [e.g., 18.17.0]
- Database: [PostgreSQL version]

### Screenshots
[If applicable]

### Additional Context
[Any other relevant information]
```

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- OS: macOS
- Node: v18.17.0
- Database: PostgreSQL 15.3
- Browser: Chrome 120

### Tests Performed
- [x] User Registration
- [x] User Login
- [x] Admin Login
- [x] Product Creation
- [x] Order Placement
- [x] Commission Calculation
- [x] Referral System
- [x] Withdrawal Request
- [x] Withdrawal Approval
- [x] Dashboard Stats

### Issues Found
None

### Performance
- Average API response: 45ms
- Page load time: 0.8s
- Database queries: Optimized

### Conclusion
All tests passed successfully. Platform is ready for production.
```

---

## 🚀 Automated Testing (Future)

### Jest Tests (Coming Soon)
```javascript
// Example test structure
describe('User Authentication', () => {
  test('should register new user', async () => {
    // Test implementation
  });
  
  test('should login existing user', async () => {
    // Test implementation
  });
});
```

### Cypress E2E Tests (Coming Soon)
```javascript
describe('Order Flow', () => {
  it('should complete full order journey', () => {
    // Cypress test implementation
  });
});
```

---

## 📞 Testing Support

If you need help with testing:
- Email: testing@soyaventures.com
- Documentation: See README.md
- API Reference: API_DOCUMENTATION.md

---

**Last Updated:** 2024-01-01  
**Test Coverage:** Manual tests covering all features  
**Automation:** Ready for implementation
