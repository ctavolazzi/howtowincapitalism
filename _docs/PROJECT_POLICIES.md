# Project Policies

Standards and conventions for the How To Win Capitalism project.

---

## File Naming

### Rule: All filenames must be self-descriptive

A filename should be understandable **without relying on its folder path**.

| ❌ Bad | ✅ Good |
|--------|---------|
| `09.md` | `2025-12-09_devlog.md` |
| `index.md` (in nested folder) | `protocol-index.md` or keep `index.md` only at root |
| `styles.css` | `custom-starlight-overrides.css` |
| `utils.ts` | `decision-matrix-utils.ts` |

### Naming Format

```
[date]_[descriptive-name].[ext]
```

**Examples:**
- `2025-12-09_devlog.md`
- `2025-12-09_project-status.md`
- `10.07_starlight-architecture-audit.md`

### Exceptions

These generic names are acceptable:
- `README.md` — Standard convention
- `index.mdx` — Web route convention (but only one per folder)
- `package.json`, `tsconfig.json` — Config files with standard names

---

## Folder Structure

### Rule: Folders provide hierarchy, not meaning

Folder paths should organize files, but each file should still be identifiable by name alone.

| ❌ Bad | ✅ Good |
|--------|---------|
| `devlog/2025/12/09.md` | `devlog/2025-12-09_devlog.md` |
| `reports/january/summary.md` | `reports/2025-01_monthly-summary.md` |

### Key Folders

| Folder | Contains | Examples |
|--------|----------|----------|
| `_docs/` | Documentation (human-readable) | Devlogs, architecture, policies |
| `_work_efforts/` | Task tracking (Johnny Decimal) | Work effort documents |
| `src/lib/tools/` | Development utilities | Logger, decision-matrix |
| `scripts/` | Build/deploy automation | ship.mjs, generate-icons.mjs |

**Note:** Development utilities live in `src/lib/tools/`, not a separate `_dev/` folder.

---

## Date Formats

Use ISO 8601 format for dates in filenames:

| Format | Use Case |
|--------|----------|
| `YYYY-MM-DD` | Daily files (e.g., `2025-12-09_devlog.md`) |
| `YYYY-MM` | Monthly files (e.g., `2025-12_summary.md`) |
| `YYYY` | Annual files (e.g., `2025_annual-review.md`) |

---

## Code Style

See user rules in Cursor settings for Python/coding style preferences.

Key points:
- Minimal abstractions
- Direct code over wrapper functions
- One file until 500+ lines
- No unnecessary helpers

---

## Documentation

### Required Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| `README.md` | Project root | Project overview |
| `AGENTS.md` | Project root | AI assistant instructions |
| `_docs/PROJECT_POLICIES.md` | This file | Standards and conventions |
| `_docs/ARCHITECTURE.md` | `_docs/` | Technical architecture |

### Work Efforts

Follow Johnny Decimal system in `_work_efforts/`:
- `XX.XX_descriptive-name.md`
- Always include status, dates, and tasks

### Devlogs

- One file per day with active development
- Filename: `YYYY-MM-DD_devlog.md`
- Location: `_docs/devlog/`

---

## Git Commits

Format: `type: description`

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, CSS |
| `refactor` | Code restructuring |
| `chore` | Maintenance |

---

## Review Checklist

Before committing, verify:

- [ ] All new files have descriptive names
- [ ] No files named only by date/number
- [ ] Documentation updated if needed
- [ ] Work effort updated if applicable

---

## Deployment Checklist

### Environment Variables (Cloudflare Pages)

Required secrets in Cloudflare Pages → Settings → Environment Variables:

| Variable | Source | Purpose |
|----------|--------|---------|
| `TINA_CLIENT_ID` | Tina Cloud dashboard | CMS authentication |
| `TINA_TOKEN` | Tina Cloud dashboard | CMS git operations |
| `RESEND_API_KEY` | resend.com | Email confirmation |
| `TURNSTILE_SITE_KEY` | Cloudflare dashboard | Registration CAPTCHA |
| `TURNSTILE_SECRET_KEY` | Cloudflare dashboard | Registration CAPTCHA |
| `CSRF_SECRET` | Generate (32+ chars) | Form protection |

### Tina Cloud Setup

1. Go to [app.tina.io](https://app.tina.io)
2. Sign in with GitHub
3. Create project → Link to `ctavolazzi/howtowincapitalism`
4. Copy Client ID → Add as `TINA_CLIENT_ID` in Cloudflare Pages
5. Create token → Add as `TINA_TOKEN` in Cloudflare Pages

### Cloudflare Access Policies

Ensure Access policies protect admin routes:

| Policy | Path Pattern |
|--------|--------------|
| Production | `howtowincapitalism.com/admin/*` |
| Preview | `*.howtowincapitalism.pages.dev/admin/*` |

### CI/CD Secrets (GitHub Actions)

Required for `playwright-e2e` workflow:

| Secret | Purpose |
|--------|---------|
| `CF_ACCOUNT_ID` | Cloudflare account |
| `CF_API_TOKEN` | Pages API access |
| `CF_ACCESS_CLIENT_ID` | Service token for Access gate |
| `CF_ACCESS_CLIENT_SECRET` | Service token for Access gate |

### Pre-Deploy Verification

- [ ] `npm run build` passes locally
- [ ] `npm test` passes (security-and-smoke tests)
- [ ] Environment variables set in Cloudflare Pages
- [ ] Cloudflare Access policies cover `/admin/*`
- [ ] Tina Cloud project linked to repository

---

*Last updated: 2025-12-12*
