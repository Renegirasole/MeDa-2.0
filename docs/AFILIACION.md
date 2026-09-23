# Afiliación: cómo darse de alta y activar los enlaces

Todo el código de afiliación está en `lib/affiliates.ts`. No hay que tocarlo para activar un partner: basta con pegar su enlace en una variable de entorno de Vercel.

## Cómo funciona

Cada partner lee una **plantilla** desde su variable. La plantilla usa uno de estos dos marcadores:

- `{url}`: la página de destino, codificada. Es lo que usan las redes como Awin.
- `{raw}`: la página de destino tal cual. Sirve para programas que solo añaden un parámetro.

Si la variable está vacía o no es válida, el enlace funciona igual, pero va directo al partner y no cobramos nada. Nunca se rompe nada.

| Variable | Partner | Dónde aparece |
| --- | --- | --- |
| `NEXT_PUBLIC_AFF_H2B` | h2b Hipotecas (bróker) | Comprar vivienda, primer enlace |
| `NEXT_PUBLIC_AFF_LINEADIRECTA` | Línea Directa (seguros de coche, moto y hogar) | Coche, moto, alquiler |
| `NEXT_PUBLIC_AFF_ASSISTCARD` | Assist Card (seguro de viaje) | Viaje, /viajes |
| `NEXT_PUBLIC_AFF_BOOKING` | Booking.com | Viajes |
| `NEXT_PUBLIC_AFF_SKYSCANNER` | Skyscanner | Viajes |
| `NEXT_PUBLIC_AFF_COCHESNET` | coches.net y motos.net | Coche, moto |
| `NEXT_PUBLIC_AFF_AUTOSCOUT24` | AutoScout24 | Coche |
| `NEXT_PUBLIC_AFF_FOTOCASA` | Fotocasa | Comprar y alquilar vivienda |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon (solo la etiqueta, p. ej. `medaono-21`) | Tecnología, deporte, mascota |

Ejemplos de plantilla:

```
Awin:     https://www.awin1.com/cread.php?awinmid=12345&awinaffid=67890&ued={url}
Booking:  {raw}&aid=1234567
```

## Orden de alta (de más a menos dinero)

La tabla de pagos es orientativa y hay que confirmarla al entrar en cada programa.

| Prioridad | Programa | Qué se cobra (aprox.) | Cómo entrar | Coste |
| --- | --- | --- | --- | --- |
| 1 | **h2b Hipotecas** (bróker) | Por solicitud válida; aprueba el 71,43 % | Awin, programa «H2B Hipotecas ES» | Gratis |
| 2 | **Assist Card / Allianz / Europ Assistance** (seguro de viaje) | Comisión sobre la póliza | Awin, región España | Gratis |
| 3 | **Amazon Afiliados** | 1–10 % de la venta | afiliados.amazon.es | Gratis |
| 4 | **Booking.com** | 4–6 % de la reserva | Programa de afiliados de Booking | Gratis |
| 5 | **Awin** (la red donde están muchos) | Según programa | awin.com/es → Soy publisher | **Depósito de unos 5 €** que devuelven con el primer pago. **Avisad antes de pagarlo.** |
| 6 | Skyscanner, coches.net, AutoScout24, Fotocasa | Poco o sin programa abierto | Solo si sobra tiempo | — |

### Comparadores: no son partners, son competencia

iAhorro, HelpMyCash, Rastreator y Acierto estuvieron enlazados aquí hasta el 23/09/2026. Ninguno tiene programa de
afiliación para webs, y ninguno aparece en Awin España. Son comparadores: ganan dinero igual que MeDa, mandando usuarios
a los bancos y aseguradoras. Enlazarlos era regalarles tráfico. Los cuatro están fuera del código desde esa fecha.

- iAhorro solo tiene un «programa de recomendados» para quien ya fue cliente suyo, que paga en cheque regalo y solo si la
  hipoteca llega a firmarse.
- La página «Colabora con HelpMyCash» va dirigida a empresas financieras que quieren anunciarse en ellos.

Sustitutos, todos programas reales de Awin España (hay que solicitarlos y esperar aprobación):

| Antes | Ahora | Dónde | Ojo |
| --- | --- | --- | --- |
| iAhorro, HelpMyCash | h2b Hipotecas | Comprar vivienda | Aprueba el 71,43 % de los leads |
| Rastreator, Acierto | Línea Directa | Coche, moto, alquiler | Aprueba solo el 12,66 %: de cada 8 contactos pagan 1 |
| — | Assist Card | Viaje y /viajes | Aprueba el 96 %, convierte el 11,12 % |

Otro candidato sin usar: SantaLucía ES (hogar y decesos), con el EPC más alto de la lista pero un 16,74 % de aprobación.

### Datos que os pedirán (tenerlos a mano)

- Web: `https://medaono.com`
- Descripción: «Calculadora gratuita que te dice si te da para una compra (coche, piso, viaje…) con una nota de 0 a 10. Público de 20 a 40 años en España.»
- Tráfico: el de Vercel → Analytics (visitas al mes).
- Titular y datos fiscales: los de René o Alberto. **Lo rellenáis vosotros**: yo no puedo meter datos fiscales ni crear cuentas.
- Método de pago: IBAN del titular.

### Requisitos de cada programa que conviene saber

- **Amazon:** si en 180 días no hay 3 ventas, cierran la cuenta y hay que volver a pedirla. Mejor darse de alta cuando haya tráfico.
- **Awin:** revisan la web a mano. Ayuda tener las páginas legales visibles (ya están en `/legal`) y el aviso de afiliación (ya sale debajo de cada enlace).

## Cuando os aprueben un programa

1. Copiad el enlace de afiliado genérico que os den.
2. Cambiad la URL de destino por `{url}` (Awin) o dejad `{raw}` delante del parámetro (Booking).
3. Vercel → proyecto **meda** → Settings → Environment Variables → añadir la variable (Production).
4. **Volved a publicar.** Las variables `NEXT_PUBLIC_` se meten al compilar, así que sin nuevo deploy no se aplican. Vale con Deployments → último → Redeploy, o pedírmelo.
5. Comprobad en medaono.com que el enlace pasa por la red (pasad el ratón por encima o abridlo).

## Reglas de confianza (no negociables)

- El partner **solo aparece si la compra te da** o si hay un plan que aprueba. Con «no te da» no mandamos a comprar.
- El aviso de afiliación sale siempre debajo de los enlaces.
- La comisión **nunca** cambia la nota ni el orden de los planes.
- Sí decide el orden de los enlaces a partners: primero el que tiene acuerdo con nosotros. Eso hay que decirlo en el aviso
  que va debajo del bloque y en el aviso legal, porque la ley de consumo obliga a declarar cuando el pago influye en la
  posición. Si algún día se cambia el orden, hay que cambiar también esos dos textos.
- Los filtros de búsqueda usan el tope redondeado **hacia abajo**: nunca enseñamos un precio más alto que el que te da.

## Medición

Cada clic envía `clic_partner` con `partner`, `origen` (categoría), `tipo` (compare, search o shop) y `posicion`. Con el plan Hobby de Vercel no se ven los eventos propios (hace falta Pro, unos 20 $/mes). **Avisad antes de pasar a Pro.** La alternativa gratuita es PostHog, prevista para la semana 4.
