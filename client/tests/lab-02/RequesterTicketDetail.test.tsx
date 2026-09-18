import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TicketDetail } from "../../src/components/TicketDetail.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetch globally so we don't make real network requests during tests
globalThis.fetch = vi.fn();

describe("RequesterTicketDetail Component", () => {
  // Define mock data that represents a standard ticket response from the API
  const mockTicketData = {
    id: 1,
    ticketNumber: "TKT-2025-001234",
    summary: "Mock Ticket",
    description: "Mock Description",
    relatedSystem: { id: 1, name: "System X" }, // Updated to match the new Object structure

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
    // Clear all mock history and implementations before each test
    // to ensure tests don't interfere with each other
    vi.resetAllMocks();
  });

  it("should render ticket details after loading", async () => {
    // 1. Arrange: Setup the fetch mock to return a successful 200 OK response with our mockTicketData
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTicketData
    });

    // 2. Act: Render the TicketDetail component
    render(<TicketDetail ticketId={1} requesterId={1} onBack={() => { }} />);

    // 3. Assert (Initial state): It should display "Loading..." initially
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();

    // 4. Assert (Async state): Wait for the UI to update after fetch resolves
    await waitFor(() => {
      expect(screen.getByText("Ticket: TKT-2025-001234")).toBeInTheDocument();
    });

    // Verify other fields rendered correctly

    expect(screen.getByText("Mock Ticket")).toBeInTheDocument();
    expect(screen.getByText("Mock Description")).toBeInTheDocument();
  });

  it("should display error if ticket fetch fails", async () => {
    // 1. Arrange: Setup the fetch mock to simulate an API error (e.g., 404 Not Found)
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not Found" })
    });

    // 2. Act: Render the component with an invalid ticket ID
    render(<TicketDetail ticketId={99} requesterId={1} onBack={() => { }} />);

    // 3. Assert: Wait for the error message to appear in the UI
    await waitFor(() => {
      expect(screen.getByText(/Failed to load ticket/)).toBeInTheDocument();
    });
  });
});
