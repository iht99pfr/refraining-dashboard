# Refrain Dashboard

React application for the Refrain recovery support platform dashboard.

## Features

- ✅ Supabase authentication with auto-login from onboarding
- ✅ User profile management (editable except phone number)
- ✅ Call initiation
- ✅ Call history display
- ✅ Protected routes
- ✅ Responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
VITE_SUPABASE_URL=https://yxicdlucumvhsskscnft.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://app.refrain.ing
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Deployment to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

4. Configure custom domain `app.refrain.ing`

## Auto-Login Flow

When users complete onboarding on `refrain.ing`, they're redirected to:
```
app.refrain.ing/dashboard?auth={"access_token":"...","refresh_token":"..."}
```

The dashboard automatically authenticates and loads the user profile.
