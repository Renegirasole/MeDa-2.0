import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { IconCheck } from "@/components/ui/icons";
import { LiveSimulation } from "./LiveSimulation";

const PROMISES = ["Gratis", "Sin registrarte", "En menos de 2 minutos"];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <Container className="grid gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-16 lg:pt-20 lg:pb-28">
        <div className="stagger max-w-xl">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-2">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <IconCheck size={15} weight="bold" className="text-brand-600" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <h1 id="hero-title" className="mt-6 text-[3.25rem] leading-[0.98] font-semibold tracking-[-0.045em] text-ink sm:text-[4.25rem] lg:text-[5rem]">
            ¿Te da
            <br />
            para eso?
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-2 md:text-xl md:leading-relaxed">
            Dinos cuánto ganas, cuánto gastas y cuánto tienes ahorrado. Calculamos lo que te cuesta de verdad, te damos 3 planes
            (barato, calidad-precio y top) y te llevamos al mejor precio.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/calculadoras" size="lg">
              Comprobar si me da
              <ArrowGlyph />
            </ButtonLink>
            <ButtonLink href="/viajes" size="lg" variant="secondary">
              Planificar un viaje
            </ButtonLink>
          </div>
          <p className="mt-6 text-[14px] text-muted">Tus números se quedan en tu dispositivo. No pedimos email ni cuenta.</p>
        </div>

        <div id="simulacion" className="scroll-mt-24 motion-safe:animate-rise motion-safe:[animation-delay:160ms]">
          <LiveSimulation />
        </div>
      </Container>
    </section>
  );
}
