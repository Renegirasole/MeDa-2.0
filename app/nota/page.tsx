import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_BY_SLUG } from "@/lib/data/categories";
import { VERDICT_COPY } from "@/lib/copy";
import { formatScore } from "@/lib/format";
import { decodeShare, encodeShare } from "@/lib/share";
import { parseScoreCard, scoreCardQuery, scoreCardThing, scoreCardVerdict } from "@/lib/scorecard";
import { ArrowGlyph, buttonClass } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";
import { ScoreScale } from "@/components/ui/ScoreScale";
import { IconLock } from "@/components/ui/icons";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Nota compartida. No se indexa: son miles de combinaciones sin contenido propio. */
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const card = parseScoreCard(await searchParams);
  if (!card) return { robots: { index: false } };
  const verdict = VERDICT_COPY[scoreCardVerdict(card)].label;
  const title = `¿Me da para ${scoreCardThing(card)}? ${formatScore(card.score)}/10: ${verdict}`;
  const description = "Esta es su nota en MeDa. ¿Y a ti, te da? Calcúlalo gratis y sin registrarte con tus números.";
  const image = { url: `/api/nota?${scoreCardQuery(card)}&formato=og`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function SharedScorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const card = parseScoreCard(params);
  if (!card) notFound();
  const verdict = scoreCardVerdict(card);
  const category = CATEGORY_BY_SLUG[card.slug];
  // Si el enlace trae la compra, la calculadora se abre con ella puesta (nunca con el perfil de quien comparte).
  const shared = decodeShare(one(params.s));
  const href = `/calculadoras/${card.slug}${shared ? `#s=${encodeShare({ purchase: shared.purchase })}` : ""}`;

  return (
    <Container className="py-12 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-20">
        <div className="max-w-xl">
          <Eyebrow>Te han pasado una nota</Eyebrow>
          <h1 className="mt-3 text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-ink md:text-[3.25rem]">
            ¿Me da para {scoreCardThing(card)}?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            A quien te lo ha enviado le sale un {formatScore(card.score)}: «{VERDICT_COPY[verdict].label.toLowerCase()}». Con tu
            sueldo, tus gastos y tus ahorros la nota puede ser otra. Tardas dos minutos en saberlo.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href={href} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
              ¿Y a mí? Poner mis números
              <ArrowGlyph />
            </a>
            <p className="flex items-center gap-2 text-[14px] text-muted">
              <IconLock size={16} aria-hidden="true" /> Gratis, sin registro y sin salir de tu móvil
            </p>
          </div>
        </div>

        <div className="rounded-card bg-night p-6 text-white shadow-raised sm:p-9">
          <p className="text-[13px] font-medium text-night-muted">{category.name}</p>
          <ScoreScale score={card.score} verdict={verdict} tone="night" className="mt-3" />
          <p className="mt-7 border-t border-night-line pt-5 text-[14px] leading-relaxed text-night-muted">
            La nota compartida solo lleva la compra y el resultado. Nunca los ingresos ni los ahorros de nadie.
          </p>
        </div>
      </div>
    </Container>
  );
}
