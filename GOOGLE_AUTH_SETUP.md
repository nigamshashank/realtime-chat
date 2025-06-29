# Google OAuth Authentication Setup

This guide will help you set up Google OAuth authentication for your Vedic Astrology application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Node.js and npm installed

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Click "Create"
6. Note down your **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Session and JWT Configuration
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/realtime-chat

# Server Configuration
PORT=3001

# TimeZoneDB API (for timezone lookup)
TIMEZONEDB_API_KEY=your-timezonedb-api-key-here
```

## Step 4: Install Dependencies

The required dependencies have already been installed:

```bash
npm install passport passport-google-oauth20 express-session jsonwebtoken bcryptjs
```

## Step 5: Start the Application

1. Make sure MongoDB is running
2. Start the application:
   ```bash
   node server.js
   ```
3. Open your browser and go to `http://localhost:3001`
4. You should see the login page with a "Login with Google" button

## Step 6: Test the Authentication

1. Click "Login with Google"
2. You'll be redirected to Google's OAuth consent screen
3. Grant permission to your application
4. You'll be redirected back to the application with authentication

## Features Implemented

- ✅ Google OAuth 2.0 authentication
- ✅ User profile storage in MongoDB
- ✅ Session management
- ✅ JWT token generation
- ✅ Protected routes
- ✅ Login/logout functionality
- ✅ User profile display
- ✅ Navigation between Panchanga and Horoscope pages

## Security Notes

- In production, set `secure: true` in session configuration
- Use HTTPS in production
- Store sensitive environment variables securely
- Regularly rotate your secrets

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Console matches exactly
   - Include the protocol (http:// or https://)

2. **"Client ID not found" error**
   - Verify your Google Client ID is correct
   - Make sure the Google+ API is enabled

3. **Session not persisting**
   - Check that MongoDB is running
   - Verify session secret is set

4. **CORS issues**
   - The application is configured for same-origin requests
   - For cross-origin requests, additional CORS configuration may be needed

## Production Deployment

For production deployment:

1. Update redirect URIs in Google Console
2. Set environment variables on your hosting platform
3. Enable HTTPS
4. Set secure session cookies
5. Use a production MongoDB instance

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Server logs for backend errors
3. Google Cloud Console for OAuth configuration
4. MongoDB connection status 