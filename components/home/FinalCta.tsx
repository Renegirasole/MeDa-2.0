import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { LogoMark } from "@/components/layout/Logo";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta" className="pb-20 md:pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-700 px-6 py-16 text-center md:px-12 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <LogoMark size={40} tone="night" />
            <h2 id="final-cta" className="mt-6 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.04em] text-white md:text-[4rem]">
              ¿Me da? Ahora lo sabes.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/75">Dos minutos, sin registrarte y sin que tus números salgan de tu dispositivo.</p>
            <ButtonLink href="/calculadoras" size="lg" variant="inverse" className="mt-9">
              Ir a las calculadoras
              <ArrowGlyph />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
