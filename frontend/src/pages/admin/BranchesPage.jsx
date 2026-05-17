import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import ConfirmModal from '../../components/ConfirmModal';

const emptyBranch = {
  code: '',
  name: '',
  address: '',
  phone: '',
  status: 'active',
};

export default function BranchesPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyBranch);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/branches/');
      setRows(res.data);
    } catch (error) {
      setRows([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) => `${row.code} ${row.name} ${row.address} ${row.phone}`.toLowerCase().includes(q));
  }, [rows, search]);

  const resetForm = () => {
    setForm(emptyBranch);
    setEditingId(null);
    setMessage('');
  };

  const startEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      code: branch.code || '',
      name: branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      status: branch.status || 'active',
    });
  };

  const saveBranch = async () => {
    if (!form.code || !form.name || !form.address) {
      setMessage('Vui lòng nhập code, tên và địa chỉ chi nhánh.');
      return;
    }

    setMessage('Đang lưu...');
    try {
      const payload = { ...form };
      if (editingId) {
        await api.patch(`/branches/${editingId}/`, payload);
        setMessage('Cập nhật chi nhánh thành công');
      } else {
        await api.post('/branches/', payload);
        setMessage('Tạo chi nhánh thành công');
      }
      resetForm();
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Lưu thất bại');
    }
  };

  const deleteBranch = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/branches/${deleteTarget.id}/`);
      setDeleteTarget(null);
      setMessage('Đã xóa chi nhánh');
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Xóa thất bại');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Branches</h2>
          <p>Quản lý chi nhánh: xem, thêm, sửa và xóa.</p>
        </div>
        <span className="pill">{filtered.length} chi nhánh</span>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">Bộ lọc</h3>
          <input className="input" style={{ marginTop: 14 }} placeholder="Tìm theo code, tên, địa chỉ" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="summary" style={{ marginTop: 16 }}>
            <div><span>Tổng chi nhánh</span><strong>{rows.length}</strong></div>
            <div><span>Đang hiển thị</span><strong>{filtered.length}</strong></div>
          </div>
        </div>

        <div className="card section-card">
          <div className="pos-bottom-header">
            <div>
              <h3 className="section-title">{editingId ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}</h3>
              <p>Nhập thông tin chi nhánh đầy đủ.</p>
            </div>
            {editingId && <span className="pill muted">Editing #{editingId}</span>}
          </div>

          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" placeholder="Code" value={form.code} onChange={(e) => setForm((cur) => ({ ...cur, code: e.target.value }))} />
            <input className="input" placeholder="Tên chi nhánh" value={form.name} onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))} />
            <input className="input" placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm((cur) => ({ ...cur, address: e.target.value }))} />
            <input className="input" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm((cur) => ({ ...cur, phone: e.target.value }))} />
            <select className="input" value={form.status} onChange={(e) => setForm((cur) => ({ ...cur, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="pill-row">
              <button type="button" className="button primary" onClick={saveBranch}>{editingId ? 'Cập nhật' : 'Tạo mới'}</button>
              <button type="button" className="button ghost" onClick={resetForm}>Làm mới</button>
            </div>
          </div>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <div className="pos-bottom-header">
          <div>
            <h3 className="section-title">Danh sách chi nhánh</h3>
            <p>Admin có thể sửa hoặc xóa từng chi nhánh.</p>
          </div>
        </div>

        <div className="table-lite">
          {filtered.map((row) => (
            <div className="cart-row" key={row.id}>
              <div>
                <strong>{row.name}</strong>
                <p>{row.code} · {row.address}</p>
                <p>{row.phone || 'Không có số điện thoại'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className={row.status === 'active' ? 'pill muted' : 'pill low-stock-pill'} style={{ display: 'inline-block' }}>{row.status}</p>
                <div className="pill-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="button secondary" onClick={() => startEdit(row)}>Sửa</button>
                  <button type="button" className="button ghost" onClick={() => setDeleteTarget(row)}>Xóa</button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="cart-row"><strong>Không có chi nhánh</strong></div>}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa chi nhánh"
        description={`Bạn có chắc chắn muốn xóa ${deleteTarget?.name || 'chi nhánh này'} không?`}
        confirmLabel="Xóa"
        onConfirm={deleteBranch}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
