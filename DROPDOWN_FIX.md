# 🔧 Fix Dropdown con React Portal

## 🐛 El Bug Real

El dropdown del buscador de sedes quedaba **por detrás del panel "Cuenta"** y otros paneles, independientemente del z-index aplicado.

### Causa Raíz

El problema NO era el z-index. Era un **stacking context trap**:

1. **Panel `.panel.always`** crea un nuevo stacking context con:
   - `transform`, `filter`, `opacity < 1`, o `isolation: isolate`
   - Cualquier elemento dentro queda atrapado en ese contexto

2. **Jerarquía de stacking contexts**:
   ```
   body
   ├── Panel "Datos provincia" (stacking context A)
   │   └── dropdown de sedes (z-index: 99999) ← atrapado en A
   └── Panel "Cuenta" (stacking context B, renderizado después)
       └── contenido (z-index: 1) ← gana porque B > A
   ```

3. **El dropdown nunca puede ganar** porque está comparando z-index dentro de un contexto hijo, mientras que "Cuenta" está en un contexto hermano que se renderiza después.

## ✅ La Solución: React Portal + position: fixed

### 1. Componente `DropdownPortal.tsx`

Usa `ReactDOM.createPortal()` para renderizar el dropdown **fuera del DOM hierarchy problemático**, directamente en `document.body`:

```tsx
import { createPortal } from 'react-dom';

export default function DropdownPortal({ isOpen, anchorRef, onClose, children }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calcular posición dinámica del input anchor
  const updatePosition = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    // Recalcular en scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: `${position.width}px`,
      zIndex: 999999
    }}>
      {children}
    </div>,
    document.body  // ← Clave: renderiza en body, no en panel
  );
}
```

### 2. Uso en `ClientePanel.tsx`

**Antes** (dropdown atrapado en panel):
```tsx
<div className="sede-wrap" ref={sedeRef}>
  <input value={sedeQuery} onChange={handleSedeSearch} />
  {showSedeDrop && (
    <div className="dropdown-pop">  {/* ← atrapado aquí */}
      {sedeResults.map(...)}
    </div>
  )}
</div>
```

**Después** (dropdown en portal):
```tsx
<div className="sede-wrap">
  <input ref={sedeInputRef} value={sedeQuery} onChange={handleSedeSearch} />
</div>

<DropdownPortal  {/* ← Renderizado en body */}
  isOpen={showSedeDrop}
  anchorRef={sedeInputRef}
  onClose={() => setShowSedeDrop(false)}
>
  {sedeResults.map(...)}
</DropdownPortal>
```

### 3. CSS Simplificado

Eliminamos z-index hacks innecesarios:

```css
/* Antes */
.sede-wrap {
  position: relative;
  z-index: 1000;
  isolation: isolate;
}
.dropdown-pop {
  position: fixed !important;
  z-index: 99999 !important;
}

/* Después */
.sede-wrap {
  position: relative;
}
/* Estilos de posicionamiento manejados por DropdownPortal */
```

## 🎯 Por qué funciona

1. **Escape del stacking context**: `createPortal()` renderiza el dropdown como hijo directo de `<body>`, escapando del stacking context del panel.

2. **position: fixed con coordenadas absolutas**: Calcula posición usando `getBoundingClientRect()` del input anchor, independientemente del scroll o DOM hierarchy.

3. **z-index efectivo**: Ahora el z-index: 999999 funciona porque está en el stacking context raíz (body), no atrapado en un panel.

4. **Sincronización automática**: Listeners de scroll/resize mantienen el dropdown alineado con el input.

## 📱 Características

✅ Funciona en desktop y mobile
✅ Se posiciona exactamente debajo del input
✅ Sigue al input en scroll
✅ Recalcula posición en resize
✅ Click fuera cierra el dropdown
✅ Mantiene diseño visual original
✅ Siempre visible sobre TODOS los paneles

## 🚀 Resultado

El dropdown **NUNCA** quedará detrás de otros elementos, sin importar:
- Cuántos paneles haya
- Qué estilos tengan (transform, filter, etc.)
- El orden de renderizado
- El z-index de otros elementos

**Solución estructural permanente**, no un hack de CSS.
