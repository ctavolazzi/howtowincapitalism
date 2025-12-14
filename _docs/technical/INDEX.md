# Technical Documentation

> **How To Win Capitalism** - Complete Technical Reference
>
> Version: 0.1.0 | Last Updated: 2025-12-14

---

## Documentation Suite

This folder contains comprehensive technical documentation for the How To Win Capitalism application.

### Quick Navigation

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System architecture, tech stack, design patterns |
| [Authentication](./AUTHENTICATION.md) | Auth flows, session management, password handling |
| [API Reference](./API_REFERENCE.md) | All API endpoints with request/response formats |
| [Components](./COMPONENTS.md) | Component library, atomic design, usage examples |
| [Data Models](./DATA_MODELS.md) | Data structures, KV storage schema, type definitions |
| [Security](./SECURITY.md) | Security measures, threat model, best practices |
| [Testing](./TESTING.md) | Test strategy, coverage, running tests |
| [Deployment](./DEPLOYMENT.md) | Deployment process, Cloudflare configuration, operations |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HOW TO WIN CAPITALISM                              │
│                    A Satirical Financial Autonomy Wiki                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Browser   │───▶│   Astro     │───▶│  Cloudflare │───▶│     KV      │  │
│  │   Client    │◀───│   SSR       │◀───│   Workers   │◀───│   Storage   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
│  Frontend            Framework          Edge Runtime       Database          │
│  - HTML/CSS/JS       - Astro v5         - API Routes       - USERS           │
│  - Components        - TypeScript       - Auth Logic       - SESSIONS        │
│  - nanostores        - MDX Content      - Rate Limiting    - Rate Limits     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Astro | v5.x | SSR, routing, build |
| **Language** | TypeScript | v5.x | Type safety |
| **Styling** | CSS Custom Properties | - | Design tokens |
| **State** | nanostores | v0.11 | Client-side state |
| **Auth Storage** | Cloudflare KV | - | Users & sessions |
| **Email** | Resend | - | Transactional email |
| **Hosting** | Cloudflare Pages | - | Edge deployment |
| **Testing** | Playwright + Vitest | - | E2E + Unit tests |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Source Files | 121 |
| Test Files | 16 |
| Test Lines | 3,478 |
| Components | 40+ |
| API Endpoints | 12 |
| TypeScript Coverage | 100% of lib files |

---

## Architecture Principles

### 1. Security First
- PBKDF2 password hashing (100k iterations)
- httpOnly cookies (XSS-resistant)
- CSRF protection on all mutations
- Rate limiting (IP + email-based)

### 2. Separation of Concerns
- Auth logic isolated in `src/lib/auth/`
- Components follow atomic design
- API routes are thin orchestration layers

### 3. Type Safety
- Strict TypeScript throughout
- Explicit interfaces for all public APIs
- No `any` types in production code

### 4. Progressive Enhancement
- Server-side rendering by default
- Client-side interactivity where needed
- Works without JavaScript for core content

---

## File Structure Overview

```
howtowincapitalism/
├── _docs/                    # Documentation (this folder)
│   ├── technical/            # Technical reference docs
│   └── devlog/               # Development history
├── public/                   # Static assets
├── scripts/                  # Build automation
├── src/
│   ├── components/           # Astro components (atomic design)
│   │   ├── atoms/            # Base components
│   │   ├── molecules/        # Composed components
│   │   ├── organisms/        # Complex sections
│   │   ├── auth/             # Auth-specific components
│   │   ├── guards/           # Access control components
│   │   └── search/           # Search functionality
│   ├── content/              # MDX content pages
│   ├── layouts/              # Page layouts
│   ├── lib/                  # TypeScript utilities
│   │   ├── auth/             # Authentication system
│   │   ├── api/              # API client utilities
│   │   ├── email/            # Email templates
│   │   └── tools/            # Reusable tools
│   ├── pages/                # Route pages + API endpoints
│   │   └── api/              # API routes
│   └── styles/               # Global styles
├── tests/                    # E2E tests (Playwright)
├── astro.config.mjs          # Astro configuration
├── wrangler.toml             # Cloudflare config
└── package.json              # Dependencies
```

---

## Quick Start for Developers

### Prerequisites
- Node.js 18+
- npm 9+
- Cloudflare account (for deployment)

### Local Development
```bash
git clone https://github.com/ctavolazzi/howtowincapitalism.git
cd howtowincapitalism
npm install
npm run dev
# Open http://localhost:4321
```

### Running Tests
```bash
npm test           # Run all E2E tests
npm run test:unit  # Run unit tests
npm run test:ui    # Interactive Playwright UI
```

### Building for Production
```bash
npm run build      # Production build
npm run preview    # Preview locally
npm run deploy     # Deploy to Cloudflare
```

---

## Related Documentation

| Location | Purpose |
|----------|---------|
| `/README.md` | Project overview |
| `/DEVELOPERS.md` | Developer guide |
| `/AGENTS.md` | AI assistant instructions |
| `/_docs/AUTH.md` | Auth system overview |
| `/_docs/ARCHITECTURE.md` | Legacy architecture doc |
| `/src/lib/tools/README.md` | Tools API reference |

---

## Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-14 | 0.1.0 | Initial comprehensive documentation suite |
