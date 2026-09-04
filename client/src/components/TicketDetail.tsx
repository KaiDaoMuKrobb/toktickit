import { useState, useEffect, useRef } from "react";
import { Category } from "../api.js";
import { AttachmentSection } from "./AttachmentSection.js";

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
                  <p>{ticket.relatedSystem?.name}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
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
