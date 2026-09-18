import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserManagement } from "../../src/components/UserManagement";
import * as AuthContextModule from "../../src/AuthContext";
import React from "react";

// Mock fetch
global.fetch = vi.fn();

// Mock useAuth
vi.mock("../../src/AuthContext", async () => {
  const actual = await vi.importActual("../../src/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("UserManagement Component", () => {
  const adminUser = {
    id: 1,
    name: "Admin User",
    email: "admin@toktickit.com",
    role: "Administrator",
    mustChangePassword: false
  };

  const mockUsers = [
    { id: 1, name: "Admin User", email: "admin@toktickit.com", role: "Administrator", isActive: true },
    { id: 2, name: "IT Staff", email: "it@toktickit.com", role: "IT Staff", isActive: true }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithAuth = (user: any) => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user,
      login: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      loading: false
    });
    return render(<UserManagement />);
  };

  it("UI-03: Admin creates new user - Form submits, modal closes, user list updates", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      }) // initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, name: "New User", email: "new@example.com", role: "Requester", isActive: true })
      }) // POST /api/users
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [...mockUsers, { id: 3, name: "New User", email: "new@example.com", role: "Requester", isActive: true }]
      }); // fetch after create

    renderWithAuth(adminUser);

    await waitFor(() => {
      expect(screen.getByText("IT Staff")).toBeInTheDocument();
    });

    // Open modal
    fireEvent.click(screen.getByText("+ Create New User"));
    
    // Check modal exists
    expect(screen.getByText("Initial Password")).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New User" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Requester" } });
    fireEvent.change(screen.getByLabelText("Initial Password"), { target: { value: "password123" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));

    // Wait for the third fetch (the update)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    // Verify modal is closed
    expect(screen.queryByText("Initial Password")).not.toBeInTheDocument();
    
    // Verify user is in list
    await waitFor(() => {
      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  it("Should deny access to non-Administrators", () => {
    renderWithAuth({ id: 2, role: "IT Staff" });
    expect(screen.getByText(/Access Denied: Administrators only/i)).toBeInTheDocument();
  });
});
