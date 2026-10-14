# System Architecture

## 1. High-Level Architecture
Yinga Academica utilizes a decoupled Client-Server architecture. This ensures a clean separation of concerns between the user interface and the business logic/data management.

## 2. Technology Stack

### 2.1 Frontend (Client)
- **Framework**: Next.js (React) using the App Router.
- **Styling**: Tailwind CSS & `shadcn/ui` for accessible, modern, and reusable components.
- **State Management & Data Fetching**: React Server Components (RSC) where applicable, alongside client-side hooks.
- **Routing & Security**: Next.js Middleware (`middleware.ts`) enforces role-based access control (RBAC) ensuring students cannot access instructor routes and vice versa.

### 2.2 Backend (API Server)
- **Framework**: Django & Django REST Framework (DRF).
- **Architecture**: Modular apps (e.g., `students`, `instructors`, `courses`) isolating specific domain logic.
- **Authentication**: JSON Web Tokens (JWT) for secure, stateless sessions.
- **Security**: Configured CORS policies to restrict API access to the Next.js frontend.

### 2.3 Database & Infrastructure
- **Primary Database**: PostgreSQL (relational integrity, JSONB support for flexible metadata).
- **Local Development**: Run Django and Next.js directly with Python and Node.js. Django uses SQLite when `DATABASE_URL` is unset in debug mode; PostgreSQL is the production database.
- **Deployment**: Vercel hosts the Next.js frontend; Render hosts the Django API and managed PostgreSQL using native runtime/build services. The application does not depend on Docker or Docker Compose.

## 3. Directory Structure
```text
yinga_academica/
├── backend/            # Django applications, core settings, and API logic
├── frontend/           # Next.js App Router, components, and layouts
└── docs/               # System architecture, scope, and roadmap
```

## 4. Data Flow
1. **Client Request**: User navigates to a protected route in the Next.js frontend.
2. **Middleware Intercept**: Next.js middleware verifies the presence and validity of the JWT.
3. **API Call**: Next.js fetches necessary data from the Django API.
4. **Backend Processing**: Django validates the JWT, checks permissions, queries PostgreSQL, and serializes the response.
5. **Render**: Next.js renders the data using modern UI components and serves it to the user.
