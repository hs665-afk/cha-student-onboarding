# Quick Start Guide - Cloud Heroes Africa

## ⚡ Get Running in 5 Minutes

**Current Status:** ✅ FULLY FUNCTIONAL - All authentication and features working!

### Step 1: Install Backend Dependencies (2 min)
```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment (1 min)
```bash
cp .env.example .env
```

**Edit `backend/.env` - Minimum required:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudheroes?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Session
SESSION_SECRET=your-session-secret-here

# URLs
FRONTEND_URL=http://localhost:5373
API_URL=http://localhost:8000

# Google OAuth (for Students/Donors)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Azure OAuth (for Admins/Volunteers - OPTIONAL)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_CALLBACK_URL=http://localhost:8000/api/auth/azure/callback
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Backend (30 sec)
```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on port 8000
📡 Environment: development
🌐 API URL: http://localhost:8000
✅ MongoDB Connected
✅ Passport initialized
✅ Socket.io ready
```

### Step 4: Install Frontend Dependencies (1 min)
**Open NEW terminal:**
```bash
cd frontend
npm install
```

### Step 5: Configure Frontend (30 sec)
```bash
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

### Step 6: Start Frontend (30 sec)
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  build tool for modern web

  ➜  Local:   http://localhost:5373/
  ➜  press h + enter to show help
```

### Step 7: Open Browser
```
http://localhost:5373
```

---

## 🎯 What You'll See

### Public Pages (No Login Required)
1. **Homepage** - Welcome page with platform overview
2. **Community** - Public forum, resources, and impact dashboard
3. **Login Page** - OAuth login options

### After Login via Google OAuth
- ✅ Student Dashboard
- ✅ Real-time socket connection
- ✅ Automatic JWT token in HttpOnly cookie
- ✅ Community access

### After Login via Azure OAuth
- ✅ Administrator Dashboard with:
  - **User Management** - view all users, delete accounts
  - **Role Assignment** - dynamically assign user roles
- ✅ Full admin privileges
- ✅ Same features as Google + admin panel

---

## 🔧 MongoDB Atlas Setup (5 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier M0 available)
3. Create cluster
4. Create database user with password
5. Whitelist IPs:
   - Development: `0.0.0.0/0` (allow all)
   - Production: Your server IP only
6. Copy connection string
7. Paste into `backend/.env` as `MONGODB_URI`
   ```
   mongodb+srv://username:password@cluster0.k6xrqnu.mongodb.net/cloudheroes?retryWrites=true&w=majority
   ```

---

## 🔐 OAuth Setup

### ✅ Google OAuth (Students/Donors - RECOMMENDED FOR TESTING)

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 Credentials (Web Application)
5. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
6. Copy **Client ID** and **Client Secret**
7. Add to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
   ```
8. Restart backend: `npm run dev`
9. Test: Click "Login with Google"

**Status:** ✅ FULLY WORKING

---

### ✅ Microsoft Entra ID / Azure AD (Admins/Volunteers - OPTIONAL)

**Steps:**
1. Go to https://portal.azure.com/
2. Navigate to Azure Active Directory → App registrations
3. Click "New registration"
4. Enter name: `Cloud Heroes Africa Backend`
5. Click "Register"
6. Go to "Authentication" → Add platform → "Web"
7. Add redirect URI: `http://localhost:8000/api/auth/azure/callback`
8. Enable: Access tokens & ID tokens
9. Go to "Certificates & secrets" → "New client secret"
10. Copy the **Value** (not ID!)
11. Copy **Client ID** and **Tenant ID** from Overview
12. Add to `backend/.env`:
    ```env
    AZURE_CLIENT_ID=your-client-id-here
    AZURE_TENANT_ID=your-tenant-id-here
    AZURE_CLIENT_SECRET=your-client-secret-here
    AZURE_CALLBACK_URL=http://localhost:8000/api/auth/azure/callback
    ```
13. Restart backend
14. Test: Click "Login with Microsoft"

**Status:** ✅ FULLY WORKING (April 2026 fix: Custom OAuth2 handler)

**See:** [AZURE_AUTH.md](AZURE_AUTH.md) for detailed setup

---

## 💳 Payment Setup (Optional)

### Stripe
1. https://stripe.com/ → Sign up
2. Get API keys from Dashboard
3. Add to `backend/.env`

### PayPal
1. https://developer.paypal.com/
2. Create app
3. Get Client ID and Secret
4. Add to `backend/.env`

---

## 📧 Email Setup (Optional)

### Gmail App Password
1. Go to https://myaccount.google.com/
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Generate app password for "Mail" and "Windows Computer"
5. Copy password
6. Add to `backend/.env`:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   ```

**Note:** Gmail has a 500 email/day limit for development. For production, use SendGrid, Mailgun, or AWS SES.

---

## 🧪 Quick Test Without OAuth

To test without setting up Google/Azure, add a test endpoint:

1. Open `backend/src/routes/auth.routes.js`
2. Add at the end (before `module.exports`):
   ```javascript
   // Test login endpoint (development only)
   router.get('/test-login/:role', async (req, res) => {
     try {
       const { role } = req.params;
       const validRoles = ['student', 'donor', 'volunteer', 'administrator'];
       
       if (!validRoles.includes(role)) {
         return res.status(400).json({ message: 'Invalid role' });
       }
       
       let user = await User.findOne({ email: `test-${role}@test.com` });
       
       if (!user) {
         user = await User.create({
           name: `Test ${role}`,
           email: `test-${role}@test.com`,
           role: role,
           provider: 'local',
           isVerified: true
         });
       }
       
       const token = generateToken(user._id, user.role);
       const refreshToken = generateRefreshToken(user._id);
       
       res.cookie('token', token, {
         httpOnly: true,
         secure: false,
         maxAge: 7 * 24 * 60 * 60 * 1000
       });
       
       res.json({
         success: true,
         user,
         token,
         refreshToken
       });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

3. Test by visiting: http://localhost:8000/api/auth/test-login/administrator

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5373
- [ ] MongoDB connected successfully
- [ ] No server startup errors
- [ ] Google login works
- [ ] Azure login works (if configured)
- [ ] User data appears in dashboard
- [ ] Socket connection established (check DevTools)
- [ ] No 401 redirect loops
- [ ] User management buttons are clickable

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
sudo lsof -i :8000

# Kill process on port 8000
kill -9 <PID>

# Or change port in .env
PORT=8001
```

### MongoDB connection fails
```bash
# Check connection string
MONGODB_URI=mongodb+srv://user:password@cluster0.xyz.mongodb.net/dbname?retryWrites=true&w=majority

# Ensure:
# 1. User/password are correct
# 2. IP whitelist allows 0.0.0.0/0 (for development)
# 3. Database name matches
```

### OAuth login not working
- Check `.env` credentials are correct
- Verify redirect URIs in Google/Azure Portal match exactly
- Check backend console for error messages
- Clear browser cookies and try again

### "401 Redirect Loop"
- This was fixed! Make sure you have latest code
- Refresh browser and clear cache
- Check `/auth/me` returns valid JWT

### Email not sending
- Check Gmail hasn't hit 500/day limit
- Verify app password is correct (not regular password)
- Check EMAIL_USER is correct
- Look for error logs in backend console

---

## 📚 Full Documentation

- **[README.md](README.md)** - Full project overview
- **[SETUP.md](SETUP.md)** - Comprehensive setup guide
- **[AZURE_AUTH.md](AZURE_AUTH.md)** - Azure/Entra ID setup
- **[GOOGLE_OAuth.md](GOOGLE_OAuth.md)** - Google OAuth setup
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Features and status
- **[CHANGELOG.md](CHANGELOG.md)** - Recent fixes (NEW!)

---

## 🚀 You're Ready!

Your Cloud Heroes Africa platform is now running! 

Next steps:
1. Explore the community forum
2. Test authentication flows
3. Try user management features
4. Configure payment gateways (optional)
5. Set up email service (optional)
6. Deploy to production when ready

Questions? Check the documentation files or see [TROUBLESHOOTING](#troubleshooting) section above.
```

**Then visit:**
- `http://localhost:5000/api/auth/test-login/student`
- `http://localhost:5000/api/auth/test-login/administrator`
- `http://localhost:5000/api/auth/test-login/donor`
- `http://localhost:5000/api/auth/test-login/volunteer`

---

## 🚨 Common Issues

### Backend won't start
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error
- Check `MONGODB_URI` in `.env`
- Ensure password doesn't have special characters
- Whitelist your IP in MongoDB Atlas

### Frontend won't start
```bash
# Check if backend is running
curl http://localhost:5000

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

---

## 📚 Next Steps

1. ✅ Get app running locally
2. [ ] Set up MongoDB Atlas
3. [ ] Configure OAuth providers
4. [ ] Set up payment gateways
5. [ ] Configure email service
6. [ ] Read [SETUP.md](SETUP.md) for details
7. [ ] Read [TECH_STACK.md](TECH_STACK.md) for architecture

---

## 🎉 Success!

If you see the Cloud Heroes Africa homepage, you're done! 🚀

**Need help?** See [SETUP.md](SETUP.md) for detailed instructions.
