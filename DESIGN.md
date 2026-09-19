# MeDa V2 — Sistema de diseño

**Principio:** sofisticado por fuera, sencillo por dentro. El motor puede ser complejo; la pantalla, no.

## Identidad

- **Escala MeDa** (`components/ui/ScoreScale.tsx`): la nota sobre una regla 0–10 con las zonas de veredicto
  (Mejor espera · Justo · Te da) sacadas de `VERDICT_THRESHOLDS`. Es la pieza reconocible de la marca.
- **Logo** (`components/layout/Logo.tsx`): la Escala en miniatura, un medidor con las tres zonas y la aguja en "te da".
  Mismo dibujo en `app/icon.svg` (favicon), `app/apple-icon.tsx` y `app/opengraph-image.tsx`: si cambia uno, cambian todos.
- **Panel oscuro** (`night`) solo en momentos clave: simulación de la home, tasador, "Mis números", pie y CTA final.
- **Una sola familia:** Geist. Cifras siempre con `.num` (tabulares).

## Tokens (`app/globals.css`)

| Grupo | Tokens | Uso |
|---|---|---|
| Superficies | `canvas`, `surface`, `subtle`, `line`, `line-strong` | Fondo, tarjetas, rellenos, bordes |
| Texto | `ink`, `ink-2`, `muted` | Titulares, cuerpo, secundario (≥ 4,5:1 sobre `canvas`) |
| Marca | `brand-50…700` | Único acento: acción principal, "te da", foco |
| Estados | `caution-*`, `alert-*` | Solo veredictos y avisos |
| Oscuro | `night`, `night-2`, `night-line`, `night-muted` | Paneles oscuros |
| Movimiento | `--ease-out`, `--ease-in-out`, `animate-rise`, `animate-fade` | Ver abajo |

Nunca hex sueltos en componentes.

## Tipografía

| Rol | Tamaño |
|---|---|
| Hero | 52 → 80 px, -0,045em |
| H1 página | 36 → 56 px |
| H2 sección | 32 → 44 px |
| Resultado (nota) | 56 → 64 px, cifras tabulares |
| Cuerpo | 15–18 px, interlineado 1,6 |
| Secundario | 13 px mínimo (12 px solo en la escala y etiquetas de partner) |

## Acciones (`components/ui/Button.tsx`)

`primary` (una por vista) · `secondary` · `tertiary` (sin caja) · `destructive` (borra, pide confirmación) · `inverse` (sobre oscuro).
Todas ≥ 44 px de alto y `scale(0.97)` al pulsar.

## Patrones

- **Paso numerado** (`Step`): formularios en pasos, lo esencial a la vista.
- **Divulgación** (`Disclosure`): `<details>` nativo para lo opcional ("Afinar", "Ajustar detalles", "Ver el cálculo exacto").
- **Resultado** (`ResultCard`): veredicto + motivo en una frase (`lib/explain/insight.ts`) + 4 cifras.
- **Por qué** (`FactorList`): 3 factores con barra, dato llano y peso. Fórmula exacta plegada.
- **Partners** (`PartnerLinks`): siempre con etiqueta y aviso de afiliación. Ocultos si ningún plan te da.

## Movimiento

Solo CSS. Menos de 300 ms en interfaz. `transform` y `opacity`, nunca alto o ancho.
Entrada escalonada solo en el hero. Sin animaciones infinitas (salvo el esqueleto de carga).
Con `prefers-reduced-motion` se quitan desplazamientos y se mantienen fundidos de color.

## Reglas de implementación

- `cn()` no fusiona clases: para ocultar según el ancho usa `max-sm:hidden` / `max-md:hidden`, no `hidden sm:flex`, sobre componentes cuya clase base ya fija `display`.
- En rejillas de una columna, `grid-cols-1` (= `minmax(0,1fr)`) para que los campos no ensanchen la página.
- Los `<input>` llevan `w-full min-w-0`.

## Piezas para compartir (semana 3)

- **Imagen de la nota** (`app/api/nota/route.tsx`): 1080×1920 para stories (panel `night`, zona segura: 260 px arriba y 340 px abajo) y 1200×630 para la vista previa de `/nota`. Solo compra, importe y nota (`lib/scorecard.ts`); nunca el perfil.
- **Carrusel** (`app/api/carrusel/route.tsx`): 1080×1350, fondo `canvas`, una cifra grande por diapositiva, portada y cierre en `night`.
- Satori no lee variables CSS: los hex de `lib/og/theme.tsx` son el espejo de los tokens. Fuente: Geist desde `assets/fonts` (OFL).
- Cifras grandes en imágenes: interletraje negativo moderado (≈ −3 % del tamaño) o el punto de los miles se pega.

## Guías (modo lectura)

`components/guides/Guide.tsx`: respuesta corta arriba (panel `night` con 3 cifras), cuerpo a 65 caracteres, tablas con `DataTable` (fila del caso destacada en `brand-50`), preguntas frecuentes con `Disclosure`, calculadora precargada en el lateral (y dentro de la respuesta en móvil). Autoría y fecha visibles; datos estructurados `Article` + `FAQPage`. Las cifras siempre salen del motor (`lib/guides/*`), nunca escritas a mano.
