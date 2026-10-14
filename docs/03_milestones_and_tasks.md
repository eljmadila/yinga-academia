# Milestones & Roadmap

This document tracks the high-level progress and upcoming objectives for Yinga Academica.

## Phase 1: Foundation (✅ Completed)
- [x] Initial Django and Next.js project setup.
- [x] Initial Docker-based setup (retired; use the direct Python and Node.js workflow).
- [x] Establish modular Django app structure (`yinga_core`, `students`, `instructors`).
- [x] Basic routing and layouts for Student and Instructor spaces.

## Phase 2: Core Infrastructure & Refactoring (✅ Completed)
- [x] Implement Instructor Analytics Dashboard (shadcn Mixed Bar/Line charts, Donut charts, KPIs, Transactions Table).
- [x] Localization & Route Migration (English/French Next.js routing and UI).
- [x] Enforce Next.js Route protection middleware.

## Phase 3: Feature Implementation (🚧 In Progress)
- [x] **Authentication Flow**: Standard JWT Login/Register via Django.
- [x] **Social Authentication**: Google and Facebook OAuth 2.0 integration (Full-stack).
- [x] **Instructor Tools**: Connected the "Create Course" Wizard (`/instructor/create-course`) to the API.
- [x] **Instructor Tools**: Connected the "My Courses" view (`/instructor/my-courses`) to the `/api/courses/my/` endpoint.
- [x] **Student Tools**: Connected the Student Course Catalog (`/student/catalog`) to display live published courses.
- [ ] **Course Enrollment & Payments**: Course detail pages, shopping cart/checkout, and M-Pesa Daraja launch checkout.
- [ ] **Lesson Content Creation**: Interface for instructors to upload videos and curriculum for their courses.
- [ ] **Student Learning Interface**: The active video player and progress tracking dashboard.

## Phase 4: Polish & Production Prep (📅 Planned)
- [ ] Performance optimizations (Image optimization, lazy loading).
- [ ] SEO implementation for the public-facing Course Catalog.
- [ ] Implement automated testing (Pytest for Django, Jest/Playwright for Next.js).
- [ ] Set up CI/CD pipelines for production deployment.
