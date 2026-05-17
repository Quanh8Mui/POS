import { useEffect, useMemo, useState } from 'react';
import api from '../../api';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

const movementTypes = [
  { value: 'import', label: 'Nhập kho' },
  { value: 'adjust', label: 'Điều chỉnh' },
  { value: 'return', label: 'Trả hàng' },
];

export default function InventoryPage() {
  const [branchId, setBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [inventories, setInventories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movement, setMovement] = useState({ branch: '', product: '', movement_type: 'import', quantity: '', note: '' });
  const [status, setStatus] = useState('');
  const [quickQty, setQuickQty] = useState({});
  const [quickPrices, setQuickPrices] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const [inventoryRes, branchesRes, productsRes, movementsRes] = await Promise.all([
        api.get('/catalog/inventory/'),
        api.get('/branches/'),
        api.get('/catalog/products/'),
        api.get('/sales/stock-movements/'),
      ]);
      setInventories(inventoryRes.data);
      setBranches(branchesRes.data);
      setProducts(productsRes.data);
      setMovements(movementsRes.data);
      setQuickQty(
        inventoryRes.data.reduce((acc, item) => {
          acc[item.id] = item.quantity_on_hand;
          return acc;
        }, {}),
      );
      setQuickPrices(
        inventoryRes.data.reduce((acc, item) => {
          acc[item.id] = item.product_sale_price || item.product?.sale_price;
          return acc;
        }, {}),
      );
    } catch (error) {
      setInventories([]);
      setBranches([]);
      setProducts([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventories.filter((item) => {
      const matchBranch = !branchId || String(item.branch) === String(branchId);
      const text = `${item.product_name || item.product?.name || ''} ${item.product_sku || item.product?.sku || ''}`.toLowerCase();
      return matchBranch && text.includes(q);
    });
  }, [inventories, search, branchId]);

  const lowStockCount = inventories.filter((item) => item.is_low_stock).length;

  const saveMovement = async () => {
    setStatus('Đang lưu...');
    try {
      await api.post('/sales/stock-movements/', {
        branch: Number(movement.branch),
        product: Number(movement.product),
        movement_type: movement.movement_type,
        quantity: Number(movement.quantity),
        reference_type: 'manual',
        note: movement.note,
      });
      setStatus('Lưu biến động kho thành công');
      setMovement({ branch: '', product: '', movement_type: 'import', quantity: '', note: '' });
      await load();
    } catch (error) {
      setStatus(error?.response?.data?.detail || 'Lưu thất bại');
    }
  };

  const saveQuickQty = async (inventoryId) => {
    const target = inventories.find((item) => item.id === inventoryId);
    if (!target) return;
    const nextQty = Number(quickQty[inventoryId]);
    await api.patch(`/catalog/inventory/${inventoryId}/`, { quantity_on_hand: nextQty });
    await api.post('/sales/stock-movements/', {
      branch: target.branch,
      product: target.product,
      movement_type: 'adjust',
      quantity: nextQty - target.quantity_on_hand,
      reference_type: 'manual-adjust',
      note: 'Quick adjust from inventory page',
    });
    await load();
  };

  const saveQuickPrice = async (inventoryId) => {
    const target = inventories.find((item) => item.id === inventoryId);
    if (!target) return;
    const sale_price = Number(quickPrices[inventoryId]);
    await api.patch(`/catalog/products/${target.product}/`, { sale_price });
    await load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>Quản lý tồn kho theo chi nhánh, nhập kho và xuất kho.</p>
        </div>
        <span className="pill">{lowStockCount} cảnh báo tồn thấp</span>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">Bộ lọc</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" placeholder="Tìm sản phẩm / SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <option value="">Tất cả chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="summary" style={{ marginTop: 16 }}>
            <div><span>Tổng mặt hàng</span><strong>{inventories.length}</strong></div>
            <div><span>Hàng thấp</span><strong>{lowStockCount}</strong></div>
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Nhập / xuất kho</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <select className="input" value={movement.branch} onChange={(e) => setMovement((cur) => ({ ...cur, branch: e.target.value }))}>
              <option value="">Chọn chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <select className="input" value={movement.product} onChange={(e) => setMovement((cur) => ({ ...cur, product: e.target.value }))}>
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
              ))}
            </select>
            <select className="input" value={movement.movement_type} onChange={(e) => setMovement((cur) => ({ ...cur, movement_type: e.target.value }))}>
              {movementTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <input className="input" type="number" placeholder="Số lượng" value={movement.quantity} onChange={(e) => setMovement((cur) => ({ ...cur, quantity: e.target.value }))} />
            <input className="input" placeholder="Ghi chú" value={movement.note} onChange={(e) => setMovement((cur) => ({ ...cur, note: e.target.value }))} />
            <button type="button" className="button primary" onClick={saveMovement}>Lưu biến động kho</button>
          </div>
          {status && <p style={{ marginTop: 12 }}>{status}</p>}
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <div className="pos-bottom-header">
          <div>
            <h3 className="section-title">Danh sách tồn kho</h3>
            <p>{filtered.length} dòng dữ liệu</p>
          </div>
        </div>

        <div className="table-lite">
          {loading && <div className="cart-row"><strong>Đang tải tồn kho...</strong></div>}
          {!loading && filtered.map((item) => {
            const isLow = item.is_low_stock;
            return (
              <div className={`cart-row ${isLow ? 'low-stock-row' : ''}`} key={item.id}>
                <div>
                  <strong>{item.product_name || item.product?.name}</strong>
                  <p>{item.product_sku || item.product?.sku} · {item.branch_name || item.branch?.name}</p>
                  <p>Reorder level: {item.reorder_level}</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: 320 }}>
                  <strong className={isLow ? 'low-stock-text' : ''}>{item.quantity_on_hand}</strong>
                  <p className={isLow ? 'pill low-stock-pill' : 'pill muted'} style={{ display: 'inline-block' }}>{isLow ? 'Low stock' : 'OK'}</p>
                  <p>{formatMoney(item.product_sale_price || item.product?.sale_price)}</p>
                  <div className="pill-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                    <input className="input" style={{ width: 120 }} type="number" value={quickQty[item.id] ?? item.quantity_on_hand} onChange={(e) => setQuickQty((cur) => ({ ...cur, [item.id]: e.target.value }))} />
                    <button type="button" className="button primary" onClick={() => saveQuickQty(item.id)}>Lưu tồn</button>
                  </div>
                  <div className="pill-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                    <input className="input" style={{ width: 180 }} type="number" value={quickPrices[item.id] ?? (item.product_sale_price || item.product?.sale_price)} onChange={(e) => setQuickPrices((cur) => ({ ...cur, [item.id]: e.target.value }))} />
                    <button type="button" className="button secondary" onClick={() => saveQuickPrice(item.id)}>Lưu giá</button>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && !filtered.length && <div className="cart-row"><strong>Không có dữ liệu tồn kho phù hợp</strong></div>}
        </div>

        <div className="card section-card" style={{ marginTop: 18 }}>
          <div className="pos-bottom-header">
            <div>
              <h3 className="section-title">Lịch sử biến động kho</h3>
              <p>{movements.length} bản ghi</p>
            </div>
            <span className="pill muted">Stock movements</span>
          </div>
          <div className="table-lite">
            {movements.slice(0, 20).map((movementItem) => (
              <div className="cart-row" key={movementItem.id}>
                <div>
                  <strong>{movementItem.product_name || movementItem.product?.name}</strong>
                  <p>{movementItem.branch_name || movementItem.branch?.name} · {movementItem.movement_type}</p>
                  <p>{movementItem.note || 'No note'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{movementItem.quantity}</strong>
                  <p>{movementItem.created_by_name || movementItem.created_by || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
