import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { apiFetch } from "../api";

export default function NeedOfficer() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("borrower_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageSize, setPageSize] = useState(5);
  const [pageInput, setPageInput] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");

    apiFetch("/need_officer", { token })
      .then((payload) => {
        setCases(payload.cases || []);
        setTotal(payload.total_cases || 0);
      })
      .catch((err) => {
        if (err.status === 401 || err.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        setError(err.message || "Could not load officer queue");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return cases;
    return cases.filter(
      (item) =>
        String(item.borrower_id).includes(trimmed) ||
        String(item.missed_emi_count).includes(trimmed) ||
        String(item.max_delay_days).includes(trimmed),
    );
  }, [cases, query]);

  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const left = a[sortKey];
      const right = b[sortKey];
      if (left === right) return 0;
      return left > right ? direction : -direction;
    });
  }, [filteredCases, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedCases.length / pageSize));

  const effectivePage = useMemo(() => {
    return Math.min(Math.max(pageInput, 1), totalPages);
  }, [pageInput, totalPages]);

  const paginatedCases = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedCases.slice(start, start + pageSize);
  }, [effectivePage, pageSize, sortedCases]);

  if (loading) return <Loader label="Loading officer review queue..." />;
  if (error) return <p className="error-state">{error}</p>;

  return (
    <div className="stack-lg">
      <article className="stat-card">
        <p>Total Cases Requiring Manual Review</p>
        <h3>{total}</h3>
      </article>
      <div className="controls-bar">
        <label className="control-group" htmlFor="queue-search">
          <span>Search</span>
          <input
            id="queue-search"
            className="control-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Borrower ID, missed EMI, max delay"
          />
        </label>
        <label className="control-group" htmlFor="queue-sort">
          <span>Sort By</span>
          <select
            id="queue-sort"
            className="control-select"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="borrower_id">Borrower ID</option>
            <option value="missed_emi_count">Missed EMI</option>
            <option value="max_delay_days">Max Delay</option>
            <option value="emi_income_ratio">EMI / Income Ratio</option>
          </select>
        </label>
        <label className="control-group" htmlFor="queue-direction">
          <span>Direction</span>
          <select
            id="queue-direction"
            className="control-select"
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label className="control-group" htmlFor="queue-page-size">
          <span>Rows Per Page</span>
          <select
            id="queue-page-size"
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
              <th>Missed EMI</th>
              <th>Max Delay</th>
              <th>EMI / Income Ratio</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.map((item) => (
              <tr key={item.borrower_id}>
                <td>
                  <Link to="/history" state={{ borrowerId: item.borrower_id }} className="table-link">
                    {item.borrower_id}
                  </Link>
                </td>
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
          Showing {paginatedCases.length} of {sortedCases.length} matching records
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
