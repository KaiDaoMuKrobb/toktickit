import { useState, useEffect } from "react";
import { Category } from "../api.js";

interface Props {
  requesterId: number;
  onSuccess: (ticketNumber: string) => void;
  onCancel: () => void;
}

export function CreateTicket({ requesterId, onSuccess, onCancel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [relatedSystem, setRelatedSystem] = useState("");
  const [requesterName, setRequesterName] = useState("Loading...");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  // Validation checks
  const isSummaryValid = summary.length >= 5 && summary.length <= 100;
  const isDescValid = description.length >= 10 && description.length <= 1000;
  const isFormValid = isSummaryValid && isDescValid && categoryId && relatedSystem;

  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoadingCats(false);
      })
      .catch(() => setLoadingCats(false));
      
    // Fetch requester name for display
    fetch("http://localhost:3000/api/requesters")
      .then(res => res.json())
      .then(data => {
        const req = data.find((r: any) => r.id === requesterId);
        if (req) setRequesterName(req.name);
      })
      .catch(() => {});
  }, [requesterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    if (!isFormValid || submitting) return;
    
    setSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Development-Requester-Id": String(requesterId)
        },
        body: JSON.stringify({
          summary,
          description,
          categoryId: Number(categoryId),
          relatedSystem
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }
      
      onSuccess(data.ticketNumber);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false); // Enable button again, preserve data (BR-10)
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3 border-bottom-0">
        <h2 className="h4 mb-0" style={{ color: "#006B3C" }}>Create New Ticket</h2>
      </div>
      <div className="card-body bg-light">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Requester <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="form-control bg-light"
              value={requesterName}
              disabled
            />
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
              <select 
                className="form-select" 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                disabled={loadingCats || submitting}
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Related System <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g., Email, VPN, SAP"
                value={relatedSystem}
                onChange={e => setRelatedSystem(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Summary <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className={`form-control ${(attemptedSubmit || summary) && !isSummaryValid ? 'is-invalid' : ''}`}
              placeholder="Brief description of the issue"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              disabled={submitting}
            />
            {(attemptedSubmit || summary) && !isSummaryValid && (
              <div className="invalid-feedback">Summary must be between 5 and 100 characters.</div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold">Description <span className="text-danger">*</span></label>
            <textarea 
              className={`form-control ${(attemptedSubmit || description) && !isDescValid ? 'is-invalid' : ''}`}
              rows={5}
              placeholder="Detailed description of the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitting}
            />
            {(attemptedSubmit || description) && !isDescValid && (
              <div className="invalid-feedback">Description must be between 10 and 1000 characters.</div>
            )}
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn text-white" 
              style={{ backgroundColor: "#006B3C" }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
