import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { VERDICT_THRESHOLDS, type Verdict } from "@/lib/engine";
import { VERDICT_COPY } from "@/lib/copy";

/**
 * Piezas comunes de las imágenes generadas (next/og).
 * Satori no lee variables CSS: estos hex son el espejo de los tokens de app/globals.css.
 * Si cambia un token allí, cambia aquí.
 */
export const OG = {
  canvas: "#f5f6f3",
  surface: "#ffffff",
  subtle: "#eef0ec",
  line: "#e1e4df",
  ink: "#0d1712",
  ink2: "#36413b",
  muted: "#5f6a63",
  night: "#0d1712",
  night2: "#17231c",
  nightLine: "#2a3830",
  nightMuted: "#a4b0a8",
  brand50: "#eaf4ee",
  brand300: "#7fd1a4",
  brand500: "#16895a",
  brand700: "#0a5f3c",
  caution50: "#faf0dc",
  caution300: "#f2c46b",
  caution500: "#d4942a",
  alert50: "#fbe9e6",
  alert300: "#ff9c88",
  alert500: "#d65a42",
} as const;

type Tone = "leaf" | "caution" | "alert";

/** Color de acento por tono: `light` sobre claro, `night` sobre oscuro. */
export const TONE_OG: Record<Tone, { light: string; night: string; soft: string; ring: string }> = {
  leaf: { light: OG.brand700, night: OG.brand300, soft: OG.brand50, ring: OG.brand500 },
  caution: { light: "#855100", night: OG.caution300, soft: OG.caution50, ring: OG.caution500 },
  alert: { light: "#a62a1e", night: OG.alert300, soft: OG.alert50, ring: OG.alert500 },
};

export const toneOf = (v: Verdict) => TONE_OG[VERDICT_COPY[v].tone];

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: "normal" }[]> | null = null;

/**
 * Geist desde assets/fonts (licencia OFL). Se lee una vez por instancia.
 * La ruta parte de la raíz del proyecto (en Vercel, process.cwd()); next.config.ts
 * incluye las fuentes en cada función con outputFileTracingIncludes.
 */
export function geistFonts() {
  fonts ??= Promise.all(
    ([
      [400, "Regular"],
      [500, "Medium"],
      [600, "SemiBold"],
      [700, "Bold"],
    ] as const).map(async ([weight, file]) => ({
      name: "Geist",
      data: await readFile(join(process.cwd(), "assets", "fonts", `Geist-${file}.ttf`)),
      weight,
      style: "normal" as const,
    })),
  );
  return fonts;
}

/** Las imágenes no cambian para los mismos parámetros: caché larga en la CDN. */
export const IMAGE_CACHE = "public, max-age=86400, s-maxage=31536000, immutable";

/** El logo: la Escala en miniatura. Mismo dibujo que components/layout/Logo.tsx. */
export function OgLogo({ size, night = false }: { size: number; night?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="1" y="1" width="30" height="30" rx="10" fill={night ? OG.night2 : OG.night} stroke={night ? OG.nightLine : "none"} />
      <path d="M7.5 21a8.5 8.5 0 0 1 4.25-7.36" fill="none" stroke={OG.alert300} strokeWidth="3.2" />
      <path d="M12.9 13.1a8.5 8.5 0 0 1 6.2 0" fill="none" stroke={OG.caution300} strokeWidth="3.2" />
      <path d="M20.25 13.64A8.5 8.5 0 0 1 24.5 21" fill="none" stroke={OG.brand300} strokeWidth="3.2" />
      <path d="M16 21l5.2-4.6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="21" r="2" fill="white" />
    </svg>
  );
}

const threshold = (v: Verdict) => VERDICT_THRESHOLDS.find(([, verdict]) => verdict === v)?.[0] ?? 0;
const ZONES: { from: number; to: number; label: string; tone: Tone }[] = [
  { from: 0, to: threshold("tight"), label: "Mejor espera", tone: "alert" },
  { from: threshold("tight"), to: threshold("yes"), label: "Justo", tone: "caution" },
  { from: threshold("yes"), to: 10, label: "Te da", tone: "leaf" },
];

/**
 * La Escala MeDa para imágenes: tres zonas sacadas de los umbrales del motor y el marcador en la nota.
 * `width` en px porque Satori no resuelve porcentajes en posiciones absolutas anidadas de forma fiable.
 */
export function OgScale({
  score,
  verdict,
  width,
  height = 20,
  night = false,
  labels = true,
  labelSize = 26,
}: {
  score: number;
  verdict: Verdict;
  width: number;
  height?: number;
  night?: boolean;
  labels?: boolean;
  labelSize?: number;
}) {
  const gap = Math.round(height / 3);
  const usable = width - gap * (ZONES.length - 1);
  const knob = Math.round(height * 2.1);
  const x = Math.min(10, Math.max(0, score)) / 10;
  // La posición real tiene en cuenta los huecos entre zonas.
  const zoneIndex = ZONES.findIndex((z) => score < z.to || z.to === 10);
  const left = x * usable + gap * Math.max(0, zoneIndex);
  const ring = toneOf(verdict).ring;
  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      <div style={{ display: "flex", position: "relative", width, height: knob, alignItems: "center" }}>
        <div style={{ display: "flex", width, height, gap }}>
          {ZONES.map((z) => (
            <div
              key={z.label}
              style={{
                width: ((z.to - z.from) / 10) * usable,
                height,
                borderRadius: height,
                background: night ? TONE_OG[z.tone].night : TONE_OG[z.tone].soft,
                opacity: night ? 0.34 : 1,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: left - knob / 2,
            top: 0,
            width: knob,
            height: knob,
            borderRadius: knob,
            background: "white",
            border: `${Math.round(knob / 5.5)}px solid ${ring}`,
            boxShadow: "0 6px 18px rgba(13,23,18,0.28)",
          }}
        />
      </div>
      {labels && (
        <div style={{ display: "flex", gap, marginTop: Math.round(height * 0.9), width, fontSize: labelSize, color: night ? OG.nightMuted : OG.muted }}>
          {ZONES.map((z) => (
            <div key={z.label} style={{ display: "flex", width: ((z.to - z.from) / 10) * usable }}>
              {z.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
