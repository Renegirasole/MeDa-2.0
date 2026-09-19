import { ImageResponse } from "next/og";

export const alt = "MeDa: ¿te da para eso? Calcula si te da antes de comprar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Tarjeta para redes: la marca, la pregunta y la escala. Sin fotos, sin ruido. */
export default function OpengraphImage() {
  const zones = [
    { grow: 5, bg: "#fbe9e6" },
    { grow: 2, bg: "#faf0dc" },
    { grow: 3, bg: "#eaf4ee" },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f5f6f3", color: "#0d1712" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect x="1" y="1" width="30" height="30" rx="10" fill="#0d1712" />
            <path d="M7.5 21a8.5 8.5 0 0 1 4.25-7.36" fill="none" stroke="#ff9c88" strokeWidth="3.2" />
            <path d="M12.9 13.1a8.5 8.5 0 0 1 6.2 0" fill="none" stroke="#f2c46b" strokeWidth="3.2" />
            <path d="M20.25 13.64A8.5 8.5 0 0 1 24.5 21" fill="none" stroke="#7fd1a4" strokeWidth="3.2" />
            <path d="M16 21l5.2-4.6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="21" r="2" fill="white" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5 }}>MeDa</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -5, lineHeight: 1 }}>¿Te da para eso?</div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#5f6a63" }}>Tu nota de 0 a 10 antes de comprar. Gratis y sin registrarte.</div>
        </div>
        <div style={{ display: "flex", gap: 6, height: 18, position: "relative" }}>
          {zones.map((z) => (
            <div key={z.bg} style={{ flexGrow: z.grow, background: z.bg, borderRadius: 9 }} />
          ))}
          <div style={{ position: "absolute", left: "76%", top: -9, width: 36, height: 36, borderRadius: 18, background: "white", border: "6px solid #16895a" }} />
        </div>
      </div>
    ),
    size,
  );
}
