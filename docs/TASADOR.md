# Tasador automático por zona

Desde la semana 7, el Tasador de pisos (`/tasador/vender-piso` y `/tasador/alquilar-piso`) no necesita que
nadie copie anuncios: con la dirección saca solo los precios del barrio. Los anuncios siguen ahí, como
paso opcional para afinar, y mandan sobre el dato oficial cuando se rellenan (son de hoy).

El Tasador de coche no cambia: sigue funcionando solo con comparables.

## Qué se consulta en el momento (sin clave, sin registro)

| Servicio | Para qué | Nota |
| --- | --- | --- |
| [CartoCiudad](https://www.cartociudad.es/) (IGN) | Dirección → coordenadas, municipio INE y referencia catastral del portal | Devuelve 406 si se pide `Accept: application/json`; hay que mandar `*/*`. Responde JSONP (`callback(...)`) aunque no se pida |
| [Sede del Catastro](https://ovc.catastro.meh.es/) | Viviendas del edificio con superficie construida y año | `Consulta_DNPRC?RefCat=<14 caracteres>`; una sola llamada trae todo el edificio |

Las respuestas se cachean un día (`next: { revalidate }`) y la ruta manda `s-maxage=86400`.
No se guarda nada de lo que escribe la persona: la API no escribe en ningún sitio.

## Datos que van en el repositorio

`lib/data/zonas/municipios.json` (0,2 MB) y `lib/data/zonas/secciones.json` (1,2 MB). Solo los importa
código de servidor (`lib/zonas/datos.ts`), nunca el navegador.

| Dato | Fuente | Detalle |
| --- | --- | --- |
| Alquiler €/m² al mes (P25, mediana, P75) por sección censal, municipio y provincia | Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (Ministerio de Vivienda), [BD 2011-2024](https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi) | Explotación de los alquileres declarados a Hacienda. Vivienda colectiva. Solo secciones con 10 viviendas o más |
| Valor tasado medio de vivienda libre €/m² por municipio (> 25.000 hab.) y provincia | [Ministerio de Transportes](https://apps.fomento.gob.es/BoletinOnline2/?nivel=2&orden=35000000), tablas 4 y 1 | Trimestral. Incluye el valor de obra nueva (hasta 5 años) y el de segunda mano |
| Centro de cada sección censal | Shapefile `SECC_CE_20210101_INE_WM` (misma página del SERPAVI) | Se guarda solo el centroide en latitud/longitud |
| Serie del valor tasado, 12 trimestres | Mismo excel del Ministerio (una pestaña por trimestre) | Alimenta la evolución del precio en /precio-vivienda |

Cobertura: 2.466 municipios con datos por barrio (26.137 secciones), 2.555 con alquiler del municipio,
277 con valor tasado propio y las 52 provincias como último recurso.

### Cómo actualizarlos

El SERPAVI sale una vez al año y el valor tasado, cada trimestre. Para refrescar:

1. Descargar a una carpeta: `serpavi.xlsx`, el zip de secciones censales (solo la primera vez),
   `muni.xls` (tabla 35103500) y `prov.xls` (tabla 35101000).
2. `pip install openpyxl xlrd pyshp`
3. `python scripts/datos-tasador.py <carpeta>`
4. `npm test` y `npm run build`. El año y el trimestre se leen de los propios ficheros y salen en la web
   (`ZONE_SOURCES`), así que no hay fechas escritas a mano.

## Cómo sale el precio (`lib/zonas/tasacion.ts`)

- **Alquiler.** €/m² del barrio × metros. Rápido = P25, mercado = mediana, sin prisa = P75.
- **Venta.** Valor tasado del municipio (el de obra nueva si el piso tiene 5 años o menos) × **factor de
  barrio** = alquiler del barrio / alquiler del municipio, acotado entre 0,6 y 1,8. El abanico es la raíz
  cuadrada del de los alquileres del barrio, porque los pisos en venta de una zona se parecen más entre sí
  que los alquileres.
- Sin dato de la zona no se inventa nada: la tarjeta pide anuncios.

Todo esto está explicado en público en `/como-calculamos`, y probado en `tests/zonas.test.ts`.

## Límites que conviene recordar

- El valor tasado es el que usan los bancos, no el que se pide en los portales: suele quedar por debajo.
- El alquiler son contratos en vigor en 2024, también antiguos: lo que sale hoy al mercado va por encima.
  Por eso la tarjeta lo llama «suelo» y ofrece afinar con anuncios.
- Fuera de los municipios grandes no hay valor tasado propio y se usa el de la provincia.
- Los municipios pequeños no siempre tienen datos de alquiler ni secciones con suficientes viviendas; ahí se usa la provincia o se piden anuncios.

## Anuncios de portales (opcional, API oficial de idealista)

Los datos oficiales son reales pero van con retraso: el valor tasado es trimestral y los alquileres son
de 2024. Para tener el precio que se pide **hoy** en la calle de la persona, el Tasador puede consultar la
[API oficial de idealista](https://developers.idealista.com/): coge los pisos publicados a menos de 750 m,
calcula los €/m² en cuartiles (quitando trasteros y precios imposibles con el criterio de Tukey) y con eso
da los tres precios. Si no hay llave, o no hay al menos 8 anuncios cerca, se sigue con el dato oficial.

**Nunca se raspa la web de idealista, Fotocasa ni ningún otro portal.** Sus condiciones lo prohíben, y el
aviso legal del Portal Estadístico del Notariado prohíbe además reproducir sus datos con fines comerciales.
Por eso solo se usan: datos abiertos de las administraciones y la API que el propio portal ofrece.

### Cómo activarlo

1. Pedir la llave en <https://developers.idealista.com/access-request> (formulario: nombre, email y para qué).
   Contad que es una calculadora gratuita que enseña el precio de la zona y enlaza a sus anuncios.
   El formulario se rellenó el 22/09/2026 a nombre de «René (MeDa)» con holamedaono@gmail.com;
   lleva un reCAPTCHA de imágenes, así que el envío final lo hace una persona.
2. Cuando llegue la llave, comprobarla antes de tocar producción: ponedla en `.env.local` y
   ejecutad `npx tsx scripts/probar-idealista.ts`. Dice si la llave vale y qué €/m² saldrían.
3. Ponerla en Vercel:
   ```
   npx vercel env add IDEALISTA_API_KEY production
   npx vercel env add IDEALISTA_SECRET production
   ```
   (`BLOB_READ_WRITE_TOKEN` ya está: es el mismo almacén que la lista de avisos.)
4. Redesplegar. La web lo cuenta sola en `/como-calculamos` y en la tarjeta del resultado.

### Cupo

La llave tiene un número limitado de peticiones al mes, así que cada consulta se guarda **un mes por celdas
de unos 500 m** en Vercel Blob (`portales/<modo>/<celda>.json`). Toda la gente de la misma manzana gasta una
sola petición. Si el cupo se agota, se devuelve lo último que se guardó y, si no hay nada, el dato oficial:
el Tasador nunca se queda en blanco.

## Tu piso dentro de su zona (características)

El €/m² de la zona es la media de muchos pisos distintos. Para parecerse a lo que hace un tasador —o el
valorador de un portal— hay un paso más, en `lib/zonas/caracteristicas.ts`:

| Qué | Efecto |
| --- | --- |
| Estado | Para reformar −15 %, buen estado 0, reformado +8 %, a estrenar +15 % |
| Planta y ascensor | Sin ascensor: 1ª −2 %, 2ª −5 %, 3ª −10 %, 4ª o más −15 %. Con ascensor: bajo −5 %, planta alta +5 % |
| Exterior / interior | +3 % / −7 % |
| Terraza | Los metros de terraza valen el 35 % del €/m² de la vivienda |
| Garaje / trastero | Se suman como 12 m² y 4 m² de vivienda |

Los coeficientes siguen el espíritu de las normas técnicas de valoración catastral (RD 1020/1993, normas 13
a 16) y son prudentes a propósito. La planta sale del Catastro cuando la persona elige su vivienda; el resto
se pregunta en el paso 3. En la tarjeta de resultado se ve **cada ajuste por separado**, con su signo: eso es
lo que un portal no enseña.
