import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { StaffDashboard } from "../../src/components/StaffDashboard.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

globalThis.fetch = vi.fn();

let mockCurrentUser: { id: number; role: string; name: string } = {
  id: 2,
  role: "IT Staff",
  name: "Michael Scott"
};

vi.mock("../../src/AuthContext.js", () => ({
  useAuth: () => ({ user: mockCurrentUser })
}));

describe("StaffDashboard Component (UI-01)", () => {
  const mockStaffData = {
    metrics: {
      unassigned: 4,
      myAssigned: 6,
      new: 2,
      open: 8,
      inProgress: 5,
      waitingForRequester: 3,
      resolved: 10,
      closed: 25
    },
    byPriority: {
      Critical: 1,
      High: 4,
      Medium: 9,
      Low: 3
    },
    recentTickets: [
      {
        id: 201,
        ticketNumber: "TKT-2026-0201",
        summary: "Database connection timeouts on production",
        status: "In Progress",
        itPriority: "Critical",
        updatedAt: "2026-10-28T16:00:00Z",
        owner: { id: 2, name: "Michael Scott" },
        requester: { id: 1, name: "Jennifer Anderson" }
      },
      {
        id: 202,
        ticketNumber: "TKT-2026-0202",
        summary: "Keyboard replacement for finance desk",
        status: "Open",
        itPriority: "Low",
        updatedAt: "2026-10-28T16:15:00Z",
        owner: null,
        requester: { id: 3, name: "David Wallace" }
      }
    ]
  };

  const mockAdminData = {
    ...mockStaffData,
    userMetrics: {
      total: 42,
      activeRequesters: 30,
      activeStaff: 8,
      activeAdmins: 2,
      inactive: 2
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockCurrentUser = { id: 2, role: "IT Staff", name: "Michael Scott" };
  });

  it("should render operational metrics, priority breakdown, and recent tickets for IT Staff", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaffData
    });

    const onTicketClick = vi.fn();
    const onViewQueue = vi.fn();

    render(<StaffDashboard onTicketClick={onTicketClick} onViewQueue={onViewQueue} />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael Scott!/i)).toBeInTheDocument();
    });

    // Metric counts
    expect(screen.getByTestId("metric-unassigned")).toHaveTextContent("4");
    expect(screen.getByTestId("metric-my-assigned")).toHaveTextContent("6");
    expect(screen.getByTestId("metric-new")).toHaveTextContent("2");
    expect(screen.getByTestId("metric-open")).toHaveTextContent("8");
    expect(screen.getByTestId("metric-in-progress")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-waiting")).toHaveTextContent("3");

    // Priority counts
    expect(screen.getByText(/Critical:/i)).toBeInTheDocument();
    expect(screen.getByText(/High:/i)).toBeInTheDocument();

    // Recent active tickets
    const summaries = screen.getAllByText("Database connection timeouts on production");
    expect(summaries.length).toBeGreaterThan(0);

    // Non-color cues
    const inProgressBadges = screen.getAllByText("⏳ In Progress");
    expect(inProgressBadges.length).toBeGreaterThan(0);

    const openBadges = screen.getAllByText("○ Open");
    expect(openBadges.length).toBeGreaterThan(0);

    // Click ticket row
    const ticketButtons = screen.getAllByRole("button", { name: /Open ticket TKT-2026-0201/i });
    expect(ticketButtons.length).toBeGreaterThan(0);
    fireEvent.click(ticketButtons[0]);
    expect(onTicketClick).toHaveBeenCalledWith(201);
  });

  it("should render user metrics breakdown and admin links when user is Administrator", async () => {
    mockCurrentUser = { id: 99, role: "Administrator", name: "System Admin" };

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdminData
    });

    const onViewAdmin = vi.fn();

    render(
      <StaffDashboard
        onTicketClick={() => {}}
        onViewQueue={() => {}}
        onViewAdmin={onViewAdmin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Administrator Overview: User Accounts/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("user-total")).toHaveTextContent("42");
    expect(screen.getByTestId("user-requesters")).toHaveTextContent("30");
    expect(screen.getByTestId("user-staff")).toHaveTextContent("8");
    expect(screen.getByTestId("user-admins")).toHaveTextContent("2");
    expect(screen.getByTestId("user-inactive")).toHaveTextContent("2");

    // Click Manage Users quick action
    fireEvent.click(screen.getByRole("button", { name: /Manage Users/i }));
    expect(onViewAdmin).toHaveBeenCalled();
  });

  it("should trigger queue filter navigation on metric drilldown clicks", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStaffData
    });

    const onViewQueue = vi.fn();

    render(<StaffDashboard onTicketClick={() => {}} onViewQueue={onViewQueue} />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Michael Scott!/i)).toBeInTheDocument();
    });

    // Drilldown to Unassigned
    fireEvent.click(screen.getByRole("button", { name: /Filter queue by unassigned tickets/i }));
    expect(onViewQueue).toHaveBeenCalledWith("Unassigned");

    // Drilldown to My Assigned
    fireEvent.click(screen.getByRole("button", { name: /View my assigned tickets/i }));
    expect(onViewQueue).toHaveBeenCalledWith("My Assigned");

    // Quick action: Full queue
    fireEvent.click(screen.getByRole("button", { name: /Browse full service queue/i }));
    expect(onViewQueue).toHaveBeenCalled();
  });
});
