import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";
import { CreateTicket } from "./components/CreateTicket.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [requesterId, setRequesterId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "create">("home");
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  void categories;

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
    <div className="container py-5" style={{ maxWidth: 800 }}>
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
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => setRequesterId(null)}
          >
            Change Requester
          </button>
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
          
          <button className="btn btn-outline-success mb-4" onClick={handleCheck} disabled={state === "loading"}>
            {state === "loading" ? "Loading…" : "Test API Health Check"}
          </button>

      {state === "success" && (
        <div className="mt-4 border p-3">
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
        <div className="mt-4 border p-3">
          <p>System Status: Offline</p>
          <p className="text-danger">{errorMessage}</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
