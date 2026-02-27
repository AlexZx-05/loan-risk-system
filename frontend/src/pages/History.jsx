import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import { apiFetch } from "../api";

export default function History() {
  const location = useLocation();
  const [borrowerId, setBorrowerId] = useState("");
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageSize, setPageSize] = useState(5);
  const [pageInput, setPageInput] = useState(1);

  const fetchHistory = useCallback(async (idOverride) => {
    const explicitId =
      typeof idOverride === "string" || typeof idOverride === "number" ? idOverride : undefined;
    const targetId = String(explicitId ?? borrowerId).trim();

    if (!targetId) {
      setError("Please enter a borrower ID.");
      return;
    }

    setLoading(true);
    setError("");
    setHistory(null);
    setBorrowerId(targetId);

    try {
      const token = localStorage.getItem("token");
      const data = await apiFetch(`/risk_history/${targetId}`, { token });
      setHistory(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      setError(err.message || "Unable to load borrower history");
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    const incomingId = location.state?.borrowerId;
    if (incomingId) {
      fetchHistory(incomingId);
    }
  }, [fetchHistory, location.state]);

  const rows = useMemo(() => history?.history || [], [history]);

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rows;
    return rows.filter(
      (item) =>
        item.risk_level?.toLowerCase().includes(trimmed) ||
        item.action?.toLowerCase().includes(trimmed) ||
        String(item.timestamp).toLowerCase().includes(trimmed),
    );
  }, [query, rows]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const left = sortKey === "timestamp" ? new Date(a.timestamp).getTime() : a[sortKey];
      const right = sortKey === "timestamp" ? new Date(b.timestamp).getTime() : b[sortKey];
      if (left === right) return 0;
      return left > right ? direction : -direction;
    });
  }, [filteredRows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  const effectivePage = useMemo(() => {
    return Math.min(Math.max(pageInput, 1), totalPages);
  }, [pageInput, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [effectivePage, pageSize, sortedRows]);

  return (
    <div className="stack-lg">
      <div className="history-controls">
        <label htmlFor="borrower-id">Borrower ID</label>
        <input
          id="borrower-id"
          type="number"
          value={borrowerId}
          onChange={(event) => setBorrowerId(event.target.value)}
          placeholder="e.g. 1024"
        />
        <button type="button" className="btn btn-primary" onClick={fetchHistory}>
          Fetch History
        </button>
      </div>

      {loading ? <Loader label="Loading borrower history..." /> : null}
      {error ? <p className="error-state">{error}</p> : null}
      {history?.message ? <p className="error-state">{history.message}</p> : null}

      {history?.history ? (
        <>
          <div className="controls-bar">
            <label className="control-group" htmlFor="history-search">
              <span>Search</span>
              <input
                id="history-search"
                className="control-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Risk, action, timestamp"
              />
            </label>
            <label className="control-group" htmlFor="history-sort">
              <span>Sort By</span>
              <select
                id="history-sort"
                className="control-select"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
              >
                <option value="timestamp">Timestamp</option>
                <option value="risk_score">Risk Score</option>
                <option value="risk_level">Risk Level</option>
                <option value="action">Action</option>
              </select>
            </label>
            <label className="control-group" htmlFor="history-direction">
              <span>Direction</span>
              <select
                id="history-direction"
                className="control-select"
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
            <label className="control-group" htmlFor="history-page-size">
              <span>Rows Per Page</span>
              <select
                id="history-page-size"
                className="control-select"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((item, index) => (
                  <tr key={`${item.timestamp}-${index}`}>
                    <td>{item.risk_level}</td>
                    <td>{(item.risk_score * 100).toFixed(2)}%</td>
                    <td>{item.action}</td>
                    <td>{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-summary">
            <p>
              Showing {paginatedRows.length} of {sortedRows.length} matching records
            </p>
            <div className="pager">
              <button
                className="btn btn-primary"
                type="button"
                disabled={effectivePage <= 1}
                onClick={() => setPageInput((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span>Page {effectivePage} of {totalPages}</span>
              <button
                className="btn btn-primary"
                type="button"
                disabled={effectivePage >= totalPages}
                onClick={() => setPageInput((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
