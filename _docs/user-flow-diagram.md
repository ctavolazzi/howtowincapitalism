# User Flow Diagram

## How To Win Capitalism - User Journey Map

> **Version:** 0.0.1 | **Updated:** December 14, 2025

---

## Screenshots Gallery (v0.0.1)

All screenshots captured from production: `https://howtowincapitalism.com`

| # | Screenshot | Description |
|---|------------|-------------|
| 01 | ![Login Page](screenshots/auth-flow/v0.0.1/01-login-page.png) | Login form with email/password |
| 02 | ![Login Error](screenshots/auth-flow/v0.0.1/02-login-error.png) | Invalid credentials error |
| 03 | ![Login Success](screenshots/auth-flow/v0.0.1/03-login-success.png) | Home page after login |
| 04 | ![User Menu](screenshots/auth-flow/v0.0.1/04-user-menu.png) | Logged-in header dropdown |
| 05 | ![Profile Page](screenshots/auth-flow/v0.0.1/05-profile-page.png) | User profile view |
| 06 | ![Home Logged In](screenshots/auth-flow/v0.0.1/06-home-logged-in.png) | Authenticated home state |
| 07 | ![Register Page](screenshots/auth-flow/v0.0.1/07-register-page.png) | User registration form |
| 08 | Forgot Password | Password reset (⚠️ redirect loop issue) |

---

## Mermaid Flow Diagram

```mermaid
flowchart TD
    subgraph ENTRY["🚪 Site Entry"]
        A[User Visits Site] --> C[Home Page]
    end

    subgraph NAV["🧭 Navigation - Not Logged In"]
        C --> D{User Action}
        D -->|Click FAQ| E[FAQ Section]
        D -->|Click Notes| F[Notes Section]
        D -->|Click Tools| G[Tools Section]
        D -->|Click Log In| H[Login Page]
        D -->|Click Register| REG[Register Page]
        D -->|Click Disclaimer| I[Disclaimer Page]
    end

    subgraph CONTENT["📚 Content Pages"]
        E --> E1[Introduction]
        E --> E2[Compound Interest]
        E --> E3[Emergency Fund]
        E --> E4[Tax-Advantaged Accounts]
        E --> E5[Debt Strategies]

        F --> F1[Latest Updates]
        F --> F2[Financial Automation]
        F --> F3[Negotiation Tactics]

        G --> G1[Decision Matrix]
        G --> G2[Financial Autonomy Checklist]
    end

    subgraph AUTH["🔐 Authentication Flow"]
        H --> J{Login Attempt}
        J -->|Wrong Credentials| K[Show Error]
        K --> H
        J -->|Correct Credentials| L[Redirect to Home<br>+ Set Auth State]
        H -->|Click Forgot Password| FP[Forgot Password Page]
        FP --> FP_SUBMIT[Submit Email]
        FP_SUBMIT --> FP_CONFIRM[Check Email Message]
    end

    subgraph REGISTRATION["📝 Registration Flow"]
        REG --> REG_FORM[Fill Registration Form]
        REG_FORM --> REG_SUBMIT{Submit}
        REG_SUBMIT -->|Validation Error| REG_ERROR[Show Error]
        REG_ERROR --> REG_FORM
        REG_SUBMIT -->|Success| REG_CONFIRM[Confirmation Email Sent]
        REG_CONFIRM --> EMAIL_LINK[Click Email Link]
        EMAIL_LINK --> H
    end

    subgraph LOGGED_IN["👤 Logged In State"]
        L --> M[Home Page<br>with Avatar]
        M --> N{User Action}
        N -->|Click Avatar| O[User Menu Dropdown]
        O -->|Click Profile| P[Profile Page]
        O -->|Click Log Out| Q[Logout]
        Q --> C

        P --> R[View Activity Stats]
        P --> S[View Recent Activity]
        P --> T[View Session Info]
    end

    subgraph TRACKING["📊 Activity Tracking"]
        L -.->|Track Login| U[(Cloudflare KV)]
        M -.->|Track Page View| U
        P -.->|Track Page View| U
    end

    %% Styling
    style A fill:#e1f5fe
    style C fill:#e8f5e9
    style H fill:#fce4ec
    style L fill:#e8f5e9
    style P fill:#f3e5f5
    style U fill:#fff9c4
    style REG fill:#e3f2fd
    style FP fill:#fff8e1
```

---

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> HomePage: Visit Site

    state "Not Logged In" as NotLoggedIn {
        HomePage --> ContentPage: Browse Content
        ContentPage --> HomePage: Back to Home
        HomePage --> LoginPage: Click Log In
        HomePage --> RegisterPage: Click Register
    }

    LoginPage --> LoginPage: Wrong Credentials
    LoginPage --> LoggedInHome: Correct Credentials
    LoginPage --> ForgotPassword: Forgot Password?
    ForgotPassword --> LoginPage: Back to Login

    RegisterPage --> RegisterPage: Validation Error
    RegisterPage --> ConfirmationSent: Submit Success
    ConfirmationSent --> LoginPage: Confirm Email

    state "Logged In" as LoggedIn {
        LoggedInHome --> ContentPage: Browse Content
        LoggedInHome --> ProfilePage: Click Profile
        ProfilePage --> LoggedInHome: Back to Home
        LoggedInHome --> Logout: Click Log Out
    }

    Logout --> HomePage: Clear Session

    note right of LoginPage
        See _docs/AUTH.md for
        test credentials
    end note

    note right of ProfilePage
        Shows:
        - Activity Stats
        - Page Views
        - Session Time
        - Recent Activity
    end note

    note right of RegisterPage
        Required fields:
        - Email
        - Username
        - Password
    end note
```

---

## User Credentials Reference

See `_docs/AUTH.md` or `tests/fixtures/test-credentials.ts` for current test credentials.

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@email.com | Full access |
| Editor | editor@email.com | Content management |
| Contributor | contributor@email.com | Limited write access |
| Viewer | viewer@email.com | Read-only access |

---

## Page Inventory

| Page | URL | Auth Required | Description |
|------|-----|---------------|-------------|
| Home | `/` | No | Main landing page |
| Login | `/login/` | No | User authentication |
| Register | `/register/` | No | New user registration |
| Forgot Password | `/forgot-password/` | No | Password reset request |
| Logout | `/logout/` | No | Clears session |
| Profile | `/users/[id]/` | Yes* | User profile dashboard |
| Profile Edit | `/profile/edit/` | Yes | Edit own profile |
| FAQ | `/faq/` | No | Content section |
| Notes | `/notes/` | No | Content section |
| Tools | `/tools/` | No | Content section |
| Disclaimer | `/disclaimer/` | No | Legal disclaimer |

*Profile shows "Not Logged In" message if not authenticated

---

## Authentication Flow Details

### Login Flow
1. User navigates to `/login/`
2. Enters email and password
3. POST to `/api/auth/login`
4. Cloudflare Worker validates against `USERS` KV
5. Creates session in `SESSIONS` KV (7-day TTL)
6. Sets `httpOnly` cookie (`htwc_session`)
7. Redirects to home (`/`)

### Registration Flow
1. User navigates to `/register/`
2. Fills form (email, username, password)
3. POST to `/api/auth/register`
4. Confirmation email sent
5. User clicks email link
6. Account activated, redirected to login

### Forgot Password Flow (⚠️ Known Issue)
1. User clicks "Forgot password?" on login page
2. Navigates to `/forgot-password/`
3. ⚠️ **Current Issue:** Redirect loop in production

---

## Activity Tracking Data Model

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACTIVITY : generates
    USER {
        string id
        string email
        string username
        string role
        datetime createdAt
    }
    SESSION {
        string id
        string userId
        datetime createdAt
        datetime expiresAt
    }
    ACTIVITY {
        string type
        string path
        datetime timestamp
    }
```

### Activity Types
- `login` - User logged in
- `logout` - User logged out
- `pageview` - Page was visited
- `registration` - New user registered

### Storage
- **Sessions**: Cloudflare KV (`SESSIONS` namespace)
- **Users**: Cloudflare KV (`USERS` namespace)
- **Auth Cookie**: `htwc_session` (httpOnly, Secure, SameSite=Strict)

---

## Security Features (v0.0.1)

| Feature | Status | Notes |
|---------|--------|-------|
| Password hashing | ✅ | SHA-256 (upgrade to PBKDF2 planned) |
| httpOnly cookies | ✅ | XSS protection |
| Secure flag | ✅ | HTTPS only |
| SameSite=Strict | ✅ | CSRF protection |
| RBAC | ✅ | 4-role permission matrix |
| Session TTL | ✅ | 7-day expiration |
| Rate limiting | ❌ | Planned for v0.1.0 |
| CSRF tokens | ⚠️ | Partial implementation |

---

## Related Documentation

- [AUTH.md](AUTH.md) - Full authentication documentation
- [v0.0.1 Snapshot](status_reports/2025-12-12_v0.0.1-snapshot.md) - Version snapshot with compliance audit
- [SECURITY.md](technical/SECURITY.md) - Security implementation details

---

*Updated: December 14, 2025*
*Previous version: December 9, 2025*



