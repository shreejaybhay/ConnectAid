# Production Environment Variables Setup

## 🚨 CRITICAL: Required Changes for Vercel Production

You need to update these environment variables in your Vercel dashboard to fix the dashboard access issue:

### 1. NEXTAUTH_URL ⚠️ MOST IMPORTANT

**Current (Development):** `http://localhost:3000`
**Production:** `https://connectaid-shree.vercel.app`

### 2. NEXTAUTH_SECRET ⚠️ CRITICAL

**Must be set:** A strong random string (minimum 32 characters)
**Generate one:** Use `openssl rand -base64 32` or any password generator

### 3. APP_URL

**Current (Development):** `http://localhost:3000`
**Production:** `https://connectaid-shree.vercel.app`

### 4. NODE_ENV

**Production:** `production`

## How to Update in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `connectaid-shree`
3. Go to Settings → Environment Variables
4. Update or add these variables:

   - `NEXTAUTH_URL` = `https://connectaid-shree.vercel.app`
   - `NEXTAUTH_SECRET` = `[GENERATE A STRONG SECRET - 32+ characters]`
   - `APP_URL` = `https://connectaid-shree.vercel.app`
   - `NODE_ENV` = `production`

5. **IMPORTANT:** After updating environment variables, you MUST redeploy your application

## What This Fixes:

- ✅ Proper callback URL handling in production
- ✅ NextAuth will correctly redirect after login
- ✅ No more stuck callback URLs in the address bar
- ✅ Seamless redirect to `/admin/dashboard` or `/dashboard`
- ✅ JWT token validation in production
- ✅ Middleware authentication checks
- ✅ Session persistence across page reloads

## 🔧 Additional Troubleshooting Steps:

### Step 1: Clear Browser Data
After updating environment variables and redeploying:
1. Clear your browser cache and cookies for the site
2. Try logging in with an incognito/private window

### Step 2: Check Environment Variables
Verify your environment variables are correctly set:
1. In Vercel dashboard, go to Settings → Environment Variables
2. Make sure all variables are set for "Production" environment
3. Redeploy after any changes

### Step 3: Debug Production Issues
If still having issues, check the Vercel function logs:
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Check the logs for any authentication errors

### Step 4: Test the Authentication Flow
1. Go to `https://connectaid-shree.vercel.app/login`
2. Login with your credentials
3. Check if you're redirected to the correct dashboard
4. If not, check browser console for errors

## Alternative: Environment-Specific Configuration

If you want to handle this automatically, you can also update your auth configuration to detect the environment:

```javascript
// In your auth.js, you could add:
const isProduction = process.env.NODE_ENV === "production";
const baseUrl = isProduction
  ? "https://connectaid-shree.vercel.app"
  : "http://localhost:3000";
```

But updating the Vercel environment variables is the recommended approach.
