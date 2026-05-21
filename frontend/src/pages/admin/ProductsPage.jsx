import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

const emptyForm = {
  sku: '',
  barcode: '',
  name: '',
  category: '',
  unit: 'pcs',
  cost_price: '',
  sale_price: '',
  is_active: true,
};

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/catalog/products/'),
        api.get('/catalog/categories/'),
      ]);
      setRows(productsRes.data);
      setCategories(categoriesRes.data);
      if (!form.category && categoriesRes.data.length) {
        setForm((cur) => ({ ...cur, category: String(categoriesRes.data[0].id) }));
      }
    } catch (error) {
      setRows([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) => `${row.name} ${row.sku} ${row.barcode || ''}`.toLowerCase().includes(q));
  }, [rows, search]);

  const resetForm = () => {
    setForm(categories.length ? { ...emptyForm, category: String(categories[0].id) } : emptyForm);
    setEditingId(null);
  };

  const saveProduct = async () => {
    try {
      if (!form.sku || !form.name || !form.category || !form.unit || !form.cost_price || !form.sale_price) {
        setMessage('Vui lòng nhập đầy đủ SKU, tên, danh mục, đơn vị và giá.');
        return;
      }

      const payload = {
        sku: form.sku,
        barcode: form.barcode || null,
        name: form.name,
        category: Number(form.category),
        unit: form.unit,
        cost_price: Number(form.cost_price),
        sale_price: Number(form.sale_price),
        is_active: form.is_active,
      };

      if (editingId) {
        await api.patch(`/catalog/products/${editingId}/`, payload);
        setMessage('Đã cập nhật sản phẩm');
      } else {
        await api.post('/catalog/products/', payload);
        setMessage('Đã thêm sản phẩm mới');
      }

      resetForm();
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Lưu sản phẩm thất bại');
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      sku: row.sku || '',
      barcode: row.barcode || '',
      name: row.name || '',
      category: row.category ? String(row.category) : '',
      unit: row.unit || 'pcs',
      cost_price: row.cost_price ?? '',
      sale_price: row.sale_price ?? '',
      is_active: row.is_active ?? true,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/catalog/products/${deleteTarget.id}/`);
      setMessage(`Đã xóa sản phẩm ${deleteTarget.name}`);
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) resetForm();
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Xóa sản phẩm thất bại');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm bán hàng'}</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" value={form.sku} onChange={(e) => setForm((cur) => ({ ...cur, sku: e.target.value }))} placeholder="SKU" />
            <input className="input" value={form.barcode} onChange={(e) => setForm((cur) => ({ ...cur, barcode: e.target.value }))} placeholder="Barcode (không bắt buộc)" />
            <input className="input" value={form.name} onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))} placeholder="Tên sản phẩm" />
            <select className="input" value={form.category} onChange={(e) => setForm((cur) => ({ ...cur, category: e.target.value }))}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input className="input" value={form.unit} onChange={(e) => setForm((cur) => ({ ...cur, unit: e.target.value }))} placeholder="Đơn vị tính" />
            <input className="input" type="number" value={form.cost_price} onChange={(e) => setForm((cur) => ({ ...cur, cost_price: e.target.value }))} placeholder="Giá vốn" />
            <input className="input" type="number" value={form.sale_price} onChange={(e) => setForm((cur) => ({ ...cur, sale_price: e.target.value }))} placeholder="Giá bán" />
            <label className="pill-row" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((cur) => ({ ...cur, is_active: e.target.checked }))} />
              <span>Kích hoạt sản phẩm</span>
            </label>
            <div className="pill-row">
              <button type="button" className="button primary" onClick={saveProduct}>{editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
              {editingId && <button type="button" className="button ghost" onClick={resetForm}>Hủy sửa</button>}
            </div>
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Danh sách sản phẩm</h3>
          <input className="input" style={{ marginTop: 14 }} placeholder="Tìm theo tên, SKU, barcode" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="table-lite" style={{ marginTop: 14 }}>
            {filteredRows.map((row) => (
              <div className="cart-row" key={row.id}>
                <div>
                  <strong>{row.name}</strong>
                  <p>{row.sku}{row.category_name ? ` · ${row.category_name}` : ''}</p>
                </div>
                <div className="pill-row" style={{ justifyContent: 'flex-end' }}>
                  <span>{Number(row.sale_price).toLocaleString('vi-VN')} đ</span>
                  <button type="button" className="button ghost" onClick={() => startEdit(row)}>Sửa</button>
                  <button type="button" className="button primary" onClick={() => setDeleteTarget(row)}>Xóa</button>
                </div>
              </div>
            ))}
            {!filteredRows.length && <div className="cart-row"><strong>Chưa có sản phẩm</strong></div>}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa sản phẩm"
        description={deleteTarget ? `Bạn có chắc muốn xóa sản phẩm ${deleteTarget.name}?` : ''}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
