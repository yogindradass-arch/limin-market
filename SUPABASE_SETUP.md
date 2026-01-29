# Supabase Setup Guide for Limin Market

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: limin-market (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier works great for development
4. Click "Create new project" and wait for it to initialize (takes 1-2 minutes)

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar) → **API**
2. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: A long JWT token string

## Step 3: Configure Your Local Environment

1. Create a `.env` file in your project root (already have `.env.example` as template)
2. Copy the content from `.env.example` and replace with your actual values:

```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Add `.env` to your `.gitignore` file (if not already there)

## Step 4: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email provider** is enabled by default
3. (Optional) Enable social login providers:
   - Click on **Google** or **GitHub**
   - Follow instructions to add OAuth credentials
   - Toggle "Enable" and save

## Step 5: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and magic link emails to match your brand
3. Set your site URL in **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:5173` (for development)

## Step 6: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the `supabase-schema.sql` file in this project
3. Copy the entire SQL script and paste it into the Supabase SQL Editor
4. Click "Run" to execute the script

This will create:
- **products** table - stores all product listings
- **favorites** table - stores user favorites
- **profiles** table - extended user information
- Row Level Security (RLS) policies for secure data access
- Indexes for better query performance
- Sample data for testing (optional)

The schema includes:
- Phone number field for direct contact
- Listing types: standard, wholesale, local pickup
- User favorites functionality
- Automatic profile creation on signup

## Step 7: Test Your Setup

1. Start your development server: `npm run dev`
2. The app should load without errors
3. Try creating an account using the auth components
4. Test posting a listing with the FAB (+) button
5. Click on products to see the phone number contact button

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists and has the correct variable names
- Restart your dev server after creating/updating `.env`

### Authentication not working
- Check that Email provider is enabled in Supabase dashboard
- Verify your Site URL is configured correctly
- Check browser console for specific error messages

## Next Steps

Once your `.env` file is configured:
1. Restart the dev server: `npm run dev`
2. The app will be ready to use Supabase authentication
3. Share your Version 11 mockup to build the homepage layout
