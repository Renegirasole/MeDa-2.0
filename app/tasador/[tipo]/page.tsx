import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APPRAISALS, APPRAISAL_BY_SLUG, isAppraisalSlug } from "@/lib/data/appraisal";
import { Appraiser } from "@/components/tools/Appraiser";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

type Params = Promise<{ tipo: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return APPRAISALS.map((a) => ({ tipo: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tipo } = await params;
  if (!isAppraisalSlug(tipo)) return {};
  const a = APPRAISAL_BY_SLUG[tipo];
  return { title: a.question, description: a.metaDescription, alternates: { canonical: `/tasador/${a.slug}` } };
}

export default async function AppraiserPage({ params }: { params: Params }) {
  const { tipo } = await params;
  if (!isAppraisalSlug(tipo)) notFound();
  const a = APPRAISAL_BY_SLUG[tipo];
  return (
    <>
      <PageHeader
        title={a.question}
        intro="Solo usamos los anuncios que tú metes: sin datos inventados. Cuantos más y más parecidos, mejor precio."
        crumbs={[{ href: "/tasador", label: "¿A cuánto lo pongo?" }]}
      />
      <Container className="pb-24">
        <Appraiser slug={a.slug} />
      </Container>
    </>
  );
}
