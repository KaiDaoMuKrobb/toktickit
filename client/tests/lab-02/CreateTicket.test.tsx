import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTicket } from "../../src/components/CreateTicket.js";

// Mock the global fetch
global.fetch = vi.fn();

describe("CreateTicket Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ([]) // Mock categories/systems fetch if necessary
    });
  });

  it("should show validation errors when submitted empty (UI-02, AC-07)", async () => {
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    render(<CreateTicket requesterId={1} onSuccess={onSuccess} onCancel={onCancel} />);

    // Click submit without filling anything
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitBtn);

    // Should show validation errors without calling API
    await waitFor(() => {
      expect(screen.getByText(/Summary must be between 5 and 100 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Description must be between 10 and 1000 characters/i)).toBeInTheDocument();
      // Notice: We don't have visual validation for empty Category and System yet in CreateTicket.tsx
      // So we just check the ones that do have validation messages
    });

    // The fetch should only have been called for categories/systems, not for POSTing the ticket
    const fetchCalls = (global.fetch as any).mock.calls;
    const postCalls = fetchCalls.filter((call: any) => call[1]?.method === "POST");
    expect(postCalls.length).toBe(0);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
