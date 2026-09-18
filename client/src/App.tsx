import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { AuthProvider, useAuth } from "./AuthContext.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";
import { UserManagement } from "./components/UserManagement.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

function AppContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"home" | "create" | "detail" | "admin">("home");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  if (authLoading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-success" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (user.mustChangePassword) {
    return <ChangePassword />;
  }

  // Get badge style based on role
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "Requester": return { backgroundColor: "#E3F2FD", color: "#000" };
      case "IT Staff": return { backgroundColor: "#0B7A46", color: "#fff" };
      case "Administrator": return { backgroundColor: "#37474F", color: "#fff" };
      default: return { backgroundColor: "#6c757d", color: "#fff" };
    }
  };

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
          {user.role === "Administrator" && (
            <button 
              className={`btn ${currentView === "admin" ? "btn-dark" : "btn-outline-dark"}`} 
              onClick={() => setCurrentView("admin")}
            >
              Admin
            </button>
          )}
          {currentView === "home" && (
            <button 
              className="btn btn-success" 
              onClick={() => setCurrentView("create")}
            >
              + Create Ticket
            </button>
          )}
          <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 border">
            <span className="text-muted small me-2 fw-bold">{user.name}</span>
            <span className="badge rounded-pill me-2" style={getRoleBadgeStyle(user.role)}>
              {user.role}
            </span>
            <button 
              className="btn btn-sm btn-link text-decoration-none p-0 ms-2 border-start ps-2 text-danger" 
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {currentView === "create" ? (
        <CreateTicket 
          requesterId={user.id} 
          onSuccess={(ticketNumber) => {
            setCreatedTicketNumber(ticketNumber);
            setCurrentView("home");
          }} 
          onCancel={() => setCurrentView("home")} 
        />
      ) : currentView === "detail" && selectedTicketId ? (
        <TicketDetail 
          ticketId={selectedTicketId}
          requesterId={user.id}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "admin" && user.role === "Administrator" ? (
        <UserManagement />
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
            requesterId={user.id} 
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
