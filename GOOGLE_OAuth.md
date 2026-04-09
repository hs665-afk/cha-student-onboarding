# Google OAuth 2.0 Setup Guide

This guide provides step-by-step instructions to get Google OAuth 2.0 credentials for the Cloud Heroes Africa backend.

---

## Prerequisites
- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. If you don't have a project, create one:
   - Click on the **project dropdown** at the top
   - Click **"New Project"**
   - Name it: `Cloud Heroes Africa` (or similar)
   - Click **"Create"**
   - Wait for it to initialize (1-2 minutes)

---

## Step 2: Enable Google+ API
1. In the **left sidebar**, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it
4. Click **"Enable"**

---

## Step 3: Set Up OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen** (left sidebar)
2. Choose **"External"** for User Type
3. Click **"Create"**
4. Fill in the form:
   - **App name**: `Cloud Heroes Africa`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On **Scopes** page: Click **"Save and Continue"** (default scopes are fine)
7. On **Test users** page: Click **"Add Users"** and add your test email
8. Click **"Save and Continue"**
9. Review and confirm

---

## Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose application type: **"Web application"**
4. Give it a name: `Cloud Heroes Backend`
5. Under **Authorized redirect URIs**, click **"Add URI"** and paste:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
6. Click **"Create"**

---

## Step 5: Copy Your Credentials

### Option A: From Popup
A popup will appear with your credentials:
- **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (long alphanumeric string)

**Copy and save both values immediately!**

### Option B: From Credentials Page (If You Missed the Popup)
1. Go to **Credentials** page
2. Find **"Cloud Heroes Backend"** under **OAuth 2.0 Client IDs**
3. Click on it to open details
4. You'll see:
   - **Client ID**
   - **Client Secret** (click the eye icon to reveal it)
5. Copy both values

### Option C: Download as JSON
1. On the **Credentials** page
2. Find your credential
3. Click the **Download icon** (⬇️)
4. You'll get a JSON file with both values:
   ```json
   {
     "client_id": "xxxxx.apps.googleusercontent.com",
     "client_secret": "GOCSPX-xxx"
   }
   ```

---

## Step 6: Update Your .env File

1. Open [`backend/.env`](backend/.env)
2. Find the **GOOGLE OAUTH 2.0** section
3. Replace the placeholder values:

```dotenv
# GOOGLE OAUTH 2.0 (Students & Donors)
GOOGLE_CLIENT_ID=<your_client_id_here>
GOOGLE_CLIENT_SECRET=<your_client_secret_here>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Example:
```dotenv
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456xyz
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

4. **Save the .env file**

---

## Step 7: Optional - Generate JWT Secrets

For better security in development, generate random JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command **twice** and paste the outputs into your `.env` file:

```dotenv
JWT_SECRET=<first_output>
JWT_REFRESH_SECRET=<second_output>
```

---

## Step 8: Restart Your Backend

```bash
npm start
```

You should now see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**Without the OAuth error!** ✅

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `OAuth2Strategy requires a clientID option` | Make sure your `.env` file has `GOOGLE_CLIENT_ID` set with the correct value |
| `Redirect URI mismatch` | Ensure `GOOGLE_CALLBACK_URL` in `.env` matches the one registered in Google Cloud Console |
| Can't find Client Secret | Click on your credential in **Credentials** page and look for the eye icon to reveal it |
| Credentials page not showing credential | Refresh the page or go to **Credentials** → **OAuth 2.0 Client IDs** |

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google API Library](https://console.cloud.google.com/apis/library)

---

## ✅ Setup Complete!

Your Google OAuth 2.0 is now configured and ready to use. Users can now:
- Sign up with Google
- Log in with Google
- Have their profile automatically created in the system

Happy coding! 🚀
