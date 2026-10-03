import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChangePassword } from "../../src/components/ChangePassword.js";
import * as AuthContext from "../../src/AuthContext.js";

vi.mock("../../src/AuthContext.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/AuthContext.js")>();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("ChangePassword Component", () => {
  let mockFetchUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetchUser = vi.fn();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: 1, name: "Test User", email: "test@example.com", role: "Requester", mustChangePassword: true },
      loading: false,
      fetchUser: mockFetchUser,
      logout: vi.fn(),
    });
    global.fetch = vi.fn();
  });

  it("should render the change password form", () => {
    render(<ChangePassword />);
    expect(screen.getByText("Password Update Required")).toBeInTheDocument();
  });

  it("should show error if new passwords do not match", async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password$/i), { target: { value: "password124" } });
    
    // the button text is actually "Update Password" or similar, let's use getByRole submit
    fireEvent.submit(screen.getByRole("button", { name: /update/i, hidden: true }).parentElement || screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("New passwords do not match.")).toBeInTheDocument();
    });
  });
});
