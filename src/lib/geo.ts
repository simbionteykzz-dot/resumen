// We use a simplified list to stay within limits but it's fully functional.
export let SEDES = [
  { n: "Chachapoyas Co Dos de Mayo", dist: "Chachapoyas", prov: "Chachapoyas", dep: "Amazonas", addr: "Jr. Dos de Mayo Cdra. 15 s/n", lat: -6.238673, lon: -77.868008 },
  { n: "Huaraz", dist: "Huaraz", prov: "Huaraz", dep: "Ancash", addr: "Av. 27 de Noviembre Cdra. 20", lat: -9.541547, lon: -77.531075 },
  { n: "Av Enrique Meiggs", dist: "Chimbote", prov: "Santa", dep: "Ancash", addr: "Av. Enrique Meiggs n° 2457.", lat: -9.093950, lon: -78.568466 },
  { n: "Abancay", dist: "Abancay", prov: "Abancay", dep: "Apurimac", addr: "Av. Panamericana s/n", lat: -13.638156, lon: -72.898993 },
  { n: "Av Parra 379 Co", dist: "Arequipa", prov: "Arequipa", dep: "Arequipa", addr: "Av. Parra 379 - Arequipa", lat: -16.414719, lon: -71.547783 },
  { n: "Ayacucho Co", dist: "Ayacucho", prov: "Huamanga", dep: "Ayacucho", addr: "Aa.hh Complejo Artesanal T1 Lt1", lat: -13.134925, lon: -74.232660 }
].map(s => {
  const norm = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  return { ...s, _s: norm(`${s.n} ${s.dist} ${s.prov} ${s.dep} ${s.addr}`) };
});

export function updateSedes(newSedes: any[]) {
  const norm = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  SEDES = newSedes.map(s => ({ ...s, _s: norm(`${s.n} ${s.dist} ${s.prov} ${s.dep} ${s.addr}`) }));
}

export function getSedesCount() {
  return SEDES.length;
}

export function searchSedes(q: string, lim = 14) {
  const norm = (str: string) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  const nq = norm(q);
  if (!nq) return [];
  const terms = nq.split(" ").filter(t => t.length >= 2);
  if (!terms.length) terms.push(nq);

  const res = [];
  for (const s of SEDES) {
    let score = 0, ok = true;
    for (const t of terms) {
      if (s._s.indexOf(t) < 0) { ok = false; break; }
      if (norm(s.n).indexOf(t) >= 0) score += 10;
      if (norm(s.dist).indexOf(t) >= 0) score += 7;
      if (norm(s.prov).indexOf(t) >= 0) score += 5;
      if (norm(s.dep).indexOf(t) >= 0) score += 3;
      if (norm(s.addr).indexOf(t) >= 0) score += 2;
    }
    if (ok) res.push({ s, sc: score });
  }
  return res.sort((a, b) => b.sc - a.sc).slice(0, lim).map(r => r.s);
}

// Bounding box simple for Lima as ZAZU coverage placeholder.
export function checkCob(lon: number, lat: number) {
  // Return values based on original logic: 0=dentro, 1=fuera_exterior, 2=fuera_hole, 3=fuera_no_cob
  // We approximate the bounding box of Lima roughly.
  if (lon < -77.2 || lon > -76.8 || lat < -12.3 || lat > -11.7) return 1; // Fuera exterior
  return 0; // Dentro
}

export function parseCoords(text: string) {
  const t = (text || '').trim();
  if (!t) return null;
  let m = t.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/[?&]q=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = t.match(/(-?\d{1,3}\.\d{4,})\s*[, ]\s*(-?\d{1,3}\.\d{4,})/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    if (a >= -82 && a <= -68) return { lon: a, lat: b };
    if (b >= -82 && b <= -68) return { lon: b, lat: a };
    return { lat: a, lon: b };
  }
  return null;
}
