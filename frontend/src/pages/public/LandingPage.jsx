import { Link } from 'react-router-dom';
import PublicFooter from '../../components/PublicFooter';

export default function LandingPage() {
  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-brand">
          <div className="public-logo">P</div>
          <div>
            <strong>POS Supermarket Mini</strong>
            <p>Giải pháp bán lẻ tại quầy cho siêu thị mini</p>
          </div>
        </div>
        <nav className="public-actions">
          <Link className="button ghost" to="/login">Đăng nhập</Link>
          <Link className="button primary" to="/register">Đăng ký</Link>
        </nav>
      </header>

      <main className="public-main">
        <section className="card hero">
          <div className="hero-copy">
            <span className="hero-badge">Retail POS for mini supermarket</span>
            <h1>Mua sắm tiện lợi mỗi ngày
            tại siêu thị mini của chúng tôi</h1>
            <p>
            Cung cấp đầy đủ thực phẩm, đồ uống và nhu yếu phẩm hằng ngày
với giá cả hợp lý, thanh toán nhanh và nhiều ưu đãi hấp dẫn.
Chúng tôi luôn mang đến trải nghiệm mua sắm tiện lợi,
thân thiện và tiết kiệm cho mọi khách hàng.
            </p>
            <div className="pill-row" style={{ marginTop: 20 }}>
              <span className="pill">Hàng hóa chất lượng</span>
              <span className="pill">Giá cả hợp lý</span>
              <span className="pill">Thanh toán nhanh</span>
              <span className="pill">Nhiều ưu đãi</span>
              <span className="pill">Tích điểm thành viên</span>
              <span className="pill">Phục vụ tận tâm</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="card stat-card" style={{ margin: 0 }}>
              <strong>Đa dạng sản phẩm</strong>
              <small>Từ thực phẩm tươi sống, đồ ăn nhanh,
              đồ uống đến các sản phẩm thiết yếu cho gia đình.</small>
            </div>
            <div className="card stat-card" style={{ marginTop: 16 }}>
              <strong>Ưu đãi mỗi ngày</strong>
              <small>Nhiều chương trình khuyến mãi,
              giảm giá và tích điểm dành cho khách hàng thân thiết.</small>
            </div>
            <div className="card stat-card" style={{ marginTop: 16 }}>
              <strong>Mua sắm nhanh chóng</strong>
              <small>Không gian mua sắm gọn gàng,
              thanh toán tiện lợi và phục vụ nhanh chóng.</small>
            </div>
          </div>
        </section>

        <section className="card section-card">
          <div className="page-header">
            <div>
              <h2>Chúng tôi mang đến</h2>
              <p>Trải nghiệm mua sắm tiện lợi, nhanh chóng và phù hợp cho mọi gia đình.</p>
            </div>
          </div>
          <div className="grid grid-3">
            <div className="card stat-card"><span>Tiện lợi</span><strong>Mua sắm nhanh chóng</strong><small>Thanh toán nhanh, không phải chờ lâu,
            giúp khách hàng tiết kiệm thời gian mỗi ngày.</small></div>
            <div className="card stat-card"><span>Đầy đủ</span><strong>Hàng hóa đa dạng</strong><small>Cung cấp đầy đủ thực phẩm,
            đồ uống và nhu yếu phẩm thiết yếu.</small></div>
            <div className="card stat-card"><span>Ưu đãi</span><strong>Khuyến mãi mỗi ngày</strong><small>Nhiều chương trình giảm giá,
            tích điểm và ưu đãi dành cho khách hàng thân thiết.</small></div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
