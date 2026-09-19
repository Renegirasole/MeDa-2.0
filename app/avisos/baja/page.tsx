import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Baja de los avisos", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UnsubscribedPage({ searchParams }: { searchParams: SearchParams }) {
  const error = Boolean((await searchParams).error);
  return (
    <Container className="flex flex-col items-start py-24 md:py-32">
      <Eyebrow>Avisos</Eyebrow>
      <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-ink md:text-[3.5rem]">
        {error ? "Este enlace no es válido" : "Te hemos dado de baja"}
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted">
        {error
          ? `Puede que ya estuvieras de baja. Si sigues recibiendo emails, escríbenos a ${SITE.owner.email} y lo borramos a mano.`
          : "Hemos borrado tu email y tu objetivo. No volverás a recibir avisos de MeDa."}
      </p>
      <ButtonLink href="/calculadoras" size="lg" className="mt-9">
        Ir a las calculadoras
      </ButtonLink>
    </Container>
  );
}
