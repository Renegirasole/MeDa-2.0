import { ImageResponse } from "next/og";
import { VERDICT_COPY } from "@/lib/copy";
import { formatScore } from "@/lib/format";
import { parseScoreCard, scoreCardThing, scoreCardVerdict, type ScoreCard } from "@/lib/scorecard";
import { geistFonts, IMAGE_CACHE, OG, OgLogo, OgScale, toneOf } from "@/lib/og/theme";

export const runtime = "nodejs";

/**
 * La nota como imagen. Sin ingresos, gastos ni ahorros: solo la compra y la nota.
 * - formato=story (por defecto): 1080×1920 para stories y estados.
 * - formato=og: 1200×630, la vista previa del enlace /nota.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const card = parseScoreCard(params);
  if (!card) return new Response("Nota no válida", { status: 400 });
  const og = params.get("formato") === "og";
  const size = og ? { width: 1200, height: 630 } : { width: 1080, height: 1920 };
  return new ImageResponse(og ? <Preview card={card} /> : <Story card={card} />, {
    ...size,
    fonts: await geistFonts(),
    headers: { "Cache-Control": IMAGE_CACHE },
  });
}

/**
 * Vertical. Las stories tapan unos 250 px arriba y 340 abajo con su interfaz:
 * lo importante vive entre medias.
 */
function Story({ card }: { card: ScoreCard }) {
  const verdict = scoreCardVerdict(card);
  const tone = toneOf(verdict);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "260px 88px 340px",
        background: OG.night,
        backgroundImage: `radial-gradient(900px 700px at 85% 38%, ${tone.ring}33, transparent 70%)`,
        color: "white",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <OgLogo size={76} night />
          <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: -2 }}>MeDa</div>
        </div>
        <div style={{ fontSize: 34, color: OG.nightMuted }}>medaono.com</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 40, fontWeight: 500, color: OG.nightMuted }}>¿Me da para</div>
        <div style={{ marginTop: 10, fontSize: 84, fontWeight: 600, letterSpacing: -3.4, lineHeight: 1.04 }}>
          {`${scoreCardThing(card)}?`}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 96 }}>
          <div style={{ fontSize: 300, fontWeight: 600, letterSpacing: -9, lineHeight: 0.8 }}>{formatScore(card.score)}</div>
          <div style={{ fontSize: 64, color: OG.nightMuted, marginBottom: 6 }}>/10</div>
        </div>
        <div style={{ marginTop: 44, fontSize: 72, fontWeight: 600, letterSpacing: -2.4, color: tone.night }}>
          {VERDICT_COPY[verdict].label}
        </div>

        <div style={{ display: "flex", marginTop: 72 }}>
          <OgScale score={card.score} verdict={verdict} width={904} height={22} night labelSize={30} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            padding: "26px 40px",
            borderRadius: 999,
            background: "white",
            color: OG.ink,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: -0.6,
          }}
        >
          ¿Y a ti? Mira si te da en medaono.com
        </div>
        <div style={{ fontSize: 28, color: OG.nightMuted }}>Nota de 0 a 10 con MeDa. Gratis y sin registrarte.</div>
      </div>
    </div>
  );
}

/** Horizontal para WhatsApp, X o Telegram: la pregunta a la izquierda, la nota a la derecha. */
function Preview({ card }: { card: ScoreCard }) {
  const verdict = scoreCardVerdict(card);
  const tone = toneOf(verdict);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: OG.canvas,
        color: OG.ink,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <OgLogo size={52} />
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4 }}>MeDa</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 30, color: OG.muted }}>¿Me da para</div>
          <div style={{ marginTop: 6, fontSize: 64, fontWeight: 600, letterSpacing: -2.6, lineHeight: 1.04 }}>{`${scoreCardThing(card)}?`}</div>
          <div style={{ marginTop: 22, fontSize: 40, fontWeight: 600, letterSpacing: -1, color: tone.light }}>{VERDICT_COPY[verdict].label}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontSize: 176, fontWeight: 600, letterSpacing: -5, lineHeight: 0.8 }}>{formatScore(card.score)}</div>
          <div style={{ fontSize: 40, color: OG.muted }}>/10</div>
        </div>
      </div>
      <OgScale score={card.score} verdict={verdict} width={1056} height={16} labels={false} />
    </div>
  );
}
