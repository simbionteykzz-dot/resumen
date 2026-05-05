import React, { useState } from 'react';
import { Copy, Check, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const OBJECIONES: { titulo: string; emoji: string; color: string; respuesta: string }[] = [
  {
    titulo: "Es muy caro",
    emoji: "💰",
    color: "239, 68, 68",
    respuesta: `¡Entiendo! Pero mirá — cada polo cuesta menos de S/20 en promo 🔥\n\nComparalo con cualquier tienda: misma calidad te sale S/50-70 por UNO. Acá te llevas 5 o más al mismo precio 💎\n\n¡Y te regalamos cadenita! Más barato imposible 🎁`,
  },
  {
    titulo: "Lo voy a pensar",
    emoji: "🤔",
    color: "250, 204, 21",
    respuesta: `¡Claro, tómate tu tiempo! Pero te cuento que esta promo es por tiempo limitado ⏳\n\nHoy ya vendimos varios de estos modelos y el stock se está acabando. Si se agotan, el precio vuelve a S/45 cada uno 📈\n\n¿Te separo uno mientras decides? Sin compromiso 😉`,
  },
  {
    titulo: "No me convence el color",
    emoji: "🎨",
    color: "56, 200, 245",
    respuesta: `¡Tenemos más de 15 colores disponibles! 🌈\n\nAzul, negro, beige, cemento, vino, plomo, topo... ¡Seguro hay uno que te encanta!\n\n¿Qué colores usas más? Te ayudo a elegir la combinación perfecta 👕✨`,
  },
  {
    titulo: "No conozco la marca",
    emoji: "🏷️",
    color: "0, 230, 150",
    respuesta: `¡Overshark es una marca peruana con miles de clientes satisfechos! 🇵🇪\n\nTenemos +500 ventas solo esta semana. Calidad premium, tela que no se deforma y colores que no se destiñen 💯\n\nPregúntale a cualquiera que ya compró — ¡siempre vuelven! 🔥`,
  },
  {
    titulo: "Envío muy caro",
    emoji: "🚚",
    color: "255, 107, 0",
    respuesta: `El envío es S/12-14, ¡pero incluye seguro y tracking! 📦\n\nAdemás piensa: te ahorras el pasaje, el tiempo y la molestia de ir a buscar. ¡Te llega a la puerta de tu casa! 🏠\n\nY con la cantidad que llevas, el envío sale prácticamente gratis por prenda 😎`,
  },
  {
    titulo: "En otro lado es más barato",
    emoji: "⚖️",
    color: "168, 85, 247",
    respuesta: `¡Compará calidad por calidad! 💎\n\nNuestros polos son tela premium, costura reforzada y colores que duran. Los "baratos" se deforman a la segunda lavada 🫠\n\nAdemás con nuestras promos te llevas 5-10 polos por S/99. ¡Eso no lo encuentras en ningún lado! 🔥`,
  },
];

export default function RespuestasPanel() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  return (
    <div className="panel always" style={{ marginTop: '1.25rem' }}>
      <div className="cliente-panel-head" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <MessageSquare size={20} /> Respuestas Rápidas
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Objeciones frecuentes</span>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--muted)' }} />}
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.65rem', marginTop: '0.25rem' }}>
          {OBJECIONES.map((obj, i) => (
            <div
              key={i}
              className="booster-card"
              style={{
                padding: '0.9rem 1rem',
                background: `linear-gradient(135deg, rgba(${obj.color}, 0.07), rgba(${obj.color}, 0.02))`,
                border: `1.5px solid rgba(${obj.color}, 0.2)`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleCopy(obj.respuesta, i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '1rem' }}>{obj.emoji}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: `rgb(${obj.color})` }}>
                    "{obj.titulo}"
                  </span>
                </div>
                <div style={{
                  width: '1.8rem', height: '1.8rem', borderRadius: '6px', flexShrink: 0,
                  background: copiedIdx === i ? `rgba(${obj.color}, 0.2)` : 'rgba(26, 39, 51, 0.5)',
                  border: `1px solid rgba(${obj.color}, 0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {copiedIdx === i ? <Check size={12} style={{ color: `rgb(${obj.color})` }} /> : <Copy size={12} style={{ color: 'var(--muted)' }} />}
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45, whiteSpace: 'pre-line', maxHeight: '3.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {obj.respuesta.split('\n')[0]}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
