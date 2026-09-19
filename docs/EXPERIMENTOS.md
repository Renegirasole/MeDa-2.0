# Experimentos

Cómo medimos y probamos cambios en MeDa sin cookies ni banner de consentimiento.

## Medición

- **Vercel Analytics** (siempre activo): visitas, páginas y de dónde llega la gente. En el plan Hobby **no guarda los eventos propios** (`calculo_completado`, `clic_partner`…).
- **PostHog** (opcional, gratis hasta 1 millón de eventos al mes): recibe los mismos eventos que `lib/analytics.ts` y permite embudos y comparar variantes. Se activa solo si existe `NEXT_PUBLIC_POSTHOG_KEY`.

Privacidad: a PostHog solo llegan el nombre del evento, la página y propiedades sin datos personales (categoría, veredicto, nota redondeada, variante). No hay cookies ni almacenamiento: el identificador vive en memoria y cambia en cada carga de página, y no se crean perfiles de persona (`$process_person_profile: false`).

### Activar PostHog (10 minutos, lo tenéis que hacer vosotros)

1. Cread una cuenta en https://eu.posthog.com (región UE) con holamedaono@gmail.com.
2. Proyecto nuevo → copiad la **Project API key** (empieza por `phc_`).
3. Desde la carpeta MeDa 2.0:
   ```
   npx vercel env add NEXT_PUBLIC_POSTHOG_KEY production
   ```
   (pegad la clave) y desplegad con un commit vacío y push.
4. En PostHog: Activity → deberían aparecer `$pageview` y `calculo_empezado` al usar la web.
5. Si la privacidad cambia (p. ej. activáis grabaciones de sesión), hay que actualizar /legal/privacidad y /legal/cookies. Con esta configuración no hace falta.

## Cómo trabajamos

1. Hipótesis escrita antes: «Porque [dato], creemos que [cambio] hará [efecto]. Lo sabremos si [métrica]».
2. Tamaño de muestra fijado antes. No se mira el resultado para parar antes de tiempo.
3. Un cambio por prueba, de 2 a 4 semanas.
4. Cada resultado, gane o pierda, se apunta abajo.

La variante se sortea en cada carga de página (`lib/experiments.ts`). Por eso la unidad es la visita a la calculadora, no la persona.

---

## #1 · Nota de ejemplo: gris o bloqueada

**Estado:** en marcha desde el despliegue de la semana 4. Solo cuenta si PostHog está activo.

**Hipótesis:** porque una nota calculada con números de otra persona puede parecer la tuya (y en la semana 1 ya la pasamos a gris), creemos que **no enseñar ninguna nota hasta que pongas tus números** hará que más gente complete el cálculo. Lo sabremos si sube `calculo_completado` por visita.

| | Control · «gris» | Variante · «bloqueada» |
| --- | --- | --- |
| Qué ve | La nota de ejemplo en gris con la etiqueta «Ejemplo» y el aviso de que es de alguien que gana 2.100 € | «Tu nota –/10», la escala vacía y «Pon tus ingresos…». Solo el coste al mes y lo que sale de ahorros |
| Reparto | 50 % | 50 % |

- **Métrica principal:** visitas con `calculo_completado` ÷ visitas con `experimento_visto` (por variante, propiedad `exp_nota_ejemplo` / `variante`).
- **Secundaria:** `calculo_empezado` ÷ `experimento_visto`.
- **Salvaguarda:** que no suba el abandono sin tocar nada (visitas con `experimento_visto` y sin `calculo_empezado`).
- **Tamaño:** con una tasa base del ~10 % y buscando una mejora del 20 %, unas **3.000 visitas por variante**. Con menos tráfico, dejadlo correr hasta llegar; no lo paréis antes.
- **Cómo leerlo en PostHog:** Insights → Funnel: `experimento_visto` → `calculo_completado`, desglosado por `variante`.
- **Decisión:** si «bloqueada» gana con significación, se queda; si pierde o empata, se vuelve a «gris» cambiando `active: false` en `lib/experiments.ts` (el control es la primera variante).

**Resultado:** _pendiente_.

---

## Siguientes en la cola (por ICE)

| # | Hipótesis | Métrica | ICE |
| --- | --- | --- | --- |
| 2 | Precio en el botón del partner («Coches hasta 16.805 €») frente a «Buscar en coches.net» | `clic_partner` | 7,7 (ya aplicado en la semana 2; medir antes/después) |
| 3 | Simulación mínima arriba en la home móvil | `calculo_empezado` | 7,0 (hecho en la semana 6, medir antes/después) |
| 5 | Gancho con números en la home («¿Cobras 1.500 €?…») | `calculo_empezado` | 6,7 |
| 4 | «Descargar mi nota» como botón principal | `compartir` | 6,3 (aplicado en la semana 3) |
| 6 | «Avísame» solo con «Mejor espera» frente a siempre | `lista_email` | 6,0 |
