# Marketing · Semana 6

**Objetivo de la semana:** conseguir los primeros enlaces y menciones de fuera con un informe propio, citable por prensa y creadores.

## Qué hay nuevo en la web

| Pieza | Dónde |
| --- | --- |
| Informe «¿Qué le da a un joven en 2026?» | /guias/que-le-da-a-un-joven-2026 |
| La simulación de la home sube en el móvil (justo después del titular) | Home |
| Aviso ámbar «Te da, pero justo en esfuerzo» | Resultado, cuando la nota aprueba pero la cuota pasa de lo recomendable |
| La nota se funde al cambiar (150 ms) y la barra móvil lleva una mini escala | Calculadoras |
| El plan recomendado es más grande y está elevado | «La misma compra, en tres planes» |
| «¿A cuánto lo pongo?» pasa a llamarse «Tasador» en el menú | Menú y pie |

**IA («Explícamelo más fácil»):** sigue apagada. Está lista, pero activarla necesita una clave de pago de Anthropic y un límite de peticiones compartido (Upstash). Como es un gasto, lo decidís vosotros. Si queréis activarla: cread la clave en console.anthropic.com con un límite de gasto mensual bajo, `npx vercel env add ANTHROPIC_API_KEY production` y `NEXT_PUBLIC_AI_ENABLED=true`. Mi recomendación: esperar a tener unas 1.000 visitas al mes; antes, no cambia nada.

---

## 1. El informe en una frase

> Con el sueldo medio de su edad (unos 1.700 € netos, según el INE), a un joven de 25 a 34 años le da para un alquiler de hasta 500 €, un coche de 9.900 € y una casa de 140.000 €, pero tardaría casi 14 años en ahorrar la entrada.

Las cifras salen del motor de MeDa y del INE (EPA 2024). Si cambian las reglas, cambian en la web; antes de enviar nada, copiad las cifras de la página ese mismo día.

---

## 2. Nota de prensa (lista para pegar)

**Asunto:** Un joven con el sueldo medio tardaría casi 14 años en ahorrar la entrada de una casa de 140.000 €

**Cuerpo:**

> MeDa, una calculadora gratuita que dice si «te da» para una compra con tus ingresos, gastos y ahorros, ha publicado el informe «¿Qué le da a un joven en 2026?».
>
> Partiendo del salario bruto medio por edad del INE (2.131,6 € al mes entre los 25 y los 34 años, EPA 2024), y con unos 1.700 € netos, las conclusiones son:
>
> - Alquiler: hasta 500 € al mes para que la vivienda no pase del 35 % del sueldo.
> - Casa: la hipoteca que cabe es de unos 112.000 €, es decir, una casa de 140.000 €.
> - Entrada: esa casa exige unos 42.000 € de entrada y gastos. Ahorrando el 15 % del sueldo, 13,7 años.
> - Coche: hasta 9.900 € financiando a 5 años, con gasolina, seguro y mantenimiento incluidos en el cálculo.
>
> «El problema de los jóvenes no es la cuota, es la entrada», explican René y Alberto, creadores de MeDa.
>
> Informe completo, método y fuentes: https://medaono.com/guias/que-le-da-a-un-joven-2026
> Contacto: holamedaono@gmail.com

(Revisad la cita entre comillas: está escrita para vosotros; cambiadla por vuestras palabras si queréis.)

---

## 3. A quién enviarlo (20 periodistas y 20 creadores)

No incluyo nombres ni emails personales: buscadlos vosotros en las firmas de piezas recientes sobre vivienda y jóvenes, y usad solo contactos profesionales públicos.

| Tipo | Dónde buscar | Criterio |
| --- | --- | --- |
| Secciones de economía y vivienda | Diarios generalistas y digitales nacionales | Periodistas que hayan firmado sobre alquiler, hipotecas o salarios jóvenes en los últimos 3 meses |
| Medios de finanzas personales | Webs y newsletters de ahorro e inversión | Que publiquen datos y calculadoras |
| Medios regionales | Diarios de cada comunidad | Ofrecedles el dato con el sueldo de su comunidad (lo podemos calcular) |
| Creadores de finanzas personales | TikTok, Instagram, YouTube en español | Entre 10.000 y 200.000 seguidores; responden más que los grandes |
| Newsletters | Economía y tecnología en español | Secciones de «enlaces de la semana» |

**Cómo enviarlo:**
- Uno a uno, nunca en copia a todos. Personalizad la primera línea («Vi tu pieza sobre…»).
- A creadores, ofreced el dato para su vídeo y la calculadora gratis para su audiencia; nada de pagos ni publis.
- Martes a jueves, entre las 9:00 y las 11:00.
- Un solo recordatorio a los 5 días. Si no contestan, no insistáis.

**Registro:** apuntad en una hoja a quién, cuándo y si respondió. Cuando alguien lo publique, enlazadlo desde las redes y dadle las gracias en público.

---

## 4. En redes

- **Carrusel:** 5 diapositivas con la tabla del informe (sueldo → alquiler → casa → años de entrada → «¿Y a ti?»). Mismo estilo que los de hipoteca y coche; si lo queréis, se genera con /api/carrusel añadiendo una guía nueva.
- **Vídeo V12:** «Tengo 28 años y cobro el sueldo medio. ¿Me da para una casa?» con la tabla en pantalla. Cierre: «14 años ahorrando. ¿Tú cuánto tardarías? Pon tus números en medaono.com».
- **Reddit:** en r/SpainFIRE o r/askspain, un post con la tabla y el método (plantilla A de la semana 2), diciendo que la calculadora es vuestra.

---

## 5. Cierre de las 6 semanas: qué mirar el domingo

| Meta a 3 meses (plan v2) | Dónde mirarlo |
| --- | --- |
| 50 páginas indexadas y con visitas | Search Console → Páginas |
| Un vídeo por encima de 10.000 visualizaciones | TikTok / Instagram |
| Primeros ingresos por afiliación | Amazon Afiliados, CJ (Booking), Awin |
| 300 personas en la lista de «Avísame» | Vercel → Storage → meda-avisos |
