# User Flow Diagram

## How To Win Capitalism - User Journey Map

### Screenshots Captured

1. **Password Gate** - Initial site access protection
2. **Home Page** - Main landing page with navigation
3. **Login Page** - User authentication form
4. **Profile Page** - Logged-in user profile with activity tracking

---

## Mermaid Flow Diagram

```mermaid
flowchart TD
    subgraph ENTRY["🚪 Site Entry"]
        A[User Visits Site] --> B{Password Gate}
        B -->|Wrong Password| B
        B -->|Correct Password<br>'unlockmenow'| C[Home Page]
    end

    subgraph NAV["🧭 Navigation - Not Logged In"]
        C --> D{User Action}
        D -->|Click FAQ| E[FAQ Section]
        D -->|Click Notes| F[Notes Section]
        D -->|Click Tools| G[Tools Section]
        D -->|Click Log In| H[Login Page]
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
        J -->|Correct Credentials<br>'admin@email.com'<br>'itcan`tbethateasy...'| L[Redirect to Home<br>+ Set Auth State]
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
        L -.->|Track Login| U[(localStorage)]
        M -.->|Track Page View| U
        P -.->|Track Page View| U
    end

    %% Styling
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#e8f5e9
    style H fill:#fce4ec
    style L fill:#e8f5e9
    style P fill:#f3e5f5
    style U fill:#fff9c4
```

---

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> PasswordGate: Visit Site

    PasswordGate --> PasswordGate: Wrong Password
    PasswordGate --> HomePage: Correct Password

    state "Not Logged In" as NotLoggedIn {
        HomePage --> ContentPage: Browse Content
        ContentPage --> HomePage: Back to Home
        HomePage --> LoginPage: Click Log In
    }

    LoginPage --> LoginPage: Wrong Credentials
    LoginPage --> LoggedInHome: Correct Credentials

    state "Logged In" as LoggedIn {
        LoggedInHome --> ContentPage: Browse Content
        LoggedInHome --> ProfilePage: Click Profile
        ProfilePage --> LoggedInHome: Back to Home
        LoggedInHome --> Logout: Click Log Out
    }

    Logout --> HomePage: Clear Session

    note right of PasswordGate
        Password: unlockmenow
        Stored in sessionStorage
    end note

    note right of LoginPage
        Email: admin@email.com
        Password: itcan'tbethateasy...
    end note

    note right of ProfilePage
        Shows:
        - Activity Stats
        - Page Views
        - Session Time
        - Recent Activity
    end note
```

---

## User Credentials Reference

| Gate | Credential | Value |
|------|------------|-------|
| **Site Password** | Password | `unlockmenow` |
| **User Login** | Email | `admin@email.com` |
| **User Login** | Password | `itcan'tbethateasy...` |

---

## Page Inventory

| Page | URL | Auth Required | Description |
|------|-----|---------------|-------------|
| Password Gate | `/` (overlay) | No | Site-wide protection |
| Home | `/` | No | Main landing page |
| Login | `/login/` | No | User authentication |
| Logout | `/logout/` | No | Clears session |
| Profile | `/profile/` | Yes* | User activity dashboard |
| FAQ | `/faq/` | No | Content section |
| Notes | `/notes/` | No | Content section |
| Tools | `/tools/` | No | Content section |
| Disclaimer | `/disclaimer/` | No | Legal disclaimer |

*Profile shows "Not Logged In" message if not authenticated

---

## Activity Tracking Data Model

```mermaid
erDiagram
    USER ||--o{ ACTIVITY : generates
    USER {
        string email
        string name
        string avatar
        datetime loginTime
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

### Storage
- **Auth State**: localStorage (`auth:isLoggedIn`, `auth:userEmail`, etc.)
- **Activity Log**: localStorage (`user_activity`)

---

*Generated: December 9, 2025*



