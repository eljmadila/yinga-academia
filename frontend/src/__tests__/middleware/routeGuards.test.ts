/**
 * Unit tests for the Next.js middleware route guards.
 *
 * We test the routing logic in isolation by mocking:
 *  - next-intl/middleware  → returns a plain "intl-handled" response
 *  - next/server           → lightweight stubs for NextRequest / NextResponse
 *
 * The guards under test (from src/middleware.ts):
 *  1. /login and /register routes bypass auth checks → delegates to intl
 *  2. /student routes without a token → redirect to /login
 *  3. /student routes with an instructor token → redirect to /instructor/dashboard
 *  4. /student routes with a student token → delegates to intl
 *  5. /instructor routes without a token → redirect to /login
 *  6. /instructor routes with a student token → redirect to /student/dashboard
 *  7. /instructor routes with an instructor token → delegates to intl
 */

// ── Lightweight stubs ─────────────────────────────────────────────────────────

const makeIntlResponse = () => ({ type: "intl" });
const makeRedirectResponse = (url: string) => ({ type: "redirect", url });

// Mock next-intl/middleware before importing middleware.ts
jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: () => () => makeIntlResponse(),
}));

// Stub NextResponse.redirect used inside middleware.ts
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: { pathname: string }) => makeRedirectResponse(url.pathname),
  },
}));

// Mock the i18n routing config (imported by middleware.ts)
jest.mock("@/i18n/routing", () => ({
  routing: {},
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

type CookieMap = Record<string, string>;

/**
 * Build a minimal NextRequest-like object.
 */
function makeRequest(pathname: string, cookies: CookieMap = {}) {
  return {
    nextUrl: {
      pathname,
      // url() is used to build redirect targets
      toString: () => `http://localhost${pathname}`,
    },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        name in cookies ? { value: cookies[name] } : undefined,
    },
  };
}

// ── Import the module under test ──────────────────────────────────────────────

// We import after mocks are in place
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: middleware } = require("@/middleware") as {
  default: (req: ReturnType<typeof makeRequest>) => { type: string; url?: string };
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("middleware route guards", () => {
  // ── Public / auth routes ───────────────────────────────────────────────────

  it("allows /login without auth — delegates to intl middleware", () => {
    const res = middleware(makeRequest("/login"));
    expect(res).toEqual(makeIntlResponse());
  });

  it("allows /register without auth — delegates to intl middleware", () => {
    const res = middleware(makeRequest("/register"));
    expect(res).toEqual(makeIntlResponse());
  });

  // ── Student routes ─────────────────────────────────────────────────────────

  it("redirects unauthenticated requests to /student/dashboard → /login", () => {
    const res = middleware(makeRequest("/student/dashboard"));
    expect(res).toEqual(makeRedirectResponse("/login"));
  });

  it("redirects instructor token on /student route → /instructor/dashboard", () => {
    const res = middleware(
      makeRequest("/student/dashboard", {
        access_token: "tok",
        user_role: "instructor",
      })
    );
    expect(res).toEqual(makeRedirectResponse("/instructor/dashboard"));
  });

  it("allows student token on /student route — delegates to intl middleware", () => {
    const res = middleware(
      makeRequest("/student/dashboard", {
        access_token: "tok",
        user_role: "student",
      })
    );
    expect(res).toEqual(makeIntlResponse());
  });

  // ── Instructor routes ──────────────────────────────────────────────────────

  it("redirects unauthenticated requests to /instructor/dashboard → /login", () => {
    const res = middleware(makeRequest("/instructor/dashboard"));
    expect(res).toEqual(makeRedirectResponse("/login"));
  });

  it("redirects student token on /instructor route → /student/dashboard", () => {
    const res = middleware(
      makeRequest("/instructor/dashboard", {
        access_token: "tok",
        user_role: "student",
      })
    );
    expect(res).toEqual(makeRedirectResponse("/student/dashboard"));
  });

  it("allows instructor token on /instructor route — delegates to intl middleware", () => {
    const res = middleware(
      makeRequest("/instructor/dashboard", {
        access_token: "tok",
        user_role: "instructor",
      })
    );
    expect(res).toEqual(makeIntlResponse());
  });

  // ── Unprotected public routes ──────────────────────────────────────────────

  it("public catalog page — delegates to intl middleware without auth", () => {
    const res = middleware(makeRequest("/catalog"));
    expect(res).toEqual(makeIntlResponse());
  });
});
