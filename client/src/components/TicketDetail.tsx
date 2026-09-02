import { useState, useEffect, useRef } from "react";
import { Category } from "../api.js";

interface Attachment {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  isRemoved: boolean;
  createdAt: string;
}

interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  relatedSystem: string;
  currentStatus: string;
  updatedAt: string;
  createdAt: string;
  category: { id: number; name: string };
  attachments: Attachment[];
}

interface Props {
  ticketId: number;
  requesterId: number;
  onBack: () => void;
}

export function TicketDetail({ ticketId, requesterId, onBack }: Props) {
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTicket = () => {
    fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
      headers: { "X-Development-Requester-Id": String(requesterId) }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load ticket");
        return res.json();
      })
      .then(data => {
        setTicket(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, requesterId]);

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

      // Reload ticket to get updated attachments
      fetchTicket();
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

      fetchTicket();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="alert alert-danger">
        {error || "Ticket not found"}
        <div className="mt-3">
          <button className="btn btn-outline-danger" onClick={onBack}>Back to List</button>
        </div>
      </div>
    );
  }

  const activeAttachments = ticket.attachments.filter(a => !a.isRemoved);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-sm btn-outline-secondary me-3" onClick={onBack}>
            &larr; Back
          </button>
          <h2 className="h4 d-inline mb-0" style={{ color: "#006B3C" }}>Ticket: {ticket.ticketNumber}</h2>
        </div>
        <span className={`badge ${ticket.currentStatus === 'New' ? 'bg-primary' : 'bg-secondary'}`}>
          {ticket.currentStatus}
        </span>
      </div>
      
      <div className="card-body bg-light">
        <div className="row g-4">
          <div className="col-md-8">
            <div className="bg-white p-4 rounded border h-100">
              <h5 className="border-bottom pb-2 mb-3">Ticket Information</h5>
              <div className="mb-3">
                <label className="fw-bold text-muted small text-uppercase">Summary</label>
                <p className="fs-5">{ticket.summary}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold text-muted small text-uppercase">Description</label>
                <p className="bg-light p-3 rounded text-break" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="fw-bold text-muted small text-uppercase">Category</label>
                  <p>{ticket.category?.name}</p>
                </div>
                <div className="col-6 mb-3">
                  <label className="fw-bold text-muted small text-uppercase">Related System</label>
                  <p>{ticket.relatedSystem}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
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
                />
                <small className="text-muted">
                  Max 5 files (JPG, PNG, WEBP, PDF), 5MB each.
                </small>
                {uploading && <div className="mt-2 text-success small">Uploading...</div>}
              </div>

              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "300px" }}>
                {ticket.attachments.length === 0 ? (
                  <p className="text-muted small text-center py-4 bg-light rounded border-dashed">No attachments</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {ticket.attachments.map(att => (
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
                                <button className="btn btn-outline-success" onClick={() => handleDownload(att.id, att.originalName)}>
                                  Download
                                </button>
                                <button className="btn btn-outline-danger" onClick={() => handleRemove(att.id)}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
