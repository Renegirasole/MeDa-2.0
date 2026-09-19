import type { Metadata } from "next";
import Link from "next/link";
import { CONTENT_REVIEWED, SITE, TEAM } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { IconCalendar, IconLock, IconScales, IconShield } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "MeDa lo hacemos René y Alberto, dos socios sin inversores. Qué hacemos, cómo nos financiamos, qué no hacemos con tus datos y cómo revisamos las cifras.",
  alternates: { canonical: "/quienes-somos" },
};

const PROMISES = [
  {
    icon: IconLock,
    title: "Tus números no salen de tu móvil",
    text: "No hay cuentas ni base de datos con tus ingresos. Se guardan en tu dispositivo y los puedes borrar cuando quieras.",
  },
  {
    icon: IconScales,
    title: "La nota no se vende",
    text: "Ganamos dinero con enlaces de afiliados y anuncios. Ninguno cambia tu nota, y los partners solo salen si la compra, o una versión más barata, te da.",
  },
  {
    icon: IconShield,
    title: "Reglas públicas",
    text: "Todas las fórmulas están en «Cómo calculamos». La IA, cuando está activa, solo explica: nunca pone ni cambia una cifra.",
  },
] as const;

export default function AboutPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Quiénes somos",
    url: `${SITE.url}/quienes-somos`,
    inLanguage: "es-ES",
    dateModified: CONTENT_REVIEWED,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      email: SITE.owner.email,
      logo: `${SITE.url}/icon.svg`,
      founder: TEAM.map((p) => ({ "@type": "Person", name: p.name, jobTitle: p.role, ...(p.sameAs && { sameAs: p.sameAs }) })),
    },
  };

  return (
    <>
      <PageHeader
        eyebrow="Quiénes somos"
        title="Dos personas, una pregunta: ¿te da?"
        intro="MeDa lo hacemos René y Alberto. Sin empresa grande detrás ni inversores: una herramienta gratuita para saber si te da antes de comprar, con reglas que cualquiera puede revisar."
      />

      <Container className="pb-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div className="flex max-w-2xl flex-col gap-12">
            <section className="border-t border-line pt-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Por qué existe MeDa</h2>
              <div className="mt-4 flex flex-col gap-4 text-[17px] leading-relaxed text-ink-2">
                <p>
                  Antes de una compra grande casi todos miramos lo mismo: la cuota. Si la cuota cabe, parece que nos da. Pero la
                  cuota es solo una parte: faltan el seguro, la gasolina, la comunidad, la entrada y, sobre todo, lo que te queda
                  para imprevistos.
                </p>
                <p>
                  Hicimos MeDa para contestar esa pregunta con todo junto y con una nota que se entiende de un vistazo. Si no te
                  da, te decimos cuánto tendría que costar o cuánto tardarías en ahorrarlo. Y si te da, dónde buscarlo.
                </p>
              </div>
            </section>

            <section className="border-t border-line pt-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Cómo revisamos las cifras</h2>
              <ul className="mt-5 flex flex-col gap-4 text-[17px] leading-relaxed text-ink-2">
                <li>
                  <strong className="font-semibold text-ink">Un solo motor para todo.</strong> Calculadoras, guías e imágenes
                  salen de las mismas fórmulas. Si una regla cambia, cambia en todas partes a la vez.
                </li>
                <li>
                  <strong className="font-semibold text-ink">Pruebas automáticas.</strong> Cada cambio pasa una batería de
                  pruebas del motor antes de publicarse.
                </li>
                <li>
                  <strong className="font-semibold text-ink">Fecha a la vista.</strong> Cada guía dice cuándo la revisamos por
                  última vez y con qué supuestos.
                </li>
              </ul>
              <p className="mt-5 text-[15px] text-muted">
                Las reglas completas están en{" "}
                <Link href="/como-calculamos" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
                  Cómo calculamos
                </Link>
                .
              </p>
            </section>

            <section className="border-t border-line pt-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Lo que no somos</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
                No somos un banco ni asesores financieros, y MeDa no es una recomendación personal. Es una estimación honesta
                para que llegues a esa conversación con los números claros. Antes de firmar, revisa siempre la TAE y las
                condiciones de la oferta.
              </p>
            </section>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-night p-6 text-white sm:p-8">
              <p className="text-[13px] font-medium text-night-muted">El equipo</p>
              <ul className="mt-5 flex flex-col gap-5">
                {TEAM.map((p) => (
                  <li key={p.name} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-14 shrink-0 place-items-center rounded-2xl border border-night-line bg-night-2 text-xl font-semibold tracking-[-0.03em] text-brand-300"
                    >
                      {p.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-lg font-semibold tracking-[-0.02em]">{p.name}</span>
                      <span className="block text-[14px] text-night-muted">{p.role} de MeDa</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-2 border-t border-night-line pt-5 text-[14px] text-night-muted">
                <p className="flex items-center gap-2">
                  <IconCalendar size={16} aria-hidden="true" /> Revisado el {formatDate(CONTENT_REVIEWED)}
                </p>
                <p>
                  Escríbenos a{" "}
                  <a href={`mailto:${SITE.owner.email}`} className="text-white underline underline-offset-4 hover:text-brand-300">
                    {SITE.owner.email}
                  </a>
                </p>
              </div>
            </div>

            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {PROMISES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3.5 py-5">
                  <Icon size={22} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold text-ink">{title}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
