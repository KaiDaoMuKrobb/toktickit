import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AttachmentSection } from "../../src/components/AttachmentSection.js";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock global fetch
global.fetch = vi.fn();
global.prompt = vi.fn();
global.alert = vi.fn();
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

describe("AttachmentSection Component", () => {
  const mockAttachments = [
    { id: 1, originalName: "test.png", mimeType: "image/png", size: 1024, isRemoved: false, createdAt: "2025-05-12T09:14:00Z" }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render active attachments", () => {
    render(<AttachmentSection ticketId={1} requesterId={1} attachments={mockAttachments} onAttachmentChanged={() => {}} />);
    expect(screen.getByText("test.png")).toBeInTheDocument();
  });

  it("should handle soft removal", async () => {
    const mockOnChanged = vi.fn();
    (global.prompt as any).mockReturnValueOnce("Wrong file");
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Removed" })
    });

    render(<AttachmentSection ticketId={1} requesterId={1} attachments={mockAttachments} onAttachmentChanged={mockOnChanged} />);
    
    const removeBtn = screen.getByRole("button", { name: /Remove attachment/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(mockOnChanged).toHaveBeenCalled();
    });
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/tickets/1/attachments/1", expect.objectContaining({ method: "DELETE" }));
  });

  it("should reject large files locally", async () => {
    render(<AttachmentSection ticketId={1} requesterId={1} attachments={[]} onAttachmentChanged={() => {}} />);
    
    const input = screen.getByLabelText(/Upload attachment/i);
    const file = new File(["a".repeat(6 * 1024 * 1024)], "large.png", { type: "image/png" });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(global.alert).toHaveBeenCalledWith("File is too large. Maximum size is 5MB.");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
