# StuntPitch Mobile App

React Native/Expo mobile app that reuses the existing StuntPitch backend.

## Setup

1. Copy environment variables from your web app:
   ```bash
   # Create mobile/.env with these values from web/.env.local:
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_API_URL=https://your-deployed-web-app-url.com
   ```

2. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Features Implemented

- ✅ Chat interface that uses your existing AI backend
- ✅ Profile search results display
- ✅ Supabase authentication ready
- ✅ Reuses all your existing business logic

## Next Steps

1. Set up environment variables
2. Test the basic chat functionality
3. Add profile detail screens
4. Add camera/photo features
5. Add authentication flows
6. Polish UI/UX
7. Build and deploy to app stores

## File Structure

```
mobile/
├── src/
│   ├── config/          # Supabase config
│   ├── screens/         # App screens
│   ├── services/        # API services (reuses your backend)
│   └── types/           # TypeScript types (shared with web)
├── App.tsx             # Main app component
└── package.json        # Dependencies
```
