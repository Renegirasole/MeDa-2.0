"use client";

import { useId, useState } from "react";
import type { FinancialProfile, PurchaseInput } from "@/lib/engine";
import { encodeShare } from "@/lib/share";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconShare } from "@/components/ui/icons";

interface Props {
  path: string;
  title: string;
  purchase: PurchaseInput;
  profile: FinancialProfile;
}

/** Compartir sin servidor. Por defecto, sin tus ingresos ni ahorros. */
export function ShareButton({ path, title, purchase, profile }: Props) {
  const id = useId();
  const [includeProfile, setIncludeProfile] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const token = encodeShare({ purchase, profile: includeProfile ? profile : undefined });
    // En el hash: nunca llega al servidor ni a sus logs.
    const url = `${window.location.origin}${path}#s=${token}`;
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

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={share} className="w-full sm:w-auto">
        {copied ? <IconCheck size={18} aria-hidden="true" /> : <IconShare size={18} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Enlace copiado" : "Compartir resultado"}</span>
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
