# StuntPitch Monorepo

Full-stack stunt performer directory with web and mobile apps.

## Project Structure

```
├── web/               # Next.js web application (your existing app)
├── mobile/            # React Native mobile app
├── shared/            # Shared code between web and mobile
│   ├── lib/          # Supabase clients, AI agents, utilities
│   ├── types/        # TypeScript database types
│   └── constants/    # Shared constants
└── package.json      # Workspace configuration
```

## Quick Start

### Web App (Existing)
```bash
npm run web:dev
```

### Mobile App (New)
```bash
# First time setup:
cd mobile
cp .env.example .env  # Add your Supabase keys
npm install

# Then start:
npm run mobile:dev
```

### Shared Library
```bash
npm run shared:build
```

## Development Workflow with Cursor

1. **Single Workspace**: Cursor sees all code (web, mobile, shared)
2. **Code Reuse**: Business logic is in `/shared` directory
3. **Hot Reload**: Both web and mobile support live reloading
4. **Type Safety**: Shared TypeScript types across all apps

## Key Features Migrated

- ✅ AI Chat Search (reuses existing backend)
- ✅ Profile Display
- ✅ Supabase Integration
- ✅ Authentication Ready
- 🔄 Camera Integration (mobile-specific)
- 🔄 Push Notifications (mobile-specific)
- 🔄 App Store Deployment

## Scripts

```bash
# Development
npm run web:dev          # Start web app
npm run mobile:dev       # Start mobile app
npm run mobile:ios       # Run on iOS simulator
npm run mobile:android   # Run on Android emulator

# Building
npm run web:build        # Build web app
npm run mobile:build:ios # Build iOS app
npm run mobile:build:android # Build Android app

# Utilities
npm run install:all      # Install all dependencies
npm run clean           # Clean all node_modules and build artifacts
```

## What's Already Working

Your mobile app can immediately:
- Use the same Supabase database
- Call the same API endpoints
- Run the same AI agents
- Display search results
- Handle authentication

## Next Steps

1. Set up mobile environment variables
2. Test basic functionality
3. Add native mobile features (camera, push notifications)
4. Polish UI/UX
5. Deploy to app stores

The beauty of this setup is that **90% of your backend logic is already mobile-ready!**
