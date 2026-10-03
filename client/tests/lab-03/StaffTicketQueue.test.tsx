import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue.js";

describe("StaffTicketQueue Component", () => {
  const mockOnTicketClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render the queue table and display tickets", async () => {
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url.toString().includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: "Hardware" }]),
        } as Response);
      }
      if (url.toString().includes("/api/tickets/queue")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              {
                id: 1,
                ticketNumber: "TKT-2025-001234",
                summary: "Test ticket summary",
                currentStatus: "New",
                requestedPriority: "Medium",
                itPriority: "Medium",
                updatedAt: new Date().toISOString(),
                category: { id: 1, name: "Hardware" },
                owner: null,
                requester: { id: 2, name: "Requester Name" }
              }
            ],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
          }),
        } as Response);
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<StaffTicketQueue onTicketClick={mockOnTicketClick} />);

    await waitFor(() => {
      expect(screen.getByText("TKT-2025-001234")).toBeInTheDocument();
      expect(screen.getByText("Test ticket summary")).toBeInTheDocument();
    });
  });

  it("should show empty state when no tickets are returned", async () => {
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url.toString().includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (url.toString().includes("/api/tickets/queue")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
          }),
        } as Response);
      }
      return Promise.reject();
    });

    render(<StaffTicketQueue onTicketClick={mockOnTicketClick} />);

    await waitFor(() => {
      expect(screen.getByText("No tickets found.")).toBeInTheDocument();
    });
  });
});
