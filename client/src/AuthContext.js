import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
            else {
                setUser(null);
            }
        }
        catch (err) {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };
    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
        }
        catch (err) {
            console.error("Logout failed", err);
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, loading, fetchUser, logout }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
