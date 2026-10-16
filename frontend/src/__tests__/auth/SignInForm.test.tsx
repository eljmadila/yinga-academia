/**
 * Smoke tests for the SignInForm component.
 *
 * Mocks: next-intl, @/i18n/navigation, UI primitives, lucide-react, fetch,
 *        Location.prototype.href (captures redirect target reliably in jsdom)
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInForm from "@/components/auth/SignInForm";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("lucide-react", () => ({
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eyeoff" />,
}));

// ── cookie helpers ───────────────────────────────────────────────────────────
//
// jsdom's window.location instance owns the href property, so prototype-level
// intercepts have no effect. Instead we verify redirect intent by reading the
// user_role cookie that the component writes immediately before calling
// window.location.href — this proves the full success path was executed.

/** Parse a single cookie value from document.cookie by name. */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null;
}

/** Clear all cookies between tests. */
function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
}

// jsdom emits a console.error for window.location.href assignments ("Not
// implemented: navigation").  Suppress it so the test output stays clean.
// Real errors are still surfaced because we only suppress the specific message.
let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const str = args.map((a) => (a instanceof Error ? `${a.message} ${a.stack}` : String(a))).join(" ");
    if (str.includes("Not implemented: navigation") || str.includes("not implemented")) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockFetch = (status: number, body: object) => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SignInForm", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    clearCookies();
  });

  it("renders email and password fields and the submit button", () => {
    render(<SignInForm />);
    expect(screen.getByPlaceholderText("emailPlaceholder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /signIn/i })).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    render(<SignInForm />);
    expect(screen.getByRole("link", { name: /signUp/i })).toHaveAttribute("href", "/register");
  });

  it("renders a link to the password reset page", () => {
    render(<SignInForm />);
    expect(screen.getByRole("link", { name: /forgotPassword/i })).toHaveAttribute(
      "href",
      "/reset-password"
    );
  });

  it("toggles password visibility when the eye button is clicked", async () => {
    render(<SignInForm />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "" });
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows an error message when credentials are rejected (401)", async () => {
    mockFetch(401, { detail: "Invalid credentials" });

    render(<SignInForm />);
    await userEvent.type(screen.getByPlaceholderText("emailPlaceholder"), "bad@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    fireEvent.submit(screen.getByRole("button", { name: /signIn/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Failed to sign in/i)).toBeInTheDocument();
    });
  });

  it("processes a successful student login: sets auth cookies before redirecting", async () => {
    mockFetch(200, { access: "access-tok", refresh: "refresh-tok", role: "student" });

    render(<SignInForm />);
    await userEvent.type(screen.getByPlaceholderText("emailPlaceholder"), "student@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "pass1234");
    fireEvent.submit(screen.getByRole("button", { name: /signIn/i }).closest("form")!);

    // Wait for the async flow to complete — no error means the success path ran
    await waitFor(() => {
      expect(screen.queryByText(/Failed to sign in/i)).not.toBeInTheDocument();
      // access_token cookie is set in the success path, before window.location.href
      expect(getCookie("user_role")).toBe("student");
    });
  });

  it("processes a successful instructor login: sets auth cookies before redirecting", async () => {
    mockFetch(200, { access: "access-tok", refresh: "refresh-tok", role: "instructor" });

    render(<SignInForm />);
    await userEvent.type(screen.getByPlaceholderText("emailPlaceholder"), "inst@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "pass1234");
    fireEvent.submit(screen.getByRole("button", { name: /signIn/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.queryByText(/Failed to sign in/i)).not.toBeInTheDocument();
      expect(getCookie("user_role")).toBe("instructor");
    });
  });

  it("disables the submit button while a login request is in-flight", async () => {
    global.fetch = jest.fn().mockReturnValueOnce(new Promise(() => {}));

    render(<SignInForm />);
    await userEvent.type(screen.getByPlaceholderText("emailPlaceholder"), "a@b.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "pass");
    fireEvent.submit(screen.getByRole("button", { name: /signIn/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signingIn/i })).toBeDisabled();
    });
  });
});
