"use client";

import { useId, useState } from "react";
import type { FinancialProfile, PurchaseInput } from "@/lib/engine";
import { encodeShare } from "@/lib/share";
import { scoreCardQuery, type ScoreCard } from "@/lib/scorecard";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconDownload, IconShare } from "@/components/ui/icons";

interface Props {
  path: string;
  title: string;
  purchase: PurchaseInput;
  profile: FinancialProfile;
  /** Nota para la imagen. null = aún con números de ejemplo: no hay nota tuya que compartir */
  card: ScoreCard | null;
}

type ImageState = "idle" | "loading" | "done" | "error";

/**
 * Compartir sin servidor de datos:
 * - «Descargar mi nota»: imagen vertical para stories, solo con la compra y la nota.
 * - «Compartir enlace»: por defecto lleva a /nota (con vista previa de la nota); con tus datos, a la calculadora.
 */
export function ShareButton({ path, title, purchase, profile, card }: Props) {
  const id = useId();
  const [includeProfile, setIncludeProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [image, setImage] = useState<ImageState>("idle");

  function linkFor() {
    const origin = window.location.origin;
    if (card && !includeProfile) return `${origin}/nota?${scoreCardQuery(card)}&s=${encodeShare({ purchase })}`;
    // En el hash: tus números nunca llegan al servidor ni a sus logs.
    return `${origin}${path}#s=${encodeShare({ purchase, profile: includeProfile ? profile : undefined })}`;
  }

  async function shareLink() {
    const url = linkFor();
    const text = includeProfile ? `${title} Mira mi resultado en MeDa.` : `${title} Compruébalo con tus números en MeDa.`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "MeDa", text, url });
        track("compartir", { metodo: "nativo", con_datos: includeProfile, origen: path });
        return;
      } catch {
        // Cancelado o no disponible: probamos a copiar.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      track("compartir", { metodo: "copiar", con_datos: includeProfile, origen: path });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este enlace", url);
    }
  }

  async function shareImage() {
    if (!card || image === "loading") return;
    setImage("loading");
    try {
      const res = await fetch(`/api/nota?${scoreCardQuery(card)}`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], `meda-nota-${card.slug}.png`, { type: "image/png" });

      // En el móvil, directo a la hoja de compartir (Instagram, WhatsApp…). En ordenador, descarga.
      const touch = window.matchMedia("(pointer: coarse)").matches;
      if (touch && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: "¿Y a ti, te da? medaono.com" });
          track("compartir", { metodo: "imagen_nativo", origen: path, nota: Math.round(card.score) });
          setImage("idle");
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") {
            setImage("idle");
            return;
          }
          // Si la hoja falla, descargamos.
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.append(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      track("compartir", { metodo: "imagen_descarga", origen: path, nota: Math.round(card.score) });
      setImage("done");
      window.setTimeout(() => setImage("idle"), 2500);
    } catch {
      setImage("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Button onClick={shareImage} disabled={!card} aria-busy={image === "loading"} className="w-full">
          {image === "done" ? <IconCheck size={18} aria-hidden="true" /> : <IconDownload size={18} aria-hidden="true" />}
          <span aria-live="polite">
            {image === "loading" ? "Preparando tu nota…" : image === "done" ? "Nota descargada" : "Descargar mi nota"}
          </span>
        </Button>
        <p className={image === "error" ? "text-[13px] text-alert-700" : "text-[13px] text-muted"}>
          {image === "error"
            ? "No hemos podido crear la imagen. Prueba otra vez en unos segundos."
            : card
              ? "Imagen para stories con la compra y tu nota. Sin sueldo ni ahorros."
              : "Pon tus números para descargar tu nota."}
        </p>
      </div>

      <Button variant="secondary" onClick={shareLink} className="w-full">
        {copied ? <IconCheck size={18} aria-hidden="true" /> : <IconShare size={18} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Enlace copiado" : "Compartir enlace"}</span>
      </Button>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-muted">
        <input
          id={id}
          type="checkbox"
          checked={includeProfile}
          onChange={(e) => setIncludeProfile(e.target.checked)}
          className="size-[18px] accent-brand-600"
        />
        Incluir mis ingresos y ahorros en el enlace
      </label>
    </div>
  );
}
