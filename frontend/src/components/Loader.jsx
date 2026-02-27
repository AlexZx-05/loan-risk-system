export default function Loader({ label = "Loading data..." }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-spinner" />
      <p>{label}</p>
    </div>
  );
}
