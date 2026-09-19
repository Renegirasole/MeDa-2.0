"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import type { CategorySlug } from "@/lib/data/categories";
import { CONSENT_TEXT, LEAD_ERROR_COPY, type LeadError } from "@/lib/leads";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * «Avísame cuando me dé»: un email al mes para volver a mirarlo.
 * Solo se guarda el email y el objetivo (categoría e importe), nunca el perfil.
 */
export function NotifyBlock({ category, amount, verdict }: { category: CategorySlug; amount: number; verdict: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    if (!consent) {
      setState({ kind: "error", message: LEAD_ERROR_COPY.consent });
      return;
    }
    setState({ kind: "sending" });
    const website = (new FormData(e.currentTarget).get("website") as string | null) ?? "";
    try {
      const res = await fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, category, amount, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: LeadError | "server" | "unavailable" };
      if (data.ok) {
        track("lista_email", { categoria: category, veredicto: verdict });
        setState({ kind: "done" });
        return;
      }
      const err = data.error;
      setState({
        kind: "error",
        message: err && err in LEAD_ERROR_COPY ? LEAD_ERROR_COPY[err as keyof typeof LEAD_ERROR_COPY] : "No hemos podido apuntarte. Prueba otra vez en un rato.",
      });
    } catch {
      setState({ kind: "error", message: "Sin conexión. Prueba otra vez en un rato." });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-card bg-brand-50 p-5 text-[15px] leading-relaxed text-ink">
        <IconCheck size={20} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Apuntado.</strong> Te escribiremos una vez al mes para que vuelvas a mirarlo. Te
          puedes dar de baja desde cualquier email.
        </p>
      </div>
    );
  }

  const error = state.kind === "error" ? state.message : null;
  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-line p-5 sm:p-6" aria-describedby={`${id}-desc`}>
      <p className="text-lg font-semibold tracking-[-0.02em] text-ink">Avísame para volver a mirarlo</p>
      <p id={`${id}-desc`} className="mt-1.5 text-[15px] leading-relaxed text-muted">
        Una vez al mes te recordamos este objetivo para que compruebes si ya te da. No guardamos tus números: solo tu email y
        lo que quieres comprar.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor={`${id}-email`} className="text-[14px] font-medium text-ink-2">
            Tu email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error === LEAD_ERROR_COPY.email || undefined}
            className="h-12 w-full min-w-0 rounded-(--radius-control) border border-line-strong bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted hover:border-ink/30 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 aria-invalid:border-alert-500"
            placeholder="nombre@correo.com"
          />
        </div>
        <Button type="submit" aria-busy={state.kind === "sending"} className="h-12 w-full sm:w-auto">
          {state.kind === "sending" ? "Apuntando…" : "Avísame"}
        </Button>
      </div>

      {/* Campo trampa para bots: invisible para personas y lectores de pantalla */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <label htmlFor={`${id}-ok`} className="mt-4 flex cursor-pointer items-start gap-2.5 text-[14px] leading-snug text-muted">
        <input
          id={`${id}-ok`}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 accent-brand-600"
        />
        <span>
          {CONSENT_TEXT}{" "}
          <Link href="/legal/privacidad" className="underline underline-offset-4 hover:text-ink">
            Privacidad
          </Link>
          .
        </span>
      </label>

      <p aria-live="polite" className="mt-3 min-h-5 text-[14px] text-alert-700">
        {error}
      </p>
    </form>
  );
}
