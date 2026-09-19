import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { headlineCase, MORTGAGE_ASSUMPTIONS as A, mortgageRow } from "@/lib/guides/mortgage";
import { CAR_GUIDE, carRow, RUNNING_EXAMPLE } from "@/lib/guides/car";
import { formatEUR, formatPct } from "@/lib/format";
import { geistFonts, IMAGE_CACHE, OG, OgLogo, OgScale } from "@/lib/og/theme";

export const runtime = "nodejs";

/**
 * Carruseles de Instagram (1080×1350) de las guías. Las cifras salen del motor, igual que en la web.
 * /api/carrusel?guia=hipoteca|coche&n=1…7. Para exportarlos a PNG: scripts/exportar-imagenes.ts.
 */
const SLIDES = 7;
const GUIDES = { hipoteca: { label: "Guía · Vivienda", Slide: HousingSlide }, coche: { label: "Guía · Coche", Slide: CarSlide } } as const;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const n = Number(q.get("n") ?? 1);
  const g = GUIDES[(q.get("guia") ?? "hipoteca") as keyof typeof GUIDES];
  if (!g || !Number.isInteger(n) || n < 1 || n > SLIDES) return new Response("Diapositiva no válida", { status: 400 });
  return new ImageResponse(<g.Slide n={n} label={g.label} />, {
    width: 1080,
    height: 1350,
    fonts: await geistFonts(),
    headers: { "Cache-Control": IMAGE_CACHE },
  });
}

function Frame({ n, label, night = false, children }: { n: number; label: string; night?: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px 88px",
        background: night ? OG.night : OG.canvas,
        color: night ? "white" : OG.ink,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, color: night ? OG.nightMuted : OG.muted }}>
        <div style={{ display: "flex" }}>{label}</div>
        <div style={{ display: "flex" }}>{`${n}/${SLIDES}`}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgLogo size={52} night={night} />
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.4 }}>MeDa</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: night ? OG.nightMuted : OG.muted }}>{n < SLIDES ? "Desliza →" : "medaono.com"}</div>
      </div>
    </div>
  );
}

const Kicker = ({ children, night = false }: { children: ReactNode; night?: boolean }) => (
  <div style={{ display: "flex", fontSize: 36, fontWeight: 500, color: night ? OG.brand300 : OG.brand700 }}>{children}</div>
);

const Big = ({ children, color }: { children: ReactNode; color?: string }) => (
  <div style={{ display: "flex", marginTop: 24, fontSize: 196, fontWeight: 600, letterSpacing: -6, lineHeight: 0.92, color }}>{children}</div>
);

const Line = ({ children, night = false }: { children: ReactNode; night?: boolean }) => (
  <div style={{ display: "flex", marginTop: 36, maxWidth: 860, fontSize: 44, lineHeight: 1.3, color: night ? OG.nightMuted : OG.ink2 }}>{children}</div>
);

function HousingSlide({ n, label }: { n: number; label: string }) {
  const { row } = headlineCase(200_000);
  const rate = `${A.rate.toLocaleString("es-ES")} %`;

  switch (n) {
    case 1:
      return (
        <Frame n={n} label={label} night>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 600, letterSpacing: -5, lineHeight: 1.02 }}>
            ¿Cuánto tienes que cobrar para una hipoteca de 200.000 €?
          </div>
          <Line night>Con números de verdad: cuota, sueldo y lo que hay que tener ahorrado.</Line>
        </Frame>
      );
    case 2:
      return (
        <Frame n={n} label={label}>
          <Kicker>Primero, la cuota</Kicker>
          <Big>{formatEUR(row.payment)}</Big>
          <Line>{`al mes. 200.000 € a ${A.years} años con un ${rate} de interés.`}</Line>
        </Frame>
      );
    case 3:
      return (
        <Frame n={n} label={label}>
          <Kicker>Pero la casa cuesta más que la cuota</Kicker>
          <Big>{formatEUR(row.monthlyTotal)}</Big>
          <Line>{`al mes, sumando unos ${formatEUR(A.running)} de comunidad, IBI y seguro de hogar.`}</Line>
        </Frame>
      );
    case 4:
      return (
        <Frame n={n} label={label}>
          <Kicker>{`La regla del ${formatPct(0.35)}`}</Kicker>
          <Big color={OG.brand700}>{formatEUR(row.minIncomeEffort)}</Big>
          <Line>netos al mes, como mínimo, para que la vivienda no se lleve más del 35 % de tu sueldo. En pareja, entre los dos.</Line>
        </Frame>
      );
    case 5:
      return (
        <Frame n={n} label={label}>
          <Kicker>Lo que casi nadie cuenta</Kicker>
          <Big>{formatEUR(row.cashNeeded)}</Big>
          <Line>{`ahorrados el día de la firma: ${formatEUR(row.downPayment)} de entrada y unos ${formatEUR(row.upfront)} de impuestos y gastos.`}</Line>
        </Frame>
      );
    case 6: {
      const loans = [150_000, 200_000, 250_000, 300_000];
      return (
        <Frame n={n} label={label}>
          <Kicker>{`Sueldo neto mínimo (${A.years} años, ${rate})`}</Kicker>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
            {loans.map((loan) => {
              const r = mortgageRow(loan);
              const on = loan === 200_000;
              return (
                <div
                  key={loan}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "30px 28px",
                    borderBottom: `2px solid ${OG.line}`,
                    background: on ? OG.brand50 : "transparent",
                    borderRadius: on ? 20 : 0,
                  }}
                >
                  <div style={{ display: "flex", fontSize: 44, color: on ? OG.brand700 : OG.ink2 }}>{`Hipoteca de ${formatEUR(loan)}`}</div>
                  <div style={{ display: "flex", fontSize: 64, fontWeight: 600, letterSpacing: -1.2, color: on ? OG.brand700 : OG.ink }}>
                    {formatEUR(r.minIncomeEffort)}
                  </div>
                </div>
              );
            })}
          </div>
        </Frame>
      );
    }
    default:
      return (
        <Frame n={n} label={label} night>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 600, letterSpacing: -5, lineHeight: 1.02 }}>¿Y a ti? Mira si te da.</div>
          <Line night>Pon tu sueldo, tus gastos y tus ahorros. Te sale una nota de 0 a 10 en dos minutos. Gratis y sin registrarte.</Line>
          <div style={{ display: "flex", marginTop: 72 }}>
            <OgScale score={7.6} verdict="yes" width={904} height={22} night labelSize={30} />
          </div>
        </Frame>
      );
  }
}

function CarSlide({ n, label }: { n: number; label: string }) {
  const car = carRow(16_000);
  const long = carRow(16_000, 84);
  const rate = `${CAR_GUIDE.rate.toLocaleString("es-ES")} %`;

  switch (n) {
    case 1:
      return (
        <Frame n={n} label={label} night>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 600, letterSpacing: -5, lineHeight: 1.02 }}>
            «Solo son 260 € al mes.»
          </div>
          <Line night>Lo que de verdad cuesta un coche de 16.000 €, sin trampas.</Line>
        </Frame>
      );
    case 2:
      return (
        <Frame n={n} label={label}>
          <Kicker>La letra</Kicker>
          <Big>{formatEUR(car.payment)}</Big>
          <Line>{`al mes, con ${formatEUR(CAR_GUIDE.downPayment)} de entrada a ${CAR_GUIDE.months} meses al ${rate}.`}</Line>
        </Frame>
      );
    case 3:
      return (
        <Frame n={n} label={label}>
          <Kicker>Lo que nadie suma</Kicker>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
            {RUNNING_EXAMPLE.map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "22px 0", borderBottom: `2px solid ${OG.line}`, fontSize: 42 }}>
                <div style={{ display: "flex", color: OG.ink2 }}>{r.label}</div>
                <div style={{ display: "flex", fontWeight: 600 }}>{`+${formatEUR(r.value)}`}</div>
              </div>
            ))}
          </div>
        </Frame>
      );
    case 4:
      return (
        <Frame n={n} label={label}>
          <Kicker>Lo que cuesta de verdad</Kicker>
          <Big color={OG.brand700}>{formatEUR(car.monthlyTotal)}</Big>
          <Line>{`al mes. La letra es solo el ${formatPct(car.payment / car.monthlyTotal)}.`}</Line>
        </Frame>
      );
    case 5:
      return (
        <Frame n={n} label={label}>
          <Kicker>Lo que tienes que cobrar</Kicker>
          <Big>{formatEUR(car.minIncome)}</Big>
          <Line>netos al mes, para que todo el coche no pase del 20 % de tu sueldo.</Line>
        </Frame>
      );
    case 6:
      return (
        <Frame n={n} label={label}>
          <Kicker>¿Y si lo alargas a 84 meses?</Kicker>
          <Big>{formatEUR(long.payment)}</Big>
          <Line>{`de letra… y ${formatEUR(long.interest)} de intereses, frente a ${formatEUR(car.interest)} a ${CAR_GUIDE.months} meses.`}</Line>
        </Frame>
      );
    default:
      return (
        <Frame n={n} label={label} night>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 600, letterSpacing: -5, lineHeight: 1.02 }}>¿Y a ti? Mira si te da.</div>
          <Line night>Pon el precio, tus gastos y tus ahorros. Te sale una nota de 0 a 10 con todo sumado. Gratis y sin registrarte.</Line>
          <div style={{ display: "flex", marginTop: 72 }}>
            <OgScale score={6.2} verdict="tight" width={904} height={22} night labelSize={30} />
          </div>
        </Frame>
      );
  }
}
