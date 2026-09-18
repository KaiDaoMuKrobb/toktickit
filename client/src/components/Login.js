import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../AuthContext.js";
export function Login() {
    const { fetchUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                await fetchUser();
            }
            else {
                const data = await res.json();
                setError(data.message || "Login failed");
            }
        }
        catch (err) {
            setError("An unexpected error occurred. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container d-flex justify-content-center align-items-center", style: { minHeight: "100vh" }, children: _jsx("div", { className: "card shadow-sm border-0", style: { maxWidth: "400px", width: "100%" }, children: _jsxs("div", { className: "card-body p-4", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsxs("h1", { className: "h3", children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "Login" })] }), _jsx("p", { className: "text-muted", children: "Sign in to the IT Service Desk" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "email", className: "form-label fw-bold", children: "Email address" }), _jsx("input", { id: "email", type: "email", className: "form-control", placeholder: "name@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "password", className: "form-label fw-bold", children: "Password" }), _jsx("input", { id: "password", type: "password", className: "form-control", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), error && (_jsx("div", { className: "alert alert-danger py-2", role: "alert", children: error })), _jsx("button", { type: "submit", className: "btn btn-success w-100", disabled: loading, children: loading ? "Signing in..." : "Sign in" })] })] }) }) }));
}
