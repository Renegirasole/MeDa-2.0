# Marketing · Semana 3

**Objetivo de la semana:** que cada nota pueda acabar en una story, y publicar la primera pieza del pilar Vivienda en tres formatos (guía en la web, carrusel y vídeo).

**Qué hay nuevo en la web**

| Pieza | Dónde | Para qué |
| --- | --- | --- |
| «Descargar mi nota» | Calculadoras → bloque «Guárdalo o compártelo» | Imagen vertical 1080×1920 con la compra y la nota. En el móvil abre la hoja de compartir (Instagram, WhatsApp); en el ordenador, descarga. Nunca lleva sueldo ni ahorros. |
| Enlace con vista previa | «Compartir enlace» → medaono.com/nota?… | En WhatsApp, X o Telegram se ve la nota en la vista previa. Quien lo abre va a la calculadora con la misma compra puesta. |
| Quiénes somos | medaono.com/quienes-somos | Confianza (Google mira con lupa las webs de dinero). |
| Guía de hipoteca | medaono.com/guias/sueldo-para-hipoteca | Captar búsquedas tipo «cuánto tengo que ganar para una hipoteca de 200.000 €». |
| Carrusel e imágenes | docs/marketing/semana-3/ | Listos para subir. Se regeneran con `npx tsx scripts/exportar-imagenes.ts`. |

---

## 1. Stories con la nota

La nota ya es un anuncio. Cuando grabéis un vídeo de la serie «¿Le da para esto?», sacad también la imagen:

1. Meted el perfil del guion en la calculadora (los de la semana 2).
2. Pulsad **Descargar mi nota** → subidla a stories.
3. Encima, un sticker de encuesta: **«¿Le da?» Sí / No**. Después, otra story con la respuesta y el sticker de enlace a medaono.com.

Ejemplos ya generados con el motor (perfiles de los guiones V1, V3 y V4) en `docs/marketing/semana-3/stories/`. Las notas son las que da la web, no inventadas: V1 (coche de 16.000 € con 1.400 € de sueldo) saca un 3,3.

**Pedid a la gente que la comparta:** en los vídeos, cerrad con «Descarga tu nota y súbela: a ver a quién le da».

---

## 2. La guía de la semana: hipoteca de 200.000 €

**Respuesta que hay que repetir en todas partes (citable, también por ChatGPT o Gemini):**

> Para una hipoteca de 200.000 € a 30 años al 3 %, la cuota es de unos 843 € al mes. Con los gastos de la casa, hay que cobrar al menos 2.760 € netos al mes para que la vivienda no pase del 35 % del sueldo, y tener unos 75.000 € ahorrados para la entrada y los gastos.

Si cambian las reglas del motor, las cifras de la guía y del carrusel cambian solas. Si publicáis texto a mano, copiadlo de la web el mismo día.

### Mapa del pilar Vivienda

```
/guias/sueldo-para-hipoteca  (esta semana, la guía central)
├── /calculadoras/comprar-vivienda  (la calculadora, ya enlazada)
├── Semana 4: páginas «cuánto ganar para una hipoteca de X €» (una por importe)
├── Pendiente: «Regla del 30 % del alquiler: ¿funciona en Madrid?»
└── Pendiente: «Entrada de una casa: cuánto ahorrar y en cuánto tiempo»
```

---

## 3. Carrusel de Instagram (7 diapositivas)

Archivos: `docs/marketing/semana-3/carrusel/hipoteca-1.png` … `hipoteca-7.png` (1080×1350).

**Texto del post:**

> ¿Cuánto tienes que cobrar para una hipoteca de 200.000 €?
>
> Spoiler: la cuota es lo de menos. Lo que casi nadie cuenta son los 75.000 € que tienes que tener ahorrados el día de la firma.
>
> Guárdalo para cuando te toque y mándaselo a quien esté mirando pisos.
>
> ¿Y a ti, te da? Calcúlalo gratis en medaono.com (enlace en la bio).
>
> #hipoteca #comprarpiso #finanzaspersonales #ahorro #vivienda


**Cuándo:** martes o miércoles, entre las 19:00 y las 21:00. Primera hora respondiendo comentarios.

**Reutilizar:** las diapositivas 2 a 6 sirven sueltas como stories con encuesta («¿Cuánto crees que hay que cobrar?» con 2 opciones antes de la diapositiva 4).

---

## 4. Vídeos de la semana (formato «¿Le da para esto?»)

### V9 · La hipoteca de 200.000 €
- **Gancho (texto):** «¿Cuánto hay que cobrar para una hipoteca de 200.000 €?»
- **Pantalla:** la guía en el móvil, bajando hasta «La respuesta corta».
- **Tensión:** «La cuota son 843 €. Pero no es lo que te va a frenar.»
- **Revelación:** «75.000 € ahorrados el día de la firma.» Zoom a la cifra.
- **Cierre:** «¿Cuánto tendrías que cobrar tú? Calculadora gratis en medaono.com.»

### V10 · «Me dan la hipoteca, ¿me da?»
- **Gancho:** «Que el banco te dé la hipoteca no significa que te dé.»
- **Perfil (calculadora de vivienda):** ingresos 2.400 €, gastos 1.100 €, ahorros 82.000 €, casa de 250.000 € con 50.000 € de entrada a 30 años.
- **Giro:** leer «Por qué esta nota»: el esfuerzo pasa del 35 %.
- **Cierre:** «Mira tu margen, no solo la cuota.»

### Automatizar más adelante (opcional)
Si el formato funciona, la animación de la nota se puede producir en serie con Remotion o Hyperframes a partir de las mismas imágenes (`/api/nota`). No merece la pena hasta tener un vídeo con más de 10.000 visualizaciones: grabar con el móvil es más auténtico y más rápido.

---

## 5. Reddit y foros: la guía como respuesta

Plantilla B (semana 2) con los números de la guía. En hilos de r/SpainFIRE, r/askspain o Rankia sobre hipotecas:

> Con 200.000 € a 30 años al 3 % la cuota ronda los 843 €. Con comunidad, IBI y seguro, unos 963 € al mes. Para no pasar del 35 % del sueldo hacen falta unos 2.760 € netos (entre los dos, si es en pareja). Lo que más frena no es la cuota, sino los ~75.000 € de entrada y gastos que hay que tener el día de la firma.

Si alguien pregunta de dónde salen los números: «Lo he sacado de una calculadora que hemos hecho, es gratis y sin registro: medaono.com/guias/sueldo-para-hipoteca». Decid siempre que es vuestra.

---

## 6. Qué medimos esta semana

| Pregunta | Dónde |
| --- | --- |
| ¿Se descarga la nota? | Evento `compartir` con `metodo` = `imagen_descarga` o `imagen_nativo` (visible con Vercel Pro o PostHog; en Hobby, ver semana 4) |
| ¿Llegan visitas desde las stories? | Vercel Analytics → Referrers: instagram.com, l.instagram.com |
| ¿Funciona el enlace con vista previa? | Vercel Analytics → Pages: visitas a /nota |
| ¿Google encuentra la guía? | Google Search Console → Páginas (dad de alta medaono.com si aún no está) |

**Experimento de la semana (hipótesis 4 del plan):** «Descargar mi nota» es ahora el botón principal del bloque de compartir. Hipótesis: *como una imagen se comparte mejor que un enlace en Instagram, creemos que poner la descarga como botón principal aumentará lo que se comparte. Lo sabremos si los eventos `compartir` por cada 100 cálculos completados suben frente a la semana 2.* Sin tráfico para un A/B, se mide antes y después.

---

## 7. Tareas que solo podéis hacer vosotros

- [ ] Subir el carrusel y los vídeos V9 y V10.
- [ ] Dar de alta medaono.com en Google Search Console y enviar el sitemap (medaono.com/sitemap.xml).
- [ ] Si queréis, añadir vuestros perfiles públicos (LinkedIn, X) en `TEAM` de lib/site.ts: salen en los datos estructurados de «Quiénes somos».
- [ ] Revisar el texto de «Quiénes somos». Está escrito sin inventar nada sobre vosotros; si queréis contar vuestra historia, este es el sitio.
