import { useState, useEffect } from "react";
import { Category } from "../api.js";
import { AttachmentSection } from "./AttachmentSection.js";
import { useAuth } from "../AuthContext.js";

// Attachment interface moved to AttachmentSection.tsx, but kept here for type definition
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

export function TicketDetail({ ticketId, requesterId, onBack }: Props) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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
        setEditStatus(data.currentStatus);
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

  const handleUpdateTicket = async (updates: Partial<TicketDetailData>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to update ticket");
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
    setEditStatus(newStatus);
    handleUpdateTicket({ status: newStatus } as any);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    setEditPriority(newPriority);
    handleUpdateTicket({ itPriority: newPriority } as any);
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
            <span className="badge bg-warning text-dark me-2">Appears Resolved</span>
          )}
          
          {isStaff ? (
            <select 
              className={`form-select form-select-sm fw-bold ${editStatus === 'New' ? 'text-primary' : 'text-secondary'}`}
              value={editStatus}
              onChange={handleStatusChange}
              disabled={isUpdating}
              style={{ width: 'auto' }}
            >
              <option value="New">New</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Requester">Waiting for Requester</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          ) : (
            <span className={`badge ${ticket.currentStatus === 'New' ? 'bg-primary' : 'bg-secondary'}`}>
              {ticket.currentStatus}
            </span>
          )}
        </div>
      </div>
      
      <div className="card-body bg-light">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded border mb-4">
              <h5 className="border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
                Ticket Information
                {isStaff && (
                  <div className="d-flex align-items-center gap-2 fs-6 fw-normal">
                    <label className="text-muted small mb-0">Owner:</label>
                    {ticket.ownerId ? (
                      <span className="badge bg-light text-dark border">{ticket.owner?.name || `User ID ${ticket.ownerId}`}</span>
                    ) : (
                      <button className="btn btn-sm btn-outline-success py-0" onClick={handleClaimTicket} disabled={isUpdating}>Claim</button>
                    )}
                  </div>
                )}
              </h5>
              <div className="mb-3">
                <label className="fw-bold text-muted small text-uppercase">Summary</label>
                <p className="fs-5">{ticket.summary}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold text-muted small text-uppercase">Description</label>
                <p className="bg-light p-3 rounded text-break" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
              </div>
              <div className="row">
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase">Category</label>
                  <p>{ticket.category?.name}</p>
                </div>
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase">Related System</label>
                  <p>{ticket.relatedSystem?.name}</p>
                </div>
                <div className="col-sm-4 mb-3">
                  <label className="fw-bold text-muted small text-uppercase">IT Priority</label>
                  {isStaff ? (
                    <select 
                      className="form-select form-select-sm"
                      value={editPriority}
                      onChange={handlePriorityChange}
                      disabled={isUpdating}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  ) : (
                    <p>{ticket.itPriority || ticket.requestedPriority || "Medium"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Communications Section */}
            <div className="bg-white p-4 rounded border mb-4">
              <h5 className="border-bottom pb-2 mb-3">Communications</h5>
              
              <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {communications.length === 0 ? (
                  <p className="text-muted text-center py-4">No comments or notes yet.</p>
                ) : (
                  communications.map((comm) => (
                    <div key={`${comm.type}-${comm.id}`} className={`p-3 rounded mb-3 border ${comm.type === 'internal_note' ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light'}`}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong className="me-2">{comm.author.name}</strong>
                          <span className={`badge ${comm.author.role === 'IT Staff' ? 'bg-success bg-opacity-10 text-success' : comm.author.role === 'Administrator' ? 'bg-dark bg-opacity-10 text-dark' : 'bg-primary bg-opacity-10 text-primary'}`}>{comm.author.role}</span>
                          {comm.type === 'internal_note' && <span className="badge bg-warning text-dark ms-2">Internal Note</span>}
                        </div>
                        <small className="text-muted">{new Date(comm.createdAt).toLocaleString()}</small>
                      </div>
                      <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{comm.content}</p>
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
