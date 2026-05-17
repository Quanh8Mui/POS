import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PublicFooter from '../../components/PublicFooter';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345678');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('Đang đăng nhập...');
    try {
      const response = await api.post('/accounts/login/', { username, password });
      setUser(response.data);
      if (response.data.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (response.data.role === 'cashier') navigate('/staff/pos', { replace: true });
      else navigate('/customer/home', { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Đăng nhập thất bại';
      setMessage(detail);
    }
  };

  return (
    <div className="public-shell">
      <main className="login-screen">
        <div className="card login-card">
          <div className="brand-mark" style={{ marginBottom: 16 }}>P</div>
          <h1>Đăng nhập POS</h1>
          <form className="grid" style={{ marginTop: 16 }} onSubmit={handleLogin}>
            <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="button primary" type="submit">Đăng nhập</button>
          </form>
          <p style={{ marginTop: 12 }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký khách hàng</Link>
          </p>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
