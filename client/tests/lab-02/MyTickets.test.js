import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyTickets } from "../../src/components/MyTickets.js";
import App from "../../src/App.js";
// Mock the AuthContext so that the app renders as an unauthenticated user by default
vi.mock("../../src/AuthContext.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useAuth: vi.fn(() => ({
            user: null,
            loading: false,
            logout: vi.fn(),
            fetchUser: vi.fn(),
        })),
    };
});
// Mock the global fetch
globalThis.fetch = vi.fn();
describe("MyTickets Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("should show 'No matching tickets found' when search yields empty results (UI-03, AC-10)", async () => {
        // Mock the initial fetch and search fetch to return 0 tickets
        globalThis.fetch.mockImplementation((url) => {
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
        render(_jsx(MyTickets, { requesterId: 1 }));
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
    it("should enforce Requester Selection on unauthenticated access (UI-01, AC-02)", async () => {
        // Render the main App which manages auth state
        render(_jsx(App, {}));
        // Since requesterId is null initially, it should show the Login screen
        expect(await screen.findByText(/Sign in to the IT Service Desk/i)).toBeInTheDocument();
        expect(screen.queryByText(/My Tickets/i)).not.toBeInTheDocument();
    });
});
