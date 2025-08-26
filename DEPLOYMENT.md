# Kwanta Deployment Guide

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: `kwanta-[your-suffix]`
3. Enable Firestore Database
4. Enable Authentication (for future features)

### 2. Service Account Setup
1. Go to Project Settings → Service Accounts
2. Generate new private key → Download JSON file
3. Extract values for environment variables

### 3. Web App Configuration
1. Go to Project Settings → General
2. Add new Web App
3. Copy configuration values

## Environment Configuration

Create `.env.local` with these values:

```bash
# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your-private-key-here
-----END PRIVATE KEY-----"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Deploy to Firebase

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Project
```bash
firebase init
# Select:
# - Firestore
# - Hosting
# Choose existing project: kwanta-[your-suffix]
# Use existing firestore.rules
# Use existing firestore.indexes.json
# Set public directory: out
# Configure as SPA: Yes
```

### 3. Build and Deploy
```bash
# Build for production
npm run build
npm run export  # If using static export

# Deploy to Firebase
firebase deploy
```

## CI/CD Pipeline with GitHub Actions

### Automated Deployment Process

The project includes a comprehensive CI/CD pipeline that:

1. **Continuous Integration**
   - Runs on every push/PR
   - Executes linting and type checking
   - Builds the application
   - Performs security audits

2. **Performance Testing**
   - Lighthouse audits on PRs
   - Performance, accessibility, and SEO checks

3. **Automatic Deployment**
   - Deploys to production on main branch push
   - Uses Vercel for hosting

### Required GitHub Secrets

Set these in your GitHub repository settings:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com  
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Application
NEXT_PUBLIC_BASE_URL=https://kwanta.org

# Vercel Integration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Alternative: Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push via GitHub Actions

## Local Development with Firebase

1. Install dependencies: `npm install`
2. Set up `.env.local` with Firebase credentials
3. Run development server: `npm run dev`

## Testing

### Backend API Testing
```bash
# Test match creation
curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Match",
    "dateISO": "2025-01-20",
    "timeISO": "15:00",
    "location": "Test Field",
    "teamSize": 11,
    "teamAName": "Team A",
    "teamBName": "Team B"
  }'

# Test slot claiming
curl -X POST http://localhost:3000/api/slots/claim \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "your-match-id",
    "teamId": "your-team-id",
    "slotNumber": 1,
    "name": "John Doe",
    "emailOrPhone": "john@example.com"
  }'
```

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set correctly
- [ ] Firestore security rules deployed
- [ ] Application builds without errors
- [ ] API endpoints tested
- [ ] Domain configured (if using custom domain)
- [ ] HTTPS enabled
- [ ] Error monitoring setup (optional)

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK errors**: Check private key formatting and project ID
2. **CORS issues**: Ensure API routes are properly configured
3. **Build errors**: Verify all environment variables are set
4. **Firestore permission denied**: Check security rules deployment

### Debug Mode
Add `NEXT_PUBLIC_DEBUG=true` to enable additional logging.