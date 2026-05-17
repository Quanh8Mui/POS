import { useEffect, useState } from 'react';
import api from '../../api';

const emptyPromotion = {
  name: '',
  type: 'percent',
  value: '',
  start_at: '',
  end_at: '',
  is_active: true,
};

export default function PricingPolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({ vat_rate: 10, global_promotion: '', is_active: true, name: 'Default policy' });
  const [promotionForm, setPromotionForm] = useState(emptyPromotion);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [policyRes, promotionsRes] = await Promise.all([
        api.get('/sales/pricing-policies/active/'),
        api.get('/sales/promotions/active/'),
      ]);
      setPolicy(policyRes.data);
      setForm({
        vat_rate: policyRes.data.vat_rate,
        global_promotion: policyRes.data.global_promotion || '',
        is_active: policyRes.data.is_active,
        name: policyRes.data.name,
      });
      setPromotions(promotionsRes.data);
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Không tải được chính sách');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const savePolicy = async () => {
    try {
      if (policy?.id) {
        await api.patch(`/sales/pricing-policies/${policy.id}/`, {
          name: form.name,
          vat_rate: Number(form.vat_rate),
          global_promotion: form.global_promotion || null,
          is_active: form.is_active,
        });
      } else {
        await api.post('/sales/pricing-policies/', {
          name: form.name,
          vat_rate: Number(form.vat_rate),
          global_promotion: form.global_promotion || null,
          is_active: form.is_active,
        });
      }
      setMessage('Đã lưu chính sách giá và thuế');
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Lưu chính sách thất bại');
    }
  };

  const savePromotion = async () => {
    try {
      await api.post('/sales/promotions/', {
        ...promotionForm,
        value: Number(promotionForm.value),
      });
      setMessage('Đã tạo khuyến mãi');
      setPromotionForm(emptyPromotion);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Tạo khuyến mãi thất bại');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pricing Policy</h2>
          <p>Cấu hình VAT và khuyến mãi toàn chuỗi áp dụng cho POS.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card section-card">
          <h3 className="section-title">Chính sách giá & thuế</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" value={form.name} onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))} placeholder="Tên chính sách" />
            <input className="input" type="number" value={form.vat_rate} onChange={(e) => setForm((cur) => ({ ...cur, vat_rate: e.target.value }))} placeholder="VAT %" />
            <select className="input" value={form.global_promotion} onChange={(e) => setForm((cur) => ({ ...cur, global_promotion: e.target.value }))}>
              <option value="">Không áp dụng khuyến mãi toàn chuỗi</option>
              {promotions.map((promotion) => (
                <option key={promotion.id} value={promotion.id}>{promotion.name}</option>
              ))}
            </select>
            <label className="pill-row" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((cur) => ({ ...cur, is_active: e.target.checked }))} />
              <span>Kích hoạt chính sách</span>
            </label>
            <button type="button" className="button primary" onClick={savePolicy}>Lưu chính sách</button>
          </div>
        </div>

        <div className="card section-card">
          <h3 className="section-title">Tạo khuyến mãi toàn chuỗi</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <input className="input" value={promotionForm.name} onChange={(e) => setPromotionForm((cur) => ({ ...cur, name: e.target.value }))} placeholder="Tên khuyến mãi" />
            <select className="input" value={promotionForm.type} onChange={(e) => setPromotionForm((cur) => ({ ...cur, type: e.target.value }))}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
            <input className="input" type="number" value={promotionForm.value} onChange={(e) => setPromotionForm((cur) => ({ ...cur, value: e.target.value }))} placeholder="Giá trị" />
            <input className="input" type="datetime-local" value={promotionForm.start_at} onChange={(e) => setPromotionForm((cur) => ({ ...cur, start_at: e.target.value }))} />
            <input className="input" type="datetime-local" value={promotionForm.end_at} onChange={(e) => setPromotionForm((cur) => ({ ...cur, end_at: e.target.value }))} />
            <button type="button" className="button primary" onClick={savePromotion}>Tạo khuyến mãi</button>
          </div>
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Chính sách hiện tại</h3>
        {policy ? (
          <div className="summary" style={{ marginTop: 14 }}>
            <div><span>Tên</span><strong>{policy.name}</strong></div>
            <div><span>VAT</span><strong>{policy.vat_rate}%</strong></div>
            <div><span>Khuyến mãi áp dụng</span><strong>{policy.global_promotion_detail?.name || 'Không có'}</strong></div>
            <div><span>Trạng thái</span><strong>{policy.is_active ? 'Active' : 'Inactive'}</strong></div>
          </div>
        ) : <p>Chưa có chính sách.</p>}
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
