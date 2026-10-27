type Row = { title: string; views: number; reads: number };

export default function PostsTable({ rows }: { rows: Row[] }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr><th>Post</th><th>Views</th><th>Reads</th><th>Completion</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = r.views ? Math.min(100, Math.round((r.reads / r.views) * 100)) : 0;
            return (
              <tr key={r.title}>
                <td><b>{r.title}</b></td>
                <td>{r.views.toLocaleString()}</td>
                <td>{r.reads.toLocaleString()}</td>
                <td>
                  <div className="pct"><div className="track"><div style={{ width: `${pct}%` }} /></div><span>{pct}%</span></div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
