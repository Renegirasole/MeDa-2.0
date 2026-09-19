import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icono de pantalla de inicio en iOS: la Escala MeDa a sangre (iOS ya redondea las esquinas). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0d1712" }}>
        <svg width="180" height="180" viewBox="2 2 28 28">
          <path d="M7.5 21a8.5 8.5 0 0 1 4.25-7.36" fill="none" stroke="#ff9c88" strokeWidth="3.2" />
          <path d="M12.9 13.1a8.5 8.5 0 0 1 6.2 0" fill="none" stroke="#f2c46b" strokeWidth="3.2" />
          <path d="M20.25 13.64A8.5 8.5 0 0 1 24.5 21" fill="none" stroke="#7fd1a4" strokeWidth="3.2" />
          <path d="M16 21l5.2-4.6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="16" cy="21" r="2" fill="white" />
        </svg>
      </div>
    ),
    size,
  );
}
