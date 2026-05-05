import { useState } from 'react';
import { Truck, LogIn, Loader } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError('Correo o contraseña incorrectos');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b00, #e05500)',
            borderRadius: '12px',
            width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(255,107,0,0.35)',
          }}>
            <Truck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              OVERSHARK <span style={{ color: '#ff6b00' }}>Ventas</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>Acceso para vendedores</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vendedor@overshark.pe"
              autoComplete="email"
              required
              style={{
                background: 'var(--surface2)',
                border: '1.5px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                padding: '0.65rem 1rem',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#ff6b00')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                background: 'var(--surface2)',
                border: '1.5px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                padding: '0.65rem 1rem',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#ff6b00')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              background: loading ? 'var(--surface3)' : 'linear-gradient(135deg, #ff6b00, #e05500)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,0,0.3)',
            }}
          >
            {loading ? <><Loader size={16} className="fa-spin" /> Entrando...</> : <><LogIn size={16} /> Iniciar sesión</>}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)' }}>
          Las cuentas son asignadas por el administrador.
        </p>
      </div>
    </div>
  );
}
