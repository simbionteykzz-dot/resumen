import React, { useState } from 'react';
import { ClipboardList, Copy, Check, PackagePlus } from 'lucide-react';

export default function OutputPanel({ outputText, onRefresh, onAddSale }: { outputText: string, onRefresh: () => void, onAddSale: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onRefresh();
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
      const el = document.createElement('textarea');
      el.value = outputText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={18} /> Texto para copiar
        </h2>
      </div>
      <textarea value={outputText} readOnly spellCheck={false} style={{ width: '100%', minHeight: '200px' }} />
      <div className="actions">
        <button className="btn btn-primary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Copiar resumen</>}
        </button>
        <button className="btn btn-primary" onClick={onAddSale} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PackagePlus size={16} /> Añadir venta a fila
        </button>
        <button className="btn btn-secondary" onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>↺ Actualizar texto</button>
      </div>
      
      <div className={`toast ${copied ? 'show' : ''}`}>Copiado</div>
    </div>
  );
}
