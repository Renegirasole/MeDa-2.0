import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

/**
 * Textos base. Deben revisarse por un profesional antes de publicar
 * y completarse con los datos del titular (variables NEXT_PUBLIC_LEGAL_*).
 */
const PAGES: Record<string, { title: string; body: ReactNode }> = {
  "aviso-legal": {
    title: "Aviso legal",
    body: (
      <>
        <p>
          En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información, te informamos de que este sitio
          web pertenece a {SITE.owner.legalName}
          {SITE.owner.taxId && <>, con NIF {SITE.owner.taxId}</>}
          {SITE.owner.address && <> y domicilio en {SITE.owner.address}</>}. Puedes escribirnos a {SITE.owner.email}.
        </p>
        <p>
          MeDa ofrece herramientas de cálculo orientativas. Los resultados son estimaciones basadas en los datos que
          introduces y en supuestos públicos, y no constituyen asesoramiento financiero, fiscal ni legal. Antes de tomar una
          decisión, consulta las condiciones reales de cada oferta.
        </p>
        <p>
          Algunos enlaces a tiendas y servicios son de afiliación: si compras a través de ellos podemos recibir una comisión,
          sin coste para ti. Estos acuerdos nunca modifican la nota ni el orden de los resultados.
        </p>
      </>
    ),
  },
  privacidad: {
    title: "Política de privacidad",
    body: (
      <>
        <p>
          Tus ingresos, gastos, ahorros y cálculos se guardan solo en tu navegador (almacenamiento local). No los enviamos a
          nuestros servidores ni los vendemos. Puedes borrarlos cuando quieras desde cualquier calculadora.
        </p>
        <p>
          Si pulsas «Explícamelo más fácil», enviamos al proveedor de IA únicamente las cifras ya calculadas del resultado
          (sin nombre, email ni identificadores) para redactar la explicación. No se guardan asociadas a ti.
        </p>
        <p>
          Cuando compartes un resultado, los datos viajan dentro del propio enlace, en una parte que los navegadores no
          envían al servidor. Por defecto, el enlace no incluye tus ingresos ni tus ahorros.
        </p>
        {SITE.adsenseClient && (
          <p>
            Mostramos anuncios de Google AdSense. Google y sus socios pueden usar cookies e identificadores para mostrar y
            medir anuncios, personalizados o no según lo que elijas en el aviso de consentimiento. Más información en{" "}
            <a className="underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
              policies.google.com/technologies/ads
            </a>
            .
          </p>
        )}
        <p>Responsable: {SITE.owner.legalName}. Para ejercer tus derechos, escribe a {SITE.owner.email}.</p>
      </>
    ),
  },
  cookies: {
    title: "Política de cookies",
    body: (
      <>
        {SITE.adsenseClient ? (
          <p>
            MeDa muestra anuncios de Google AdSense. Google y sus socios pueden instalar cookies publicitarias para mostrar,
            limitar y medir anuncios. Solo se usan para anuncios personalizados si lo aceptas en el aviso de consentimiento,
            y puedes cambiar tu elección en cualquier momento. Puedes gestionar la personalización en{" "}
            <a className="underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              adssettings.google.com
            </a>
            .
          </p>
        ) : (
          <p>MeDa no usa cookies publicitarias ni de seguimiento.</p>
        )}
        <p>
          Por nuestra parte, solo usamos el almacenamiento local de tu navegador para
          recordar tus datos en este dispositivo, algo técnicamente necesario para que la herramienta funcione sin cuenta.
        </p>
        <p>
          Si en el futuro añadimos medición de audiencia, usaremos una herramienta sin cookies o te pediremos permiso
          antes.
        </p>
      </>
    ),
  },
};

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return page ? { title: page.title, robots: { index: false }, alternates: { canonical: `/legal/${slug}` } } : {};
}

export default async function LegalPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <>
      <PageHeader title={page.title} />
      <Container className="pb-24">
        <div className="flex max-w-[65ch] flex-col gap-4 text-[16px] leading-relaxed text-ink-2">{page.body}</div>
      </Container>
    </>
  );
}
