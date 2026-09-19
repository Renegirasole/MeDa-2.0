# Marketing · Semana 5

**Objetivo de la semana:** empezar la lista de email (el activo que más vale a largo plazo) y publicar la guía del pilar Coche.

## Qué hay nuevo en la web

| Pieza | Dónde | Para qué |
| --- | --- | --- |
| «Avísame para volver a mirarlo» | Calculadoras → «Siguiente paso», cuando todavía no te da | Email con consentimiento. Una vez al mes le recordamos su objetivo |
| Baja con un clic | Enlace en cada email y cabecera List-Unsubscribe | Obligatorio y da confianza |
| Envío mensual | Cron de Vercel, día 1 de cada mes a las 11:00 (hora peninsular en verano) | Solo envía si Resend está configurado |
| Guía de coche | /guias/coste-real-coche | «Cuánto cuesta un coche al mes», «coste real de un coche» |
| Carrusel de coche | docs/marketing/semana-5/carrusel/ | 7 diapositivas listas para subir |

**Qué se guarda:** solo el email y el objetivo (categoría e importe), en un almacén privado de Vercel en Fráncfort (UE). Nunca ingresos, gastos ni ahorros. La política de privacidad ya lo explica.

---

## 1. Activar el envío de emails (tarea vuestra, 15 minutos, antes del 1 de octubre)

Sin esto la gente se puede apuntar, pero no le llegará nada. El primer envío es el **1 de octubre**.

1. Cread una cuenta gratis en https://resend.com con holamedaono@gmail.com (3.000 emails al mes gratis).
2. Domains → Add Domain → `medaono.com`, región **EU (Ireland)**.
3. Resend os dará 3 o 4 registros DNS (MX, TXT de SPF y DKIM). Añadidlos en Vercel → team me-da2 → Domains → medaono.com → DNS Records. Si me pasáis los valores, los añado yo desde la línea de comandos.
4. Cuando Resend marque el dominio como verificado: API Keys → Create (permiso «Sending access»).
5. Desde la carpeta MeDa 2.0:
   ```
   npx vercel env add RESEND_API_KEY production
   npx vercel env add EMAIL_FROM production
   ```
   Valor de EMAIL_FROM: `MeDa <avisos@medaono.com>`. Después, un commit vacío y push.
6. Probad a apuntaros con vuestro email: debería llegar el email de bienvenida.

**Ver la lista:** está en Vercel → Storage → meda-avisos (un archivo por persona). Para contar altas sin abrirlos, mirad el número de archivos.

---

## 2. Guía y carrusel de coche

**Frase que hay que repetir:**

> Un coche de 16.000 € no cuesta 260 € al mes: con gasolina, seguro y mantenimiento son unos 460 €. Para que no pase del 20 % del sueldo, hay que cobrar unos 2.310 € netos.

**Texto del post del carrusel:**

> «Solo son 260 € al mes.»
>
> Eso es la letra. Un coche de 16.000 € te cuesta unos 460 € al mes cuando sumas gasolina, seguro, mantenimiento e impuesto. Desliza para ver cuánto hay que cobrar.
>
> Guárdalo para cuando vayas al concesionario.
>
> ¿Te da a ti? Calcúlalo gratis en medaono.com (enlace en la bio).
>
> #coche #finanzaspersonales #ahorro #cochenuevo #españa

**Vídeo V11 · «El error de la letra» (versión con la guía):**
- **Gancho:** «Este coche no cuesta 260 € al mes.»
- **Pantalla:** diapositiva 3 del carrusel (la lista de gastos), subiendo una por una.
- **Revelación:** «460 € al mes. Y si lo alargas a 84 meses, 3.749 € solo de intereses.»
- **Cierre:** «¿Y el tuyo? Pon tu coche en medaono.com.»

---

## 3. Revisar qué vídeos funcionan (domingo, 30 minutos)

Ya hay unas 10 publicaciones. Toca decidir con datos, no con intuición.

1. Exportad de TikTok e Instagram, por vídeo: visualizaciones, retención a los 3 s, % visto entero, guardados, compartidos y comentarios.
2. Ordenad por **retención a los 3 s** (mide el gancho) y por **guardados + compartidos** (mide el valor).
3. Clasificad cada vídeo por pilar (¿Le da para esto?, Mitos, Coste real, Detrás de MeDa) y por tipo de gancho (pregunta con cifra, error común, reacción).

| Si pasa esto | Haced esto |
| --- | --- |
| Un pilar tiene el doble de retención | La próxima semana, dos de cada tres vídeos de ese pilar |
| Mucha retención pero pocos guardados | El gancho funciona, el contenido no aporta: añadid la cifra útil antes |
| Muchos comentarios con sueldos | Grabad V7 (reacción) con esos casos, sin nombres |
| Nada supera 500 visualizaciones | Cambiad la hora y los primeros 3 s, no el formato entero |

4. Vercel Analytics → Referrers: ¿llega gente de tiktok.com o instagram.com? Si no llega nadie, el enlace de la bio no se ve: probad «Link en bio» como texto en pantalla.

---

## 4. Qué medimos esta semana

| Pregunta | Dónde |
| --- | --- |
| ¿Se apunta gente? | Número de archivos en Vercel → Storage → meda-avisos. Con PostHog, evento `lista_email` |
| ¿Qué categorías traen más altas? | PostHog: `lista_email` por `categoria` |
| ¿Se da de baja mucha gente tras el primer envío? | Archivos antes y después del día 1 |

**Objetivo del plan a 3 meses:** 300 personas en la lista.
