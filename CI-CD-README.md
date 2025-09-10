# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline setup for the Kwanta application.

## 🚀 Overview

The project uses GitHub Actions for automated testing, building, security scanning, and deployment. The pipeline consists of multiple workflows designed to ensure code quality, security, and reliable deployments.

## 📋 Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggered by:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**Jobs:**
- **CI (Continuous Integration)**
  - Code checkout and Node.js setup
  - Dependency installation with caching
  - ESLint code linting
  - TypeScript type checking
  - Test execution
  - Application build
  - Build artifact upload

- **Quality Gate**
  - Ensures all CI and security checks pass
  - Gates deployment to production
  - Provides clear success/failure feedback

- **Deploy Preview (PRs only)**
  - Deploys preview versions for pull requests
  - Automatically comments PR with preview URL
  - Uses Vercel for preview deployments

- **Deploy Production**
  - Deploys to production when main branch is updated
  - Only runs after quality gate passes
  - Deploys to https://kwanta.org via Vercel

- **Security Audit**
  - Runs npm audit for vulnerability checks
  - Checks for critical and high-severity issues
  - Runs in parallel with CI for faster feedback

- **Lighthouse Performance**
  - Performance testing for PRs
  - Monitors bundle size and core web vitals
  - Uses configuration from `.lighthouserc.json`

### 2. Code Quality & Security (`.github/workflows/code-quality.yml`)

**Triggered by:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Weekly schedule (Sundays at 2 AM UTC)

**Jobs:**
- **Code Quality Analysis**
  - Advanced ESLint reporting
  - Code complexity analysis
  - Uploads detailed reports as artifacts

- **Dependency Vulnerability Scan**
  - Comprehensive npm audit
  - Generates JSON reports
  - Provides security summary

- **SAST (Static Application Security Testing)**
  - Semgrep security scanning
  - Identifies security anti-patterns
  - Requires `SEMGREP_APP_TOKEN` secret

- **License Compliance Check**
  - Scans all dependencies for license issues
  - Generates compliance reports
  - Ensures legal requirements are met

- **Bundle Analysis (PRs only)**
  - Analyzes bundle size changes
  - Comments on PRs with size impact
  - Helps prevent bundle bloat

### 3. Automated Dependency Updates (`.github/workflows/dependency-updates.yml`)

**Triggered by:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual workflow dispatch

**Features:**
- Automatically updates dependencies
- Applies security fixes
- Creates PRs with detailed changelogs
- Labels PRs for easy identification

### 4. Production Health Check (`.github/workflows/health-check.yml`)

**Triggered by:**
- Hourly schedule
- Manual workflow dispatch

**Monitors:**
- Application availability and response times
- API endpoint functionality
- Basic accessibility checks
- Security headers presence

## 🔧 Configuration Requirements

### Required GitHub Secrets

Add these secrets in your repository settings:

```env
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Application Settings
NEXT_PUBLIC_BASE_URL=https://kwanta.org

# Optional: Security Scanning
SEMGREP_APP_TOKEN=your_semgrep_token
```

### Environment Setup

The workflows automatically handle:
- Node.js 18 setup
- Dependency caching for faster builds
- Build artifact management
- Multi-environment deployment

## 📊 Quality Gates

The pipeline includes several quality gates:

1. **Code Linting** - ESLint must pass
2. **Type Checking** - TypeScript compilation must succeed
3. **Build Verification** - Application must build successfully
4. **Security Audit** - No critical vulnerabilities allowed
5. **Performance Testing** - Lighthouse checks for PRs

## 🚀 Deployment Strategy

### Preview Deployments
- Every PR gets a preview deployment
- Preview URLs are automatically commented on PRs
- Enables testing changes before merging

### Production Deployment
- Only triggered by pushes to `main` branch
- Requires all quality gates to pass
- Zero-downtime deployment via Vercel
- Automatic rollback on deployment failure

## 📈 Monitoring & Alerts

### Health Monitoring
- Hourly health checks of production environment
- Response time monitoring
- API endpoint verification
- Security headers validation

### Security Monitoring
- Weekly dependency vulnerability scans
- Automated security updates via Dependabot
- SAST scanning for code security issues
- License compliance monitoring

## 🛠️ Local Development Support

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Quality Checks
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run test            # Run tests
npm run check-all       # Run all quality checks

# Utilities
npm run clean           # Clean build artifacts
npm run analyze         # Bundle analysis
npm run preview         # Build and preview locally
```

### Local Quality Gate

Run the full quality check locally:
```bash
npm run check-all
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify dependencies: `npm ci`
   - Clear build cache: `npm run clean`

2. **Deployment Issues**
   - Verify required secrets are set
   - Check build artifacts are created
   - Ensure quality gates pass

3. **Security Scan Failures**
   - Review npm audit output
   - Update vulnerable dependencies
   - Apply security patches

## 📚 Best Practices

1. **Pull Request Workflow**
   - Always create PRs for changes
   - Wait for all checks to pass
   - Review preview deployment
   - Ensure quality gates pass

2. **Security**
   - Regularly update dependencies
   - Monitor security alerts
   - Review audit reports
   - Use security headers

3. **Performance**
   - Monitor bundle size changes
   - Check Lighthouse scores
   - Optimize build artifacts
   - Use caching effectively

## 🎯 Future Enhancements

- Integration with monitoring tools (DataDog, New Relic)
- Advanced testing frameworks (Jest, Cypress)
- Database migration automation
- Feature flag integration
- Blue/green deployment strategy

---

For questions or improvements to the CI/CD pipeline, please open an issue or submit a PR.