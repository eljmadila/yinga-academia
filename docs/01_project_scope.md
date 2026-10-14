# Project Scope: Yinga Academica

## 1. Overview
Yinga Academica is a modern, modular educational platform designed to deliver a premium learning and teaching experience. It provides distinct, secure, and feature-rich environments for both Students and Instructors.

## 2. Core Objectives
- **Scalability**: Decoupled architecture allowing independent scaling of the frontend and backend.
- **User Experience (UX)**: A highly responsive, dynamic, and visually stunning interface prioritizing ease-of-use and modern aesthetics.
- **Data-Driven Insights**: Providing instructors with actionable, real-time analytics to track sales and student engagement.

## 3. Key Features

### 3.1 Student Portal (`/student/*`)
- **Dashboard**: Personalized overview of active courses and learning progress.
- **Course Catalog**: Public-facing library of available courses.
- **Learning Environment**: Distraction-free interface for consuming video, text, and interactive content.

### 3.2 Instructor Portal (`/instructor/*`)
- **Analytics Dashboard**: Modern, shadcn-powered charts displaying revenue, course enrollments, and KPIs.
- **Course Management**: Tools to draft, publish, and manage course content (e.g., Course Creation Wizard).
- **Student Engagement**: Interface to monitor student progress and handle queries.

## 4. Localization Strategy
- The launch site and course content support **English and French**.
- The frontend uses `next-intl`; English is the default locale and locale prefixes are disabled.

## 5. Launch Scope
- **Launch roles**: Students and instructors; administrators/staff operate the platform.
- **Course pricing**: A mix of free and paid courses.
- **Launch payment provider**: M-Pesa Daraja only. Other provider integrations are outside the launch checkout scope.
- **Hosting**: Vercel for the frontend, Render for the Django backend, and Render-managed PostgreSQL.
- **Legal and support pages**: Terms of Service, Privacy Policy, and Contact/support must be live; their content and destinations require approval before launch.
