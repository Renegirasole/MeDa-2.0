import { Section } from "@/components/ui/Section";

const STEPS = [
  { title: "Cuéntanos tu situación", text: "Cuánto ganas, cuánto gastas y cuánto tienes ahorrado. Sin cuenta y sin email." },
  { title: "Dinos qué quieres comprar", text: "Un coche, un piso, un viaje… Añadimos los gastos que se suelen olvidar." },
  { title: "Te damos 3 planes con su nota", text: "Barato, calidad-precio y top, cada uno con su nota de 0 a 10 y el porqué." },
  { title: "Decide y reserva", text: "Cuando lo tengas claro, te llevamos a buscar el mejor precio real." },
];

export function HowItWorks() {
  return (
    <Section id="como-funciona" eyebrow="Cómo funciona" title="Tú pones los números. MeDa hace las cuentas." className="border-t border-line">
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative border-t border-ink/15 pt-6">
            <span aria-hidden="true" className="absolute -top-px left-0 h-px w-10 bg-ink" />
            <span className="num text-[13px] font-medium text-muted">0{i + 1}</span>
            <h3 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
