import Link from "next/link";
import { INFO_NAV, NAV, PERSONAL_NAV, SITE } from "@/lib/site";
import { Container } from "@/components/ui/Section";
import { IconShield } from "@/components/ui/icons";
import { Logo } from "./Logo";

const COLUMNS = [
  { title: "Herramientas", links: [...NAV, { href: "/combinar", label: "¿Te da para todo junto?" }] },
  { title: "Tus cosas", links: PERSONAL_NAV.map(({ href, label }) => ({ href, label })) },
  { title: "Empresa", links: INFO_NAV },
  {
    title: "Legal",
    links: [
      { href: "/legal/aviso-legal", label: "Aviso legal" },
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-night text-white">
      <Container className="pt-16 pb-10 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,3fr)]">
          <div className="max-w-xs">
            <Logo tone="night" />
            <p className="mt-4 text-[15px] leading-relaxed text-night-muted">{SITE.tagline}</p>
            <p className="mt-6 flex items-start gap-2.5 text-[13px] leading-relaxed text-night-muted">
              <IconShield size={18} className="mt-px shrink-0 text-brand-300" aria-hidden="true" />
              Sin cuentas ni cookies de seguimiento. Tus números se quedan en tu dispositivo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-[13px] font-medium text-night-muted">{col.title}</h2>
                <ul className="mt-2 flex flex-col">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-11 items-center text-[15px] text-white/85 transition-colors duration-150 hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-night-line pt-6 text-[13px] leading-relaxed text-night-muted md:flex-row md:justify-between md:gap-10">
          <p className="shrink-0">© {new Date().getFullYear()} MeDa</p>
          <p className="max-w-3xl md:text-right">
            Algunos enlaces son de afiliados: si compras a través de ellos podemos recibir una comisión, sin coste extra para
            ti y sin que cambie la nota. Los resultados son estimaciones orientativas y no constituyen asesoramiento
            financiero.
          </p>
        </div>
      </Container>
    </footer>
  );
}
