export default function StatCard({ label, value, note, up }: { label: string; value: string; note: string; up?: boolean }) {
  return (
    <div className="card">
      <div className="muted">{label}</div>
      <div className="big">{value}</div>
      <div className={up ? "note up" : "note"}>{note}</div>
    </div>
  );
}
