import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_BY_SLUG, isCategorySlug } from "@/lib/data/categories";
import { AffordabilityCalculator } from "@/components/tools/AffordabilityCalculator";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";

type Params = Promise<{ categoria: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategorySlug(categoria)) return {};
  const c = CATEGORY_BY_SLUG[categoria];
  return {
    title: c.question,
    description: c.metaDescription,
    alternates: { canonical: `/calculadoras/${c.slug}` },
    openGraph: { title: `${c.question} | MeDa`, description: c.metaDescription, url: `/calculadoras/${c.slug}` },
  };
}

export default async function CalculatorPage({ params }: { params: Params }) {
  const { categoria } = await params;
  if (!isCategorySlug(categoria)) notFound();
  const c = CATEGORY_BY_SLUG[categoria];

  return (
    <>
      <PageHeader
        title={c.question}
        intro="Dos pasos y tienes tu nota. Se actualiza mientras escribes."
        crumbs={[{ href: "/calculadoras", label: "Calculadoras" }]}
      />
      <Container className="pb-32 lg:pb-24">
        <AffordabilityCalculator slug={c.slug} />
      </Container>
    </>
  );
}
