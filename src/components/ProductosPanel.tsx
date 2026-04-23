import React, { useState } from 'react';
import { POLOS_CATALOGO_OVERSHARK, POL_VARIANTES_OVERSHARK, PROMOS_DATA, TALLAS_SMLXL } from '../lib/data';

export default function ProductosPanel({ products, setProducts, customComboName, setCustomComboName, promoPrice, setPromoPrice }: any) {
  
  const [newPromoName, setNewPromoName] = useState("");
  const [newPromoPrice, setNewPromoPrice] = useState("");
  const [newPromoQty, setNewPromoQty] = useState("1");

  const addProduct = () => {
    setProducts([...products, { id: Date.now(), name: "", size: "", qty: 1, colorLines: [], promoName: "" }]);
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter((p: any) => p.id !== id));
  };

  const updateProduct = (id: number, field: string, value: any) => {
    setProducts(products.map((p: any) => p.id === id ? { ...p, [field]: value } : p));
  };

  const handlePromoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const pData = PROMOS_DATA[val];
    if (pData) {
      const ts = Date.now();
      const newProducts = pData.list.map((item, i) => ({
        id: ts + i,
        name: item.n,
        size: "",
        qty: item.q,
        colorLines: [],
        promoName: pData.comboData
      }));
      
      setProducts((prev: any[]) => [...prev, ...newProducts]);
      setCustomComboName((prev: string) => prev ? prev + " + " + pData.comboData : pData.comboData);
      
      if (pData.price) {
        setPromoPrice((prev: any) => {
          const prevNum = parseFloat(prev);
          const current = isNaN(prevNum) ? 0 : prevNum;
          return current + pData.price;
        });
      }
    }
    e.target.value = "";
  };

  const handleAddManualPromo = () => {
    const pName = newPromoName.trim();
    const pVal = parseFloat(newPromoPrice);
    const pQty = parseInt(newPromoQty, 10) || 1;
    const validPrice = !isNaN(pVal) && pVal > 0;

    if (pName || validPrice) {
      const baseName = pName || "Promo Especial";
      let comboDesc = baseName;
      
      if (validPrice) {
         comboDesc = `${baseName} ${pQty} X ${pVal}`;
      } else if (pQty > 1) {
         comboDesc = `${baseName} ${pQty}X`;
      }
      
      setCustomComboName((prev: string) => prev ? prev + " + " + comboDesc : comboDesc);
      
      if (validPrice) {
        setPromoPrice((prev: any) => {
          const prevNum = parseFloat(prev);
          return (isNaN(prevNum) ? 0 : prevNum) + pVal;
        });
      }

      setProducts((prev: any[]) => [...prev, {
        id: Date.now(),
        name: baseName,
        size: "",
        qty: pQty,
        colorLines: [],
        promoName: comboDesc
      }]);

      setNewPromoName("");
      setNewPromoPrice("");
      setNewPromoQty("1");
    }
  };

  const normalizePolName = (name: string) => {
    const tl = name.trim().toLowerCase();
    return Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl) || null;
  };

  const addColorLine = (id: number, color: string) => {
    setProducts(products.map((p: any) => {
      if (p.id === id) {
        if (p.colorLines.find((c: any) => c.color === color)) return p;
        return { ...p, colorLines: [...p.colorLines, { color, qty: 1 }] };
      }
      return p;
    }));
  };

  const removeColorLine = (id: number, color: string) => {
    setProducts(products.map((p: any) => {
      if (p.id === id) {
        return { ...p, colorLines: p.colorLines.filter((c: any) => c.color !== color) };
      }
      return p;
    }));
  };

  const updateColorQty = (id: number, color: string, delta: number) => {
    setProducts(products.map((p: any) => {
      if (p.id === id) {
        return {
          ...p,
          colorLines: p.colorLines.map((c: any) => c.color === color ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
        };
      }
      return p;
    }));
  };

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="products-header" style={{ display: 'block' }}>
        <h2>Productos Overshark</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
          <input
            list="lista-polos-overshark"
            placeholder="Elegir producto promo..."
            className="form-input"
            style={{ flex: '1', minWidth: '150px', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', borderRadius: '4px' }}
            value={newPromoName}
            onChange={(e) => setNewPromoName(e.target.value)}
          />
          <input
            placeholder="Cant"
            type="number"
            min="1"
            className="form-input"
            style={{ width: '60px', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', borderRadius: '4px' }}
            value={newPromoQty}
            onChange={(e) => setNewPromoQty(e.target.value)}
          />
          <input
            placeholder="S/ Total"
            className="form-input"
            style={{ width: '80px', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', borderRadius: '4px' }}
            value={newPromoPrice}
            onChange={(e) => setNewPromoPrice(e.target.value)}
          />
          <button
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.8rem', background: '#1a2733', border: 'none', color: '#fff' }}
            onClick={handleAddManualPromo}
          >+</button>

          <span style={{ margin: '0 0.5rem', color: '#1a2733' }}>|</span>

          <input
            placeholder="Nombre de promo (total)"
            className="form-input"
            style={{ flex: '1 1 180px', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', borderRadius: '4px' }}
            value={customComboName}
            onChange={e => setCustomComboName(e.target.value)}
          />
          <input
            placeholder="Total S/"
            className="form-input"
            style={{ width: '80px', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', borderRadius: '4px' }}
            value={promoPrice}
            onChange={e => setPromoPrice(e.target.value)}
          />
          <select onChange={handlePromoSelect} style={{ flex: '1', padding: '0.5rem', background: '#0a1017', border: '1px solid #1a2733', color: '#fff', borderRadius: '4px', maxWidth: '200px' }}>
            <option value="">Cargar Promoción...</option>
            {Object.entries(PROMOS_DATA).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-ghost" onClick={addProduct} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#0a1017', border: '1px dashed #1a2733', borderRadius: '24px', fontSize: '0.85rem' }}>+ Añadir producto</button>
      </div>
      <p className="hint">Catálogo <strong>Overshark</strong> (polos). Producto y talla; si hay cuadros de color, cada color es una fila con cantidad.</p>
      
      <div>
        <datalist id="lista-polos-overshark">
          {POLOS_CATALOGO_OVERSHARK.map(p => <option key={p} value={p} />)}
        </datalist>
        {products.map((p: any) => {
          const cfgKey = normalizePolName(p.name);
          const cfg = cfgKey ? POL_VARIANTES_OVERSHARK[cfgKey] : null;
          const tallas = cfg?.tallas || TALLAS_SMLXL;
          const colorList = cfg?.colores ? cfg.colores.split(",").map((c: string) => c.trim()) : [];
          const hasColorLines = p.colorLines.length > 0;

          return (
            <div key={p.id} className="detail-card product-row">
              <div className="product-row-main">
                <div className="cell-name">
                  <label>Producto</label>
                  <input list="lista-polos-overshark" value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} placeholder="Escribe o elige polo..." />
                </div>
                <div className="cell-size prod-size-cell">
                  <label>Talla</label>
                  <div className="prod-size-boxes">
                    <button className="prod-size-btn" aria-pressed={p.size === ""} onClick={() => updateProduct(p.id, 'size', "")}>-</button>
                    {tallas.map((t: string) => (
                      <button key={t} className="prod-size-btn" aria-pressed={p.size === t} onClick={() => updateProduct(p.id, 'size', t)}>{t}</button>
                    ))}
                  </div>
                </div>
                {!hasColorLines && (
                  <div className="prod-qty-cell">
                    <label>Cant.</label>
                    <div className="qty-stepper">
                      <button className="qty-btn" onClick={() => updateProduct(p.id, 'qty', Math.max(1, p.qty - 1))}>−</button>
                      <input value={p.qty} readOnly />
                      <button className="qty-btn" onClick={() => updateProduct(p.id, 'qty', p.qty + 1)}>+</button>
                    </div>
                  </div>
                )}
                <button className="btn btn-secondary rm" onClick={() => removeProduct(p.id)}>Quitar</button>
              </div>

              <div className="product-row-extras visible" style={{ marginTop: '0.75rem' }}>
                <div className="prod-color-extras">
                  <span className="product-row-extras-lbl">Añadir color {colorList.length > 0 ? "(toca un cuadro o escribe uno)" : "(escribe un color)"}</span>
                  
                  {colorList.length > 0 && (
                    <div className="prod-color-grid" style={{ marginBottom: '0.5rem' }}>
                      {colorList.map((c: string) => (
                        <button key={c} className="prod-color-chip" onClick={() => addColorLine(p.id, c)}>{c}</button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Color manual..." 
                      className="form-input" 
                      style={{ flex: 1, maxWidth: '150px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            addColorLine(p.id, val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input) {
                          const val = input.value.trim();
                          if (val) {
                            addColorLine(p.id, val);
                            input.value = '';
                          }
                        }
                      }}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {hasColorLines && (
                <div className="product-color-lines">
                  {p.colorLines.map((cL: any) => (
                    <div key={cL.color} className="prod-color-line">
                      <span className="prod-color-name">{cL.color}</span>
                      <div className="prod-color-qty-wrap">
                        <label>Cant.</label>
                        <div className="qty-stepper">
                          <button className="qty-btn" onClick={() => updateColorQty(p.id, cL.color, -1)}>−</button>
                          <input value={cL.qty} readOnly />
                          <button className="qty-btn" onClick={() => updateColorQty(p.id, cL.color, 1)}>+</button>
                        </div>
                      </div>
                      <button className="btn btn-secondary prod-color-rm" onClick={() => removeColorLine(p.id, cL.color)}>Quitar</button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
