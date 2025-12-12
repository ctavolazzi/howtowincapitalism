# How To Win Capitalism - Architecture Analysis

> **Generated:** 2025-12-12
> **Purpose:** Comprehensive technical analysis of the codebase architecture, data flows, and design patterns.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level System Architecture](#high-level-system-architecture)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [Data Schema & Storage](#data-schema--storage)
6. [Authentication System](#authentication-system)
7. [CRUD & I/O Operations](#crud--io-operations)
8. [Request/Response Lifecycle](#requestresponse-lifecycle)
9. [Design Patterns Employed](#design-patterns-employed)
10. [Content Management System](#content-management-system)
11. [Deployment Architecture](#deployment-architecture)
12. [Key Observations](#key-observations)

---

## Executive Summary

**How To Win Capitalism** is a Wikipedia-style financial literacy wiki built with a hybrid SSR architecture. The system combines:

- **Astro v5** with SSR output mode for dynamic content
- **Cloudflare Pages** for edge hosting with Workers runtime
- **Cloudflare KV** for persistent storage (users, sessions)
- **MDX content** for wiki articles
- **Nanostores** for client-side state management

The codebase follows **Atomic Design** principles for components and uses a **dual auth system** (server-side KV auth + client-side store for UI state).

---

## High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI["Astro Pages"]
        Components["Astro Components"]
        Nanostores["Nanostores<br/>(authStore, userStore)"]
        localStorage["localStorage<br/>(profile edits, favorites)"]
    end

    subgraph Edge["Cloudflare Edge"]
        Pages["Cloudflare Pages"]
        Workers["Workers Runtime"]

        subgraph KV["Cloudflare KV"]
            USERS["USERS Namespace"]
            SESSIONS["SESSIONS Namespace"]
        end
    end

    subgraph Build["Build Time"]
        MDX["MDX Content<br/>(src/content/docs/)"]
        Astro["Astro Build"]
    end

    Client --> Pages
    Pages --> Workers
    Workers --> KV
    MDX --> Astro
    Astro --> Pages
    Nanostores --> localStorage
```

---

## Technology Stack

```mermaid
graph LR
    subgraph Frontend
        A[Astro v5]
        B[MDX]
        C[Custom CSS]
        D[Nanostores]
    end

    subgraph Backend
        E[Cloudflare Workers]
        F[API Routes]
    end

    subgraph Storage
        G[Cloudflare KV]
        H[localStorage]
    end

    subgraph Hosting
        I[Cloudflare Pages]
    end

    A --> E
    E --> G
    D --> H
```

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Astro v5 | Static + SSR hybrid |
| **Content** | MDX | Wiki articles with components |
| **Styling** | Custom CSS | Wikipedia aesthetic |
| **State** | Nanostores + @nanostores/persistent | Client-side reactive state |
| **Auth** | Cloudflare KV + httpOnly cookies | Server-side sessions |
| **Hosting** | Cloudflare Pages | Edge deployment |
| **Runtime** | Cloudflare Workers | SSR + API routes |

---

## Component Architecture

The codebase follows **Atomic Design** principles:

```mermaid
graph TD
    subgraph Atoms["Atoms (Base Elements)"]
        WikiBox
        Breadcrumbs
        Collapsible
        Avatar
        RoleBadge
    end

    subgraph Molecules["Molecules (Composed)"]
        TopicCard
        Disclaimer
        DecisionMatrix
        FAQ
        SeeAlso
        BlankSlate
        CompletenessMeter
        Favorites
        LoginForm
        UserMenu
    end

    subgraph Organisms["Organisms (Complex)"]
        Hero
        Footer
        PageHeader
        ProfileHeader
        ProfileForm
        ActivityFeed
    end

    subgraph Pages["Pages"]
        Index["/ (Home)"]
        Login["/login/"]
        Profile["/profile/"]
        Users["/users/"]
        Content["/[...slug]/"]
    end

    Atoms --> Molecules
    Molecules --> Organisms
    Organisms --> Pages
```

### Component Registry (`src/components/index.ts`)

| Category | Components |
|----------|------------|
| **Atoms** | WikiBox, Breadcrumbs, Collapsible, Avatar, RoleBadge |
| **Molecules** | TopicCard, Disclaimer, DecisionMatrix, FAQ, SeeAlso, BlankSlate, CompletenessMeter, Favorites, LoginForm, UserMenu, ActivityItem |
| **Organisms** | Hero, Footer, PageHeader, ProfileHeader, ProfileForm, ActivityFeed, SystemBulletin |
| **Utilities** | CardGrid, Empty, ForceLightTheme |
| **Guards** | OwnerGuard |

---

## Data Schema & Storage

### Cloudflare KV Schema

```mermaid
erDiagram
    USERS_NAMESPACE {
        string user_id PK "user:{id}"
        string email_index "email:{email} -> userId"
    }

    USER {
        string id PK
        string email
        string passwordHash
        string name
        string role "admin|editor|contributor|viewer"
        int accessLevel "1-10"
        string avatar
        string bio
        string createdAt
    }

    SESSIONS_NAMESPACE {
        string session_token PK "session:{token}"
    }

    SESSION {
        string userId FK
        string createdAt
        string expiresAt
    }

    USERS_NAMESPACE ||--o{ USER : contains
    SESSIONS_NAMESPACE ||--o{ SESSION : contains
    SESSION }o--|| USER : references
```

### Client-Side Storage (localStorage)

| Key | Purpose | Structure |
|-----|---------|-----------|
| `auth:*` | Auth state via nanostores | `{isLoggedIn, userId, userName, userRole, ...}` |
| `users_data` | Profile edits | `{userId: {name, avatar, bio}}` |
| `page_visits` | Activity tracking | `{path: timestamp}[]` |
| `favorites` | Bookmarked pages | `string[]` |
| `dismissed_disclaimer` | UI state | `boolean` |

### User Role Schema (RBAC)

```mermaid
graph TD
    Admin["admin (10)"] -->|can do everything| All["Full CRUD"]
    Editor["editor (5)"] -->|can| CRU["Create, Read, Update"]
    Contributor["contributor (3)"] -->|can| Own["CRUD own content"]
    Viewer["viewer (1)"] -->|can| Read["Read only"]
```

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| **admin** | 10 | Full CRUD on all resources |
| **editor** | 5 | Create, Read, Update any (no delete) |
| **contributor** | 3 | CRUD on own content only |
| **viewer** | 1 | Read public content |

---

## Authentication System

### Dual Auth Architecture

The system has **two authentication layers**:

1. **Server-side (Cloudflare KV)** - Real auth with httpOnly cookies
2. **Client-side (Nanostores)** - UI state management

```mermaid
sequenceDiagram
    participant Browser
    participant LoginForm
    participant API as /api/auth/login
    participant KV as Cloudflare KV
    participant Cookie as httpOnly Cookie
    participant Store as authStore

    Browser->>LoginForm: Submit credentials
    LoginForm->>API: POST {email, password}
    API->>KV: getUserByEmail()
    KV-->>API: User with passwordHash
    API->>API: verifyPassword()
    API->>KV: createSession()
    KV-->>API: session token
    API->>Cookie: Set-Cookie (httpOnly)
    API-->>LoginForm: {success, user}
    LoginForm->>Store: Update authStore
    Store->>Browser: Redirect to /
```

### Auth Flow Details

```mermaid
flowchart TB
    subgraph Login["Login Flow"]
        L1[User submits form] --> L2[POST /api/auth/login]
        L2 --> L3{Valid credentials?}
        L3 -->|Yes| L4[Create session in KV]
        L3 -->|No| L5[Return 401]
        L4 --> L6[Set httpOnly cookie]
        L6 --> L7[Return user data]
        L7 --> L8[Update client authStore]
    end

    subgraph Protected["Protected Request"]
        P1[Request to page] --> P2[Cookie sent automatically]
        P2 --> P3[Parse session token]
        P3 --> P4[Lookup in KV]
        P4 --> P5{Session valid?}
        P5 -->|Yes| P6[Get user from KV]
        P5 -->|No| P7[Redirect to /login/]
        P6 --> P8[Render page with user context]
    end

    subgraph Logout["Logout Flow"]
        O1[Click logout] --> O2[POST /api/auth/logout]
        O2 --> O3[Delete session from KV]
        O3 --> O4[Clear cookie]
        O4 --> O5[Clear authStore]
        O5 --> O6[Redirect to /login/]
    end
```

### Session Security Features

| Feature | Implementation |
|---------|----------------|
| **Password hashing** | SHA-256 with salt |
| **Session tokens** | 32-byte cryptographic random |
| **Cookie security** | httpOnly, Secure, SameSite=Strict |
| **Session expiry** | 7-day TTL in KV |
| **XSS protection** | No secrets in JavaScript |

---

## CRUD & I/O Operations

### Read Operations

```mermaid
flowchart LR
    subgraph Reads["Data Reads"]
        R1["MDX Content"] --> R2["Astro getCollection()"]
        R3["User Profile"] --> R4["KV getUserById()"]
        R5["Current Session"] --> R6["KV getSession()"]
        R7["Activity Log"] --> R8["localStorage"]
        R9["Favorites"] --> R10["localStorage"]
    end
```

| Operation | Source | Method |
|-----------|--------|--------|
| Wiki content | `src/content/docs/*.mdx` | Astro `getCollection('docs')` |
| User by ID | KV USERS | `getUserById(users, id)` |
| User by email | KV USERS | `getUserByEmail(users, email)` |
| Session | KV SESSIONS | `getSession(sessions, token)` |
| Current user | KV + Cookie | `getCurrentUser(users, sessions, cookie)` |
| Page visits | localStorage | `activityStore.get()` |
| Favorites | localStorage | `favoritesStore.get()` |

### Write Operations

```mermaid
flowchart LR
    subgraph Writes["Data Writes"]
        W1["Login"] --> W2["createSession() -> KV"]
        W3["Logout"] --> W4["deleteSession() -> KV"]
        W5["Profile Edit"] --> W6["userStore -> localStorage"]
        W7["Track Page"] --> W8["activityStore -> localStorage"]
        W9["Favorite"] --> W10["favoritesStore -> localStorage"]
    end
```

| Operation | Target | Method |
|-----------|--------|--------|
| Create session | KV SESSIONS | `createSession(sessions, userId)` |
| Delete session | KV SESSIONS | `deleteSession(sessions, token)` |
| Update profile | localStorage | `updateUserProfile(userId, updates)` |
| Track activity | localStorage | `trackActivity(type, path)` |
| Toggle favorite | localStorage | `toggleFavorite(path)` |

### API Endpoints

| Endpoint | Method | Purpose | I/O |
|----------|--------|---------|-----|
| `/api/auth/login` | POST | Authenticate user | Read KV, Write KV, Set Cookie |
| `/api/auth/logout` | POST | End session | Delete KV, Clear Cookie |
| `/api/auth/me` | GET | Get current user | Read Cookie, Read KV |

---

## Request/Response Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Cloudflare as Cloudflare Edge
    participant Worker as Workers Runtime
    participant KV as Cloudflare KV
    participant Astro as Astro SSR

    User->>Browser: Navigate to /profile/
    Browser->>Cloudflare: GET /profile/ + Cookie
    Cloudflare->>Worker: Route request
    Worker->>Astro: Invoke page handler
    Astro->>Worker: Request KV binding
    Worker->>KV: getCurrentUser()
    KV-->>Worker: User data
    Worker-->>Astro: User context
    Astro->>Astro: Render .astro template
    Astro-->>Worker: HTML response
    Worker-->>Cloudflare: Response
    Cloudflare-->>Browser: HTML + hydration JS
    Browser->>Browser: Hydrate Nanostores
    Browser-->>User: Interactive page
```

---

## Design Patterns Employed

### 1. Atomic Design Pattern

```mermaid
graph LR
    A["Atoms<br/>(WikiBox, Collapsible)"] --> B["Molecules<br/>(TopicCard, FAQ)"]
    B --> C["Organisms<br/>(Footer, Hero)"]
    C --> D["Templates<br/>(Base.astro)"]
    D --> E["Pages<br/>(.astro routes)"]
```

**Location:** `src/components/atoms/`, `molecules/`, `organisms/`

### 2. Repository Pattern (KV Auth)

```mermaid
classDiagram
    class KVAuthRepository {
        +getUserById(users, id)
        +getUserByEmail(users, email)
        +validateCredentials(users, email, password)
        +createSession(sessions, userId)
        +getSession(sessions, token)
        +deleteSession(sessions, token)
    }

    class APIRoutes {
        +POST /api/auth/login
        +POST /api/auth/logout
        +GET /api/auth/me
    }

    APIRoutes --> KVAuthRepository : uses
```

**Location:** `src/lib/auth/kv-auth.ts`

### 3. Observer Pattern (Nanostores)

```mermaid
flowchart LR
    A["authStore"] -->|subscribe| B["Header.astro"]
    A -->|subscribe| C["UserMenu.astro"]
    A -->|subscribe| D["ProfileHeader.astro"]

    E["userStore"] -->|subscribe| A
    E -->|subscribe| F["ProfileForm.astro"]
```

**Location:** `src/lib/auth/store.ts`, `src/lib/auth/userStore.ts`

### 4. Strategy Pattern (Decision Matrix)

```mermaid
classDiagram
    class DecisionMatrix {
        +analyze(method)
        -analyzeWeighted()
        -analyzeNormalized()
        -analyzeRanking()
        -analyzeBestWorst()
    }

    class AnalysisStrategy {
        <<interface>>
        +calculate(scores, weights)
    }

    DecisionMatrix --> AnalysisStrategy : selects strategy
```

**Location:** `src/lib/tools/decision-matrix.ts`

### 5. Adapter Pattern (Starlight Customization)

The codebase adapts Starlight's documentation theme for a Wikipedia-style wiki:

```mermaid
graph TD
    A["Starlight Theme<br/>(default docs)"] --> B["CSS Overrides<br/>(custom.css)"]
    A --> C["Component Overrides<br/>(Empty.astro)"]
    B --> D["Wikipedia Aesthetic"]
    C --> D
```

**Location:** `src/styles/custom.css`, `src/components/utilities/Empty.astro`

### 6. Facade Pattern (Auth Module)

```mermaid
classDiagram
    class AuthFacade {
        +login(email, password)
        +logout()
        +isAuthenticated()
        +getCurrentUser()
        +checkPermission(op, owner, visibility)
    }

    class UserStore {
        +validateCredentials()
        +getUserById()
        +updateUserProfile()
    }

    class AuthStore {
        +set()
        +get()
        +subscribe()
    }

    class Activity {
        +trackActivity()
    }

    AuthFacade --> UserStore
    AuthFacade --> AuthStore
    AuthFacade --> Activity
```

**Location:** `src/lib/auth/index.ts`

### 7. Singleton Pattern (Debug Logger)

```mermaid
classDiagram
    class DebugLogger {
        -instance: DebugLogger
        +log(module, message)
        +warn(module, message)
        +error(module, message)
        +success(module, message)
        +time(label)
        +group(label)
    }

    note for DebugLogger "Single instance with<br/>module-based logging"
```

**Location:** `src/lib/debug.ts`

### 8. Guard Pattern (Route Protection)

```mermaid
flowchart TD
    Request --> Guard{Auth Guard}
    Guard -->|Authenticated| Page
    Guard -->|Not Authenticated| Login["/login/?redirect=..."]

    Page --> OwnerGuard{Owner Guard}
    OwnerGuard -->|Is Owner/Admin| EditControls
    OwnerGuard -->|Not Owner| HideControls
```

**Location:** `src/components/guards/OwnerGuard.astro`

---

## Content Management System

### Content Structure

```mermaid
graph TD
    subgraph Content["src/content/docs/"]
        Index["index.mdx<br/>(Home)"]

        subgraph Protocol["protocol/"]
            P1["introduction.mdx"]
            P2["compound-interest.mdx"]
            P3["emergency-fund.mdx"]
            P4["debt-strategies.mdx"]
            P5["decision-matrix.mdx"]
            P6["...more"]
        end

        subgraph FieldNotes["field-notes/"]
            F1["latest.mdx"]
            F2["inflation-strategies.mdx"]
            F3["negotiation-tactics.mdx"]
            F4["automation.mdx"]
        end

        subgraph Reports["reports/"]
            R1["index.mdx"]
            R2["financial-autonomy-checklist.mdx"]
            R3["decision-matrix-template.mdx"]
            R4["tax-optimization-guide.mdx"]
        end
    end
```

### Frontmatter Schema

```typescript
// src/content.config.ts
extend: z.object({
  category: z.enum(['concept', 'tool', 'framework', 'guide', 'reference']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  readTime: z.string().optional(),
})
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Development["Development"]
        Dev["npm run dev"]
        Dev --> Local["localhost:4321"]
    end

    subgraph Build["Build Pipeline"]
        Ship["npm run ship 'message'"]
        Ship --> Build1["npm run build"]
        Build1 --> Commit["git commit"]
        Commit --> Push["git push"]
        Push --> Deploy["wrangler pages deploy"]
    end

    subgraph Production["Production (Cloudflare)"]
        Pages["Cloudflare Pages"]
        Workers["Workers Runtime"]
        KV["KV Namespaces"]

        Pages --> Workers
        Workers --> KV
    end

    Deploy --> Pages
```

### Environment Configuration

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro + integrations config |
| `wrangler.toml` | Cloudflare Pages + KV bindings |
| `public/_headers` | Security headers |
| `public/_redirects` | URL redirects |

---

## Key Observations

### Strengths

1. **Edge-first Architecture** - KV + Workers provide fast, globally distributed auth
2. **Clean Separation** - Server auth (KV) vs UI state (Nanostores) clearly separated
3. **Atomic Design** - Components are well-organized and reusable
4. **Comprehensive Logging** - Debug module with module-scoped, toggleable logging
5. **Type Safety** - TypeScript throughout with proper interfaces

### Areas of Interest

1. **Dual Auth System** - Both `kv-auth.ts` (server) and `userStore.ts` (client) exist
   - KV auth is the "real" system for production
   - Client stores provide fallback for local dev and UI state

2. **Password Storage** - Default passwords in `userStore.ts` for dev/demo
   - Production uses hashed passwords in KV

3. **RBAC Implementation** - Access levels (1-10) with role-based gates
   - UI-only protection via `OwnerGuard.astro`
   - Server protection via API route validation

4. **Content-Auth Bridge** - User IDs match between auth system and content collections
   - Enables future per-user content ownership

### Data Flow Summary

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Browser]                                                           │
│     ↓ POST /api/auth/login {email, password}                        │
│  [Cloudflare Worker]                                                 │
│     ↓ validateCredentials(USERS_KV, email, password)                │
│  [KV: USERS]                                                         │
│     ↓ user data (hashed password verified)                          │
│  [Cloudflare Worker]                                                 │
│     ↓ createSession(SESSIONS_KV, userId)                            │
│  [KV: SESSIONS]                                                      │
│     ↓ session token                                                 │
│  [Cloudflare Worker]                                                 │
│     ↓ Set-Cookie: htwc_session=token; HttpOnly; Secure              │
│  [Browser]                                                           │
│     ↓ authStore.set({isLoggedIn: 'true', ...})                      │
│  [localStorage]                                                      │
│     ↓ persist auth state                                            │
│  [UI]                                                                │
│     ↓ render authenticated view                                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## File Reference

| Path | Purpose |
|------|---------|
| `src/lib/auth/kv-auth.ts` | Server-side KV auth utilities |
| `src/lib/auth/store.ts` | Client-side auth state (nanostores) |
| `src/lib/auth/userStore.ts` | Unified user data store |
| `src/lib/auth/permissions.ts` | RBAC permission checks |
| `src/lib/auth/activity.ts` | Activity tracking |
| `src/lib/auth/api-client.ts` | Client-side API wrapper |
| `src/pages/api/auth/*.ts` | API route handlers |
| `src/lib/tools/decision-matrix.ts` | Decision matrix utility |
| `src/lib/debug.ts` | Debug logging system |
| `src/lib/constants.ts` | App constants |

---

*Document generated as part of codebase architecture review.*
