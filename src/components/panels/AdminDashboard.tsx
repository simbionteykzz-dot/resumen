import { useRef } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { LogOut, RefreshCw, Filter, Search, Download, Trash2, X } from 'lucide-react';
import type { Profile } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
  adminName: string;
  profiles: Profile[];
  onSignOut: () => void;
}

const GREEN = '#2e7d32';
const GREEN_LIGHT = '#388e3c';
const RED = '#c62828';

export default function AdminDashboard({ adminName, onSignOut }: AdminDashboardProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const {
    filteredSales, paginatedSales, loading,
    dateFrom, setDateFrom, dateTo, setDateTo,
    exactDate, setExactDate, monthFilter, setMonthFilter,
    search, setSearch,
    regionFilter, setRegionFilter,
    codPublicidad, setCodPublicidad,
    vendorSearch, setVendorSearch,
    celFilter, setCelFilter,
    estadoFilter, setEstadoFilter,
    metodoPagoFilter, setMetodoPagoFilter,
    showFilters, setShowFilters,
    page, setPage, totalPages,
    globalStats, vendorStats,
    refresh, clearFilters,
    getRegion, getEstado,
  } = useAdmin();

  const startIdx = (page - 1) * 50;
  const endIdx = Math.min(startIdx + paginatedSales.length, filteredSales.length);

  const toggleEstado = (estado: string) => {
    setEstadoFilter(prev =>
      prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]
    );
  };

  const exportCSV = () => {
    const headers = ['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGION', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'];
    const rows = filteredSales.map(s => [
      s.fecha ?? '', s.marcaLabel ?? 'OVER', s.vendorName ?? '',
      s.hora ?? '', getRegion(s), s.nom ?? '', s.cel ?? '', s.dni ?? '',
      s.totalTotal ?? 0, s.resta ?? '', s.separo ?? '',
      getEstado(s), s.codigoPublicidad ?? '', s.metodoPago ?? '', s.combo ?? '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`ventas_${dateFrom}_${dateTo}.pdf`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: GREEN, color: '#fff', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.04em' }}>OVERSHARK</div>
          <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>|</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Panel Admin — {adminName}</div>
        </div>
        <button onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: '#fff', cursor: 'pointer', padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LogOut size={13} /> Salir
        </button>
      </div>

      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '1.25rem 1.5rem' }}>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Ventas totales', value: globalStats.salesCount, suffix: '' },
            { label: 'Ingresos S/', value: `S/${globalStats.totalRevenue.toLocaleString()}`, suffix: '' },
            { label: 'Prendas', value: globalStats.totalItems, suffix: '' },
            { label: 'Promedio/venta', value: `S/${globalStats.avgPerSale}`, suffix: '' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem 1.25rem', borderLeft: `4px solid ${GREEN}` }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>{k.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: GREEN }}>{k.value}{k.suffix}</div>
            </div>
          ))}
        </div>

        {/* Ranking vendedores */}
        {vendorStats.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Ranking de vendedores</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {vendorStats.map((v, i) => (
                <div key={v.id} style={{ background: i === 0 ? '#e8f5e9' : '#fafafa', border: `1px solid ${i === 0 ? '#a5d6a7' : '#e0e0e0'}`, borderRadius: '8px', padding: '0.6rem 1rem', minWidth: '160px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#757575', marginBottom: '0.2rem' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`} {v.name}
                  </div>
                  <div style={{ fontWeight: 800, color: GREEN, fontSize: '0.95rem' }}>S/{v.totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>{v.salesCount} ventas · {v.totalItems} prendas</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por cliente, vendedor, celular o DNI..."
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.82rem', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={() => setShowFilters(p => !p)} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#424242' }}>
            <Filter size={13} /> Filtros {showFilters ? '∧' : '∨'}
          </button>
          <button onClick={exportPDF} style={{ background: GREEN, border: 'none', borderRadius: '6px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
            <Download size={13} /> Exportar PDF
          </button>
          <button onClick={exportCSV} style={{ background: GREEN_LIGHT, border: 'none', borderRadius: '6px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff' }}>
            <Download size={13} /> Exportar Excel
          </button>
          <button onClick={refresh} disabled={loading} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#424242' }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Cargando...' : 'Obtener datos'}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <label style={labelStyle}>
                Ubicación
                <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1); }} style={inputStyle}>
                  <option value="todas">Todas las ubicaciones</option>
                  <option value="Lima">Lima</option>
                  <option value="Provincia">Provincia</option>
                  <option value="Almacén">Almacén</option>
                </select>
              </label>
              <label style={labelStyle}>
                Cod. Publicidad
                <input value={codPublicidad} onChange={e => { setCodPublicidad(e.target.value); setPage(1); }} placeholder="Ej: Live" style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Vendedor
                <input value={vendorSearch} onChange={e => { setVendorSearch(e.target.value); setPage(1); }} placeholder="Filtrar por vendedor" style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Celular cliente
                <input value={celFilter} onChange={e => { setCelFilter(e.target.value); setPage(1); }} placeholder="Ej: 999888777" style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Fecha exacta
                <input type="date" value={exactDate} onChange={e => { setExactDate(e.target.value); setMonthFilter(''); setPage(1); }} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Mes
                <input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setExactDate(''); setPage(1); }} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Rango: inicio
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Rango: fin
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setExactDate(''); setMonthFilter(''); setPage(1); }} style={inputStyle} />
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#616161', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado de Pedido (Múltiple)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1.5rem' }}>
                  {['PAGO COMPLETO', 'CONTRA ENTREGA', 'ANULADO', 'DEVOLUCIÓN'].map(e => (
                    <label key={e} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#424242', cursor: 'pointer' }}>
                      <input type="checkbox" checked={estadoFilter.includes(e)} onChange={() => { toggleEstado(e); setPage(1); }} style={{ accentColor: GREEN }} />
                      {e}
                    </label>
                  ))}
                </div>
              </div>
              <label style={labelStyle}>
                Método de Pago
                <select value={metodoPagoFilter} onChange={e => { setMetodoPagoFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: '180px' }}>
                  <option value="todos">Todos los métodos</option>
                  <option value="Contra entrega">Contra entrega</option>
                  <option value="Yape Import Textil">Yape Import Textil</option>
                  <option value="Pago completo">Pago completo</option>
                </select>
              </label>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#616161' }}>
                  <X size={13} /> Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Counter + Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#616161' }}>
            Mostrando {filteredSales.length === 0 ? '0–0' : `${startIdx + 1}–${endIdx}`} de {filteredSales.length} registros activos
          </span>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>

        {/* Table */}
        <div ref={tableRef} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: GREEN, color: '#fff' }}>
                  {['FECHA', 'EMPRESA', 'VENDEDOR', 'HORA', 'REGIÓN', 'CLIENTE', 'CELULAR', 'DNI', 'TOTAL S/', 'DEBE', 'SEPARO', 'ESTADO DE PEDIDO', 'COD. PUBLICIDAD', 'MET. PAGO', 'COMBO'].map(h => (
                    <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.68rem', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((s, i) => {
                  const region = getRegion(s);
                  const estado = getEstado(s);
                  return (
                    <tr key={s._dbId ?? i}
                      style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f8e9')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                      <td style={td}>{s.fecha ?? '—'}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{s.marcaLabel || 'OVER'}</td>
                      <td style={{ ...td, color: GREEN, fontWeight: 700 }}>{s.vendorName}</td>
                      <td style={td}>{s.hora ?? '—'}</td>
                      <td style={td}>
                        <span style={{ background: region === 'Lima' ? '#e3f2fd' : region === 'Provincia' ? '#fff8e1' : '#f3e5f5', color: region === 'Lima' ? '#1565c0' : region === 'Provincia' ? '#e65100' : '#6a1b9a', borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.7rem' }}>
                          {region}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>{s.nom || '—'}</td>
                      <td style={td}>{s.cel || '—'}</td>
                      <td style={td}>{s.dni || '—'}</td>
                      <td style={{ ...td, fontWeight: 800, color: GREEN }}>S/{s.totalTotal ?? 0}</td>
                      <td style={{ ...td, color: s.resta ? '#c62828' : '#9e9e9e' }}>{s.resta || '—'}</td>
                      <td style={td}>{s.separo || '—'}</td>
                      <td style={td}>
                        <span style={{ background: estado === 'PAGO COMPLETO' ? '#e8f5e9' : estado === 'CONTRA ENTREGA' ? '#fff3e0' : '#fce4ec', color: estado === 'PAGO COMPLETO' ? GREEN : estado === 'CONTRA ENTREGA' ? '#e65100' : RED, borderRadius: '4px', padding: '0.15rem 0.5rem', fontWeight: 700, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                          {estado}
                        </span>
                      </td>
                      <td style={td}>{s.codigoPublicidad || '—'}</td>
                      <td style={td}>{s.metodoPago || '—'}</td>
                      <td style={{ ...td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.combo || '—'}</td>
                    </tr>
                  );
                })}
                {paginatedSales.length === 0 && (
                  <tr>
                    <td colSpan={15} style={{ padding: '3rem', textAlign: 'center', color: '#9e9e9e', fontSize: '0.85rem' }}>
                      {loading ? 'Cargando ventas...' : 'Sin registros para los filtros seleccionados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </div>

      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const btnStyle = (active?: boolean, disabled?: boolean): React.CSSProperties => ({
    padding: '0.35rem 0.7rem', fontSize: '0.75rem', fontWeight: 700,
    border: `1px solid ${active ? GREEN : '#e0e0e0'}`,
    background: active ? GREEN : '#fff',
    color: active ? '#fff' : disabled ? '#bdbdbd' : '#424242',
    borderRadius: '4px', cursor: disabled ? 'default' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  });
  return (
    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
      <button style={btnStyle(false, page === 1)} onClick={() => onPage(1)}>Primero</button>
      <button style={btnStyle(false, page === 1)} onClick={() => onPage(page - 1)}>Anterior</button>
      <span style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', color: '#616161', fontWeight: 600 }}>
        Página {page} de {totalPages}
      </span>
      <button style={btnStyle(false, page === totalPages)} onClick={() => onPage(page + 1)}>Siguiente</button>
      <button style={btnStyle(false, page === totalPages)} onClick={() => onPage(totalPages)}>Último</button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.3rem',
  fontSize: '0.7rem', fontWeight: 700, color: '#616161',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.65rem', border: '1px solid #e0e0e0',
  borderRadius: '6px', fontSize: '0.82rem', background: '#fff',
  outline: 'none', width: '100%', boxSizing: 'border-box', color: '#212121',
};

const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem', color: '#424242', whiteSpace: 'nowrap',
};
