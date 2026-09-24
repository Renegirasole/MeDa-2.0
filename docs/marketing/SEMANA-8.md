# Marketing · Semana 8

**Objetivo:** que el Tasador valore *tu piso*, no «un piso de tu barrio», y que se note la diferencia con los valoradores de los portales.

## Qué hay nuevo en la web

| Pieza | Dónde |
| --- | --- |
| Paso «¿Cómo es tu piso?»: estado, planta, ascensor, exterior, terraza, garaje y trastero | /tasador/vender-piso y /tasador/alquilar-piso |
| Desglose en la tarjeta: cuánto suma o resta cada cosa | Mismo sitio, resultado |
| Evolución del precio del municipio (12 trimestres) con gráfico | /precio-vivienda/&lt;ciudad&gt; |
| Anuncios publicados cerca (API oficial de idealista) | Listo, pendiente de la llave |

## Lo que nos diferencia (y hay que contar así)

Un valorador de portal te da un número y punto. MeDa enseña **de dónde sale cada euro**: el precio de tu
barrio, el ajuste por tu planta y tu ascensor, lo que resta estar para reformar y lo que suma el garaje.
Y después te lleva a la pregunta que de verdad importa: con ese dinero, ¿te da para lo siguiente?

Frases que funcionan:
- «Tu piso no vale lo que vale el de tu vecino del cuarto sin ascensor. Y te decimos cuánto menos.»
- «El único tasador que te enseña las cuentas.»
- «Gratis, sin registro y sin que te llame ninguna inmobiliaria.»

## Pendiente vuestro: la llave de idealista

Pedidla en <https://developers.idealista.com/access-request> (nombre, email y para qué). Con ella, el
Tasador usa los anuncios que hay a 750 m de la dirección en vez del dato oficial, que va unos meses por
detrás. Instrucciones para ponerla: `docs/TASADOR.md`.

Mientras tanto, **no se raspa ningún portal**: sus condiciones lo prohíben y el aviso legal del Portal
Estadístico del Notariado prohíbe además reutilizar sus datos con fines comerciales. Todo lo que hay en
MeDa sale de datos abiertos oficiales o de APIs que el propio portal ofrece.

## Vídeos y posts

- **V14:** grabación de pantalla poniendo una dirección real y cambiando «buen estado» a «para reformar»
  para ver caer el precio. Cierre: «¿A cuánto lo pondrías tú?».
- **V15:** «Vivo en un cuarto sin ascensor: ¿cuánto me cuesta eso?» con el desglose en pantalla.
- **Post de barrio:** coger tres calles de una ciudad grande y comparar el precio del m². Las páginas de
  /precio-vivienda dan el dato del municipio; el del barrio sale del Tasador poniendo una dirección.
