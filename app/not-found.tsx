import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start py-24 md:py-32">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-ink md:text-[3.5rem]">Esta página no existe</h1>
      <p className="mt-4 max-w-lg text-lg text-muted">Puede que el enlace esté mal escrito. Vuelve a las calculadoras y empieza de nuevo.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/calculadoras" size="lg">
          Ir a las calculadoras
          <ArrowGlyph />
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="secondary">
          Volver al inicio
        </ButtonLink>
      </div>
    </Container>
  );
}
