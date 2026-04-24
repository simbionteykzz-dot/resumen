/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ClientePanel from './components/ClientePanel';
import CuentaPanel from './components/CuentaPanel';
import ProductosPanel from './components/ProductosPanel';
import OutputPanel from './components/OutputPanel';
import PlanillaPanel from './components/PlanillaPanel';
import CierreCajaPanel from './components/CierreCajaPanel';
import { Trash2, PackagePlus, Store, Bike, Package, Truck } from 'lucide-react';
import { POL_PRECIOS_OVERSHARK, ENVIO_PROVINCIA_SOLES, ENVIO_LIMA_SOLES, POL_VARIANTES_OVERSHARK } from './lib/data';

interface ClientData {
  nombre: string; celular: string; dni: string; provincia: string; depto: string; sede: string; ubicacion: string; distrito: string; codigoPublicidad: string;
}

export default function App() {
  const [tab, setTab] = useState<'prov' | 'lima' | 'almacen'>('prov');
  const [clientData, setClientData] = useState<ClientData>({ nombre: "", celular: "", dni: "", provincia: "", depto: "", sede: "Shalom", ubicacion: "", distrito: "", codigoPublicidad: "R-D" });
  const [cuentaData, setCuentaData] = useState({ tipo: 'contra', pago: "", debe: "" });
  const [products, setProducts] = useState<any[]>([]);
  const [customComboName, setCustomComboName] = useState("");
  const [sales, setSales] = useState<any[]>([]);
  const [promoPrice, setPromoPrice] = useState<string | number>("");

  const handleClientChange = (field: keyof ClientData, value: string) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleCuentaChange = (field: string, value: string) => {
    setCuentaData(prev => ({ ...prev, [field]: value }));
  };

  const clearAll = () => {
    setClientData({ nombre: "", celular: "", dni: "", provincia: "", depto: "", sede: "Shalom", ubicacion: "", distrito: "", codigoPublicidad: "R-D" });
    setCuentaData({ tipo: 'contra', pago: "", debe: "" });
    setProducts([]);
    setCustomComboName("");
    setPromoPrice("");
  };

  const getShippingCost = () => {
    if (tab === 'prov') return ENVIO_PROVINCIA_SOLES;
    if (tab === 'lima') return ENVIO_LIMA_SOLES;
    return 0;
  };

  const sumCatalogPolosSoles = () => {
    let sum = 0;
    let hasComboOverride = promoPrice !== "" && Number(promoPrice) > 0;
    let comboMonto = hasComboOverride ? Number(promoPrice) : 0;

    products.forEach(p => {
      // Si el producto pertenece a un combo importado, su precio ya pre-existe en comboMonto
      if (hasComboOverride && p.promoName !== "" && p.promoName != null) {
        return;
      }

      const tl = p.name.trim().toLowerCase();
      const canon = Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl) || null;
      let unit = canon && POL_PRECIOS_OVERSHARK[canon] != null ? Number(POL_PRECIOS_OVERSHARK[canon]) : 0;
      if (isNaN(unit) || unit < 0) unit = 0;

      if (p.colorLines && p.colorLines.length > 0) {
        p.colorLines.forEach((cl: any) => sum += unit * cl.qty);
      } else {
        sum += unit * p.qty;
      }
    });

    return Math.round((comboMonto + sum) * 100) / 100;
  };

  const parseMoneyPE = (raw: string) => {
    if (!raw) return NaN;
    let s = raw.trim().replace(/^S\//i, "").replace(/\s/g, "");
    if (/^[-+]?\d+,\d{1,2}$/.test(s)) s = s.replace(",", ".");
    else s = s.replace(/,/g, "");
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  };

  const calcularTotalPagar = () => {
    let total = sumCatalogPolosSoles() + getShippingCost();
    if (total === 0 && products.length === 0 && (!promoPrice || Number(promoPrice) <= 0)) return 0;
    return Math.max(0, Math.round(total * 100) / 100);
  };

  const totalPagar = calcularTotalPagar();

  useEffect(() => {
    if (cuentaData.tipo === 'completo') {
      setCuentaData(prev => ({ ...prev, debe: "0" }));
    } else {
      if (cuentaData.pago && totalPagar > 0) {
        const pagoN = parseMoneyPE(cuentaData.pago);
        if (!isNaN(pagoN)) {
          let d = totalPagar - pagoN;
          setCuentaData(prev => ({ ...prev, debe: (d < 0 ? 0 : d).toString() }));
        }
      } else if (!cuentaData.pago && products.length > 0) {
        setCuentaData(prev => ({ ...prev, debe: totalPagar.toString() }));
      } else if (products.length === 0) {
        setCuentaData(prev => ({ ...prev, debe: "" }));
      }
    }
  }, [products, promoPrice, tab, cuentaData.pago, cuentaData.tipo]);

  const buildCuentaBlock = () => {
    const texto = cuentaData.tipo === 'contra' ? "Contra entrega" : "Pago completo";
    const shippingValue = tab === 'prov' ? ENVIO_PROVINCIA_SOLES : (tab === 'lima' ? ENVIO_LIMA_SOLES : 0);
    const shippingStr = shippingValue > 0 ? `\nEnvio: ${shippingValue}` : "";

    let block = `\n\n- PAGO -\nForma de pago: ${texto}`;
    block += shippingStr;

    if (cuentaData.pago) block += `\nPago: ${cuentaData.pago}`;
    if (cuentaData.debe) block += `\n\n- DEBE -\nDebe: ${cuentaData.debe}`;
    return block;
  };

  const getProductString = () => {
    if (products.length === 0 && customComboName.trim() === "") return "";
    
    const groups: Record<string, any[]> = {};
    const groupOrder: string[] = [];
    products.forEach(p => {
      const pName = p.promoName || "";
      if (!groups[pName]) { groups[pName] = []; groupOrder.push(pName); }
      groups[pName].push(p);
    });

    const finalBlocks: string[] = [];
    groupOrder.forEach(gName => {
      const isCustom = gName !== "";
      let groupTotalQty = 0;
      const productLines: string[] = [];
      
      groups[gName].forEach((p: any) => {
        const sizePart = p.size ? ` (talla ${p.size})` : "";
        if (p.colorLines && p.colorLines.length > 0) {
          const subs: string[] = [];
          
          if (!isCustom) {
            let label = `*${p.name}`;
            if (p.qty > 1) {
              const itemTotal = POL_PRECIOS_OVERSHARK[p.name] || 0;
              label += ` ${p.qty} X ${itemTotal * p.qty}`;
            }
            productLines.push(`${label}*`);
            productLines.push(`- ${p.name}${sizePart}`);
          } else {
            productLines.push(`- ${p.name}${sizePart}`);
          }
          
          p.colorLines.forEach((cl: any) => {
            groupTotalQty += cl.qty;
            let sub = "  - " + cl.color.toUpperCase();
            if (cl.qty !== 1) sub += ` × ${cl.qty}`;
            subs.push(sub);
          });
          productLines.push(subs.join("\n"));
        } else {
          groupTotalQty += p.qty;
          if (isCustom) {
            if (p.name && p.name !== gName) {
                productLines.push(`- ${p.qty}x ${p.name}${sizePart} (sin color)`);
            } else {
                productLines.push(`- ${p.qty} prendas${sizePart} (sin color)`);
            }
          } else {
            let label = `*${p.name}`;
            if (p.qty > 1) {
               const itemTotal = POL_PRECIOS_OVERSHARK[p.name] || 0;
               label += ` ${p.qty} X ${itemTotal * p.qty}`;
            }
            productLines.push(`${label}${sizePart}*`);
          }
        }
      });
      
      const groupBlocks = [];
      if (isCustom) {
        groupBlocks.push(`*${gName}*`);
      }
      groupBlocks.push(...productLines);
      finalBlocks.push(groupBlocks.join("\n"));
    });

    if (finalBlocks.length === 0 && customComboName.trim() !== "") {
        finalBlocks.push(`*${customComboName.trim()}*`);
    }

    return "\n\n- PRODUCTO -\n" + finalBlocks.join("\n\n") + "\n";
  };

  const outputStr = (() => {
    let t = "";
    if (tab === 'prov') {
      t = `➖OVERSHARK — DATOS PROVINCIA 🚌🚌\n` +
          `🫵🏻Nombre: ${clientData.nombre}\n` +
          `📲 Celular: ${clientData.celular}\n` +
          `💳Numero DNI : ${clientData.dni}\n` +
          `🗣️Provincia: ${clientData.provincia}\n` +
          `😎 Departamento: ${clientData.depto}\n` +
          `📌SEDE de agencia: *(${clientData.sede || 'Shalom'})*` +
          buildCuentaBlock() + getProductString() +
          `\n\nCADENITA DE REGALO 🎁\n\nVENDEDOR SANDRO\n\n⏰ Te enviarán tu voucher entre 48 a 72 horas máximo`;
    } else if (tab === 'lima') {
      t = `➖OVERSHARK — DATOS DELIVERY 🏍️🏍️\n` +
          `🫵🏻Nombre: ${clientData.nombre}\n` +
          `📲 Celular: ${clientData.celular}\n` +
          `😎 Distrito: ${clientData.distrito}\n` +
          `📌Ubicacion: ${clientData.ubicacion}` +
          buildCuentaBlock() + getProductString() +
          `\n\nCADENITA DE REGALO 🎁\n\nVENDEDOR SANDRO\n\n⏰ Los pedidos salen al día siguiente entre las 11 AM y a lo largo de la tarde/noche del día`;
    } else {
      t = `➖OVERSHARK — RECOJO EN ALMACÉN 🏭🏭\n` +
          `🫵🏻Nombre: ${clientData.nombre}\n` +
          `📲 Celular: ${clientData.celular}\n` +
          `💳Numero DNI : ${clientData.dni}\n` +
          buildCuentaBlock() + getProductString() +
          `\n\nCADENITA DE REGALO 🎁\n\nVENDEDOR SANDRO`;
    }
    return t.replace(/\s+$/, "");
  })();

  const formatTipoComboSheet = () => {
    const orderedNames: string[] = [];
    const seen: Record<string, boolean> = {};
    let totalQty = 0;

    products.forEach(p => {
      const tl = p.name.trim().toLowerCase();
      const canon = Object.keys(POL_VARIANTES_OVERSHARK).find(k => k.toLowerCase() === tl) || null;
      const label = String(canon || p.name).toUpperCase().replace(/\s+/g, " ").trim();
      if (label && !seen[label]) { seen[label] = true; orderedNames.push(label); }
      
      if (p.colorLines && p.colorLines.length > 0) {
        p.colorLines.forEach((cl: any) => totalQty += cl.qty);
      } else {
        totalQty += p.qty;
      }
    });

    if (totalQty < 1) return "";
    if (customComboName.trim() !== "") return `${totalQty} ${customComboName.trim()}`;

    const namesStr = orderedNames.join(" ");
    if (tab === 'lima') {
      let outLima = `${totalQty} ${namesStr}`.trim();
      return outLima.length > 320 ? outLima.slice(0, 317) + "..." : outLima;
    }

    const env = getShippingCost();
    const catSum = sumCatalogPolosSoles();
    const base = catSum > 0 ? catSum : 0;
    let net = base > 0 ? Math.round((base - env) * 100) / 100 : 0;
    if (net < 0) net = 0;

    let priceStr = "";
    if (base > 0) priceStr = net % 1 === 0 ? String(Math.round(net)) : net.toFixed(2);

    let out = `${namesStr}    ${totalQty}${priceStr !== "" ? " X " + priceStr : ""}`;
    return out.length > 320 ? out.slice(0, 317) + "..." : out;
  };

  const pushSale = () => {
    if (!clientData.celular && !clientData.nombre) return;
    const now = new Date();
    const hora = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let totalQty = 0;
    products.forEach(p => {
      if (p.colorLines && p.colorLines.length > 0) {
        p.colorLines.forEach((cl: any) => totalQty += cl.qty);
      } else {
        totalQty += p.qty;
      }
    });

    const isCompleto = cuentaData.tipo === 'completo';
    const newSale = {
      cel: clientData.celular,
      nom: clientData.nombre,
      dni: clientData.dni,
      hora,
      codigoPublicidad: clientData.codigoPublicidad || "R-D",
      marcaLabel: "OVER",
      limaMark: tab === "lima" ? "X" : "",
      provMark: tab === "prov" ? "X" : "",
      separo: isCompleto ? "" : cuentaData.pago,
      resta: isCompleto ? "" : cuentaData.debe,
      pagoCompletoTxt: isCompleto ? totalPagar.toString() : "",
      combo: formatTipoComboSheet(),
      qtyN: totalQty,
      totalTotal: totalPagar
    };

    setSales([...sales, newSale]);
  };

  return (
    <div className="wrap" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header className="app-header" style={{ marginBottom: '2rem', padding: '1rem', background: '#080d12', borderRadius: '12px', border: '1px solid #1a2733', display: 'flex', alignItems: 'center' }}>
        <div className="app-icon" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #00e696, #00a36b)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#000' }}><Truck size={24} /></div>
        <div className="app-header-text">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Resumen de compra</h1>
          <p style={{ color: '#638d99', fontSize: '0.9rem', margin: 0 }}>Elige el tipo de envío y los productos. El texto se genera solo — solo cópialo al chat.</p>
        </div>
      </header>

      <div className="tabs-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border2)', paddingBottom: '1rem' }}>
        <div className="tabs" style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', borderRadius: '40px', padding: '6px', border: '1px solid var(--surface3)' }}>
          <button 
            style={{ 
              borderRadius: '30px', 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              background: tab === 'prov' ? 'var(--accent)' : 'transparent', 
              color: tab === 'prov' ? '#000' : 'var(--muted)', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              transition: 'all 0.2s',
              outline: 'none'
            }} 
            onClick={() => setTab('prov')}
          >
            <Package size={16} /> Provincia (Shalom)
          </button>
          <button 
            style={{ 
              borderRadius: '30px', 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              background: tab === 'lima' ? 'var(--accent)' : 'transparent', 
              color: tab === 'lima' ? '#000' : 'var(--muted)', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              transition: 'all 0.2s',
              outline: 'none'
            }} 
            onClick={() => setTab('lima')}
          >
            <Bike size={16} /> Delivery Lima
          </button>
          <button 
            style={{ 
              borderRadius: '30px', 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              background: tab === 'almacen' ? 'var(--accent)' : 'transparent', 
              color: tab === 'almacen' ? '#000' : 'var(--muted)', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              transition: 'all 0.2s',
              outline: 'none'
            }} 
            onClick={() => setTab('almacen')}
          >
            <Store size={16} /> Recojo almacén
          </button>
        </div>
        <button 
          className="btn-borrar-todo" 
          onClick={clearAll} 
          title="Borra todos los datos de golpe" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '40px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Trash2 size={16}/> Borrar todo
        </button>
      </div>

      <ClientePanel tab={tab} data={clientData} onChange={handleClientChange} />
      
      <CuentaPanel data={cuentaData} onChange={handleCuentaChange} totalPagar={totalPagar} />

      <ProductosPanel 
        products={products} 
        setProducts={setProducts} 
        customComboName={customComboName} 
        setCustomComboName={setCustomComboName} 
        promoPrice={promoPrice}
        setPromoPrice={setPromoPrice}
      />

      <OutputPanel outputText={outputStr} onRefresh={() => {}} onAddSale={pushSale} />

      <CierreCajaPanel sales={sales} />

      <PlanillaPanel sales={sales} />

    </div>
  );
}
