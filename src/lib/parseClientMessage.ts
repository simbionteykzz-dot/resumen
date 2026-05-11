import { GoogleGenAI } from '@google/genai';

export interface ParsedSaleData {
  nombre?: string;
  celular?: string;
  dni?: string;
  provincia?: string;
  depto?: string;
  distrito?: string;
  products?: Array<{
    name: string;
    size?: string;
    qty: number;
    colorLines?: Array<{ color: string; qty: number }>;
  }>;
}

export async function parseClientMessage(
  message: string,
  catalogo: string[],
): Promise<ParsedSaleData> {
  const apiKey = (process.env.GEMINI_API_KEY as string) || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Eres un asistente que extrae datos de mensajes informales de clientes de una tienda de ropa peruana. Los mensajes pueden tener errores ortográficos, abreviaciones, emojis o estar desordenados. Responde SOLO con JSON válido, sin markdown ni explicaciones.

Catálogo disponible (usa el nombre EXACTO en mayúsculas): ${catalogo.join(', ')}

Mensaje del cliente:
"""
${message}
"""

Devuelve este JSON (omite campos que no encuentres):
{
  "nombre": "nombre completo",
  "celular": "9 dígitos empezando con 9, solo números",
  "dni": "exactamente 8 dígitos, solo números",
  "provincia": "departamento o región peruana (ej: La Libertad, Arequipa, Lima)",
  "depto": "ciudad o provincia dentro del departamento (ej: Trujillo, Arequipa, Chiclayo)",
  "distrito": "distrito de Lima si aplica (ej: Miraflores, San Isidro, SJL)",
  "products": [
    {
      "name": "nombre EXACTO del catálogo en MAYÚSCULAS",
      "size": "S | M | L | XL si se menciona",
      "qty": 1,
      "colorLines": [{ "color": "color", "qty": 1 }]
    }
  ]
}

Reglas importantes:
- Detecta nombres aunque estén en minúsculas o con faltas ortográficas
- Un número de 9 dígitos que empieza con 9 es celular; uno de 8 dígitos es DNI
- Mapea el producto al nombre más cercano del catálogo aunque esté abreviado o mal escrito (ej: "clásico" → CLASICO, "wafle" → WAFFLE, "baby" → BABY TY)
- Si hay colores mencionados, ponlos en colorLines con su cantidad individual
- Si no hay colores, deja colorLines como []
- qty es la cantidad total de esa prenda
- Ciudades como Trujillo van en depto, su región (La Libertad) en provincia
- Responde SOLO el JSON`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text ?? '';
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean) as ParsedSaleData;
}
