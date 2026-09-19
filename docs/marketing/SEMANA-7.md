# Marketing · Semana 7

**Objetivo:** que MeDa conteste solo, sin pedirle trabajo a nadie, y entrar en las búsquedas de «precio vivienda + ciudad», que se buscan todos los meses.

## Qué hay nuevo en la web

| Pieza | Dónde |
| --- | --- |
| Tasador automático: con la dirección salen los precios del barrio | /tasador/vender-piso y /tasador/alquilar-piso |
| Elegir tu piso del edificio (metros y año los pone el Catastro) | Mismo sitio, paso 1 |
| «Afinar con anuncios» pasa a ser opcional y manda sobre el dato oficial | Mismo sitio, paso 2 |
| 277 páginas «¿Cuánto cuesta un piso en X?» | /precio-vivienda y /precio-vivienda/&lt;ciudad&gt; |
| Método explicado en público | /como-calculamos |

## De dónde salen los precios

- **Venta:** valor tasado medio de vivienda libre del Ministerio de Transportes (segundo trimestre de 2026).
  Es lo que valoran los bancos, no lo que se pide en los portales: por eso sale algo por debajo de idealista.
- **Alquiler:** alquileres declarados a Hacienda (Ministerio de Vivienda, 2024), por barrio.
  Incluye contratos antiguos, así que lo que sale hoy al mercado va por encima. La web lo dice.
- **Dirección y vivienda:** CartoCiudad (IGN) y Catastro. No se guarda nada de lo que escribe la gente.

Detalle técnico y cómo actualizar los datos: `docs/TASADOR.md`.

## Qué contar fuera

1. **El gancho:** «Escribe tu dirección y te decimos a cuánto poner tu piso». Es lo que nos diferencia de
   las calculadoras que piden diez datos.
2. **Vídeo corto (V13):** grabar la pantalla escribiendo una dirección real y que aparezcan los tres precios.
   Cierre: «Sin registro y gratis, en medaono.com».
3. **Posts por ciudad:** con las páginas nuevas hay dato local para cada ciudad grande. Ejemplo para redes:
   «En Móstoles, un piso de 80 m² son 246.000 €: 830 € de cuota y hace falta cobrar 2.720 € netos».
   Sirve igual para grupos y foros locales, siempre diciendo que la calculadora es vuestra.
4. **Prensa local:** cada diario provincial publica cada trimestre la nota del precio de la vivienda.
   Ofrecedles la página de su ciudad como fuente con el dato ya mascado (cuota y sueldo necesario).

## Qué mirar dentro de dos semanas

- Search Console: impresiones de «precio vivienda + ciudad» y posición media de /precio-vivienda/*.
- Analítica: cuánta gente que entra por esas páginas acaba abriendo una calculadora.
- Si alguna ciudad despega, escribir una guía larga de esa ciudad (alquiler por barrios, por ejemplo).
