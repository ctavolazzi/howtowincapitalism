# Deployment & Operations

> Complete deployment and operations documentation for How To Win Capitalism
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Build Process](#build-process)
6. [Deployment Methods](#deployment-methods)
7. [Cloudflare KV Setup](#cloudflare-kv-setup)
8. [User Seeding](#user-seeding)
9. [Environment Variables](#environment-variables)
10. [Monitoring & Logs](#monitoring--logs)
11. [Rollback Procedures](#rollback-procedures)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| **Hosting** | Cloudflare Pages | Static + serverless |
| **Runtime** | Cloudflare Workers | API routes |
| **Database** | Cloudflare KV | User/session storage |
| **Email** | Resend | Transactional email |
| **Domain** | Cloudflare | DNS, SSL, CDN |

### URLs

| Environment | URL |
|-------------|-----|
| Production | https://howtowincapitalism.com |
| Preview | https://*.howtowincapitalism.pages.dev |
| Local Dev | http://localhost:4321 |

---

## Architecture

### Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LOCAL DEVELOPMENT                                                        │
│     ┌────────────────────────────────────────────────────────────────────┐  │
│     │  npm run dev                                                        │  │
│     │  └─▶ Astro dev server (http://localhost:4321)                      │  │
│     │  └─▶ Hot reload enabled                                            │  │
│     │  └─▶ Local mock auth (no KV)                                       │  │
│     └────────────────────────────────────────────────────────────────────┘  │
│                              │                                               │
│                              ▼                                               │
│  2. BUILD                                                                    │
│     ┌────────────────────────────────────────────────────────────────────┐  │
│     │  npm run build                                                      │  │
│     │  └─▶ TypeScript compilation                                        │  │
│     │  └─▶ Astro SSR build                                               │  │
│     │  └─▶ Output to dist/                                               │  │
│     │       ├── _worker.js (Cloudflare Worker)                           │  │
│     │       ├── _routes.json (routing config)                            │  │
│     │       └── static assets                                            │  │
│     └────────────────────────────────────────────────────────────────────┘  │
│                              │                                               │
│                              ▼                                               │
│  3. DEPLOY                                                                   │
│     ┌────────────────────────────────────────────────────────────────────┐  │
│     │  npm run deploy                                                     │  │
│     │  └─▶ wrangler pages deploy dist                                    │  │
│     │  └─▶ Upload to Cloudflare Pages                                    │  │
│     │  └─▶ Live at howtowincapitalism.com                               │  │
│     └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Diagram

```
                                 ┌─────────────────┐
                                 │   Cloudflare    │
                                 │      CDN        │
                                 └────────┬────────┘
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CLOUDFLARE PAGES                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────┐      ┌────────────────────────┐                  │
│  │    Static Assets       │      │   Cloudflare Worker    │                  │
│  │  (HTML, CSS, JS, etc)  │      │   (API Routes)         │                  │
│  └────────────────────────┘      └──────────┬─────────────┘                  │
│                                              │                                │
└──────────────────────────────────────────────┼────────────────────────────────┘
                                               │
                                               ▼
                            ┌──────────────────────────────────┐
                            │         CLOUDFLARE KV            │
                            ├──────────────────────────────────┤
                            │  USERS namespace                 │
                            │  SESSIONS namespace              │
                            └──────────────────────────────────┘
```

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Wrangler | 4+ | Cloudflare CLI |
| Git | Any | Version control |

### Cloudflare Account Setup

1. Create Cloudflare account at https://dash.cloudflare.com
2. Create Pages project
3. Create KV namespaces (USERS, SESSIONS)
4. Configure custom domain (optional)

### Install Dependencies

```bash
# Clone repository
git clone https://github.com/ctavolazzi/howtowincapitalism.git
cd howtowincapitalism

# Install dependencies
npm install

# Install Wrangler globally (optional)
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

---

## Environment Configuration

### wrangler.toml

```toml
# wrangler.toml

name = "howtowincapitalism"
pages_build_output_dir = "dist"
compatibility_date = "2025-12-08"

[env.production]
compatibility_date = "2024-09-23"
compatibility_flags = [ "nodejs_compat" ]

[[env.production.kv_namespaces]]
id = "xxxxx-sessions-namespace-id"
binding = "SESSIONS"

[[env.production.kv_namespaces]]
id = "xxxxx-users-namespace-id"
binding = "USERS"
```

### Astro Configuration

```javascript
// astro.config.mjs

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://howtowincapitalism.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [mdx(), sitemap()],
});
```

---

## Build Process

### Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Build + validation
npm run check

# Preview production build locally
npm run preview
```

### Build Output Structure

```
dist/
├── _worker.js            # Cloudflare Worker entry point
├── _routes.json          # Route configuration
├── _headers              # HTTP headers
├── _redirects            # Redirect rules
├── favicon.svg           # Static assets
├── og-image.png
└── [pages]/              # Rendered pages
```

### Build Verification

```bash
# Verify build succeeds
npm run check

# Expected output:
# ✓ Build passed
```

---

## Deployment Methods

### Method 1: Ship Script (Recommended)

One-command build, commit, push, and deploy:

```bash
npm run ship "your commit message"
```

**What it does:**
1. Runs `npm run build` - Verify build works
2. Runs `git add -A && git commit` - Commit changes
3. Runs `git push` - Push to GitHub
4. Runs `wrangler pages deploy dist` - Deploy to Cloudflare

### Method 2: Manual Deploy

```bash
# 1. Build
npm run build

# 2. Deploy
npm run deploy
```

### Method 3: Direct Wrangler

```bash
# Build and deploy
npm run build
wrangler pages deploy dist

# Deploy to specific environment
wrangler pages deploy dist --project-name=howtowincapitalism
```

### Preview Deployments

Every push creates a preview deployment:

```
https://<commit-hash>.howtowincapitalism.pages.dev
```

---

## Cloudflare KV Setup

### Create Namespaces

```bash
# Create USERS namespace
wrangler kv namespace create "USERS"
# Output: Created namespace 'xxxxx-id'

# Create SESSIONS namespace
wrangler kv namespace create "SESSIONS"
# Output: Created namespace 'xxxxx-id'

# Create preview namespaces (for development)
wrangler kv namespace create "USERS" --preview
wrangler kv namespace create "SESSIONS" --preview
```

### Configure Bindings

Add to `wrangler.toml`:

```toml
[[env.production.kv_namespaces]]
id = "your-users-namespace-id"
binding = "USERS"

[[env.production.kv_namespaces]]
id = "your-sessions-namespace-id"
binding = "SESSIONS"
```

### Verify Configuration

```bash
# List namespaces
wrangler kv namespace list

# List keys in namespace
wrangler kv key list --namespace-id=xxxxx
```

---

## User Seeding

### Seed Users to KV

```bash
# Seed to production
npm run seed:users

# Seed to preview
npm run seed:users:preview
```

### Seed Script

```javascript
// scripts/seed-users.mjs

const users = [
  {
    id: 'admin',
    email: 'admin@email.com',
    name: 'Admin User',
    role: 'admin',
    accessLevel: 10,
    // Password hashed with PBKDF2
  },
  // ... more users
];

// Hash passwords and upload to KV
for (const user of users) {
  const passwordHash = await hashPassword(user.password);
  await USERS.put(`user:${user.id}`, JSON.stringify({ ...user, passwordHash }));
  await USERS.put(`email:${user.email}`, user.id);
}
```

### Verify Users

```bash
# List users in KV
wrangler kv key list --namespace-id=xxxxx-users-namespace

# Get specific user
wrangler kv get "user:admin" --namespace-id=xxxxx-users-namespace
```

---

## Environment Variables

### Required Variables

| Variable | Purpose | Where to Set |
|----------|---------|--------------|
| `CSRF_SECRET` | CSRF token encryption | Cloudflare Pages |
| `RESEND_API_KEY` | Email sending | Cloudflare Pages |
| `TURNSTILE_SECRET_KEY` | CAPTCHA verification | Cloudflare Pages |

### Setting in Cloudflare Dashboard

1. Go to Cloudflare Dashboard
2. Select Pages project
3. Settings → Environment Variables
4. Add variables for Production and Preview

### Setting via Wrangler

```bash
# Set secret
wrangler pages secret put CSRF_SECRET

# List secrets
wrangler pages secret list
```

### Local Development

Create `.dev.vars` file (gitignored):

```bash
# .dev.vars
CSRF_SECRET=local-development-secret
RESEND_API_KEY=re_xxxx
TURNSTILE_SECRET_KEY=xxxx
```

---

## Monitoring & Logs

### Cloudflare Dashboard

| Feature | Location |
|---------|----------|
| Traffic analytics | Pages → Analytics |
| Error logs | Workers → Logs |
| Real-time logs | `wrangler pages tail` |
| KV metrics | KV → Metrics |

### Real-Time Logs

```bash
# Stream production logs
wrangler pages tail

# Filter by status
wrangler pages tail --status=error
```

### Log Format

```
[timestamp] [status] [method] [path] [duration]
2025-12-14T10:00:00Z 200 POST /api/auth/login 45ms
```

### Metrics to Monitor

| Metric | Alert Threshold |
|--------|-----------------|
| Error rate | > 1% |
| Latency (p95) | > 500ms |
| KV operations | > 1000/min |
| Rate limit hits | > 100/hour |

---

## Rollback Procedures

### Cloudflare Pages Rollbacks

1. Go to Cloudflare Dashboard → Pages
2. Select project → Deployments
3. Find previous deployment
4. Click "Rollback to this deployment"

### Git-Based Rollback

```bash
# View recent commits
git log --oneline -10

# Revert to previous commit
git revert HEAD
npm run ship "Rollback: <reason>"

# Or hard reset (caution!)
git reset --hard <commit-hash>
git push --force-with-lease
npm run deploy
```

### KV Data Rollback

KV doesn't have built-in rollback. For critical data:

1. Export data before changes:
   ```bash
   wrangler kv key list --namespace-id=xxxxx > backup.json
   ```

2. Re-seed from backup if needed:
   ```bash
   # Custom restore script
   node scripts/restore-kv.mjs backup.json
   ```

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check for TypeScript errors
npx astro check

# Clear cache and rebuild
rm -rf dist node_modules/.astro
npm run build
```

#### Deployment Failures

```bash
# Check Wrangler login
wrangler whoami

# Verify project configuration
wrangler pages project list

# Check for deployment errors
wrangler pages deployment list
```

#### KV Connection Issues

```bash
# Verify namespace bindings
wrangler pages project get howtowincapitalism

# Test KV connection
wrangler kv key list --namespace-id=xxxxx
```

#### Auth Not Working

1. Check KV bindings in wrangler.toml
2. Verify CSRF_SECRET is set
3. Check user exists in KV:
   ```bash
   wrangler kv get "email:user@email.com" --namespace-id=xxxxx
   ```

### Debug Commands

```bash
# Local with KV emulation
npm run dev:wrangler

# View deployment logs
wrangler pages deployment list
wrangler pages deployment get <deployment-id>

# Check Worker errors
wrangler pages tail --status=error
```

### Support Resources

| Resource | URL |
|----------|-----|
| Cloudflare Docs | https://developers.cloudflare.com |
| Astro Docs | https://docs.astro.build |
| Wrangler Docs | https://developers.cloudflare.com/workers/wrangler |
| GitHub Issues | https://github.com/ctavolazzi/howtowincapitalism/issues |

---

## Operations Checklist

### Pre-Deployment

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run check`)
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] KV namespaces ready

### Post-Deployment

- [ ] Verify site loads
- [ ] Test login functionality
- [ ] Check error logs
- [ ] Monitor initial traffic

### Regular Maintenance

- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review rate limit logs

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture
- [Security](./SECURITY.md) - Security configuration
- [Testing](./TESTING.md) - Test procedures
