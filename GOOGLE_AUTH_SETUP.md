# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the ChainLithograph application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Make note of your Project ID

## 2. Configure OAuth Consent Screen

1. In your Google Cloud project, navigate to "APIs & Services" > "OAuth consent screen"
2. Select the appropriate user type (External or Internal)
3. Fill in the required information:
   - App name: "ChainLithograph"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `./auth/userinfo.email` and `./auth/userinfo.profile`
5. Add your domains to the authorized domains list (e.g., `your-app.vercel.app`)
6. Save and continue

## 3. Create OAuth Credentials

1. In your Google Cloud project, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Provide a name for your OAuth client ID (e.g., "ChainLithograph Web Client")
5. Add authorized JavaScript origins:
   - For local development: `http://localhost:5000`
   - For production: Your actual domain (e.g., `https://your-app.vercel.app`)
6. Add authorized redirect URIs:
   - For local development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://your-app.vercel.app/api/auth/google/callback`
7. Click "Create"
8. Save your Client ID and Client Secret

## 4. Set Environment Variables

Add the following environment variables to your application:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### For Local Development

Create a `.env` file in the root of your project with these variables.

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the above variables for your production environment
4. Redeploy your application for the changes to take effect

## 5. Testing the Integration

1. Restart your application
2. Visit the login page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page
5. After authenticating, you will be redirected back to your application
