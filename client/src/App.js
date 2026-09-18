import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { checkSystem } from "./api.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { MyTickets } from "./components/MyTickets.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { AuthProvider, useAuth } from "./AuthContext.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";
function AppContent() {
    const { user, loading: authLoading, logout } = useAuth();
    const [currentView, setCurrentView] = useState("home");
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [createdTicketNumber, setCreatedTicketNumber] = useState(null);
    const [state, setState] = useState("idle");
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    if (authLoading) {
        return _jsx("div", { className: "d-flex justify-content-center mt-5", children: _jsx("div", { className: "spinner-border text-success" }) });
    }
    if (!user) {
        return _jsx(Login, {});
    }
    if (user.mustChangePassword) {
        return _jsx(ChangePassword, {});
    }
    // Get badge color based on role
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "Requester": return "bg-primary bg-opacity-10 text-primary border-primary";
            case "IT Staff": return "bg-success bg-opacity-10 text-success border-success";
            case "Administrator": return "bg-dark bg-opacity-10 text-dark border-dark";
            default: return "bg-secondary bg-opacity-10 text-secondary border-secondary";
        }
    };
    async function handleCheck() {
        setState("loading");
        setErrorMessage("");
        try {
            const result = await checkSystem();
            setCategories(result.categories);
            setState(result.online ? "success" : "error");
        }
        catch (err) {
            setState("error");
            setErrorMessage(err instanceof Error ? err.message : "An error occurred");
        }
    }
    return (_jsxs("div", { className: "container py-5", style: { maxWidth: 1000 }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom", children: [_jsxs("h1", { className: "h3 mb-0", style: { cursor: 'pointer' }, onClick: () => setCurrentView("home"), children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "IT Service Desk" })] }), _jsxs("div", { className: "d-flex gap-3 align-items-center", children: [currentView === "home" && (_jsx("button", { className: "btn btn-success", onClick: () => setCurrentView("create"), children: "+ Create Ticket" })), _jsxs("div", { className: "d-flex align-items-center bg-light rounded-pill px-3 py-1 border", children: [_jsx("span", { className: "text-muted small me-2 fw-bold", children: user.name }), _jsx("span", { className: `badge border ${getRoleBadgeColor(user.role)} rounded-pill me-2`, children: user.role }), _jsx("button", { className: "btn btn-sm btn-link text-decoration-none p-0 ms-2 border-start ps-2 text-danger", onClick: logout, children: "Logout" })] })] })] }), currentView === "create" ? (_jsx(CreateTicket, { requesterId: user.id, onSuccess: (ticketNumber) => {
                    setCreatedTicketNumber(ticketNumber);
                    setCurrentView("home");
                }, onCancel: () => setCurrentView("home") })) : currentView === "detail" && selectedTicketId ? (_jsx(TicketDetail, { ticketId: selectedTicketId, requesterId: user.id, onBack: () => setCurrentView("home") })) : (_jsxs(_Fragment, { children: [createdTicketNumber && (_jsxs("div", { className: "alert alert-success mb-4 d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("strong", { children: "Success!" }), " Your ticket has been created.", _jsx("br", {}), "Ticket Number: ", _jsx("span", { className: "fw-bold", children: createdTicketNumber })] }), _jsx("button", { className: "btn-close", onClick: () => setCreatedTicketNumber(null) })] })), _jsx(MyTickets, { requesterId: user.id, onTicketClick: (ticketId) => {
                            setSelectedTicketId(ticketId);
                            setCurrentView("detail");
                        } }), _jsxs("div", { className: "mt-5 pt-3 border-top border-2 border-dashed opacity-50", children: [_jsx("h5", { className: "text-muted", children: "Legacy Health Check" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm mb-3", onClick: handleCheck, disabled: state === "loading", children: state === "loading" ? "Loading…" : "Check System" }), state === "success" && (_jsxs("div", { className: "border p-3 rounded bg-light", children: [_jsx("p", { children: "System Status: Online" }), _jsx("p", { children: "Supported Request Categories:" }), _jsx("ul", { children: categories.length === 0 ? (_jsx("li", { children: "No categories loaded yet." })) : (categories.map(c => _jsx("li", { children: c.name }, c.id))) })] })), state === "error" && (_jsxs("div", { className: "border p-3 rounded bg-light", children: [_jsx("p", { children: "System Status: Offline" }), _jsx("p", { className: "text-danger", children: errorMessage })] }))] })] }))] }));
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
