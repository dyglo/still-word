export default function BarChart({ values }: { values: number[] }) {
  const last = values.length - 1;
  return (
    <>
      <div className="bars" role="img" aria-label={`Bar chart of ${values.length} days, latest ${values[last]} visitors`}>
        {values.map((v, i) => (
          <div key={i} style={{ height: v, background: i === last ? "var(--accent)" : "#d9d4cf" }} />
        ))}
      </div>
      <div className="axis"><span>{values.length} days ago</span><span>Today</span></div>
    </>
  );
}
