# Soya Ventures - API Documentation

Complete API reference for the Soya Ventures MLM platform.

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]  // Optional validation errors
}
```

---

## Endpoints

## 🔐 Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",     // Optional
  "referralCode": "ABC123"          // Optional
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Min 8 characters, 1 uppercase, 1 lowercase, 1 number
- Full Name: Min 2 characters
- Referral Code: Valid existing referral code (optional)

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "referralCode": "XYZ789",
    "walletBalance": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid input / Email already registered
- `500` - Internal server error

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "referralCode": "XYZ789",
    "walletBalance": 150.00
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account deactivated
- `500` - Internal server error

---

### Get Current User
Fetch authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "user",
    "referralCode": "XYZ789",
    "walletBalance": 150.00,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized / Invalid token
- `404` - User not found
- `500` - Internal server error

---

## 📦 Products

### List Products
Get all active products.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `includeInactive` (boolean) - Include inactive products (admin only)

**Success Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Premium Soy Protein",
      "description": "High-quality soy protein powder",
      "price": 49.99,
      "imageUrl": "https://example.com/image.jpg",
      "category": "Supplements",
      "stockQuantity": 100,
      "isActive": true,
      "commissionRate": 0.15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Product
Create a new product (Admin only).

**Endpoint:** `POST /api/products`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Detailed product description",
  "price": 99.99,
  "imageUrl": "https://example.com/image.jpg",
  "category": "Category Name",
  "stockQuantity": 100,
  "commissionRate": 0.10
}
```

**Validation Rules:**
- Name: Required, min 1 character
- Description: Required, min 1 character
- Price: Required, positive number
- Commission Rate: 0.0 to 1.0 (0% to 100%)
- Stock Quantity: Non-negative integer

**Success Response (200):**
```json
{
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Detailed product description",
    "price": 99.99,
    "imageUrl": "https://example.com/image.jpg",
    "category": "Category Name",
    "stockQuantity": 100,
    "isActive": true,
    "commissionRate": 0.10,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `400` - Invalid input
- `500` - Internal server error

---

### Get Product
Get single product details.

**Endpoint:** `GET /api/products/:id`

**Success Response (200):**
```json
{
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "imageUrl": "https://example.com/image.jpg",
    "category": "Category",
    "stockQuantity": 50,
    "isActive": true,
    "commissionRate": 0.10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Product not found
- `500` - Internal server error

---

### Update Product
Update product details (Admin only).

**Endpoint:** `PATCH /api/products/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 89.99,
  "category": "New Category",
  "stockQuantity": 75,
  "commissionRate": 0.12,
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "product": { /* updated product */ }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Product not found
- `400` - Invalid input
- `500` - Internal server error

---

### Delete Product
Delete a product (Admin only).

**Endpoint:** `DELETE /api/products/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Internal server error

---

## 🛒 Orders

### List Orders
Get orders (user sees own, admin sees all).

**Endpoint:** `GET /api/orders`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "userId": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "totalAmount": 199.98,
      "status": "pending",
      "shippingAddress": "123 Main St",
      "trackingNumber": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "productName": "Product Name",
      "productImageUrl": "https://example.com/image.jpg",
      "userName": "John Doe",        // Admin only
      "userEmail": "user@example.com" // Admin only
    }
  ]
}
```

---

### Create Order
Place a new order.

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 2,
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**Validation Rules:**
- Product ID: Valid UUID
- Quantity: Positive integer
- Shipping Address: Required

**Success Response (200):**
```json
{
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "productId": "uuid",
    "quantity": 2,
    "totalAmount": 199.98,
    "status": "pending",
    "shippingAddress": "123 Main St, City, State 12345",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Side Effects:**
- Creates direct commission for buyer
- Creates referral commission if buyer was referred
- Updates wallet balances
- Creates transaction records
- Decreases product stock

**Error Responses:**
- `401` - Unauthorized
- `404` - Product not found
- `400` - Product not available / Insufficient stock
- `500` - Internal server error

---

### Get Order
Get single order details.

**Endpoint:** `GET /api/orders/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "productId": "uuid",
    "quantity": 2,
    "totalAmount": 199.98,
    "status": "shipped",
    "shippingAddress": "123 Main St",
    "trackingNumber": "TRACK123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "productName": "Product Name",
    "productImageUrl": "https://example.com/image.jpg",
    "productPrice": 99.99
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not owner or admin)
- `404` - Order not found
- `500` - Internal server error

---

### Update Order
Update order status (Admin only).

**Endpoint:** `PATCH /api/orders/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

**Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Success Response (200):**
```json
{
  "order": { /* updated order */ }
}
```

---

## 💰 Wallet & Transactions

### Get Wallet Balance
Get user's wallet balance and recent transactions.

**Endpoint:** `GET /api/wallet/balance`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "balance": 150.00,
  "transactions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "commission",
      "amount": 15.00,
      "description": "Commission for order #abc123",
      "referenceId": "order-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "stats": {
    "totalEarnings": 250.00
  }
}
```

**Transaction Types:**
- `commission` - Direct purchase commission
- `referral_bonus` - Referral commission
- `withdrawal` - Withdrawal request (negative amount)
- `refund` - Withdrawal rejection refund

---

## 💸 Withdrawals

### List Withdrawals
Get withdrawal requests (user sees own, admin sees all).

**Endpoint:** `GET /api/withdrawals`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "withdrawals": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 100.00,
      "status": "pending",
      "paymentMethod": "Bank Transfer",
      "paymentDetails": "Account: 1234567890",
      "adminNotes": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "processedAt": null,
      "userName": "John Doe",        // Admin only
      "userEmail": "user@example.com" // Admin only
    }
  ]
}
```

---

### Create Withdrawal
Request a withdrawal.

**Endpoint:** `POST /api/withdrawals`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 100.00,
  "paymentMethod": "Bank Transfer",
  "paymentDetails": "Bank: ABC Bank\nAccount: 1234567890\nName: John Doe"
}
```

**Validation Rules:**
- Amount: Minimum $50
- Amount: Must not exceed wallet balance
- Payment Method: Required
- Payment Details: Required

**Success Response (200):**
```json
{
  "withdrawal": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 100.00,
    "status": "pending",
    "paymentMethod": "Bank Transfer",
    "paymentDetails": "Bank: ABC Bank...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Side Effects:**
- Deducts amount from wallet balance
- Creates withdrawal transaction record

**Error Responses:**
- `401` - Unauthorized
- `400` - Insufficient balance / Below minimum
- `500` - Internal server error

---

### Update Withdrawal
Update withdrawal status (Admin only).

**Endpoint:** `PATCH /api/withdrawals/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "status": "completed",
  "adminNotes": "Payment processed via bank transfer on 2024-01-05"
}
```

**Status Values:**
- `pending` - Awaiting review
- `approved` - Approved for processing
- `processing` - Being processed
- `completed` - Payment sent
- `rejected` - Request rejected

**Success Response (200):**
```json
{
  "withdrawal": { /* updated withdrawal */ }
}
```

**Side Effects (if rejected):**
- Refunds amount to user's wallet
- Creates refund transaction

---

## 💵 Commissions

### Get Commissions
Get user's commission history.

**Endpoint:** `GET /api/commissions`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "commissions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "orderId": "uuid",
      "amount": 15.00,
      "type": "direct",
      "referralUserId": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "orderTotal": 150.00,
      "productName": "Product Name",
      "referralUserName": null
    }
  ],
  "totalCommissions": 150.00
}
```

**Commission Types:**
- `direct` - Commission from own purchase
- `referral` - Commission from referred user's purchase

---

## 👥 Referrals

### Get Referrals
Get user's referral statistics.

**Endpoint:** `GET /api/referrals`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "referralCode": "XYZ789",
  "referredUsers": [
    {
      "id": "uuid",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "totalOrders": 5,
      "totalCommissions": 25.00
    }
  ],
  "totalReferrals": 3,
  "totalReferralCommissions": 75.00
}
```

---

## 📊 Dashboard

### Get Dashboard Stats
Get dashboard statistics (different for user/admin).

**Endpoint:** `GET /api/dashboard/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**User Response (200):**
```json
{
  "stats": {
    "walletBalance": 150.00,
    "totalOrders": 5,
    "totalSpent": 500.00,
    "totalCommissions": 150.00,
    "totalReferrals": 3
  },
  "recentOrders": [ /* 5 most recent orders */ ],
  "recentCommissions": [ /* 5 most recent commissions */ ]
}
```

**Admin Response (200):**
```json
{
  "stats": {
    "totalUsers": 100,
    "totalOrders": 500,
    "totalRevenue": 50000.00,
    "totalCommissions": 7500.00,
    "totalProducts": 20,
    "pendingWithdrawals": 5,
    "totalPendingAmount": 1000.00
  },
  "recentOrders": [ /* 5 most recent orders */ ],
  "topProducts": [ /* 5 best-selling products */ ]
}
```

---

## Rate Limiting

**Recommendations:**
- Authentication endpoints: 5 requests per minute
- Order creation: 10 requests per minute
- Other endpoints: 100 requests per minute

## Webhooks (Future)

Coming soon: Webhook notifications for:
- New orders
- Commission earned
- Withdrawal status changes
- Order status updates

## Support

For API support:
- Email: api@soyaventures.com
- Documentation: https://docs.soyaventures.com
- Status: https://status.soyaventures.com

---

**API Version:** 1.0.0  
**Last Updated:** 2024
