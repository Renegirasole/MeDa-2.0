import { ArrowGlyph, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { IconCheck } from "@/components/ui/icons";
import { LiveSimulation } from "./LiveSimulation";

const PROMISES = ["Gratis", "Sin registrarte", "En menos de 2 minutos"];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      {/* Móvil: titular → simulación → resto, para que la nota se vea al entrar. Escritorio: dos columnas. */}
      <Container className="grid gap-8 pt-8 pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0 lg:pt-20 lg:pb-28">
        <div className="stagger max-w-xl lg:col-start-1 lg:row-start-1 lg:self-end">
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
        </div>

        <div
          id="simulacion"
          className="scroll-mt-24 motion-safe:animate-rise motion-safe:[animation-delay:160ms] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <LiveSimulation />
        </div>

        <div className="stagger max-w-xl lg:col-start-1 lg:row-start-2">
          <p className="max-w-[34rem] text-lg leading-relaxed text-ink-2 lg:mt-6 md:text-xl md:leading-relaxed">
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
          <p className="mt-6 text-[14px] text-muted">Tus números se quedan en tu dispositivo. No pedimos cuenta.</p>
        </div>
      </Container>
    </section>
  );
}
