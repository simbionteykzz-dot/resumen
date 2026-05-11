// Short WhatsApp-friendly phrases per product (1-2 lines max)
export const FRASES_RESUMEN: Record<string, string[]> = {
  "BABY TY": [
    "El Baby Ty más suave que vas a tocar — ¡ideal para el día a día!",
    "Tela premium que no se deforma. ¡Calidad Overshark garantizada!",
    "Tendencia total — se agota rápido, ¡aprovecha ahora!",
  ],
  "BABY TY MANGA": [
    "Baby Ty Manga Larga — fit perfecto para días frescos.",
    "Suave, ceñido y con estilo. ¡Tu closet lo necesita!",
    "La versión manga larga del polo más vendido.",
  ],
  "CAMISA WAFFLE": [
    "Textura waffle premium — se siente diferente, se ve INCREÍBLE.",
    "Elegante pero relajada. ¡Perfecta para cualquier ocasión!",
    "Botones + textura waffle = tu outfit sube de nivel.",
  ],
  "CAMISERO PIKE": [
    "Tela piqué clásica que grita calidad en cada detalle.",
    "Duradero y con cuerpo — se mantiene como nuevo siempre.",
    "El polo tipo polo por excelencia, con sello Overshark.",
  ],
  "CLASICO": [
    "Simple, limpio, PERFECTO — nuestro bestseller por algo.",
    "Se ve bien con TODO. ¡No puede faltar en tu closet!",
    "Colores que no se destiñen + corte impecable.",
  ],
  "CUELLO CHINO": [
    "Cuello mao moderno — sofisticado sin esfuerzo.",
    "Perfecto para impresionar en cenas o reuniones.",
    "Un diseño que pocos tienen y todos quieren copiar.",
  ],
  "CUELLO CHINO WAFFLE": [
    "Cuello Chino + Waffle = la combinación más elegante.",
    "Dos tendencias en una sola prenda. ¡Otro nivel!",
    "Para los que buscan algo diferente y con personalidad.",
  ],
  "JERSEY MANGA LARGA": [
    "Tu mejor amigo para los días frescos. ¡Imprescindible!",
    "Tela jersey premium — abrigado sin sentirte pesado.",
    "7 por S/99 — stockéate para todo el invierno.",
  ],
  "WAFFLE": [
    "La textura Waffle es adictiva — pruébala y no querrás otra cosa.",
    "Se siente premium porque ES premium. ¡Calidad real!",
    "6 por S/99 — la promo más loca para el polo más suave.",
  ],
  "WAFFLE CAMISERO": [
    "Waffle + cuello camisero = elegancia de temporada.",
    "Se ve como camisa pero se siente como polo. ¡Lo mejor!",
    "4 por S/99 — textura premium con look formal.",
  ],
  "WAFFLE MANGA LARGA": [
    "La textura que amas, ahora para todas las estaciones.",
    "Ideal para días frescos sin sacrificar estilo.",
    "Se ve increíble arremangado o con mangas completas.",
  ],
  "CUELLO NOTCH PIQUE": [
    "El cuello notch le da un aire moderno y sofisticado.",
    "5 por S/99 — el polo más elegante al mejor precio.",
    "Tela piqué + diseño que marca la diferencia.",
  ],
  "CUELLO NOTCH WAFLE": [
    "Cuello Notch + Waffle = diseño único, solo en Overshark.",
    "4 por S/99 — textura waffle con el cuello más moderno.",
    "El polo que hará que todos pregunten dónde lo compraste.",
  ],
};

// Cross-sell recommendations: product name suggestions per model
export const RECOMENDACIONES_RESUMEN: Record<string, string[]> = {
  "BABY TY":             ["Baby Ty Manga Larga", "Baby Ty Escotado"],
  "BABY TY MANGA":       ["Baby Ty manga corta", "Camisa Waffle"],
  "CAMISA WAFFLE":       ["Waffle Camisero", "Cuello Chino Waffle"],
  "CAMISERO PIKE":       ["Cuello Notch Piqué", "Waffle Camisero"],
  "CLASICO":             ["Waffle", "Camisero Piqué"],
  "CUELLO CHINO":        ["Cuello Chino Waffle", "Cuello Notch Piqué"],
  "CUELLO CHINO WAFFLE": ["Cuello Chino clásico", "Waffle Camisero"],
  "JERSEY MANGA LARGA":  ["Waffle Manga Larga", "Clásico"],
  "WAFFLE":              ["Waffle Camisero", "Waffle Manga Larga"],
  "WAFFLE CAMISERO":     ["Waffle manga corta", "Camisa Waffle"],
  "WAFFLE MANGA LARGA":  ["Waffle manga corta", "Jersey Manga Larga"],
  "CUELLO NOTCH PIQUE":  ["Cuello Notch Waffle", "Camisero Piqué"],
  "CUELLO NOTCH WAFLE":  ["Cuello Notch Piqué", "Waffle"],
};
