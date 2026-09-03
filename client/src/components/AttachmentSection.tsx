import React, { useRef, useState } from "react";

interface Attachment {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  isRemoved: boolean;
  createdAt: string;
}

interface Props {
  ticketId: number;
  requesterId: number;
  attachments: Attachment[];
  onAttachmentChanged: () => void;
}

export function AttachmentSection({ ticketId, requesterId, attachments, onAttachmentChanged }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAttachments = attachments.filter(a => !a.isRemoved);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}/attachments`, {
        method: "POST",
        headers: { "X-Development-Requester-Id": String(requesterId) },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload file");
      }

      onAttachmentChanged();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (attachmentId: number, originalName: string) => {
    fetch(`http://localhost:3000/api/attachments/${attachmentId}/download`, {
      headers: { "X-Development-Requester-Id": String(requesterId) }
    })
      .then(res => {
        if (!res.ok) throw new Error("File not found or removed");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => alert(err.message));
  };

  const handleRemove = async (attachmentId: number) => {
    const reason = prompt("Please provide a reason for removing this file:");
    if (reason === null) return; // User cancelled
    if (reason.trim() === "") {
      alert("A reason is required to remove an attachment.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: { 
          "X-Development-Requester-Id": String(requesterId),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason.trim() })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove file");
      }

      onAttachmentChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white p-4 rounded border h-100 d-flex flex-column">
      <h5 className="border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
        Attachments
        <span className="badge bg-light text-dark border">{activeAttachments.length}/5</span>
      </h5>
      
      <div className="mb-4">
        <input 
          type="file" 
          className="form-control form-control-sm mb-2" 
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={uploading || activeAttachments.length >= 5}
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          aria-label="Upload attachment"
        />
        <small className="text-muted">
          Max 5 files (JPG, PNG, WEBP, PDF), 5MB each.
        </small>
        {uploading && <div className="mt-2 text-success small">Uploading...</div>}
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "300px" }}>
        {attachments.length === 0 ? (
          <p className="text-muted small text-center py-4 bg-light rounded border-dashed">No attachments</p>
        ) : (
          <ul className="list-group list-group-flush">
            {attachments.map(att => (
              <li key={att.id} className="list-group-item px-2 py-3 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-truncate me-2" style={{ maxWidth: "150px" }} title={att.originalName}>
                    <span className={att.isRemoved ? "text-decoration-line-through text-muted" : "fw-medium"}>
                      {att.originalName}
                    </span>
                    <br />
                    <small className="text-muted">{(att.size / 1024).toFixed(1)} KB</small>
                  </div>
                  <div className="btn-group btn-group-sm">
                    {!att.isRemoved && (
                      <>
                        <button aria-label="Download attachment" className="btn btn-outline-success" onClick={() => handleDownload(att.id, att.originalName)}>
                          Download
                        </button>
                        <button aria-label="Remove attachment" className="btn btn-outline-danger" onClick={() => handleRemove(att.id)}>
                          Remove
                        </button>
                      </>
                    )}
                    {att.isRemoved && (
                      <span className="badge bg-secondary">Removed</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
