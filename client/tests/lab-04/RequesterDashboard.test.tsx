import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RequesterDashboard } from "../../src/components/RequesterDashboard.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

globalThis.fetch = vi.fn();

let mockCurrentUser = { id: 1, role: "Requester", name: "Jennifer Anderson" };

vi.mock("../../src/AuthContext.js", () => ({
  useAuth: () => ({ user: mockCurrentUser })
}));

describe("RequesterDashboard Component (UI-02)", () => {
  const mockDashboardData = {
    metrics: {
      open: 3,
      inProgress: 2,
      resolved: 5,
      closed: 12,
      waitingForRequester: 1
    },
    recentTickets: [
      {
        id: 10,
        ticketNumber: "TKT-2026-0010",
        summary: "Need secondary monitor for workstation",
        status: "Open",
        itPriority: "Medium",
        updatedAt: "2026-10-28T14:00:00Z"
      },
      {
        id: 12,
        ticketNumber: "TKT-2026-0012",
        summary: "VPN access dropped during conference call",
        status: "Resolved",
        itPriority: "High",
        updatedAt: "2026-10-28T15:30:00Z"
      }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockCurrentUser = { id: 1, role: "Requester", name: "Jennifer Anderson" };
  });

  it("should render personal metrics, recent tickets, and non-color cues", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    });

    const onTicketClick = vi.fn();
    const onCreateTicket = vi.fn();
    const onViewAll = vi.fn();

    render(
      <RequesterDashboard
        onTicketClick={onTicketClick}
        onCreateTicket={onCreateTicket}
        onViewAll={onViewAll}
      />
    );

    // Header greeting
    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();
    });

    // Metric counts
    expect(screen.getByTestId("metric-open")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-in-progress")).toHaveTextContent("2");
    expect(screen.getByTestId("metric-resolved")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-closed")).toHaveTextContent("12");

    // Recent tickets
    const summaries = screen.getAllByText("Need secondary monitor for workstation");
    expect(summaries.length).toBeGreaterThan(0);

    // Non-color cues
    const openBadges = screen.getAllByText("○ Open");
    expect(openBadges.length).toBeGreaterThan(0);

    const resolvedBadges = screen.getAllByText("✓ Resolved");
    expect(resolvedBadges.length).toBeGreaterThan(0);

    // Clicking a ticket
    const ticketButtons = screen.getAllByRole("button", { name: /Open ticket TKT-2026-0010/i });
    expect(ticketButtons.length).toBeGreaterThan(0);
    fireEvent.click(ticketButtons[0]);
    expect(onTicketClick).toHaveBeenCalledWith(10);
  });

  it("should handle empty state cleanly when requester has zero tickets", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        metrics: { open: 0, inProgress: 0, resolved: 0, closed: 0, waitingForRequester: 0 },
        recentTickets: []
      })
    });

    render(
      <RequesterDashboard
        onTicketClick={() => {}}
        onCreateTicket={() => {}}
        onViewAll={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any tickets yet/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("metric-open")).toHaveTextContent("0");
  });

  it("should trigger navigation callbacks for quick actions and drilldown", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    });

    const onCreateTicket = vi.fn();
    const onViewAll = vi.fn();

    render(
      <RequesterDashboard
        onTicketClick={() => {}}
        onCreateTicket={onCreateTicket}
        onViewAll={onViewAll}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Jennifer Anderson!/i)).toBeInTheDocument();
    });

    // Quick action: Create ticket
    fireEvent.click(screen.getByRole("button", { name: /Create a new ticket/i }));
    expect(onCreateTicket).toHaveBeenCalled();

    // Quick action: View all tickets
    fireEvent.click(screen.getByRole("button", { name: /View all my tickets/i }));
    expect(onViewAll).toHaveBeenCalled();

    // Metric drill-down
    fireEvent.click(screen.getByRole("button", { name: /View all open tickets/i }));
    expect(onViewAll).toHaveBeenCalledWith("Open");
  });
});
