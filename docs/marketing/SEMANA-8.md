# Marketing · Semana 8 — Lanzamiento iPhone (orgánico)

**Objetivo:** aprovechar el pico de búsquedas del iPhone nuevo para que MeDa entre en la conversación con el ángulo que nadie usa: no «qué cámara lleva», sino **«¿te lo puedes permitir de verdad?»**.

**Canal:** orgánico en TikTok, Reels y Shorts. Vertical 9:16. Vídeos de 20–35 s.

---

## 1. Lo que ha salido de verdad (corrige el brief)

No hay «iPhone 18» a secas: Apple no ha sacado el modelo base todavía. Lo que está en venta en apple.com/es a 23/09/2026:

| Modelo | Desde (256 GB) | Tope de gama | Notas |
| --- | --- | --- | --- |
| iPhone 17 | 1.109 € | 1.359 € (512 GB) | El «barato» de la gama actual |
| **iPhone 18 Pro** | **1.469 €** | 2.969 € (2 TB) | Novedad |
| **iPhone 18 Pro Max** | **1.619 €** | 3.119 € (2 TB) | Novedad |
| **iPhone Duo** (plegable) | **2.339 €** | **3.839 €** (2 TB) | Reserva **16/10 14:00**, a la venta **23/10** |

Dos consecuencias para el contenido:

1. Decid «el iPhone 18 Pro» o «el iPhone nuevo», nunca «iPhone 18» a secas: quien lo sabe os corrige en comentarios y perdéis autoridad.
2. **El plegable es el gancho**: 3.839 € por un móvil es la cifra que hace que la gente pare el scroll. Y tiene dos fechas (16/10 y 23/10) para dos olas de contenido.

---

## 2. Lo que dice nuestro propio motor (cifras reales, no inventadas)

Calculado con `evaluateOne` y la categoría Tecnología (referencia 6 % de los ingresos, colchón objetivo 3 meses de gastos).

**iPhone 18 Pro, 1.469 €, al contado. Sueldo 1.800 €, gastos 1.300 €:**

| Ahorros | Nota | Veredicto |
| --- | --- | --- |
| 1.000 € | **1,5** | No te da (no llegas ni a pagarlo) |
| 2.000 € | **4,9** | Mejor espera |
| 3.000 € | **4,9** | Mejor espera |
| 5.000 € | **6,9** | Te da, pero justo |
| 7.000 € | **9,9** | Sí, te da |

**El titular:** para que un iPhone de 1.469 € «te dé» de verdad, no hacen falta 1.469 € — hacen falta unos **7.000 € ahorrados**. Ese es el vídeo.

**La paradoja (con 6.000 € ahorrados en todos los casos):**

| Sueldo | Gastos | Nota |
| --- | --- | --- |
| 1.200 € | 840 € | **10** |
| 2.000 € | 1.400 € | **9,5** |
| 3.200 € | 2.240 € | **6,9** |

Cobrar más da **peor** nota, porque el colchón se mide en meses de *tus* gastos. Contraintuitivo = se comparte.

---

## 3. Aviso de producto: no hagáis todavía el vídeo de «contado vs plazos»

Mismo perfil (1.800 € / 1.300 € / 2.500 € ahorrados), iPhone 18 Pro:

| Forma de pago | Nota | Intereses |
| --- | --- | --- |
| Al contado | 4,9 | 0 € |
| 24 meses al 0 % | 6,9 | 0 € |
| 24 meses al 12 % | **6,9** | **191 €** |
| 36 meses al 15 % | **6,9** | **364 €** |

**Pagar 364 € de intereses da exactamente la misma nota que no pagar ninguno.** El tope del colchón aplasta la diferencia, así que ahora mismo la web dice «financiar sale mejor» sin penalizar el interés. Publicar eso sería mal consejo y nos come la credibilidad, que es lo único que tenemos.

→ Arreglar en `lib/engine/scoring.ts` antes de tocar este ángulo. Cuando esté, el vídeo «te cobran 364 € por esperar menos» es de los mejores que podemos hacer.

---

## 4. Contenidos

Numeración siguiendo la serie (el último fue V13).

### V14 · Cuánto hay que tener ahorrado de verdad
- **Gancho (0–3 s):** «El iPhone nuevo cuesta 1.469 €. Para que te dé, necesitas tener 7.000 € ahorrados. Te explico por qué.»
- **Desarrollo:** grabación de pantalla de medaono.com metiendo sueldo 1.800, gastos 1.300 y ahorro 1.000 → sale **1,5**. Subir el ahorro a 3.000 → **4,9**. A 7.000 → **9,9**.
- **Giro:** «No es que no te llegue. Es que te quedas sin colchón. Pagarlo y quedarte a cero no es podértelo permitir.»
- **Cierre:** «Pon tus números en medaono.com. Gratis y sin registrarte.»

### V15 · El plegable cuesta más que un coche
- **Gancho:** «El iPhone plegable de 2 TB son 3.839 €. Con eso te compras un coche.»
- **Desarrollo:** al lado, coches.net filtrado a 3.800 € (la calculadora de coche ya lleva el filtro puesto). Pasar el precio del móvil por la calculadora de Tecnología y el coche por la de Coche.
- **Giro:** el coche tiene seguro, gasolina y mantenimiento; el móvil no. La nota puede salir mejor en el coche aunque cueste lo mismo.
- **Cierre:** «Mismo dinero, dos notas distintas. Míralo en medaono.com.»
- **Cuándo:** subir el **15/10**, víspera de que abran las reservas.

### V16 · Cobrar más no significa que te dé más
- **Gancho:** «Dos personas quieren el mismo iPhone. Una cobra 1.200 € y otra 3.200 €. A la que cobra menos le da. Mira.»
- **Desarrollo:** las dos simulaciones en pantalla, mismo ahorro de 6.000 €: **10** contra **6,9**.
- **Giro:** «Porque el colchón no se mide en euros, se mide en meses de tus gastos. El que gasta 2.240 € al mes necesita 6.720 € solo para estar tranquilo.»
- **Cierre:** «¿Tú en qué lado estás? medaono.com»

### V17 · Lo que te cuesta en horas de tu vida
- **Gancho:** «1.469 € con el sueldo medio español son 12 días trabajando. El plegable, un mes entero.»
- **Desarrollo:** cálculo en pantalla y la nota de MeDa al lado.
- **Cierre:** «Si te sigue compensando, adelante. Pero decídelo con el número delante.»

### V18 · Reacción a comentarios
- **Gancho:** «Me habéis pedido que mire si os da para el iPhone con vuestros sueldos. Vamos.»
- Coger 3 comentarios reales de V14/V15 y calcularlos en directo. Si aún no hay, usar casos de r/askspain o r/SpainFIRE, sin nombres.
- **Cierre:** «Dejad el vuestro y lo miro en el próximo.»

### C1 · Carrusel «Los iPhone de 2026 y lo que necesitas ahorrado»
7 diapositivas, formato 1080×1350: portada con la pregunta, una por modelo con precio real y ahorro necesario, una con la paradoja del colchón, y cierre con medaono.com.

**Hazlo con el generador de la web, no a mano:** ya existe `/api/carrusel?guia=hipoteca|coche&n=1…7`, que pinta las diapositivas con la tipografía y los colores de la marca y las cifras salidas del motor. Falta añadir `guia=iphone`: es media hora de trabajo y deja el carrusel reproducible cada vez que cambien los precios. Pedídmelo y lo hago.

---

## 5. Prompts para Grok

**Regla de oro:** Grok hace el *ambiente*, la web hace los *números*. Nada de pedirle a una IA que dibuje la interfaz de MeDa ni un iPhone: los logos y las pantallas salen deformados y se nota a un kilómetro. Las pantallas se graban de medaono.com y el móvil se graba de verdad o se coge de imágenes de prensa de Apple.

**Texto en pantalla:** no lo pidáis en el prompt. Los generadores escriben mal en español. Texto y cifras se ponen luego en CapCut con la tipografía de la marca.

**Formato en todos:** `9:16 vertical, 1080x1920`.

### Para V14 (b-roll del gancho)
```
Cinematic vertical video, 9:16. Young Spanish woman, 26, sitting on the edge of
her bed in a small modern apartment in Madrid, evening light through the window.
She is holding her phone, looking at it with a worried but calm expression, then
sets it face down on her knee and exhales. Shot on 35mm, shallow depth of field,
natural warm light, muted colour grade, no text, no logos, no brand names.
Handheld, slight movement. 6 seconds.
```

### Para V15 (el contraste móvil / coche)
```
Cinematic vertical video, 9:16. Split-second contrast: a used silver hatchback
car parked on a quiet Spanish residential street in the late afternoon, then a
close-up of an empty open hand, palm up, as if holding something invisible.
Documentary style, natural light, muted greens and greys, 35mm, no text, no
logos, no brand names, no people's faces. 6 seconds.
```

### Para V16 (la paradoja de los dos sueldos)
```
Cinematic vertical video, 9:16. Two young Spanish adults in their late twenties
standing apart against a plain light grey wall, one on the left in simple work
clothes, one on the right in office clothes, both looking straight at the camera,
neutral expressions, symmetrical composition, soft even studio light, minimal
modern aesthetic, muted colour palette of white, grey and soft green. No text,
no logos. Static shot, 5 seconds.
```

### Para V17 (el tiempo de trabajo)
```
Cinematic vertical video, 9:16. Time passing in a workplace: hands typing on a
laptop keyboard, a coffee cup going cold beside it, light on the desk shifting
from morning to dusk in a smooth time-lapse. Modern minimal desk, white surface,
one small green plant. Shallow depth of field, natural light, muted colour grade,
no text, no logos, no faces. 6 seconds.
```

### Para la portada del carrusel C1 (imagen fija)
```
Minimal product-style photograph, vertical 4:5. A clean matte white surface with
soft natural side light and long gentle shadows, completely empty except for a
single small stack of euro coins on the right third of the frame. Scandinavian
minimal aesthetic, muted palette, lots of negative space on the left for text,
high detail, no text, no logos, no devices. Shot on 50mm.
```

### Plantilla para pedirle más a Grok
```
Cinematic vertical video, 9:16, [ESCENA COTIDIANA ESPAÑOLA CONCRETA], [HORA DEL
DÍA Y LUZ], [EMOCIÓN DE LA PERSONA, sin exagerar], shot on 35mm, shallow depth of
field, muted colour grade of white, grey and soft green, documentary style,
no text, no logos, no brand names. [4-8] seconds.
```

---

## 6. Piezas listas para usar hoy

La web ya genera la **nota como imagen de story 1080×1920**. Abrid la URL en el navegador y guardad la imagen:

| Qué enseña | URL |
| --- | --- |
| No te da (1,5) · iPhone 1.469 € | `https://medaono.com/api/nota?c=tecnologia&n=1.5&i=1469` |
| Mejor espera (4,9) · 1.469 € | `https://medaono.com/api/nota?c=tecnologia&n=4.9&i=1469` |
| Sí, te da (9,9) · 1.469 € | `https://medaono.com/api/nota?c=tecnologia&n=9.9&i=1469` |
| Plegable 2.339 € | `https://medaono.com/api/nota?c=tecnologia&n=4.9&i=2339` |
| Plegable 2 TB 3.839 € | `https://medaono.com/api/nota?c=tecnologia&n=1.5&i=3839` |

Son las tres notas del mismo móvil: sirven de cierre de vídeo y de story con encuesta («¿cuál crees que es la tuya?»).

---

## 7. Calendario

| Día | Pieza | Nota |
| --- | --- | --- |
| Lun 28/09 | V14 | El de más recorrido: abre la serie |
| Mié 30/09 | C1 (carrusel) | Instagram; en TikTok como foto-carrusel |
| Vie 02/10 | V16 | La paradoja: el que más se comparte |
| Mié 15/10 | V15 | Víspera de las reservas del plegable |
| Vie 17/10 | V18 (reacciones) | Con comentarios ya acumulados |
| Jue 23/10 | V17 | Día de salida del plegable |

Publicar entre 19:00 y 22:00. Primera línea del texto = el gancho del vídeo. 3–5 hashtags: #iphone18 #finanzaspersonales #ahorro #sueldo #españa.

---

## 8. Qué mirar a los 15 días

- Visitas a `/calculadoras/tecnologia` y cuántas acaban en un resultado.
- Clics salientes a Amazon desde esa calculadora (es la única monetización activa ahí).
- Qué vídeo trae mejor **tiempo en la web**, no cuál tiene más visitas: 10.000 visitas que rebotan valen menos que 500 que calculan.
- Comentarios pidiendo otros productos: cada uno es un vídeo gratis.
