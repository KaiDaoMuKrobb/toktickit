import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

vi.mock("../../src/components/DevelopmentRequesterSelector.js", () => ({
  DevelopmentRequesterSelector: ({ onSelect }: any) => (
    <button onClick={() => onSelect(1)}>Mock Select Requester</button>
  ),
}));

// Mock global fetch to prevent components rendered by App (like MyTickets) from making actual network requests
global.fetch = vi.fn((url: string) => {
  if (url.includes("/api/categories") || url.includes("/api/requesters")) {
    return Promise.resolve({
      ok: true,
      json: async () => ([])
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({ data: [], meta: { total: 0 } })
  });
}) as any;

describe("App", () => {
  // WORKED EXAMPLE — provided for you.
  it("renders the TokTickIT heading", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Mock Select Requester" }));
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
    
    // Wait for MyTickets initial fetch to settle to avoid act() warning
    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any tickets yet/i)).toBeInTheDocument();
    });
  });

  // Issue 4 — write these yourself. Hint: mock the api module with
  // vi.spyOn(api, "checkSystem").mockResolvedValue(...) / .mockRejectedValue(...)
  // then click the button and assert the Online list / Offline message.
  it("shows Online and the seeded categories on success", async () => {
    vi.spyOn(api, "checkSystem").mockResolvedValue({
      online: true,
      categories: [
        { id: 1, name: "Account and Access" },
        { id: 2, name: "Hardware" },
      ]
    });
    
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Mock Select Requester" }));
    fireEvent.click(screen.getByRole("button", { name: /check system/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/System Status: Online/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Account and Access")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();

    // Wait for MyTickets initial fetch to settle
    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any tickets yet/i)).toBeInTheDocument();
    });
  });

  it("shows an Offline error message when the API is unavailable", async () => {
    vi.spyOn(api, "checkSystem").mockRejectedValue(new Error("Unable to connect to TokTickIT API"));
    
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Mock Select Requester" }));
    fireEvent.click(screen.getByRole("button", { name: /check system/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/System Status: Offline/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Unable to connect to TokTickIT API/i)).toBeInTheDocument();

    // Wait for MyTickets initial fetch to settle
    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any tickets yet/i)).toBeInTheDocument();
    });
  });
});
