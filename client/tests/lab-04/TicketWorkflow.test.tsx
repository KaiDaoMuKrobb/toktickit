import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { TicketDetail } from "../../src/components/TicketDetail.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

globalThis.fetch = vi.fn();

let mockCurrentUser = { id: 2, role: "IT Staff", name: "Staff Member" };

vi.mock("../../src/AuthContext.js", () => ({
  useAuth: () => ({ user: mockCurrentUser })
}));

describe("TicketWorkflow & Concurrency UI Component (UI-04)", () => {
  const baseTicket = {
    id: 1,
    ticketNumber: "TKT-2026-0001",
    summary: "Workflow Test Ticket",
    description: "Detailed description for workflow testing",
    relatedSystem: { id: 1, name: "ERP System" },
    currentStatus: "New",
    requestedPriority: "High",
    itPriority: "High",
    updatedAt: "2026-10-28T12:00:00Z",
    createdAt: "2026-10-28T10:00:00Z",
    category: { id: 1, name: "Software" },
    attachments: [],
    owner: null,
    ownerId: null,
    requesterId: 3,
    requesterResolved: false
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockCurrentUser = { id: 2, role: "IT Staff", name: "Staff Member" };
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("should render only permitted transitions in the status dropdown", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => baseTicket
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    render(<TicketDetail ticketId={1} requesterId={3} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2026-0001")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Ticket Status");
    expect(statusSelect).toBeInTheDocument();

    const options = Array.from(statusSelect.querySelectorAll("option")).map(
      (opt) => (opt as HTMLOptionElement).value
    );

    // Permitted from 'New': Open, In Progress, Cancelled, plus current
    expect(options).toContain("New");
    expect(options).toContain("Open");
    expect(options).toContain("In Progress");
    expect(options).toContain("Cancelled");
    expect(options).not.toContain("Closed");
    expect(options).not.toContain("Resolved");
  });

  it("should send expectedUpdatedAt when transitioning status", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => baseTicket
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...baseTicket, currentStatus: "In Progress" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...baseTicket, currentStatus: "In Progress" })
      });

    render(<TicketDetail ticketId={1} requesterId={3} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2026-0001")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Ticket Status");
    fireEvent.change(statusSelect, { target: { value: "In Progress" } });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/tickets/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            status: "In Progress",
            expectedUpdatedAt: "2026-10-28T12:00:00Z"
          })
        })
      );
    });
  });

  it("should display conflict alert banner when receiving 409 Conflict", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => baseTicket
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        status: 409,
        ok: false,
        json: async () => ({ error: "Conflict Detected" })
      });

    render(<TicketDetail ticketId={1} requesterId={3} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2026-0001")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Ticket Status");
    fireEvent.change(statusSelect, { target: { value: "Open" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Conflict Detected: This ticket was modified by another user/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Refresh Ticket/i })).toBeInTheDocument();
  });

  it("should render advisory alert banner when requesterResolved is true", async () => {
    const resolvedAdvisoryTicket = {
      ...baseTicket,
      currentStatus: "In Progress",
      requesterResolved: true
    };

    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => resolvedAdvisoryTicket
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    render(<TicketDetail ticketId={1} requesterId={3} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2026-0001")).toBeInTheDocument();
    });

    expect(screen.getByText(/Requester Feedback:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The requester indicated that the problem appears resolved/i)
    ).toBeInTheDocument();
  });
});
