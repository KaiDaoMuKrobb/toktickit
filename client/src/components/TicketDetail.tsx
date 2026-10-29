import { useState, useEffect } from "react";
import { AttachmentSection } from "./AttachmentSection.js";
import { ActionsTakenSection } from "./ActionsTakenSection.js";
import { useAuth } from "../AuthContext.js";

export interface Attachment {
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
  relatedSystem: { id: number; name: string };
  currentStatus: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  category: { id: number; name: string };
  attachments: Attachment[];
  ownerId?: number | null;
  owner?: { name: string } | null;
  requestedPriority: string;
  itPriority: string;
  requesterResolved: boolean;
}

interface Communication {
  id: number;
  content: string;
  createdAt: string;
  type: 'public_comment' | 'internal_note';
  author: {
    name: string;
    role: string;
  };
}

interface Props {
  ticketId: number;
  requesterId: number;
  onBack: () => void;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  "New": ["Open", "In Progress", "Cancelled"],
  "Open": ["In Progress", "Waiting for Requester", "Resolved", "Cancelled"],
  "In Progress": ["Open", "Waiting for Requester", "Resolved", "Cancelled"],
  "Waiting for Requester": ["In Progress", "Open", "Resolved", "Cancelled"],
  "Resolved": ["Closed", "Reopened"],
  "Closed": ["Reopened"],
  "Reopened": ["In Progress", "Open", "Resolved", "Cancelled"],
  "Cancelled": []
};

export function TicketDetail({ ticketId, requesterId, onBack }: Props) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conflictError, setConflictError] = useState("");
  
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  
  // IT Staff Edit States
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const isStaff = user?.role === "IT Staff" || user?.role === "Administrator";
  const isRequester = user?.role === "Requester";

  const fetchTicket = () => {
    fetch(`/api/tickets/${ticketId}`, { method: "GET" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load ticket");
        return res.json();
      })
      .then(data => {
        setTicket(data);
        setEditStatus(data.currentStatus || data.status);
        setEditPriority(data.itPriority);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchCommunications = () => {
    fetch(`/api/tickets/${ticketId}/communications`, { method: "GET" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load communications");
        return res.json();
      })
      .then(data => setCommunications(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchTicket();
    fetchCommunications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const handleUpdateTicket = async (updates: Record<string, any>) => {
    setIsUpdating(true);
    setConflictError("");
    try {
      const payload: Record<string, any> = { ...updates };
      if (updates.status && ticket?.updatedAt && !payload.expectedUpdatedAt) {
        payload.expectedUpdatedAt = ticket.updatedAt;
      }
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        setConflictError("Conflict Detected: This ticket was modified by another user. Your changes were not applied to avoid overwriting.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update ticket");
      }
      fetchTicket();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClaimTicket = () => {
    if (!user) return;
    handleUpdateTicket({ ownerId: user.id });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === (ticket?.currentStatus || ticket?.status)) return;
    setEditStatus(newStatus);
    handleUpdateTicket({ status: newStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    setEditPriority(newPriority);
    handleUpdateTicket({ itPriority: newPriority });
  };

  const handlePostComment = async (isResolution = false) => {
    if (!newComment.trim() && !isResolution) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newComment || (isResolution ? "The requester has indicated this problem appears resolved." : ""),
          isResolutionIndication: isResolution
        })
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setNewComment("");
      fetchCommunications();
      if (isResolution) fetchTicket();
    } catch (err) {
      alert("Error posting comment");
    }
  };

  const handlePostNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote })
      });
      if (!res.ok) throw new Error("Failed to post note");
      setNewNote("");
      fetchCommunications();
    } catch (err) {
      alert("Error posting note");
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

  const currentStatusVal = ticket.currentStatus || ticket.status;
  const permittedTransitions = ALLOWED_TRANSITIONS[currentStatusVal] || [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <button className="btn btn-sm btn-outline-secondary me-3" onClick={onBack}>
            &larr; Back
          </button>
          <h2 className="h4 d-inline mb-0" style={{ color: "#006B3C" }}>Ticket: {ticket.ticketNumber}</h2>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {ticket.requesterResolved && (
            <span className="badge bg-warning text-dark me-2">
              <i className="bi bi-check-circle me-1"></i>Appears Resolved
            </span>
          )}
          
          {isStaff ? (
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="status-select" className="small text-muted mb-0 fw-bold">Status:</label>
              <select 
                id="status-select"
                className={`form-select form-select-sm fw-bold ${currentStatusVal === 'New' ? 'text-primary' : 'text-secondary'}`}
                value={editStatus}
                onChange={handleStatusChange}
                disabled={isUpdating}
                style={{ width: 'auto' }}
                aria-label="Ticket Status"
              >
                <option value={currentStatusVal}>{currentStatusVal} (Current)</option>
                {permittedTransitions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          ) : (
            <span className={`badge ${currentStatusVal === 'New' ? 'bg-primary' : currentStatusVal === 'Resolved' ? 'bg-success' : 'bg-secondary'}`}>
              {currentStatusVal}
            </span>
          )}
        </div>
      </div>

      {conflictError && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mx-4 mb-0 mt-3" role="alert">
          <div>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {conflictError}
          </div>
          <button className="btn btn-sm btn-outline-dark" onClick={() => { setConflictError(""); fetchTicket(); }}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Ticket
          </button>
        </div>
      )}

      {isStaff && ticket.requesterResolved && currentStatusVal !== "Resolved" && currentStatusVal !== "Closed" && (
        <div className="alert alert-warning mx-4 mb-0 mt-3 border-warning" role="alert">
          <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
          <strong>Requester Feedback:</strong> The requester indicated that the problem appears resolved. Please review Actions Taken and formally transition the ticket to <strong>Resolved</strong>.
        </div>
      )}
      
      <div className="card-body bg-light">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Ticket Information */}
            <div className="card shadow-sm border-0 p-4 mb-4">
              <h5 className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center">
                Ticket Information
                {isStaff && (
                  <div className="d-flex align-items-center gap-2 fs-6 fw-normal">
                    <label className="text-muted small mb-0">Owner:</label>
                    {ticket.ownerId ? (
                      <span className="badge bg-light text-dark border px-3 py-2">{ticket.owner?.name || `User ID ${ticket.ownerId}`}</span>
                    ) : (
                      <button className="btn btn-sm btn-outline-success py-1 px-3" onClick={handleClaimTicket} disabled={isUpdating}>Claim</button>
                    )}
                  </div>
                )}
              </h5>
              <div className="mb-4">
                <label className="fw-bold text-muted small text-uppercase mb-1">Summary</label>
                <p className="fs-5 fw-medium text-dark">{ticket.summary}</p>
              </div>
              <div className="mb-4">
                <label className="fw-bold text-muted small text-uppercase mb-2">Description</label>
                <p className="bg-light p-3 rounded-3 text-break" style={{ whiteSpace: "pre-wrap", border: "1px solid #edf2f7" }}>{ticket.description}</p>
              </div>
              <div className="row">
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase mb-1">Category</label>
                  <p className="fw-medium">{ticket.category?.name}</p>
                </div>
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase mb-1">Related System</label>
                  <p className="fw-medium">{ticket.relatedSystem?.name}</p>
                </div>
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase mb-1">IT Priority</label>
                  {isStaff ? (
                    <select 
                      className="form-select form-select-sm shadow-none"
                      value={editPriority}
                      onChange={handlePriorityChange}
                      disabled={isUpdating}
                      aria-label="IT Priority"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  ) : (
                    <p className="fw-medium">{ticket.itPriority || ticket.requestedPriority || "Medium"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Taken Section */}
            <ActionsTakenSection ticketId={ticketId} onActionChanged={fetchTicket} />

            {/* Communications Section */}
            <div className="card shadow-sm border-0 p-4 mb-4">
              <h5 className="border-bottom pb-3 mb-4">Communications</h5>
              
              <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {communications.length === 0 ? (
                  <p className="text-muted text-center py-5 bg-light rounded-3">No comments or notes yet.</p>
                ) : (
                  communications.map((comm) => (
                    <div key={`${comm.type}-${comm.id}`} className={`comm-bubble ${comm.type === 'internal_note' ? 'comm-internal' : 'comm-public'}`}>
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-opacity-10">
                        <div>
                          <strong className="me-2">{comm.author.name}</strong>
                          <span className="badge" style={{
                            backgroundColor: comm.author.role === 'Requester' ? '#E3F2FD' : comm.author.role === 'IT Staff' ? '#0B7A46' : '#37474F',
                            color: comm.author.role === 'Requester' ? '#000' : '#fff'
                          }}>{comm.author.role}</span>
                          {comm.type === 'internal_note' && <span className="badge bg-warning text-dark ms-2"><i className="bi bi-lock-fill me-1"></i>Internal Note</span>}
                        </div>
                        <small className="text-muted fw-medium">{new Date(comm.createdAt).toLocaleString()}</small>
                      </div>
                      <p className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap", color: "#2D3748" }}>{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment/Note Forms */}
              <div className="border-top pt-3">
                <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active py-1 px-3" id="pills-comment-tab" data-bs-toggle="pill" data-bs-target="#pills-comment" type="button" role="tab">Add Public Comment</button>
                  </li>
                  {isStaff && (
                    <li className="nav-item" role="presentation">
                      <button className="nav-link py-1 px-3 text-warning-emphasis" id="pills-note-tab" data-bs-toggle="pill" data-bs-target="#pills-note" type="button" role="tab">Add Internal Note</button>
                    </li>
                  )}
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  <div className="tab-pane fade show active" id="pills-comment" role="tabpanel">
                    <textarea 
                      className="form-control mb-2" 
                      rows={3} 
                      placeholder="Type a public comment visible to everyone..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    ></textarea>
                    <div className="d-flex justify-content-between align-items-center">
                      <button className="btn btn-success" onClick={() => handlePostComment(false)} disabled={!newComment.trim()}>Post Comment</button>
                      
                      {isRequester && !ticket.requesterResolved && (
                        <button className="btn btn-outline-success" onClick={() => {
                          if (window.confirm("Mark this problem as resolved? This will notify IT Staff.")) {
                            handlePostComment(true);
                          }
                        }}>
                          Problem Appears Resolved
                        </button>
                      )}
                    </div>
                  </div>
                  {isStaff && (
                    <div className="tab-pane fade" id="pills-note" role="tabpanel">
                      <textarea 
                        className="form-control mb-2 border-warning bg-warning bg-opacity-10" 
                        rows={3} 
                        placeholder="Type an internal note visible only to IT Staff and Admins..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                      ></textarea>
                      <button className="btn btn-warning" onClick={handlePostNote} disabled={!newNote.trim()}>Save Internal Note</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          
          <div className="col-lg-4">
            <AttachmentSection 
              ticketId={ticketId} 
              requesterId={requesterId} 
              attachments={ticket.attachments} 
              onAttachmentChanged={fetchTicket} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
