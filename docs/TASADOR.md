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
| Alquiler €/m² al mes (P25, mediana, P75) por sección censal, municipio y provincia | Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (Ministerio de Vivienda), [BD 2011-2024](https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi) | Explotación de los alquileres declarados a Hacienda. Vivienda colectiva. Solo secciones con 10 viviendas o más. No hay datos del País Vasco ni de Navarra (haciendas forales) |
| Valor tasado medio de vivienda libre €/m² por municipio (> 25.000 hab.) y provincia | [Ministerio de Transportes](https://apps.fomento.gob.es/BoletinOnline2/?nivel=2&orden=35000000), tablas 4 y 1 | Trimestral. Incluye el valor de obra nueva (hasta 5 años) y el de segunda mano |
| Centro de cada sección censal | Shapefile `SECC_CE_20210101_INE_WM` (misma página del SERPAVI) | Se guarda solo el centroide en latitud/longitud |

Cobertura: 2.466 municipios con datos por barrio (26.137 secciones), 277 municipios con valor tasado propio
y las 52 provincias como último recurso.

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
- País Vasco y Navarra no tienen datos de alquiler; ahí el Tasador pide anuncios.
