import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyTickets } from "../../src/components/MyTickets.js";
import App from "../../src/App.js";

// Mock the global fetch
global.fetch = vi.fn();

describe("MyTickets Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show 'No matching tickets found' when search yields empty results (UI-03, AC-10)", async () => {
    // Mock the initial fetch and search fetch to return 0 tickets
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ id: 1, name: "Hardware" }])
        });
      }
      if (url.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ id: 1, name: "Mock User", email: "mock@user.com" }])
        });
      }
      if (url.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
          })
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<MyTickets requesterId={1} />);

    // Wait for the initial load to finish and show the no tickets default message
    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any tickets yet/i)).toBeInTheDocument();
    });

    // Enter search term and submit
    const searchInput = screen.getByPlaceholderText(/Search by summary/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    
    const searchBtn = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(searchBtn);

    // It should now show "No matching tickets found"
    await waitFor(() => {
      expect(screen.getByText(/No matching tickets found/i)).toBeInTheDocument();
    });
  });

  it("should enforce Requester Selection on unauthenticated access (UI-01, AC-02)", () => {
    // Render the main App which manages auth state
    render(<App />);

    // Since requesterId is null initially, it should show the Requester Selection screen
    expect(screen.getByText(/Select Development Requester/i)).toBeInTheDocument();
    expect(screen.queryByText(/My Tickets/i)).not.toBeInTheDocument();
  });
});
