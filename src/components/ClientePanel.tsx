import { Search, MapPin, CheckCircle2, XCircle, ChevronDown, RotateCcw, RefreshCw, Package, Bike, Store } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { DISTRITOS } from '../lib/data';
import { searchSedes, checkCob, parseCoords, updateSedes, getSedesCount } from '../lib/geo';
import DropdownPortal from './DropdownPortal';

async function sha256Hmac(message: string, secret: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", keyMaterial, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ClientePanel({ tab, data, onChange }: any) {
  const [sedeQuery, setSedeQuery] = useState(data.sede || "Shalom");
  const [sedeResults, setSedeResults] = useState<any[]>([]);
  const [showSedeDrop, setShowSedeDrop] = useState(false);
  const sedeInputRef = useRef<HTMLInputElement>(null);
  const [updatingSedes, setUpdatingSedes] = useState(false);
  const [sedesCount, setSedesCount] = useState(getSedesCount());

  const [distQuery, setDistQuery] = useState(data.distrito || "");
  const [distResults, setDistResults] = useState<string[]>([]);
  const [showDistDrop, setShowDistDrop] = useState(false);
  const distInputRef = useRef<HTMLInputElement>(null);

  const [cobStatus, setCobStatus] = useState<number>(-1);

  const handleUpdateSedes = async () => {
    setUpdatingSedes(true);
    try {
      const uuid = `web-${crypto.randomUUID()}`;
      const time = Math.floor(Date.now() / 1000) + 30;
      const raw = `${uuid}@${time}`;
      const hash = await sha256Hmac(raw, '.Ov3rsku112024l4r43l.');
      const authToken = `${raw}@${hash}`;

      const res = await fetch('https://serviceswebapi.shalomcontrol.com/api/v1/web/agencias/listar', {
        method: 'POST',
        body: new FormData(),
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((a: any) => ({
          n: a.nombre,
          dist: a.zona,
          prov: a.provincia,
          dep: a.departamento,
          addr: a.direccion,
          lat: parseFloat(a.latitud) || 0,
          lon: parseFloat(a.longitud) || 0
        }));
        updateSedes(mapped);
        setSedesCount(getSedesCount());
        setSedeResults(searchSedes(sedeQuery, 14)); // Refresh results if any
      } else {
        alert("Error de Shalom: " + (json.message || "Desconocido"));
      }
    } catch (err: any) {
      alert("Error al conectar con servidor: " + err.message);
    } finally {
      setUpdatingSedes(false);
    }
  };

  const handleSedeSearch = (val: string) => {
    setSedeQuery(val);
    onChange('sede', val);
    if (!val || val.toLowerCase() === "shalom") {
      setShowSedeDrop(false);
      return;
    }
    const res = searchSedes(val, 14);
    setSedeResults(res);
    setShowSedeDrop(true);
  };

  const selectSede = (s: any) => {
    let loc = [];
    if (s.dist && s.dist !== s.prov) loc.push(s.dist);
    if (s.prov) loc.push(s.prov);
    const label = "Shalom " + s.n + (loc.length ? " - " + loc.join(", ") : "");
    setSedeQuery(label);
    onChange('sede', label);
    onChange('depto', s.prov || "");
    onChange('provincia', s.dep || "");
    setShowSedeDrop(false);
  };

  const handleDistSearch = (val: string) => {
    setDistQuery(val);
    onChange('distrito', val);
    if (!val) {
      setShowDistDrop(false);
      return;
    }
    const nq = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const res = DISTRITOS.filter(d => d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(nq));
    setDistResults(res);
    setShowDistDrop(true);
  };

  const handleUbicacion = (val: string) => {
    onChange('ubicacion', val);
    const coords = parseCoords(val);
    if (coords) {
      setCobStatus(checkCob(coords.lon, coords.lat));
    } else {
      setCobStatus(-1);
    }
  };

  const detectIp = () => {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(r => r.json())
      .then(d => {
        const city = d.city || d.region;
        if(city) handleDistSearch(city);
      })
      .catch(() => {});
  };

  return (
    <>
      {tab === 'prov' && (
        <div className="panel always" style={{ marginTop: '1.25rem' }}>
          <div className="cliente-panel-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={18} /> Datos provincia — Shalom
            </h2>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>NOMBRE COMPLETO</label>
            <input value={data.nombre} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre y apellido" className="form-input" />
            <label>CELULAR</label>
            <input value={data.celular} onChange={e => onChange('celular', e.target.value)} placeholder="9xxxxxxxx" className="form-input" />
            <label>NÚMERO DNI</label>
            <input value={data.dni} onChange={e => onChange('dni', e.target.value)} placeholder="12345678" className="form-input" />
            <label>CÓDIGO DE PUBLICIDAD</label>
            <input value={data.codigoPublicidad} onChange={e => onChange('codigoPublicidad', e.target.value)} placeholder="Live" className="form-input" />
            <label>DEPARTAMENTO</label>
            <input value={data.provincia} onChange={e => onChange('provincia', e.target.value)} placeholder="Ej. La Libertad" className="form-input" />
            <label>PROVINCIA</label>
            <input value={data.depto} onChange={e => onChange('depto', e.target.value)} placeholder="Ej. Trujillo" className="form-input" />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ margin: 0 }}>SEDE SHALOM — BUSCA POR DISTRITO, PROVINCIA O DIRECCIÓN</label>
              <button 
                onClick={handleUpdateSedes} 
                disabled={updatingSedes}
                className="btn btn-secondary" 
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Sincronizar red de agencias de Shalom en tiempo real"
              >
                <RefreshCw size={12} className={updatingSedes ? "fa-spin" : ""} /> {updatingSedes ? "Sincronizando..." : "Actualizar Sedes"}
              </button>
            </div>
            <div className="sede-wrap">
              <div className="sede-row" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input
                  ref={sedeInputRef}
                  value={sedeQuery}
                  onChange={e => handleSedeSearch(e.target.value)}
                  onFocus={() => setSedeQuery("")}
                  placeholder="Escribe para buscar sedes…"
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary sede-clear" onClick={() => handleSedeSearch("Shalom")} style={{ height: '42px', padding: '0 1rem' }}><RotateCcw size={16}/></button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>Busca por <span style={{color: '#fff', fontWeight: 'bold'}}>distrito</span>, <span style={{color: '#fff', fontWeight: 'bold'}}>provincia</span>, <span style={{color: '#fff', fontWeight: 'bold'}}>departamento</span> o <span style={{color: '#fff', fontWeight: 'bold'}}>dirección</span>. Al elegir, se completan los campos arriba automáticamente.</div>
            </div>

            <DropdownPortal
              isOpen={showSedeDrop}
              anchorRef={sedeInputRef}
              onClose={() => setShowSedeDrop(false)}
              className="sede-dropdown-portal"
            >
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> <strong style={{ color: '#fff' }}>{sedesCount}</strong> sedes cargadas
                </span>
                {sedeResults.length > 0 && <span>{sedeResults.length} resultados</span>}
              </div>
              {sedeResults.length === 0 ? <div className="sede-empty">Sin resultados</div> :
                sedeResults.map((s, i) => (
                  <div key={i} className="sede-item" onClick={() => selectSede(s)}>
                    <div className="sede-item-name">{s.n}</div>
                    <div className="sede-item-loc" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={12} opacity={0.7} /> {s.prov}, {s.dep}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{s.addr}</div>
                  </div>
                ))
              }
            </DropdownPortal>
          </div>
        </div>
      )}

      {tab === 'lima' && (
        <div className="panel always" style={{ marginTop: '1.25rem' }}>
          <div className="cliente-panel-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bike size={18} /> Delivery Lima
            </h2>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>NOMBRE COMPLETO</label>
            <input value={data.nombre} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre y apellido" className="form-input" />
            <label>NÚMERO CELULAR</label>
            <input value={data.celular} onChange={e => onChange('celular', e.target.value)} placeholder="9xxxxxxx" className="form-input" />
            <label>DNI</label>
            <input value={data.dni} onChange={e => onChange('dni', e.target.value)} placeholder="12345678" className="form-input" />
            <label>CÓDIGO DE PUBLICIDAD</label>
            <input value={data.codigoPublicidad} onChange={e => onChange('codigoPublicidad', e.target.value)} placeholder="Live" className="form-input" />
            <label>UBICACIÓN EN TIEMPO REAL (MANDAR)</label>
            <input value={data.ubicacion} onChange={e => handleUbicacion(e.target.value)} placeholder="Link o referencia de ubicación" className="form-input" />
            
            {cobStatus !== -1 && (
              <div className={`cob-badge visible ${cobStatus === 0 ? 'dentro' : 'fuera'}`}>
                <div className="cob-badge-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cobStatus === 0 ? <CheckCircle2 size={24} color="#00e696" /> : <XCircle size={24} color="#ef4444" />}
                </div>
                <div className="cob-badge-text">
                  <div className="cob-badge-msg">{cobStatus === 0 ? 'Dentro de cobertura ZAZU' : 'Fuera de cobertura ZAZU'}</div>
                </div>
              </div>
            )}

            <label>DISTRITO</label>
            <div className="dist-wrap" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input
                  ref={distInputRef}
                  value={distQuery}
                  onChange={e => handleDistSearch(e.target.value)}
                  onFocus={() => distQuery && setShowDistDrop(true)}
                  placeholder="Escribe para buscar distrito..."
                  className="form-input"
                />
              </div>
              <button className="btn btn-secondary" onClick={detectIp} title="Detectar" style={{ height: '42px', padding: '0 1rem' }}><MapPin size={16}/></button>
            </div>

            <DropdownPortal
              isOpen={showDistDrop}
              anchorRef={distInputRef}
              onClose={() => setShowDistDrop(false)}
              className="dist-dropdown-portal"
            >
              {distResults.map((d, i) => (
                <div key={i} className="dist-opt" onClick={() => { setDistQuery(d); onChange('distrito', d); setShowDistDrop(false); }}>{d}</div>
              ))}
            </DropdownPortal>
          </div>
        </div>
      )}

      {tab === 'almacen' && (
        <div className="panel always" style={{ marginTop: '1.25rem' }}>
          <div className="cliente-panel-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Store size={18} /> Recojo almacén
            </h2>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label>NOMBRE COMPLETO</label>
            <input value={data.nombre} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre y apellido" className="form-input" />
            <label>CELULAR</label>
            <input value={data.celular} onChange={e => onChange('celular', e.target.value)} placeholder="9xxxxxxx" className="form-input" />
            <label>NÚMERO DNI</label>
            <input value={data.dni} onChange={e => onChange('dni', e.target.value)} placeholder="12345678" className="form-input" />
            <label>CÓDIGO DE PUBLICIDAD</label>
            <input value={data.codigoPublicidad} onChange={e => onChange('codigoPublicidad', e.target.value)} placeholder="Live" className="form-input" />
          </div>
        </div>
      )}
    </>
  );
}
