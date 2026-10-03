import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "../../src/components/Login.js";
import { ChangePassword } from "../../src/components/ChangePassword.js";
import * as AuthContext from "../../src/AuthContext.js";

// Mock the useAuth hook
vi.mock("../../src/AuthContext.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/AuthContext.js")>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("Lab 3: Authentication UI", () => {
  let mockFetchUser: ReturnType<typeof vi.fn>;
  let mockLogout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetchUser = vi.fn();
    mockLogout = vi.fn();
    
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      fetchUser: mockFetchUser,
      logout: mockLogout,
    });
    
    globalThis.fetch = vi.fn();
  });

  describe("Login Component", () => {
    it("renders the login form", () => {
      render(<Login />);
      expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    });

    it("displays an error message on failed login", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials" }),
      } as any);

      render(<Login />);
      
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "test@test.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrong" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
      
      expect(mockFetchUser).not.toHaveBeenCalled();
    });

    it("calls fetchUser on successful login", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as any);

      render(<Login />);
      
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "test@test.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "correct" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(mockFetchUser).toHaveBeenCalled();
      });
    });
  });

  describe("ChangePassword Component", () => {
    beforeEach(() => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: { id: 1, email: "test@test.com", name: "Test User", role: "Requester", mustChangePassword: true },
        loading: false,
        fetchUser: mockFetchUser,
        logout: mockLogout,
      });
    });

    it("renders the change password form", () => {
      render(<ChangePassword />);
      expect(screen.getByText(/Password Update Required/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    });

    it("validates that new passwords match", async () => {
      render(<ChangePassword />);
      
      fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: "old" } });
      fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: "newpass123" } });
      fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: "mismatch123" } });
      
      fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(screen.getByText("New passwords do not match.")).toBeInTheDocument();
      });
      
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("validates that the new password is at least 8 characters", async () => {
      render(<ChangePassword />);
      
      fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: "old" } });
      fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: "short" } });
      fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: "short" } });
      
      fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(screen.getByText("New password must be at least 8 characters.")).toBeInTheDocument();
      });
      
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("calls API and fetchUser on success", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
      } as any);

      render(<ChangePassword />);
      
      fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: "old" } });
      fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: "newpass123" } });
      fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: "newpass123" } });
      
      fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/auth/change-password", expect.any(Object));
        expect(mockFetchUser).toHaveBeenCalled();
      });
    });
  });
});
