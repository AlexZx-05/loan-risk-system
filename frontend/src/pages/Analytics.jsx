import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../components/Loader";
import { apiFetch } from "../api";

const RISK_ORDER = ["HIGH", "MEDIUM", "LOW"];
const RISK_COLOR = {
  HIGH: "#8f1e3f",
  MEDIUM: "#af6b1f",
  LOW: "#1d7163",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    apiFetch("/analytics", { token })
      .then(setData)
      .catch((err) => {
        if (err.status === 401 || err.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        setError(err.message || "Could not load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  const distributionData = useMemo(() => {
    if (!data) return [];
    return RISK_ORDER.filter((risk) => data.summary_counts[risk] !== undefined).map((risk) => ({
      risk,
      count: data.summary_counts[risk],
      percentage: data.percentage[risk],
      fill: RISK_COLOR[risk],
    }));
  }, [data]);

  const confidenceGaugeData = useMemo(() => {
    if (!data) return [];
    return [{ name: "Confidence", value: Number((data.average_confidence * 100).toFixed(1)) }];
  }, [data]);

  if (loading) return <Loader label="Loading analytics..." />;
  if (error) return <p className="error-state">{error}</p>;
  if (!data) return <p className="error-state">No analytics data available.</p>;

  return (
    <div className="analytics-page">
      <div className="analytics-top">
        <article className="stat-card analytics-stat analytics-stat-primary">
          <p>Total Borrowers</p>
          <h3>{data.total_customers}</h3>
          <span>Active portfolio tracked by model</span>
        </article>

        <article className="stat-card analytics-stat analytics-stat-accent">
          <p>Average Confidence</p>
          <h3>{(data.average_confidence * 100).toFixed(1)}%</h3>
          <span>Prediction reliability index</span>
        </article>
      </div>

      <section className="analytics-section">
        <div className="analytics-section-title">
          <h3 className="section-title">Risk Distribution</h3>
          <p>Current borrower segmentation by default exposure.</p>
        </div>
        <div className="risk-grid analytics-risk-grid">
          {distributionData.map((item) => (
            <article key={item.risk} className={`risk-card risk-${item.risk.toLowerCase()}`}>
              <p>{item.risk} Risk</p>
              <h3>{data.summary_counts[item.risk]}</h3>
              <span>{data.percentage[item.risk]}%</span>
            </article>
          ))}
        </div>
      </section>

      <section className="analytics-grid analytics-chart-grid">
        <article className="chart-card analytics-chart-card">
          <h4 className="chart-title">Portfolio Risk Split</h4>
          <div className="chart-wrap compact-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="count"
                  nameKey="risk"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={104}
                  paddingAngle={3}
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.risk} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _, payload) => [`${value}`, `${payload?.payload?.risk} Risk`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="analytics-legend">
              {distributionData.map((entry) => (
                <span key={entry.risk} className="analytics-legend-item">
                  <i style={{ backgroundColor: entry.fill }} />
                  {entry.risk}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="chart-card analytics-chart-card">
          <h4 className="chart-title">Risk Count Comparison</h4>
          <div className="chart-wrap compact-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e2dc" />
                <XAxis dataKey="risk" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry) => (
                    <Cell key={entry.risk} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card analytics-chart-card">
          <h4 className="chart-title">Model Confidence Gauge</h4>
          <div className="chart-wrap compact-chart">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                innerRadius="65%"
                outerRadius="95%"
                data={confidenceGaugeData}
                startAngle={180}
                endAngle={0}
                barSize={20}
              >
                <RadialBar minAngle={15} background dataKey="value" fill="#b3472f" cornerRadius={12} />
                <Tooltip formatter={(value) => [`${value}%`, "Confidence"]} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="gauge-value">{confidenceGaugeData[0]?.value || 0}% average confidence</p>
          </div>
        </article>
      </section>
    </div>
  );
}
