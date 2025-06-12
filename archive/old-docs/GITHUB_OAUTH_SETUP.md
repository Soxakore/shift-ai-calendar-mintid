# GitHub OAuth Setup Guide

## 🔧 Setting up GitHub OAuth for MinTid

### Step 1: Create GitHub OAuth App

1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Click **"Register a new application"** (or **"New OAuth App"** if you have existing apps)
3. Fill in the application details:
   - **Application name**: `MinTid Shift Management`
   - **Homepage URL**: `http://localhost:8080` (for development)
   - **Application description**: `MinTid shift management and scheduling application`
   - **Authorization callback URL**: `https://vcjmwgbjbllkkivrkvqx.supabase.co/auth/v1/callback`

4. Click **"Register Application"**
5. Copy and save:
   - **Client ID** 
   - **Client Secret** (click "Generate a new client secret")

### Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/vcjmwgbjbllkkivrkvqx)
2. Navigate to **Authentication > Providers**
3. Find **GitHub** and click **Enable**
4. Enter your:
   - **Client ID** (from GitHub OAuth app)
   - **Client Secret** (from GitHub OAuth app)
5. Click **Save**

### Step 3: Update Environment Variables

Your `.env.local` already has the correct Supabase configuration:
```bash
VITE_SUPABASE_URL=https://vcjmwgbjbllkkivrkvqx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjam13Z2JqYmxsa2tpdnJrdnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTA0NjIsImV4cCI6MjA2NDY2NjQ2Mn0.-Z3F5KeBUbQYt_-HvvkSefBW1KcKx93kfwOEjjR2Uw4
```

### Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:8080`
3. Click the **"Sign in with GitHub"** button
4. Complete the GitHub OAuth flow
5. You should be redirected back and logged in automatically

## 🔒 Production Setup

For production deployment:

1. Update **Homepage URL** to your production domain
2. Update **Authorization callback URL** to: `https://your-domain.com/auth/v1/callback`
3. Update your production environment variables

## 🛠️ Troubleshooting

- **Invalid redirect_uri**: Make sure the callback URL in GitHub matches exactly
- **Client ID not found**: Verify the Client ID is correct in Supabase
- **Access denied**: Check that the OAuth app is properly configured and active

## 📋 Next Steps

After GitHub OAuth is working:
1. Users will authenticate with their GitHub accounts
2. Super admin access will be granted to configured GitHub usernames
3. User profiles will be created automatically based on GitHub user data
