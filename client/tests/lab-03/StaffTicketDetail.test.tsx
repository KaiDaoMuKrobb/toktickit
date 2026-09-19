import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { TicketDetail } from "../../src/components/TicketDetail.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

globalThis.fetch = vi.fn();

vi.mock("../../src/AuthContext.js", () => ({
  useAuth: () => ({ user: { id: 2, role: "IT Staff", name: "Staff Member" } })
}));

describe("StaffTicketDetail Component", () => {
  const mockTicketData = {
    id: 1,
    ticketNumber: "TKT-2025-001234",
    summary: "Mock Ticket",
    description: "Mock Description",
    relatedSystem: { id: 1, name: "System X" },
    currentStatus: "New",
    requestedPriority: "Medium",
    itPriority: "Medium",
    updatedAt: "2025-05-12T09:14:00Z",
    createdAt: "2025-05-12T09:14:00Z",
    category: { id: 1, name: "Hardware" },
    attachments: [],
    owner: null,
    ownerId: null,
    requesterId: 1
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should show claim button and allow IT Staff to claim ticket", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicketData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    render(<TicketDetail ticketId={1} requesterId={1} onBack={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2025-001234")).toBeInTheDocument();
    });

    const claimButton = screen.getByRole("button", { name: /Claim/i });
    expect(claimButton).toBeInTheDocument();

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTicketData, ownerId: 2, owner: { name: "Staff Member" } })
    });

    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/tickets/1", expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ ownerId: 2 })
      }));
    });
  });

  it("should show Internal Note tab for IT Staff", async () => {
    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicketData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    render(<TicketDetail ticketId={1} requesterId={1} onBack={() => { }} />);

    await waitFor(() => {
      expect(screen.getByText("Add Internal Note")).toBeInTheDocument();
    });
  });
});
