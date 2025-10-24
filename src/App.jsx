import { useState } from 'react';
import { api } from './api';

export default function App() {
  const [email, setEmail] = useState('admin@lodge.test');
  const [password, setPassword] = useState('12345678');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [adminPing, setAdminPing] = useState(null);

  async function login(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api('/api/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(res.token);
      localStorage.setItem('token', res.token);
      setMe(res.user);
    } catch (err) {
      setError(err.message || 'Error de login');
    }
  }

  async function fetchMe() {
    try {
      const res = await api('/api/me', { token });
      setMe(res);
    } catch (err) {
      setError(err.message || 'No autenticado');
    }
  }

  async function logout() {
    try {
      // cierra sesión en backend (borra el token en BD)
      await api('/api/logout', { method: 'POST', token });
    } catch {
      // aunque falle, limpiaremos el estado local
    } finally {
      localStorage.removeItem('token');
      setToken('');
      setMe(null);
      setAdminPing(null);
    }
  }

  async function pingAdmin() {
    setError('');
    try {
      const res = await api('/api/admin/dashboard', { token });
      setAdminPing(res);
    } catch (err) {
      setError(err.message || 'No autorizado');
    }
  }

  async function crearEmpleadoDemo() {
    setError('');
    try {
      const res = await api('/api/admin/users', {
        method: 'POST',
        token,
        body: {
          name: 'Empleado Demo',
          email: `empleado${Math.floor(Math.random()*10000)}@lodge.test`,
          password: '12345678',
          role: 'recepcionista',
        },
      });
      alert(res.message || 'Empleado creado');
    } catch (err) {
      setError(err.message || 'Error al crear empleado');
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h2>Login (Sanctum token)</h2>

      {!token && (
        <form onSubmit={login}>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="email"
            style={{width:'100%',margin:'6px 0'}}
          />
          <input
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="password"
            type="password"
            style={{width:'100%',margin:'6px 0'}}
          />
          <button>Entrar</button>
        </form>
      )}

      {token && (
        <>
          <p><b>Token</b>: {token.slice(0, 24)}…</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={fetchMe}>/api/me</button>
            <button onClick={pingAdmin}>/api/admin/dashboard</button>
            <button onClick={crearEmpleadoDemo}>Crear empleado demo</button>
            <button onClick={logout}>Logout</button>
          </div>
        </>
      )}

      {error && <p style={{color:'crimson'}}>{error}</p>}
      {me && (
        <>
          <h3>Yo</h3>
          <pre style={{background:'#f5f5f5', padding:12}}>{JSON.stringify(me,null,2)}</pre>
        </>
      )}
      {adminPing && (
        <>
          <h3>Admin dashboard</h3>
          <pre style={{background:'#f5f5f5', padding:12}}>{JSON.stringify(adminPing,null,2)}</pre>
        </>
      )}
    </div>
  );
}
