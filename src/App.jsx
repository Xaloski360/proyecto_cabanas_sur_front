import { useState } from 'react';
import { api } from './api';

export default function App() {
  const [email, setEmail] = useState('admin@lodge.test');
  const [password, setPassword] = useState('12345678');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  async function login(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api('/api/login', { method: 'POST', body: { email, password } });
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
      await api('/api/logout', { method: 'POST', token });
    } finally {
      localStorage.removeItem('token');
      setToken('');
      setMe(null);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h2>Login (Sanctum token)</h2>

      {!token && (
        <form onSubmit={login}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" style={{width:'100%',margin:'6px 0'}} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" style={{width:'100%',margin:'6px 0'}} />
          <button>Entrar</button>
        </form>
      )}

      {token && (
        <>
          <p><b>Token</b>: {token.slice(0,12)}…</p>
          <button onClick={fetchMe}>/api/me</button>{' '}
          <button onClick={logout}>Logout</button>
        </>
      )}

      {error && <p style={{color:'crimson'}}>{error}</p>}
      {me && (<pre style={{background:'#f5f5f5', padding:12}}>{JSON.stringify(me,null,2)}</pre>)}
    </div>
  );
}
