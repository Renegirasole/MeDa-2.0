# Marketing · Semana 4

**Objetivo de la semana:** que Google empiece a encontrar las 50 respuestas rápidas, y arrancar el primer experimento A/B.

## Qué hay nuevo en la web

| Pieza | Dónde | Para qué |
| --- | --- | --- |
| 16 páginas de hipoteca | /cuanto-ganar-para/hipoteca-100000 … hipoteca-400000 | Búsquedas «cuánto ganar para una hipoteca de X» |
| 17 páginas de coche | /que-puedo-permitirme/coche-con-1100 … coche-con-2700 | «qué coche puedo comprar cobrando X» |
| 17 páginas de alquiler | /alquiler-maximo/sueldo-1000 … sueldo-2600 | «cuánto alquiler puedo pagar con X» |
| Índice | /guias → «Respuestas rápidas» | Enlaza las 50 para que Google las rastree |
| Experimento #1 | Calculadoras, mientras no hay números tuyos | Nota de ejemplo en gris frente a nota bloqueada (ver docs/EXPERIMENTOS.md) |
| PostHog (opcional) | Variable NEXT_PUBLIC_POSTHOG_KEY | Ver eventos y el resultado del experimento. Lo tenéis que activar vosotros (10 min) |

Cada página tiene su respuesta arriba, el cálculo explicado, una tabla con las cifras vecinas (enlazadas entre sí), preguntas frecuentes con datos estructurados y la calculadora con el caso ya puesto. Todas las cifras salen de las reglas del motor.

---

## 1. SEO: que Google las encuentre (tarea vuestra, 15 minutos)

1. **Google Search Console** → Añadir propiedad → Dominio → `medaono.com`. Verificad con el registro TXT de DNS: el dominio está en Vercel (team me-da2 → Domains → medaono.com → DNS Records → Add → tipo TXT, nombre `@`, valor el que da Google).
2. Sitemaps → enviar `https://medaono.com/sitemap.xml`.
3. Inspección de URLs → pedid la indexación de estas cinco (las que más se buscan):
   - /guias/sueldo-para-hipoteca
   - /cuanto-ganar-para/hipoteca-200000
   - /cuanto-ganar-para/hipoteca-150000
   - /que-puedo-permitirme/coche-con-1500
   - /alquiler-maximo/sueldo-1500

**Qué mirar en 2–4 semanas** (Search Console → Páginas y Rendimiento):

| Señal | Qué significa | Qué hacer |
| --- | --- | --- |
| «Descubierta, sin indexar» en muchas | Google no las ve útiles todavía | Enlazarlas desde redes y foros; esperar |
| Indexadas pero sin clics | El título no convence | Probar otro título en `titleFor` de cada ruta |
| Un grupo recibe clics y otro no | Ese tipo de búsqueda funciona | Ampliar ese grupo (p. ej. hipotecas de 5.000 en 5.000 €) |

Plan: ampliar solo lo que funcione, hasta unas 300 páginas. No crear más del mismo tipo si Google no indexa las primeras.

---

## 2. La serie de vídeos que sale sola: «¿Qué coche puedo comprar cobrando…?»

Las 17 páginas de coche son 17 vídeos. Formato de 20–30 s:

1. **Gancho:** «¿Qué coche te puedes comprar cobrando 1.500 €?» (texto grande).
2. **Pantalla:** la página /que-puedo-permitirme/coche-con-1500 en el móvil, la respuesta corta.
3. **Revelación:** el precio máximo y «todo el coche no debería pasar de 300 € al mes».
4. **Giro:** «¿Y si lo financias a 84 meses? Llegas a más… y pagas más intereses.» (está en las preguntas frecuentes de la página).
5. **Cierre:** «Comenta tu sueldo y te digo qué coche te da.»

Los comentarios con sueldos son la siguiente tanda. Lo mismo con alquiler («¿Cuánto alquiler puedes pagar cobrando 1.400 €?»), muy compartible en ciudades caras.

## 3. Reddit y foros: enlazar la respuesta exacta

Cuando alguien pregunte «cobro 1.600, ¿cuánto alquiler puedo pagar?», responded con la cifra (plantilla B de la semana 2) y, solo si preguntan de dónde sale, el enlace a su página exacta: medaono.com/alquiler-maximo/sueldo-1600. Una página que responde exactamente a la pregunta no se percibe como spam.

## 4. El experimento de la semana

Ficha completa en docs/EXPERIMENTOS.md. En corto:

- **Qué:** la mitad de las visitas ven la nota de ejemplo en gris (como hasta ahora) y la otra mitad no ven ninguna nota hasta poner sus números.
- **Se mide:** cálculos completados por visita. Sin PostHog no se puede leer: activarlo es lo primero.
- **Cuánto dura:** hasta llegar a unas 3.000 visitas por variante. No se mira para parar antes.

## 5. Revisión del domingo (añadir a la de la semana 2)

- Search Console: ¿cuántas de las 50 están indexadas?
- PostHog: embudo `experimento_visto` → `calculo_completado` por variante (solo mirar que llegan datos, no decidir).
- Vídeos: ¿funciona mejor la serie de coche o la de alquiler? Doblad la que gane.
