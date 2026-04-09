# Cloud Heroes Africa - Technical Stack Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Technologies](#backend-technologies)
3. [Frontend Technologies](#frontend-technologies)
4. [Infrastructure & Deployment](#infrastructure--deployment)
5. [Architecture Patterns](#architecture-patterns)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Security Measures](#security-measures)
10. [Development Workflow](#development-workflow)

---

## Overview

**Cloud Heroes Africa** is a production-ready full-stack MERN application with enterprise-grade authentication, multi-payment gateway integration, and real-time communication. It supports four distinct user roles: **Students, Administrators, Donors, and Volunteers**.

**Architecture Type:** MERN Stack + Python Services + Microservices Ready  
**Deployment Model:** Cloud-native (MongoDB Atlas, Socket.io, REST APIs)  
**Security Level:** Enterprise-grade (OAuth 2.0, JWT, MFA, Role-Based Access Control)

---

## Technology Stack

### Backend

#### Core Framework
- **Node.js v18+** - JavaScript runtime
- **Express.js 4.18** - Web application framework
  - Fast, unopinionated, minimalist
  - Robust routing and middleware
  - Excellent ecosystem

#### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose 8.0** - MongoDB ODM (Object Data Modeling)
  - Schema validation
  - Middleware hooks
  - Query building
  - Population (joins)

#### Authentication & Authorization
- **Passport.js** - Authentication middleware
  - **passport-google-oauth20** - Google OAuth for Students/Donors
  - **passport-azure-ad** - Microsoft Entra ID for Admins/Volunteers
- **JWT (jsonwebtoken 9.0)** - Token-based authentication
  - Access tokens (7 days)
  - Refresh tokens (30 days)
- **bcryptjs 2.4** - Password hashing

#### Payment Gateways
- **Stripe 14.9** - International card payments
- **PayPal REST SDK 1.8** - PayPal payments
- **MTN Mobile Money API** - Cameroon mobile payments
- **Orange Money API** - Cameroon mobile payments

#### Email Service
- **Nodemailer 6.9** - Email sending
  - Gmail SMTP integration
  - App Password authentication
  - HTML email templates

#### Real-time Communication
- **Socket.io 4.6** - WebSocket library
  - Real-time notifications
  - Live chat/forum
  - User presence tracking
  - Donation alerts

#### Security
- **Helmet 7.1** - Security headers
- **CORS 2.8** - Cross-Origin Resource Sharing
- **express-rate-limit 7.1** - Rate limiting
- **express-validator 7.0** - Input validation
- **cookie-parser 1.4** - Cookie parsing
- **express-session 1.17** - Session management

#### Development Tools
- **Nodemon 3.0** - Auto-restart on file changes
- **Morgan 1.10** - HTTP request logger
- **dotenv 16.3** - Environment variable management

---

### Frontend

#### Core Framework
- **React 18.2** - UI library
  - Component-based architecture
  - Hooks for state management
  - Virtual DOM for performance

#### Build Tool
- **Vite 5.0** - Next-generation frontend tooling
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules

#### Styling
- **Tailwind CSS 3.3** - Utility-first CSS framework
  - Responsive design utilities
  - Custom color palette
  - JIT (Just-In-Time) compiler
- **PostCSS 8.4** - CSS processing
- **Autoprefixer 10.4** - Vendor prefixes

#### Routing
- **React Router 6.20** - Client-side routing
  - Nested routes
  - Protected routes
  - URL parameters
  - Navigation guards

#### HTTP Client
- **Axios 1.6** - Promise-based HTTP client
  - Request/response interceptors
  - Automatic JSON transformation
  - Error handling

#### Real-time
- **Socket.io-client 4.6** - WebSocket client
  - Auto-reconnection
  - Event-based communication
  - Room support

#### State Management
- **React Context API** - Built-in state management
  - AuthContext for user state
  - SocketContext for real-time connection
  - No external library needed

---

## Architecture Patterns

### Backend Architecture

#### 1. MVC Pattern (Modified)
```
Routes → Controllers → Services → Models → Database
```

- **Routes**: Define API endpoints
- **Controllers**: Handle request/response logic
- **Services**: Business logic and external API calls
- **Models**: Database schemas and validation
- **Middleware**: Authentication, authorization, validation

#### 2. Service Layer Pattern
Separate business logic from route handlers:
- **Payment Services**: Stripe, PayPal, MTN, Orange
- **Email Service**: Nodemailer wrapper
- **Auth Services**: OAuth providers
- **Socket Service**: Real-time event handlers

#### 3. Middleware Chain
```
Request → Rate Limiter → CORS → Body Parser → Auth → RBAC → Route Handler
```

---

### Frontend Architecture

#### 1. Component-Based Architecture
```
App
├── Context Providers (Auth, Socket)
├── Router
│   ├── Public Routes
│   │   ├── Home
│   │   ├── Login
│   │   └── Community
│   └── Protected Routes
│       ├── Student Dashboard
│       ├── Admin Dashboard
│       ├── Donor Dashboard
│       └── Volunteer Dashboard
```

#### 2. Container/Presentational Pattern
- **Pages**: Smart components with logic
- **Components**: Dumb components for UI

#### 3. Context + Hooks Pattern
- **AuthContext**: User authentication state
- **SocketContext**: Real-time connection
- **Custom Hooks**: Reusable logic

---

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'administrator', 'donor', 'volunteer'],
  provider: Enum ['google', 'azure', 'local'],
  providerId: String,
  avatar: String,
  isActive: Boolean,
  isVerified: Boolean,
  mfaEnabled: Boolean,
  mfaEnrollmentDate: Date,
  lastLogin: Date,
  refreshToken: String,
  // Role-specific fields
  inviteCode: String (students),
  coursesEnrolled: [ObjectId] (students),
  assignedClasses: [ObjectId] (volunteers),
  totalDonated: Number (donors),
  donations: [ObjectId] (donors),
  timestamps: true
}
```

### Donation Model
```javascript
{
  donor: ObjectId (ref: User),
  donorEmail: String,
  donorName: String,
  amount: Number,
  currency: String,
  paymentMethod: Enum ['stripe', 'paypal', 'mtn-momo', 'orange-money'],
  paymentStatus: Enum ['pending', 'completed', 'failed', 'refunded'],
  transactionId: String (unique),
  paymentDetails: Mixed,
  isAnonymous: Boolean,
  message: String,
  receiptSent: Boolean,
  receiptUrl: String,
  timestamps: true
}
```

---

## API Architecture

### RESTful API Design

#### Authentication Endpoints
```
GET    /api/auth/google              - Initiate Google OAuth
GET    /api/auth/google/callback     - Google callback
GET    /api/auth/azure               - Initiate Azure OAuth
POST   /api/auth/azure/callback      - Azure callback
GET    /api/auth/me                  - Get current user
POST   /api/auth/logout              - Logout user
```

#### Payment Endpoints
```
POST   /api/payments/stripe/create-checkout    - Create Stripe session
GET    /api/payments/stripe/verify/:sessionId  - Verify payment
POST   /api/payments/paypal/create             - Create PayPal payment
POST   /api/payments/paypal/execute            - Execute PayPal payment
POST   /api/payments/mtn/request               - MTN MoMo request
GET    /api/payments/mtn/status/:refId         - Check MTN status
POST   /api/payments/orange/initiate           - Orange Money initiate
GET    /api/payments/orange/status/:orderId    - Check Orange status
```

#### Role-Specific Endpoints
```
GET    /api/student/dashboard        - Student data (Protected)
GET    /api/admin/dashboard          - Admin data (Protected)
GET    /api/donor/dashboard          - Donor data (Protected)
GET    /api/volunteer/dashboard      - Volunteer data (Protected)
```

#### Community Endpoints
```
GET    /api/community/stats          - Community statistics (Public)
GET    /api/community/forum          - Forum posts (Public)
```

---

## Authentication Flow

### Google OAuth Flow (Students/Donors)
```
1. User clicks "Login with Google"
2. Frontend redirects to: /api/auth/google
3. Backend redirects to Google OAuth consent screen
4. User authenticates with Google
5. Google redirects to: /api/auth/google/callback?code=xxx
6. Backend exchanges code for access token
7. Backend fetches user profile from Google
8. Backend creates/updates user in MongoDB
9. Backend generates JWT tokens
10. Backend sets cookies and redirects to frontend
11. Frontend stores token and redirects to dashboard
```

### Microsoft Entra ID Flow (Admins/Volunteers)
```
1. User clicks "Login with Microsoft"
2. Frontend redirects to: /api/auth/azure
3. Backend redirects to Azure AD consent screen
4. User authenticates with Microsoft (MFA enforced)
5. Azure redirects to: /api/auth/azure/callback
6. Backend validates token and fetches user profile
7. Backend creates/updates user in MongoDB
8. Backend generates JWT tokens
9. Backend sets cookies and redirects to frontend
10. Frontend stores token and redirects to dashboard
```

---

## Payment Gateway Integration

### Stripe Integration
```javascript
// Create checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [...],
  mode: 'payment',
  success_url: 'http://localhost:5173/donation/success',
  cancel_url: 'http://localhost:5173/donation/cancel'
});

// Redirect user to Stripe Checkout
window.location.href = session.url;
```

### PayPal Integration
```javascript
// Create payment
const payment = await paypal.payment.create({
  intent: 'sale',
  payer: { payment_method: 'paypal' },
  transactions: [...]
});

// Redirect to PayPal approval URL
window.location.href = approvalUrl;
```

### MTN Mobile Money
```javascript
// Request payment
const response = await axios.post(
  'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
  {
    amount: '100',
    currency: 'XAF',
    payer: { partyId: '237670000000' }
  }
);

// User approves on phone
// Poll for status
const status = await checkPaymentStatus(referenceId);
```

### Orange Money
```javascript
// Initiate payment
const response = await axios.post(
  'https://api.orange.com/orange-money-webpay/dev/v1/webpayment',
  {
    amount: 100,
    currency: 'XAF',
    order_id: 'ORD-123'
  }
);

// Redirect to Orange Money payment page
window.location.href = response.data.payment_url;
```

---

## Real-time Features (Socket.io)

### Server-Side Events
```javascript
io.on('connection', (socket) => {
  // User joins
  socket.on('user:join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.broadcast.emit('user:online', userId);
  });

  // Forum message
  socket.on('forum:message', (data) => {
    io.emit('forum:new-message', data);
  });

  // Donation received
  socket.on('donation:new', (donation) => {
    io.emit('donation:received', donation);
  });

  // User disconnects
  socket.on('disconnect', () => {
    socket.broadcast.emit('user:offline', userId);
  });
});
```

### Client-Side Usage
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join with user ID
socket.emit('user:join', user._id);

// Listen for notifications
socket.on('notification:receive', (notification) => {
  showNotification(notification);
});

// Send forum message
socket.emit('forum:message', { text, userId });
```

---

## Email Service (Nodemailer)

### Configuration
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Gmail App Password
  }
});
```

### Email Templates
- **Welcome Email**: Sent on user registration
- **Donation Receipt**: Sent after successful donation
- **MFA Code**: Sent for two-factor authentication
- **Password Reset**: Sent for password recovery

---

## Security Implementation

### 1. Authentication Security
- JWT tokens with expiration
- Refresh token rotation
- HttpOnly cookies
- Secure flag in production
- CSRF protection

### 2. Authorization (RBAC)
```javascript
// Middleware chain
router.get('/admin/dashboard',
  protect,              // Verify JWT
  authorize('administrator'),  // Check role
  checkMFA,             // Verify MFA
  getDashboard          // Route handler
);
```

### 3. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

router.post('/donate',
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('email').isEmail(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process donation
  }
);
```

### 4. Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Security Headers (Helmet)
```javascript
app.use(helmet());
// Sets various HTTP headers:
// - X-DNS-Prefetch-Control
// - X-Frame-Options
// - X-Content-Type-Options
// - X-XSS-Protection
// - etc.
```

---

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Azure AD
AZURE_CLIENT_ID=xxx
AZURE_TENANT_ID=xxx
AZURE_CLIENT_SECRET=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# PayPal
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# MTN MoMo
MTN_MOMO_API_KEY=xxx
MTN_MOMO_SUBSCRIPTION_KEY=xxx

# Orange Money
ORANGE_MONEY_API_KEY=xxx
ORANGE_MONEY_MERCHANT_ID=xxx

# Email
EMAIL_USER=xxx@gmail.com
EMAIL_PASSWORD=xxx (App Password)
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_AUTH_URL=http://localhost:5000/api/auth/google
VITE_AZURE_AUTH_URL=http://localhost:5000/api/auth/azure
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Development Workflow

### Backend Development
```bash
cd backend
npm install
npm run dev  # Nodemon watches for changes
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Vite HMR
```

### Full Stack Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Production Build

### Frontend Build
```bash
cd frontend
npm run build
# Creates optimized dist/ folder
```

### Backend Production
```bash
cd backend
npm start
# Or use PM2:
pm2 start src/server.js --name cloud-heroes-backend
```

---

## Performance Optimizations

### Backend
- MongoDB indexing on frequently queried fields
- Connection pooling
- Caching with Redis (future)
- Compression middleware
- Query optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Lazy loading
- Memoization with useMemo/useCallback
- Vite's automatic chunking

---

## Monitoring & Logging

### Backend Logging
- Morgan for HTTP request logging
- Console logs for debugging
- Error logging to file (future)
- Winston for structured logging (future)

### Frontend Logging
- Console logs in development
- Error boundary for React errors
- Analytics integration (future)

---

## Testing Strategy

### Backend Testing
- **Unit Tests**: Jest for individual functions
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Postman collections

### Frontend Testing
- **Unit Tests**: Vitest for components
- **Integration Tests**: React Testing Library
- **E2E Tests**: Playwright/Cypress (future)

---

## Deployment Architecture

### Development
```
Frontend (Vite Dev Server) :5173
    ↓
Backend (Express + Nodemon) :5000
    ↓
MongoDB Atlas (Cloud)
```

### Production
```
Frontend (Static Files on CDN)
    ↓
Load Balancer
    ↓
Backend Servers (PM2 Cluster)
    ↓
MongoDB Atlas (Replica Set)
```

---

## Technology Comparison

### Why MERN over Other Stacks?

**MERN vs MEAN:**
- React > Angular (lighter, more flexible)
- Better ecosystem and community

**MERN vs LAMP:**
- JavaScript everywhere (one language)
- JSON-native with MongoDB
- Better for real-time features

**MERN vs Django:**
- Faster development with Node.js
- Better for real-time (Socket.io)
- More flexible architecture

---

## Future Enhancements

### Planned Features
1. **Redis Caching** - Session storage and caching
2. **GraphQL API** - Alternative to REST
3. **Microservices** - Split into smaller services
4. **Docker** - Containerization
5. **Kubernetes** - Orchestration
6. **CI/CD** - GitHub Actions
7. **Monitoring** - Prometheus + Grafana
8. **Testing** - Comprehensive test suite

---

## Dependencies Summary

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-azure-ad": "^4.3.5",
    "socket.io": "^4.6.0",
    "nodemailer": "^6.9.7",
    "stripe": "^14.9.0",
    "paypal-rest-sdk": "^1.8.1",
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "socket.io-client": "^4.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

---

## Resources & Documentation

### Official Documentation
- **Node.js**: https://nodejs.org/docs
- **Express**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Socket.io**: https://socket.io/docs/

### Payment Gateway Docs
- **Stripe**: https://stripe.com/docs
- **PayPal**: https://developer.paypal.com/docs
- **MTN MoMo**: https://momodeveloper.mtn.com/
- **Orange Money**: https://developer.orange.com/

---

**Version:** 2.0.0 (MERN Stack)  
**Last Updated:** 2024  
**Architecture:** MERN (MongoDB, Express, React, Node.js)  
**Maintained By:** Cloud Heroes Africa Development Team
