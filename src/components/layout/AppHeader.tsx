import { Truck, Target, LogOut } from 'lucide-react';

interface AppHeaderProps {
  salesCount: number;
  totalSoles: number;
  metaDiaria: number;
  onMetaChange: (v: number) => void;
  userName?: string;
  onSignOut: () => void;
}

export default function AppHeader({
  salesCount,
  totalSoles,
  metaDiaria,
  onMetaChange,
  userName,
  onSignOut,
}: AppHeaderProps) {
  const pct = metaDiaria > 0 ? Math.min(100, (salesCount / metaDiaria) * 100) : 0;
  const reached = salesCount >= metaDiaria;

  return (
    <header style={{
      marginBottom: '1.5rem',
      padding: '1.1rem 1.5rem',
      background: 'linear-gradient(135deg, #100c08, #1a1208)',
      borderRadius: '14px',
      border: '1px solid #2a1f14',
      boxShadow: '0 4px 24px rgba(255,107,0,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b00, #e05500)',
            borderRadius: '12px', width: '48px', height: '48px',
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
            <p style={{ color: '#a08060', fontSize: '0.82rem', margin: 0 }}>
              Genera el resumen y registra la venta al instante
            </p>
          </div>
        </div>

        {/* Stats + user */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a08060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ventas hoy</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ff6b00', lineHeight: 1 }}>{salesCount}</div>
          </div>
          <div style={{ width: '1px', height: '2.5rem', background: '#2a1f14' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a08060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total S/</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{totalSoles.toFixed(0)}</div>
          </div>
          {userName && (
            <>
              <div style={{ width: '1px', height: '2.5rem', background: '#2a1f14' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ff6b00', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {userName}
                </span>
                <button
                  onClick={onSignOut}
                  title="Cerrar sesión"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <LogOut size={12} /> Salir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meta diaria */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Target size={14} style={{ color: '#a08060', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="meta-bar-track">
            <div
              className="meta-bar-fill"
              style={{
                width: `${pct}%`,
                background: reached ? '#00e696' : 'linear-gradient(90deg, #ff6b00, #ffaa44)',
              }}
            />
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: reached ? '#00e696' : '#a08060', whiteSpace: 'nowrap' }}>
          {salesCount} / {metaDiaria}
        </span>
        <input
          type="number"
          min={1}
          max={999}
          value={metaDiaria}
          onChange={e => onMetaChange(Math.max(1, parseInt(e.target.value) || 1))}
          title="Meta diaria de ventas"
          style={{
            width: '52px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #2a1f14',
            borderRadius: '6px',
            color: '#a08060',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '0.2rem 0.4rem',
            textAlign: 'center',
          }}
        />
      </div>
    </header>
  );
}
