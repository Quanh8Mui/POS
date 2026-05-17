import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PublicFooter from '../../components/PublicFooter';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', username: '', password: '', phone: '', email: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('Đang đăng ký...');
    try {
      const response = await api.post('/accounts/register/', {
        full_name: form.full_name,
        username: form.username,
        password: form.password,
        phone: form.phone,
        email: form.email,
      });
      setUser(response.data);
      navigate('/customer/home', { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Đăng ký thất bại';
      setMessage(detail);
    }
  };

  return (
    <div className="public-shell">
      <main className="login-screen">
        <div className="card login-card">
          <div className="brand-mark" style={{ marginBottom: 16 }}>P</div>
          <h1>Đăng ký tài khoản khách hàng</h1>
          <p>Tài khoản mới sẽ được gán role customer.</p>
          <form className="grid" style={{ marginTop: 16 }} onSubmit={handleRegister}>
            <input className="input" placeholder="Họ tên" value={form.full_name} onChange={updateField('full_name')} />
            <input className="input" placeholder="Username" value={form.username} onChange={updateField('username')} />
            <input className="input" placeholder="Password" type="password" value={form.password} onChange={updateField('password')} />
            <input className="input" placeholder="Số điện thoại" value={form.phone} onChange={updateField('phone')} />
            <input className="input" placeholder="Email" value={form.email} onChange={updateField('email')} />
            <button className="button primary" type="submit">Đăng ký</button>
          </form>
          <p style={{ marginTop: 12 }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
