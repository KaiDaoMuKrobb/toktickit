import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

globalThis.fetch = vi.fn();

let mockCurrentUser: { id: number; role: string; name: string } | null = {
  id: 2,
  role: "IT Staff",
  name: "Staff Member"
};

vi.mock("../../src/AuthContext.js", () => ({
  useAuth: () => ({ user: mockCurrentUser })
}));

describe("ActionsTakenSection Component (UI-03)", () => {
  const mockActionsData = [
    {
      id: 101,
      ticketId: 1,
      actionDateTime: "2026-10-28T10:00:00Z",
      description: "Tested power supply and replaced blown fuse",
      result: "Power restored, boot sequence normal",
      performedById: 2,
      performedBy: { id: 2, name: "Staff Member", email: "staff@example.com", role: "IT Staff" },
      followUpRequired: true,
      followUpNote: "Monitor voltage stability over 24 hours",
      attachmentNotes: "See multimeter log",
      createdAt: "2026-10-28T10:05:00Z",
      updatedAt: "2026-10-28T10:05:00Z"
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockCurrentUser = { id: 2, role: "IT Staff", name: "Staff Member" };
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("should render action list and allow IT Staff to see Add Action Taken button", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockActionsData
    });

    render(<ActionsTakenSection ticketId={1} />);

    await waitFor(() => {
      const descriptions = screen.getAllByText("Tested power supply and replaced blown fuse");
      expect(descriptions.length).toBeGreaterThan(0);
    });

    const results = screen.getAllByText("Power restored, boot sequence normal");
    expect(results.length).toBeGreaterThan(0);

    const staffBadges = screen.getAllByText("Staff Member");
    expect(staffBadges.length).toBeGreaterThan(0);

    const followUpNotes = screen.getAllByText("Monitor voltage stability over 24 hours");
    expect(followUpNotes.length).toBeGreaterThan(0);

    expect(screen.getByRole("button", { name: /Add Action Taken/i })).toBeInTheDocument();
  });

  it("should hide Add Action Taken button and Edit buttons for Requester", async () => {
    mockCurrentUser = { id: 3, role: "Requester", name: "Requester User" };

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockActionsData
    });

    render(<ActionsTakenSection ticketId={1} />);

    await waitFor(() => {
      const descriptions = screen.getAllByText("Tested power supply and replaced blown fuse");
      expect(descriptions.length).toBeGreaterThan(0);
    });

    expect(screen.queryByRole("button", { name: /Add Action Taken/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit/i })).not.toBeInTheDocument();
  });

  it("should dynamically validate follow-up note when follow-up checkbox is checked", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<ActionsTakenSection ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/No actions recorded yet/i)).toBeInTheDocument();
    });

    // Open Modal
    fireEvent.click(screen.getByRole("button", { name: /Add Action Taken/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Fill Description and Result
    fireEvent.change(screen.getByLabelText(/Action Description/i), {
      target: { value: "Replaced RAM module" }
    });
    fireEvent.change(screen.getByLabelText(/Result/i), {
      target: { value: "Memory diagnostics passed" }
    });

    // Check Follow-Up Required toggle
    const followUpCheckbox = screen.getByLabelText(/Follow-Up Required\?/i);
    fireEvent.click(followUpCheckbox);

    // Follow-up note field should appear
    const followUpInput = screen.getByLabelText(/Follow-up Note/i);
    expect(followUpInput).toBeInTheDocument();

    // Fill with whitespace to trigger dynamic validation error
    fireEvent.change(followUpInput, { target: { value: "   " } });

    const form = screen.getByRole("dialog").querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText(/Follow-up Note is required when Follow-up Required is checked/i)
      ).toBeInTheDocument();
    });
  });

  it("should submit new Action Taken successfully", async () => {
    const onActionChanged = vi.fn();

    (globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 102, description: "Cleaning cooling fans" })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 102,
            ticketId: 1,
            actionDateTime: "2026-10-28T11:00:00Z",
            description: "Cleaning cooling fans",
            result: "Temperatures dropped by 15C",
            performedById: 2,
            performedBy: { id: 2, name: "Staff Member", email: "staff@example.com", role: "IT Staff" },
            followUpRequired: false,
            followUpNote: null,
            attachmentNotes: null,
            createdAt: "2026-10-28T11:00:00Z",
            updatedAt: "2026-10-28T11:00:00Z"
          }
        ]
      });

    render(<ActionsTakenSection ticketId={1} onActionChanged={onActionChanged} />);

    await waitFor(() => {
      expect(screen.getByText(/No actions recorded yet/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Action Taken/i }));

    fireEvent.change(screen.getByLabelText(/Action Description/i), {
      target: { value: "Cleaning cooling fans" }
    });
    fireEvent.change(screen.getByLabelText(/Result/i), {
      target: { value: "Temperatures dropped by 15C" }
    });

    const form = screen.getByRole("dialog").querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/tickets/1/actions",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(onActionChanged).toHaveBeenCalled();
  });
});
