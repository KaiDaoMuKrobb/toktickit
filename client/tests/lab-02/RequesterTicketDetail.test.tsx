import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TicketDetail } from "../../src/components/TicketDetail.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

describe("RequesterTicketDetail Component", () => {
  const mockTicketData = {
    id: 1,
    ticketNumber: "TKT-2025-001234",
    summary: "Mock Ticket",
    description: "Mock Description",
    relatedSystem: "System X",
    currentStatus: "New",
    updatedAt: "2025-05-12T09:14:00Z",
    createdAt: "2025-05-12T09:14:00Z",
    category: { id: 1, name: "Hardware" },
    attachments: [
      { id: 1, originalName: "test.png", mimeType: "image/png", size: 1024, isRemoved: false, createdAt: "2025-05-12T09:14:00Z" },
      { id: 2, originalName: "removed.pdf", mimeType: "application/pdf", size: 2048, isRemoved: true, createdAt: "2025-05-12T09:14:00Z" }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render ticket details after loading", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTicketData
    });

    render(<TicketDetail ticketId={1} requesterId={1} onBack={() => {}} />);
    
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2025-001234")).toBeInTheDocument();
    });

    expect(screen.getByText("Mock Ticket")).toBeInTheDocument();
    expect(screen.getByText("Mock Description")).toBeInTheDocument();
  });

  it("should display error if ticket fetch fails", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not Found" })
    });

    render(<TicketDetail ticketId={99} requesterId={1} onBack={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load ticket/)).toBeInTheDocument();
    });
  });
});
