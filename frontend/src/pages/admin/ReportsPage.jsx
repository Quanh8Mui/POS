export default function ReportsPage() {
  return (
    <>
      <div className="page-header">
        <h2>Reports</h2>
      </div>
      <div className="grid grid-3">
        <div className="card stat-card"><span>Revenue Today</span><strong>0 đ</strong></div>
        <div className="card stat-card"><span>Best Seller</span><strong>—</strong></div>
        <div className="card stat-card"><span>Low Stock</span><strong>—</strong></div>
      </div>
    </>
  );
}
