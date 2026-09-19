import type { FactorId, FlagCode, PlanTier, TripLineId, Verdict } from "@/lib/engine";

export const VERDICT_COPY: Record<Verdict, { label: string; tone: "leaf" | "caution" | "alert" }> = {
  yes: { label: "Sí, te da", tone: "leaf" },
  tight: { label: "Te da, pero justo", tone: "caution" },
  risky: { label: "Mejor espera", tone: "alert" },
  no: { label: "No te da", tone: "alert" },
};

export const TIER_COPY: Record<PlanTier, { label: string; hint: string }> = {
  budget: { label: "Barato", hint: "La mitad de precio" },
  value: { label: "Calidad-precio", hint: "Un 25 % más barato" },
  top: { label: "Top", hint: "Lo que pides" },
};

export const FACTOR_COPY: Record<FactorId, { label: string; question: string }> = {
  effort: { label: "Esfuerzo mensual", question: "¿Qué parte de tu sueldo se lleva cada mes?" },
  margin: { label: "Margen que te queda", question: "¿Cuánto te sobra al mes después?" },
  cushion: { label: "Colchón de ahorro", question: "¿Cuántos meses aguantarías sin ingresos?" },
};

export const FLAG_COPY: Record<FlagCode, string> = {
  no_income: "Sin ingresos no podemos calcular si te da. Añade lo que cobras al mes.",
  not_enough_savings: "No tienes ahorros suficientes para la entrada y los gastos iniciales.",
  upcoming_uncovered: "Tus ahorros no cubren la compra y los gastos que ya tienes previstos este año.",
  negative_margin: "Cada mes gastarías más de lo que ingresas.",
  cushion_critical: "Te quedarías con menos de la mitad del colchón que quieres tener.",
  cushion_below_target: "Te quedarías por debajo del colchón que quieres tener.",
  over_guideline: "Te lleva más parte del sueldo de lo recomendable para este tipo de gasto.",
  high_interest: "El interés de la financiación es alto. Compara otras ofertas antes de firmar.",
};

export const TRIP_LINE_COPY: Record<TripLineId, string> = {
  airport: "Ir y volver del aeropuerto",
  transport: "Vuelo o tren",
  lodging: "Alojamiento",
  food: "Comida",
  activities: "Qué ver y moverte",
};
