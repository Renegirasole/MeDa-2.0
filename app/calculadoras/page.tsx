import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorGrid } from "@/components/home/CalculatorGrid";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { IconArrowRight, IconStack, IconWallet } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Calculadoras: ¿me da para comprarlo?",
  description:
    "Calculadoras gratis para saber si te da para un coche, una vivienda, un alquiler, un viaje, tecnología o estudios según tu sueldo, gastos y ahorros.",
  alternates: { canonical: "/calculadoras" },
};

const SHORTCUTS = [
  { href: "/mi-situacion", icon: IconWallet, title: "Mis números", text: "Rellénalos una vez: valen para todas las calculadoras." },
  { href: "/combinar", icon: IconStack, title: "¿Te da para todo junto?", text: "Suma varias compras y compruébalas a la vez." },
];

export default function CalculatorsPage() {
  return (
    <>
      <PageHeader eyebrow="Calculadoras" title="¿Qué quieres comprar?" intro="Elige y en dos pasos tienes tu nota de 0 a 10, tres planes y el porqué." />
      <CalculatorGrid id="lista" title={null} className="pt-0 pb-12 md:pt-0 md:pb-16" />
      <Container className="pb-24">
        <ul className="grid gap-4 md:grid-cols-2">
          {SHORTCUTS.map(({ href, icon: Icon, title, text }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-card border border-dashed border-line-strong p-5 transition-[border-color,background-color] duration-150 hover:border-ink/30 hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="block text-[14px] text-muted">{text}</span>
                </span>
                <IconArrowRight size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform duration-200 ease-(--ease-out) group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
