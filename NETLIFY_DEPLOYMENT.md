# Netlify Deployment Guide

This guide walks you through deploying the Kwanta football match organizer to Netlify.

## Prerequisites

1. **GitHub Repository**: Project is already pushed to https://github.com/getmobilehq/kwantadotorg.git
2. **Firebase Project**: Set up and configured (see DEPLOYMENT.md)
3. **Netlify Account**: Sign up at https://netlify.com

## Step 1: Import Project to Netlify

### Option A: Netlify Dashboard
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select the `getmobilehq/kwantadotorg` repository

### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project directory
netlify deploy --prod
```

## Step 2: Configure Build Settings

Netlify should automatically detect the Next.js project, but verify these settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

## Step 3: Set Environment Variables

In the Netlify dashboard, go to Site settings → Environment variables and add:

### Firebase Configuration
```
FIREBASE_PROJECT_ID = your-firebase-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----
your-private-key-content-here
-----END PRIVATE KEY-----"
```

### Application Settings
```
NEXT_PUBLIC_BASE_URL = https://your-site-name.netlify.app
```

⚠️ **Important**: 
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with line breaks
- Wrap the private key in quotes to preserve formatting
- Update `NEXT_PUBLIC_BASE_URL` with your actual Netlify URL

## Step 4: Configure Custom Domain (Optional)

### If you own kwanta.org:

1. **In Netlify Dashboard**:
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter `kwanta.org`
   - Follow DNS configuration instructions

2. **Update Environment Variable**:
   ```
   NEXT_PUBLIC_BASE_URL = https://kwanta.org
   ```

3. **DNS Configuration**:
   - Add CNAME record: `www.kwanta.org` → `your-site.netlify.app`
   - Add ALIAS/ANAME record: `kwanta.org` → `your-site.netlify.app`

4. **SSL Certificate**:
   - Netlify automatically provisions SSL via Let's Encrypt
   - Enable "Force HTTPS redirect"

## Step 5: Enable Continuous Deployment

Continuous deployment is automatically enabled when you connect via GitHub:

- **Automatic Deploys**: Pushes to `main` branch trigger deployment
- **Deploy Previews**: Pull requests create preview deployments
- **Branch Deploys**: Other branches can be configured for staging

### Configure Deploy Hooks (Optional)
1. Go to Site settings → Build & deploy → Deploy hooks
2. Create hooks for external triggers if needed

## Step 6: Test Deployment

### Verify Core Functionality
1. **Home Page**: Loads correctly with match creation form
2. **Create Match**: Can create new matches
3. **Match Pages**: Individual match pages load with team slots
4. **Admin Dashboard**: Login works and shows match management
5. **API Endpoints**: Test match creation and slot booking
6. **Export Functions**: Excel and PDF downloads work

### Test Firebase Integration
1. Create a test match
2. Try to claim a slot
3. Check Firebase Console to verify data persistence
4. Test admin delete functionality

### Performance Check
1. Run Lighthouse audit
2. Verify loading speeds
3. Test on mobile devices

## Step 7: Monitor and Troubleshoot

### Netlify Functions Logs
- Go to Functions tab in Netlify dashboard
- Monitor API route performance and errors

### Deploy Logs
- Check build logs for any warnings or errors
- Monitor deployment success rates

### Error Monitoring
- Enable Netlify Analytics (optional)
- Set up external monitoring if needed

## Common Issues & Solutions

### Build Failures
- **TypeScript errors**: Temporarily disabled in `next.config.js`
- **Missing dependencies**: Check `package.json` is committed
- **Environment variables**: Verify all required vars are set

### Runtime Errors
- **Firebase connection**: Check credentials format and permissions
- **API routes failing**: Verify Netlify Functions are working
- **CORS issues**: Check API route configurations

### Performance Issues
- **Slow loading**: Enable asset optimization in netlify.toml
- **Large bundle**: Consider code splitting
- **Firebase timeouts**: Increase function timeout in netlify.toml

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] Firebase security rules are properly configured
- [ ] HTTPS is enabled and HTTP redirects
- [ ] Security headers are configured in netlify.toml
- [ ] Admin authentication is working
- [ ] Sensitive data is not exposed in client-side code

## Production Monitoring

### Essential Metrics
- **Uptime**: Monitor site availability
- **Performance**: Track loading times
- **Error rates**: Monitor function failures
- **User activity**: Track match creation and participation

### Recommended Tools
- Netlify Analytics (built-in)
- Google Analytics (optional)
- Sentry for error tracking (optional)
- Firebase Performance Monitoring

## Support Resources

- **Netlify Documentation**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/frameworks/next-js/
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Firebase Documentation**: https://firebase.google.com/docs

---

## Quick Deployment Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled
- [ ] Deploy successful
- [ ] Core functionality tested
- [ ] Firebase integration verified
- [ ] Performance optimized
- [ ] Security headers enabled