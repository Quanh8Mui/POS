import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setMessage('Đang đổi mật khẩu...');
    try {
      await api.post('/accounts/change-password/', form);
      setMessage('Đổi mật khẩu thành công');
      setTimeout(() => navigate(-1), 800);
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div className="public-shell">
      <main className="login-screen">
        <div className="card login-card">
          <div className="brand-mark" style={{ marginBottom: 16 }}>P</div>
          <h1>Đổi mật khẩu</h1>
          <p>Nhập mật khẩu hiện tại và mật khẩu mới của bạn.</p>
          <form className="grid" style={{ marginTop: 16 }} onSubmit={submit}>
            <input
              className="input"
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={form.current_password}
              onChange={(e) => setForm((current) => ({ ...current, current_password: e.target.value }))}
            />
            <input
              className="input"
              type="password"
              placeholder="Mật khẩu mới"
              value={form.new_password}
              onChange={(e) => setForm((current) => ({ ...current, new_password: e.target.value }))}
            />
            <button className="button primary" type="submit">Đổi mật khẩu</button>
          </form>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </main>
    </div>
  );
}
