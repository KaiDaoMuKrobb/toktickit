import { useState, useEffect } from "react";

interface Requester {
  id: number;
  name: string;
  email: string;
}

interface Props {
  onSelect: (requesterId: number) => void;
}

export function DevelopmentRequesterSelector({ onSelect }: Props) {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | "">("");

  useEffect(() => {
    fetch("http://localhost:3000/api/requesters")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requesters");
        return res.json();
      })
      .then((data) => {
        setRequesters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (selectedId) {
      onSelect(Number(selectedId));
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow-sm p-4" style={{ maxWidth: "500px", width: "100%", backgroundColor: "#F5F7F6" }}>
        <div className="text-center mb-4">
          <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", fontSize: "24px", backgroundColor: "#006B3C" }}>
            👤
          </div>
          <h2 className="h4" style={{ color: "#006B3C" }}>Select Development Requester</h2>
          <p className="text-muted small">
            Choose a development requester to simulate the current requester context for Lab 2.<br />
            This is for testing only and is not a login screen.
          </p>
        </div>

        {loading ? (
          <div className="text-center my-4">Loading requesters...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : requesters.length === 0 ? (
          <div className="alert alert-warning">No active requesters found.</div>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 600 }}>Development Requester <span className="text-danger">*</span></label>
              <select 
                className="form-select" 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="" disabled>Select a requester</option>
                {requesters.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} ({req.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="alert mb-4" style={{ backgroundColor: "#EAF6EF", border: "1px solid #0B7A46", color: "#0B7A46" }}>
              ℹ️ Only active development requesters are shown.
            </div>

            <div className="alert bg-light border text-muted small mb-4">
              <strong>Authentication coming in Lab 3</strong><br/>
              In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" disabled>Cancel</button>
              <button 
                className="btn text-white" 
                style={{ backgroundColor: "#006B3C" }} 
                disabled={!selectedId} 
                onClick={handleContinue}
              >
                Continue &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
