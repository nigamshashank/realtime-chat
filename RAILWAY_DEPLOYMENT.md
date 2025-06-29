# Railway.app Deployment Guide

This guide will help you deploy your Vedic Astrology application to Railway.app.

## Prerequisites

1. GitHub account with your code repository
2. Google Cloud Console access (for OAuth credentials)
3. Railway.app account

## Step 1: Prepare Your Repository

✅ **Already Done:**
- Procfile created
- package.json updated with start script
- Environment variables configured
- All dependencies installed

## Step 2: Commit and Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 3: Deploy to Railway

### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

### 3.2 Deploy Your App
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will automatically detect it's a Node.js app
5. Click "Deploy"

### 3.3 Add MongoDB Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "MongoDB"
3. Wait for the database to be created
4. Copy the connection string (we'll use this in Step 4)

## Step 4: Configure Environment Variables

1. In your Railway project, go to the "Variables" tab
2. Add the following environment variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session and JWT Configuration
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# MongoDB Configuration (use Railway's MongoDB)
MONGODB_URI=your-railway-mongodb-connection-string

# Server Configuration
PORT=3001

# TimeZoneDB API (optional)
TIMEZONEDB_API_KEY=your-timezonedb-api-key
```

### 4.1 Get Your Railway MongoDB URI
1. Click on your MongoDB database in Railway
2. Go to "Connect" tab
3. Copy the "MongoDB Connection String"
4. Replace `your-railway-mongodb-connection-string` with this value

### 4.2 Generate Secure Secrets
```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add your Railway domain to "Authorized redirect URIs":
   ```
   https://your-app-name.railway.app/auth/google/callback
   ```
5. Save the changes

## Step 6: Test Your Deployment

1. Go to your Railway project dashboard
2. Click on your app service
3. Click the generated URL (e.g., `https://your-app-name.railway.app`)
4. Test the Google OAuth login
5. Test the Panchanga and Horoscope calculations

## Step 7: Custom Domain (Optional)

1. In Railway, go to your app service
2. Click "Settings" tab
3. Under "Domains", click "Generate Domain"
4. Or add your custom domain

## Troubleshooting

### Common Issues:

1. **Build fails**
   - Check Railway logs for errors
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **MongoDB connection fails**
   - Verify the MONGODB_URI is correct
   - Check if the database is running in Railway

3. **Google OAuth redirect error**
   - Ensure the redirect URI in Google Console matches exactly
   - Include the protocol (https://)

4. **Environment variables not loading**
   - Check Railway Variables tab
   - Ensure variable names match exactly
   - Redeploy after adding variables

### Check Logs:
1. In Railway dashboard, click on your app
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Check "Build Logs" and "Deploy Logs"

## Cost Information

- **Free Tier**: 500 hours/month, 512MB RAM
- **Paid Tier**: $5/month for more resources
- **MongoDB**: Free with Railway

## Next Steps

1. **Monitor Usage**: Check Railway dashboard for resource usage
2. **Scale Up**: Upgrade to paid tier if needed
3. **Custom Domain**: Add your own domain name
4. **Backup**: Set up regular database backups

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your app logs: Available in Railway dashboard 