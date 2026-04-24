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

// Distritos de Lima con coordenadas aproximadas del centro de cada distrito
const DISTRITOS_LIMA_COORDS = [
  { nombre: "Miraflores", lat: -12.1198, lon: -77.0292 },
  { nombre: "San Isidro", lat: -12.0953, lon: -77.0364 },
  { nombre: "Surco", lat: -12.1481, lon: -76.9947 },
  { nombre: "San Borja", lat: -12.1015, lon: -77.0004 },
  { nombre: "La Molina", lat: -12.0797, lon: -76.9419 },
  { nombre: "Surquillo", lat: -12.1129, lon: -77.0136 },
  { nombre: "Barranco", lat: -12.1461, lon: -77.0208 },
  { nombre: "Chorrillos", lat: -12.1686, lon: -77.0178 },
  { nombre: "San Miguel", lat: -12.0772, lon: -77.0864 },
  { nombre: "Magdalena", lat: -12.0903, lon: -77.0725 },
  { nombre: "Pueblo Libre", lat: -12.0768, lon: -77.0631 },
  { nombre: "Jesús María", lat: -12.0725, lon: -77.0408 },
  { nombre: "Lince", lat: -12.0831, lon: -77.0314 },
  { nombre: "Breña", lat: -12.0600, lon: -77.0500 },
  { nombre: "Lima", lat: -12.0464, lon: -77.0428 },
  { nombre: "Cercado de Lima", lat: -12.0464, lon: -77.0428 },
  { nombre: "Rímac", lat: -12.0311, lon: -77.0414 },
  { nombre: "San Juan de Lurigancho", lat: -11.9789, lon: -77.0047 },
  { nombre: "Ate", lat: -12.0453, lon: -76.9053 },
  { nombre: "Santa Anita", lat: -12.0464, lon: -76.9678 },
  { nombre: "La Victoria", lat: -12.0681, lon: -77.0189 },
  { nombre: "San Luis", lat: -12.0792, lon: -76.9975 },
  { nombre: "El Agustino", lat: -12.0461, lon: -76.9967 },
  { nombre: "Los Olivos", lat: -11.9756, lon: -77.0711 },
  { nombre: "San Martín de Porres", lat: -12.0167, lon: -77.0861 },
  { nombre: "Independencia", lat: -11.9933, lon: -77.0547 },
  { nombre: "Comas", lat: -11.9386, lon: -77.0533 },
  { nombre: "Carabayllo", lat: -11.8653, lon: -77.0431 },
  { nombre: "Puente Piedra", lat: -11.8597, lon: -77.0731 },
  { nombre: "Ancón", lat: -11.7533, lon: -77.1758 },
  { nombre: "Villa El Salvador", lat: -12.2039, lon: -76.9386 },
  { nombre: "Villa María del Triunfo", lat: -12.1628, lon: -76.9381 },
  { nombre: "San Juan de Miraflores", lat: -12.1572, lon: -76.9736 },
  { nombre: "Pachacámac", lat: -12.2492, lon: -76.8631 },
  { nombre: "Lurín", lat: -12.2739, lon: -76.8731 },
  { nombre: "Punta Hermosa", lat: -12.3347, lon: -76.8236 },
  { nombre: "Punta Negra", lat: -12.3583, lon: -76.7975 },
  { nombre: "San Bartolo", lat: -12.3856, lon: -76.7772 },
  { nombre: "Santa María del Mar", lat: -12.3872, lon: -76.7681 },
  { nombre: "Pucusana", lat: -12.4756, lon: -76.7972 },
  { nombre: "Callao", lat: -12.0564, lon: -77.1181 },
  { nombre: "Bellavista", lat: -12.0717, lon: -77.1156 },
  { nombre: "La Perla", lat: -12.0692, lon: -77.1081 },
  { nombre: "Carmen de la Legua", lat: -12.0519, lon: -77.0922 },
  { nombre: "Ventanilla", lat: -11.8761, lon: -77.1181 },
  { nombre: "Mi Perú", lat: -12.0172, lon: -77.1272 },
];

// Función para calcular distancia entre dos puntos en km (fórmula de Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Detectar distrito de Lima más cercano basado en coordenadas
export function detectarDistritoLima(lat: number, lon: number): string | null {
  // Verificar que esté en el área de Lima aproximadamente
  if (lon < -77.3 || lon > -76.7 || lat < -12.5 || lat > -11.7) {
    return null; // Fuera del área de Lima
  }

  let distritoMasCercano = null;
  let distanciaMinima = Infinity;

  for (const distrito of DISTRITOS_LIMA_COORDS) {
    const distancia = calcularDistancia(lat, lon, distrito.lat, distrito.lon);
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      distritoMasCercano = distrito.nombre;
    }
  }

  // Solo retornar si está dentro de un radio razonable (15 km del centro del distrito)
  return distanciaMinima < 15 ? distritoMasCercano : null;
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
