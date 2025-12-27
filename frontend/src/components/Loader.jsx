export default function Loader() {
  return (
    <div style={{
      textAlign:"center",
      marginTop:"50px"
    }}>
      <div style={{
        width:"45px",
        height:"45px",
        border:"6px solid #d0d7ff",
        borderTop:"6px solid #022449",
        borderRadius:"50%",
        margin:"auto",
        animation:"spin 1s linear infinite"
      }}></div>

      <p>Fetching secure banking data...</p>
    </div>
  );
}
