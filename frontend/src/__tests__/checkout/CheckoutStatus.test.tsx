/**
 * Smoke tests for the CheckoutStatus component.
 *
 * Tests cover the four visible states:
 *  1. No orderId supplied     → "invalidOrder" message
 *  2. orderId + PENDING order → "pendingTitle" message, no course link
 *  3. orderId + COMPLETED     → "successTitle" message + "openCourse" link
 *  4. orderId + FAILED        → "failureTitle" message + "browseCourses" link
 *  5. API returns 404         → "invalidOrder" message
 *  6. API network error       → "statusUnavailable" message
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CheckoutStatus from "@/app/[locale]/student/checkout/success/CheckoutStatus";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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

// Silence window.setInterval / clearInterval noise in jsdom
beforeEach(() => {
  jest.useFakeTimers();
  // Reset document.cookie stub
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "",
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockOrderFetch(status: number, body?: object) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body ?? {},
  } as Response);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CheckoutStatus", () => {
  it("shows invalidOrder immediately when no orderId is provided", () => {
    render(<CheckoutStatus orderId={null} />);
    expect(screen.getAllByText("invalidOrder").length).toBeGreaterThan(0);
    // No fetch should be made
    expect(global.fetch).toBeUndefined();
  });

  it("shows pending state while the order is still PENDING", async () => {
    mockOrderFetch(200, { status: "PENDING", payment_status: null, course_id: "c1" });
    render(<CheckoutStatus orderId="order-123" />);

    await waitFor(() => {
      expect(screen.getByText("pendingTitle")).toBeInTheDocument();
    });
    expect(screen.getByText("pendingBody")).toBeInTheDocument();
    // No course link or browse link while pending
    expect(screen.queryByText("openCourse")).not.toBeInTheDocument();
    expect(screen.queryByText("browseCourses")).not.toBeInTheDocument();
  });

  it("shows success state with a course link when order is COMPLETED", async () => {
    mockOrderFetch(200, { status: "COMPLETED", payment_status: "SUCCESS", course_id: "course-42" });
    render(<CheckoutStatus orderId="order-456" />);

    await waitFor(() => {
      expect(screen.getByText("successTitle")).toBeInTheDocument();
    });
    expect(screen.getByText("successBody")).toBeInTheDocument();

    const courseLink = screen.getByRole("link", { name: "openCourse" });
    expect(courseLink).toHaveAttribute("href", "/student/courses/course-42");
  });

  it("shows failure state with a browse link when order is FAILED", async () => {
    mockOrderFetch(200, { status: "FAILED", payment_status: "FAILED", course_id: "course-7" });
    render(<CheckoutStatus orderId="order-789" />);

    await waitFor(() => {
      expect(screen.getByText("failureTitle")).toBeInTheDocument();
    });
    expect(screen.getByText("failureBody")).toBeInTheDocument();

    const browseLink = screen.getByRole("link", { name: "browseCourses" });
    expect(browseLink).toHaveAttribute("href", "/student/catalog");
  });

  it("shows invalidOrder when the API returns 404", async () => {
    mockOrderFetch(404);
    render(<CheckoutStatus orderId="missing-order" />);

    await waitFor(() => {
      expect(screen.getAllByText("invalidOrder").length).toBeGreaterThan(0);
    });
  });

  it("shows statusUnavailable when the network request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    render(<CheckoutStatus orderId="order-abc" />);

    await waitFor(() => {
      expect(screen.getByText("statusUnavailable")).toBeInTheDocument();
    });
  });
});
