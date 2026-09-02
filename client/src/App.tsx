import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { DevelopmentRequesterSelector } from "./components/DevelopmentRequesterSelector.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [requesterId, setRequesterId] = useState<number | null>(null);
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
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          TokTickIT <span className="text-success">IT Service Desk</span>
        </h1>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={() => setRequesterId(null)}
        >
          Change Requester
        </button>
      </div>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
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
    </div>
  );
}
