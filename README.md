# Cloud Heroes Africa Platform

> Empowering the next generation of cloud professionals across Africa

A comprehensive IAM-focused platform built with the MERN stack, supporting Students, Administrators, Donors, and Volunteers with dual identity provider integration, role-based access control, TOTP-based MFA, and multiple payment gateways.

---

## 🌟 Features

### Authentication & Authorization
- **Dual Identity Providers**
  - Google OAuth 2.0 for Students and Donors
  - Microsoft Entra ID (Azure AD) for Administrators and Volunteers
- **JWT Token Authentication** with refresh token rotation
- **Role-Based Access Control (RBAC)** with four distinct personas
- **Multi-Factor Authentication (MFA)** with TOTP (Time-based One-Time Password)
  - Supports Google Authenticator, Microsoft Authenticator, and Authy
  - Mandatory for Administrators and Volunteers on every login
  - Grace period for Students (14 days) and Donors (30 days)
  - 10 single-use backup codes for account recovery
  - QR code setup for easy configuration
- **Privileged Access Management (PAM)** for Administrators

### Payment Integration
- **Stripe** - International card payments
- **PayPal** - Global payment processing
- **MTN Mobile Money** - Cameroon mobile payments
- **Orange Money** - Cameroon mobile payments
- Automated donation receipts via email

### Real-time Features
- **Socket.io** integration for live updates
- Real-time notifications
- Live community forum
- Donation alerts
- User presence tracking

### Email Service
- **Nodemailer** with Gmail integration
- Welcome emails
- Donation receipts
- MFA setup instructions
- Password reset emails

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB Atlas (Database)
- Mongoose (ODM)
- Passport.js (OAuth)
- JWT Authentication
- Speakeasy (TOTP MFA)
- QRCode (MFA QR generation)
- Socket.io (Real-time)
- Nodemailer (Email)

**Frontend:**
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- Axios (HTTP client)
- Socket.io-client (Real-time)

**Payment Gateways:**
- Stripe
- PayPal
- MTN Mobile Money
- Orange Money

---

## 📁 Project Structure

```
cloud-heroes-africa/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Database, JWT configs
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, RBAC, validation
│   │   ├── services/        # Payment, Email, Socket, MFA
│   │   └── server.js        # Entry point
│   └── package.json
│
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context
│   │   ├── services/        # API calls
│   │   └── App.jsx
│   └── package.json
│
├── infrastructure/           # IaC configurations
├── config/                   # RBAC, MFA, Session policies
├── docs/                     # Documentation
├── scripts/                  # Operational scripts
├── SETUP.md                  # Setup instructions
├── TECH_STACK.md            # Technical documentation
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v16.20.2+ minimum)
- npm
- MongoDB Atlas account
- Google Cloud Console account (for Google OAuth)
- Azure Portal account (for Microsoft Entra ID)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/cloud-heroes-africa.git
cd cloud-heroes-africa
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

4. **Start the backend server:**
```bash
cd backend
npm run dev
```

5. **Start the frontend (new terminal):**
```bash
cd frontend
npm run dev
```

6. **Open your browser:**
```
http://localhost:5173
```

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 👥 User Roles

### 🎓 Students
- Access free cloud computing courses
- Join community forums
- Track learning progress
- Earn certifications
- **Authentication:** Google OAuth
- **MFA Grace Period:** 14 days

### 👨💼 Administrators
- Manage platform operations
- User management and role assignment
- Volunteer vetting
- Generate invite codes
- Privileged Access Management (PAM)
- **Authentication:** Microsoft Entra ID
- **MFA:** Mandatory on every login (TOTP via authenticator app)

### 💝 Donors
- Support students with donations
- Multiple payment options
- Track donation impact
- View impact dashboard
- Guest donation option (no account required)
- **Authentication:** Google OAuth
- **MFA Grace Period:** 30 days (configurable)

### 🤝 Volunteers
- Mentor students
- Manage assigned classes
- Class-scoped permissions
- Track student progress
- **Authentication:** Microsoft Entra ID
- **MFA:** Mandatory on every login (TOTP via authenticator app)

---

## 🔐 Security Features

- **Dual Identity Provider Strategy** for role separation
- **JWT Token Authentication** with secure HttpOnly cookies
- **Role-Based Access Control (RBAC)** with granular permissions
- **Multi-Factor Authentication (MFA)** with TOTP standard
  - QR code setup with authenticator apps
  - 6-digit time-based codes
  - 10 single-use backup codes per user
  - Mandatory verification on every login for admins/volunteers
  - Speakeasy library for TOTP generation
- **Continuous Authorization Checks (CHA)** for session integrity
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **Security Headers** with Helmet
- **CORS Configuration** for cross-origin requests
- **Password Hashing** with bcrypt
- **Audit Logging** for compliance (POPIA & GDPR)

---

## 🔒 MFA Authentication Flow

### First Login (Administrators & Volunteers)
1. Login with Microsoft Entra ID
2. Complete OAuth authentication
3. Redirect to MFA Setup page
4. Scan QR code with authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)
5. Enter 6-digit verification code
6. Save 10 backup codes securely
7. Access dashboard

### Subsequent Logins (Administrators & Volunteers)
1. Login with Microsoft Entra ID
2. Complete OAuth authentication
3. Enter 6-digit code from authenticator app
4. Access dashboard

### Students & Donors
- Optional MFA with grace periods
- Same setup process if enabled

---

## 💳 Payment Methods

### International
- **Stripe** - Credit/Debit cards worldwide
- **PayPal** - Global payment processing

### Cameroon (Local)
- **MTN Mobile Money** - Mobile payments
- **Orange Money** - Mobile payments

All donations include:
- Automated email receipts
- Transaction tracking
- Impact reporting
- Tax documentation (where applicable)

---

## 📧 Email Notifications

Automated emails for:
- Welcome messages on registration
- Donation receipts
- MFA setup instructions
- Password reset links
- Platform updates
- Community notifications

---

## 🔄 Real-time Features

Powered by Socket.io:
- Live notifications
- Real-time forum messages
- Donation alerts for admins
- Student progress updates
- User online/offline status
- Typing indicators

---

## 🌍 Community Platform

### Forum
- Discuss cloud computing topics
- Ask questions and get answers
- Share experiences and tips
- Study group formation

### Learning Resources
- AWS certification guides
- Azure learning paths
- Google Cloud resources
- Practice tests and materials

### Impact Dashboard
- Community statistics
- Student success stories
- Donation impact metrics
- Geographic reach

---

## 📊 API Endpoints

### Authentication
```
GET  /api/auth/google              - Google OAuth login
GET  /api/auth/google/callback     - Google callback
GET  /api/auth/azure               - Azure AD login
POST /api/auth/azure/callback      - Azure callback
GET  /api/auth/me                  - Get current user
POST /api/auth/logout              - Logout
```

### Multi-Factor Authentication
```
POST /api/mfa/setup                - Generate MFA secret and QR code
POST /api/mfa/verify-setup         - Verify and enable MFA
POST /api/mfa/verify               - Verify MFA token during login
GET  /api/mfa/status               - Get MFA status
POST /api/mfa/disable              - Disable MFA
POST /api/mfa/reset                - Reset MFA (for testing)
```

### Payments
```
POST /api/payments/stripe/create-checkout    - Stripe checkout
POST /api/payments/paypal/create             - PayPal payment
POST /api/payments/mtn/request               - MTN MoMo
POST /api/payments/orange/initiate           - Orange Money
```

### Admin Management
```
GET  /api/admin/dashboard          - Admin dashboard data
GET  /api/admin/users              - Get all users
PUT  /api/admin/users/:id/role     - Update user role
```

### Role-Specific
```
GET /api/student/dashboard         - Student data
GET /api/donor/dashboard           - Donor data
GET /api/volunteer/dashboard       - Volunteer data
```

**For complete API documentation, see [TECH_STACK.md](TECH_STACK.md)**

---

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon (auto-reload)
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server with HMR (auto-opens browser)
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

---

## 🧪 Testing

### Manual Testing
- Community pages (no authentication required)
- OAuth login flows (Google and Azure AD)
- MFA setup and verification
- User role assignment
- Payment gateway integrations
- Real-time features
- Email notifications

### Automated Testing (Future)
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Playwright

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
AZURE_CLIENT_ID=xxx
AZURE_TENANT_ID=xxx
AZURE_CLIENT_SECRET=xxx
STRIPE_SECRET_KEY=xxx
PAYPAL_CLIENT_ID=xxx
MTN_MOMO_API_KEY=xxx
ORANGE_MONEY_API_KEY=xxx
EMAIL_USER=xxx@gmail.com
EMAIL_PASSWORD=xxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**For complete configuration guide, see [SETUP.md](SETUP.md)**

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[TECH_STACK.md](TECH_STACK.md)** - Technical architecture
- **[docs/architecture.md](docs/architecture.md)** - System architecture
- **[docs/discovery.md](docs/discovery.md)** - Discovery document

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- AWS for cloud infrastructure support
- Microsoft Azure for identity services
- Google Cloud for OAuth services
- Stripe for payment processing
- PayPal for global payments
- MTN and Orange for mobile money integration
- All contributors and supporters

---

## 📞 Support

- **Email:** support@cloudheroes.africa
- **Website:** https://cloudheroes.africa
- **Community Forum:** https://cloudheroes.africa/community/forum
- **GitHub Issues:** https://github.com/your-org/cloud-heroes-africa/issues

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ MERN stack implementation
- ✅ Dual OAuth integration (Google + Microsoft Entra ID)
- ✅ TOTP-based MFA with authenticator apps
- ✅ User management and role assignment
- ✅ Payment gateway integration (4 gateways)
- ✅ Real-time features with Socket.io
- ✅ Email service with Nodemailer

### Phase 2 (Q1 2024)
- [ ] Course management system
- [ ] Certificate generation
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Phase 3 (Q2 2024)
- [ ] AI-powered learning recommendations
- [ ] Live video classes
- [ ] Gamification features
- [ ] Multi-language support

### Phase 4 (Q3 2024)
- [ ] Blockchain certificates
- [ ] Job board integration
- [ ] Alumni network
- [ ] Corporate partnerships

---

## 📈 Statistics

- **Students Enrolled:** 1,234+
- **Certifications Earned:** 567+
- **Active Volunteers:** 45+
- **Scholarships Awarded:** $125,000+
- **Countries Reached:** 15+ African nations

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ for Africa by Cloud Heroes Africa Team**

**Version:** 2.0.0 (MERN Stack with TOTP MFA)  
**Last Updated:** 2024  
**Status:** Active Development
