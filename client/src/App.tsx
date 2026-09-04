import { useState, useEffect } from "react";
import { checkSystem, Category } from "./api.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [requesterId, setRequesterId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "create" | "detail">("home");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState<string>("");

  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  void categories;
  // Fetch the requester's name whenever the requesterId changes
  useEffect(() => {
    if (requesterId) {
      fetch("http://localhost:3000/api/requesters")
        .then(res => res.json())
        .then(data => {
          const req = data.find((r: any) => r.id === requesterId);
          if (req) setRequesterName(req.name);
        })
        .catch(() => {});
    }
  }, [requesterId]);

  if (!requesterId) {
    return <DevelopmentRequesterSelector onSelect={setRequesterId} />;
  }

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");
    try {
      const result = await checkSystem();
      setCategories(result.categories);
      setState(result.online ? "success" : "error");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 1000 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0" style={{ cursor: 'pointer' }} onClick={() => setCurrentView("home")}>
          TokTickIT <span className="text-success">IT Service Desk</span>
        </h1>
        <div className="d-flex gap-3 align-items-center">
          {currentView === "home" && (
            <button 
              className="btn btn-success" 
              onClick={() => setCurrentView("create")}
            >
              + Create Ticket
            </button>
          )}
          <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 border">
            <span className="text-muted small me-2">👤 {requesterName || "Loading..."}</span>
            <button 
              className="btn btn-sm btn-link text-decoration-none p-0 ms-2 border-start ps-2" 
              onClick={() => setRequesterId(null)}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {currentView === "create" ? (
        <CreateTicket 
          requesterId={requesterId} 
          onSuccess={(ticketNumber) => {
            setCreatedTicketNumber(ticketNumber);
            setCurrentView("home");
          }} 
          onCancel={() => setCurrentView("home")} 
        />
      ) : currentView === "detail" && selectedTicketId ? (
        <TicketDetail 
          ticketId={selectedTicketId}
          requesterId={requesterId}
          onBack={() => setCurrentView("home")}
        />
      ) : (
        <>
          {createdTicketNumber && (
            <div className="alert alert-success mb-4 d-flex justify-content-between align-items-center">
              <div>
                <strong>Success!</strong> Your ticket has been created.
                <br />Ticket Number: <span className="fw-bold">{createdTicketNumber}</span>
              </div>
              <button className="btn-close" onClick={() => setCreatedTicketNumber(null)}></button>
            </div>
          )}
          
          <MyTickets 
            requesterId={requesterId} 
            onTicketClick={(ticketId) => {
              setSelectedTicketId(ticketId);
              setCurrentView("detail");
            }}
          />

          {/* Legacy Health Check (Lab 1) - required to pass tests */}
          <div className="mt-5 pt-3 border-top border-2 border-dashed opacity-50">
            <h5 className="text-muted">Legacy Health Check</h5>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={handleCheck} disabled={state === "loading"}>
              {state === "loading" ? "Loading…" : "Check System"}
            </button>

            {state === "success" && (
              <div className="border p-3 rounded bg-light">
                <p>System Status: Online</p>
                <p>Supported Request Categories:</p>
                <ul>
                  {categories.length === 0 ? (
                    <li>No categories loaded yet.</li>
                  ) : (
                    categories.map(c => <li key={c.id}>{c.name}</li>)
                  )}
                </ul>
              </div>
            )}

            {state === "error" && (
              <div className="border p-3 rounded bg-light">
                <p>System Status: Offline</p>
                <p className="text-danger">{errorMessage}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
