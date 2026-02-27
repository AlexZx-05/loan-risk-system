import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { apiFetch } from "../api";

export default function TopRisky() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("prob");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageSize, setPageSize] = useState(5);
  const [pageInput, setPageInput] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");

    apiFetch("/top_risky", { token })
      .then(setRows)
      .catch((err) => {
        if (err.status === 401 || err.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        setError(err.message || "Unable to load top risky borrowers");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return rows;
    return rows.filter(
      (row) =>
        String(row.borrower_id).includes(trimmed) ||
        String(row.risk).toLowerCase().includes(trimmed),
    );
  }, [query, rows]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const left = a[sortKey];
      const right = b[sortKey];
      if (left === right) return 0;
      return left > right ? direction : -direction;
    });
  }, [filteredRows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  const effectivePage = useMemo(() => {
    return Math.min(Math.max(pageInput, 1), totalPages);
  }, [pageInput, totalPages]);

  const currentPageRows = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [effectivePage, pageSize, sortedRows]);

  if (loading) return <Loader label="Loading top risky borrowers..." />;
  if (error) return <p className="error-state">{error}</p>;

  return (
    <div className="stack-lg">
      <p className="section-intro">Borrowers ranked by highest model probability of default.</p>
      <div className="controls-bar">
        <label className="control-group" htmlFor="top-search">
          <span>Search</span>
          <input
            id="top-search"
            className="control-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Borrower ID or risk"
          />
        </label>
        <label className="control-group" htmlFor="top-sort">
          <span>Sort By</span>
          <select
            id="top-sort"
            className="control-select"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="prob">Probability</option>
            <option value="borrower_id">Borrower ID</option>
            <option value="missed_emi_count">Missed EMI</option>
            <option value="max_delay_days">Max Delay</option>
            <option value="emi_income_ratio">EMI / Income Ratio</option>
          </select>
        </label>
        <label className="control-group" htmlFor="top-direction">
          <span>Direction</span>
          <select
            id="top-direction"
            className="control-select"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label className="control-group" htmlFor="top-page-size">
          <span>Rows Per Page</span>
          <select
            id="top-page-size"
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
              <th>Borrower ID</th>
              <th>Risk</th>
              <th>Probability</th>
              <th>Missed EMI</th>
              <th>Max Delay</th>
              <th>EMI/Income</th>
            </tr>
          </thead>
          <tbody>
            {currentPageRows.map((item) => (
              <tr key={item.borrower_id}>
                <td>
                  <Link to="/history" state={{ borrowerId: item.borrower_id }} className="table-link">
                    {item.borrower_id}
                  </Link>
                </td>
                <td><span className="risk-badge">{item.risk}</span></td>
                <td>{(item.prob * 100).toFixed(2)}%</td>
                <td>{item.missed_emi_count}</td>
                <td>{item.max_delay_days} days</td>
                <td>{item.emi_income_ratio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <p>
          Showing {currentPageRows.length} of {sortedRows.length} matching records
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
    </div>
  );
}
