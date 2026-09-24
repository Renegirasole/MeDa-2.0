# MeDa V2 — ¿Me da para esto?

Herramienta web gratuita y sin registro que responde, antes de comprar, si una compra encaja en tu situación real. Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4.

## Arrancar

```bash
npm install
cp .env.example .env.local   # rellenar lo que aplique
npm run dev                  # http://localhost:3000
npm test                     # tests del motor financiero
npm run typecheck
```

## Diseño

Sistema de diseño, tokens y reglas en [DESIGN.md](DESIGN.md).

## Arquitectura: tres capas que no se mezclan

```
lib/engine/     Motor financiero determinista. TypeScript puro, sin React ni red.
                Mismas entradas → mismas cifras. Es la única fuente de números.
lib/ai/         Capa de IA opcional. Recibe un paquete cerrado de cifras ya
                calculadas (facts.ts), nunca datos crudos. guard.ts descarta la
                respuesta entera si contiene un número que no estaba en los datos.
components/     UI. Solo pinta lo que devuelve el motor.
```

Resto de `lib/`:

| Ruta | Qué hay |
|---|---|
| `lib/data/categories.ts` | Las 10 calculadoras: SEO, valores por defecto, `guideline` (peso razonable del gasto sobre ingresos) |
| `lib/data/travel.ts` | Precios de referencia de viajes (orígenes/destinos revisados a mano). Fecha de actualización en `TRAVEL_REFERENCE_UPDATED` |
| `lib/viajes/` | Viajes a cualquier parte del mundo: `lugares.ts` (buscador y catálogo, puro), `paises.ts` (índice de precios, roaming, eSIM), `resolver.ts` (convierte una ciudad en cifras para el motor), `traslados.ts`, `fuentes.ts` (Aviasales: autocompletado y precios) y `hooks.ts` |
| `lib/data/appraisal.ts` | Configuración del tasador (piso venta/alquiler, coche) |
| `lib/explain/template.ts` | Explicación en lenguaje llano sin IA (siempre disponible) |
| `lib/storage/` | Perfil guardado en `localStorage`, sincronizado entre pestañas |
| `lib/share.ts` | Compartir resultados sin servidor: token en el `#hash`, nunca llega a logs |
| `lib/affiliates.ts` | **Único punto de monetización por afiliación** |
| `lib/copy.ts` | Todo el copy de veredictos, planes y avisos |

## Cómo puntúa (resumen)

Nota 0–10 = 40 % esfuerzo mensual + 30 % margen que te queda + 30 % colchón tras la compra, con topes duros (no llega la entrada → máx. 1,5; margen negativo → máx. 2,5; colchón crítico → máx. 4,9…). Todo se publica en `/como-calculamos`, generado desde el propio código para que web y motor no diverjan.

## Rutas

`/` · `/mi-situacion` (noindex) · `/calculadoras` · `/calculadoras/[categoria]` (10, estáticas) · `/viajes` · `/comparar` · `/combinar` · `/tasador` · `/tasador/[tipo]` · `/como-calculamos` · `/anunciate` · `/legal/[slug]` · `/api/explain` · `/api/lugares` · `/api/vuelos` · `sitemap.xml` · `robots.txt`

## Escalar

- **Nueva calculadora**: añade una entrada en `lib/data/categories.ts` (y sus enlaces en `lib/affiliates.ts`). La ruta, el sitemap y la tarjeta de la home salen solos.
- **Nuevo destino de viaje**: no hace falta tocar nada. El buscador cubre cualquier ciudad con aeropuerto del mundo (`/api/lugares`) y estima el gasto con el índice de precios de su país. Añadir el destino a `lib/data/travel.ts` sirve para darle cifras revisadas a mano y su propio «qué ver»; si está a menos de 25 km de lo que elija la persona, se usa esa ficha.
- **Cambiar la fórmula**: toca `lib/engine/scoring.ts` y ejecuta `npm test`; los tests fijan los ejemplos que se ven en la home.

## Antes de producción

1. Datos del titular en `.env` (`NEXT_PUBLIC_LEGAL_*`) y revisión de los textos legales por un profesional.
2. Sustituir URLs de `lib/affiliates.ts` por los deep links aprobados (Awin, Amazon, Booking, Skyscanner…).
3. IA opcional: `NEXT_PUBLIC_AI_ENABLED=true` + `ANTHROPIC_API_KEY`. El rate limit de `/api/explain` es en memoria: con más de una instancia, moverlo a Upstash/Redis.
3b. Viajes: `TRAVELPAYOUTS_TOKEN` (precios reales de vuelo) y `TRAVELPAYOUTS_MARKER` (comisión). Sin ellos el planificador funciona igual, con la estimación por distancia.
4. Analítica sin cookies (Plausible/Umami) si se quiere medir clics salientes sin banner de consentimiento.
5. Campañas de Google Ads: `NEXT_PUBLIC_GOOGLE_ADS_ID` (AW-…) monta la etiqueta con modo de consentimiento v2, y
   `NEXT_PUBLIC_GOOGLE_ADS_PARTNER_LABEL` (la etiqueta de la acción de conversión) hace que el clic a partner cuente
   como conversión. Sin las dos, no se carga nada de Google Ads.
