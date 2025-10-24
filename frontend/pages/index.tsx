import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { classify, listRecent } from "../lib/api";

const Home: NextPage = () => {
  const [action, setAction] = useState("");
  const [guideline, setGuideline] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await listRecent(8);
        setRecent(items);
      } catch (e) {
        /* ignore */
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!action.trim() || !guideline.trim()) {
      setError("Both action and guideline are required.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await classify({ action: action.trim(), guideline: guideline.trim() });
      setResult(res);
      // optimistic update for recent list
      setRecent(prev => [{ id: res.id, action, guideline, label: res.label, score: res.score, status: "success" }, ...prev].slice(0, 8));
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>ProcessMonitor</h1>
        <p className="small">Submit an action and guideline to classify whether the action follows the guideline.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <input value={action} onChange={e => setAction(e.target.value)} placeholder="Action (what happened)" />
            <input value={guideline} onChange={e => setGuideline(e.target.value)} placeholder="Guideline (policy / rule)" />
          </div>

          <textarea value={action} onChange={e => setAction(e.target.value)} placeholder="Longer action description (optional)"/>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" disabled={loading}>{loading ? "Classifying…" : "Classify"}</button>
          </div>

          {error && <div className="meta" style={{ color: "var(--error)", marginTop: 10 }}>{error}</div>}
        </form>
      </div>

      <div className="card">
        <h2>Result</h2>
        {!result && <div className="small">No result yet. Submit an action to begin.</div>}
        {result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="result-label">Label: {result.label ?? "—"}</div>
                <div className="small">Score: {typeof result.score === "number" ? result.score.toFixed(3) : "—"}</div>
              </div>
              <div className={`badge ${result.label === "entailment" ? "success" : result.label === "contradiction" ? "error" : ""}`}>
                {result.label ?? "unknown"}
              </div>
            </div>

            <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto", background: "#f6f7ff", padding: 12, borderRadius: 6 }}>
              {JSON.stringify(result.raw ?? result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Recent classifications</h3>
        {recent.length === 0 && <div className="small">No recent items</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {recent.map(item => (
            <div key={item.id} className="list-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.action}</div>
                <div className="small">{item.guideline}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="small">{item.label ?? "—"}</div>
                <div className="small">{item.score ? item.score.toFixed(2) : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
