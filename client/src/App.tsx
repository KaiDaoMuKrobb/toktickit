import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { AuthProvider, useAuth } from "./AuthContext.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";
import { UserManagement } from "./components/UserManagement.js";
import { StaffTicketQueue } from "./components/StaffTicketQueue.js";
import { RequesterDashboard } from "./components/RequesterDashboard.js";
import { StaffDashboard } from "./components/StaffDashboard.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

function AppContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"dashboard" | "home" | "create" | "detail" | "admin" | "queue">("dashboard");
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

  const isRequester = user.role === "Requester";
  const isStaff = user.role === "IT Staff";
  const isAdmin = user.role === "Administrator";

  return (
    <div className="container py-5" style={{ maxWidth: 1050 }}>
      {/* Navigation Header */}
      <div className="app-header d-flex justify-content-between align-items-center mb-4 pb-3 rounded-bottom-4 px-3 shadow-sm" style={{ margin: "-3rem -1rem 2rem -1rem" }}>
        <h1 className="h3 mb-0 fw-bold" style={{ cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => setCurrentView("dashboard")}>
          TokTickIT <span style={{ color: "var(--zen-green)" }}>IT Service Desk</span>
        </h1>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button
            className={`btn btn-sm ${currentView === "dashboard" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setCurrentView("dashboard")}
            aria-label="Dashboard"
          >
            <i className="bi bi-speedometer2 me-1"></i> Dashboard
          </button>

          {isRequester && (
            <>
              <button 
                className={`btn btn-sm ${currentView === "home" ? "btn-success" : "btn-outline-secondary"}`} 
                onClick={() => setCurrentView("home")}
                aria-label="My Tickets"
              >
                <i className="bi bi-ticket-detailed me-1"></i> My Tickets
              </button>
              <button 
                className="btn btn-sm btn-success" 
                onClick={() => setCurrentView("create")}
                aria-label="Create Ticket"
              >
                + Create Ticket
              </button>
            </>
          )}

          {(isStaff || isAdmin) && (
            <button 
              className={`btn btn-sm ${currentView === "queue" ? "btn-success" : "btn-outline-secondary"}`} 
              onClick={() => setCurrentView("queue")}
              aria-label="Ticket Queue"
            >
              <i className="bi bi-list-task me-1"></i> Ticket Queue
            </button>
          )}

          {isAdmin && (
            <button 
              className={`btn btn-sm ${currentView === "admin" ? "btn-dark" : "btn-outline-dark"}`} 
              onClick={() => setCurrentView("admin")}
              aria-label="Admin Users"
            >
              <i className="bi bi-people me-1"></i> Admin Users
            </button>
          )}

          <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 border ms-2">
            <span className="text-muted small me-2 fw-bold">{user.name}</span>
            <span className="badge rounded-pill me-2" style={getRoleBadgeStyle(user.role)}>
              {user.role}
            </span>
            <button 
              className="btn btn-sm btn-link text-decoration-none p-0 ms-2 border-start ps-2 text-danger" 
              onClick={logout}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {createdTicketNumber && (
        <div className="alert alert-success mb-4 d-flex justify-content-between align-items-center">
          <div>
            <strong>Success!</strong> Your ticket has been created.
            <br />Ticket Number: <span className="fw-bold">{createdTicketNumber}</span>
          </div>
          <button className="btn-close" onClick={() => setCreatedTicketNumber(null)}></button>
        </div>
      )}

      {/* Main Views */}
      {currentView === "create" ? (
        <CreateTicket 
          requesterId={user.id} 
          onSuccess={(ticketNumber) => {
            setCreatedTicketNumber(ticketNumber);
            setCurrentView("dashboard");
          }} 
          onCancel={() => setCurrentView("dashboard")} 
        />
      ) : currentView === "detail" && selectedTicketId ? (
        <TicketDetail 
          ticketId={selectedTicketId}
          requesterId={user.id}
          onBack={() => setCurrentView("dashboard")}
        />
      ) : currentView === "admin" && isAdmin ? (
        <UserManagement />
      ) : currentView === "home" && isRequester ? (
        <MyTickets 
          requesterId={user.id} 
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setCurrentView("detail");
          }} 
        />
      ) : currentView === "queue" && (isStaff || isAdmin) ? (
        <StaffTicketQueue 
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setCurrentView("detail");
          }} 
        />
      ) : isRequester ? (
        <RequesterDashboard
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setCurrentView("detail");
          }}
          onCreateTicket={() => setCurrentView("create")}
          onViewAll={() => setCurrentView("home")}
        />
      ) : (
        <StaffDashboard
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setCurrentView("detail");
          }}
          onViewQueue={() => setCurrentView("queue")}
          onViewAdmin={() => setCurrentView("admin")}
        />
      )}

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
