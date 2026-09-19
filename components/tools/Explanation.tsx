"use client";

import { useEffect, useRef, useState } from "react";
import type { AffordabilityResult } from "@/lib/engine";
import { explainResult } from "@/lib/explain/template";
import { buildFacts } from "@/lib/ai/facts";
import { requestExplanation } from "@/lib/ai/client";
import { Button } from "@/components/ui/Button";
import { IconChat } from "@/components/ui/icons";

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

type AiState = { status: "idle" } | { status: "loading" } | { status: "done"; text: string } | { status: "failed"; message: string };

/** Explicación completa en texto llano. La IA, si está activa, solo la reformula. */
export function Explanation({ result, what }: { result: AffordabilityResult; what: string }) {
  const [ai, setAi] = useState<AiState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);
  const paragraphs = explainResult(result, what);

  // Si cambian los números, la explicación de la IA deja de ser válida.
  useEffect(() => {
    controller.current?.abort();
    setAi({ status: "idle" });
  }, [result]);

  async function ask() {
    controller.current?.abort();
    controller.current = new AbortController();
    setAi({ status: "loading" });
    const res = await requestExplanation(buildFacts(result, what), controller.current.signal);
    if (res.ok) setAi({ status: "done", text: res.text });
    else
      setAi({
        status: "failed",
        message:
          res.reason === "unverified"
            ? "La respuesta de la IA incluía cifras que no salen de tu cálculo, así que la hemos descartado."
            : "Ahora mismo no podemos generar la explicación. La de arriba es la oficial.",
      });
  }

  return (
    <div>
      <div className="flex max-w-[65ch] flex-col gap-3 text-[15px] leading-relaxed text-ink-2">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {AI_ENABLED && (
        <div className="mt-5 border-t border-line pt-5">
          {ai.status === "done" ? (
            <div>
              <p className="text-sm font-semibold text-ink">Dicho de otra forma</p>
              <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{ai.text}</p>
              <p className="mt-3 text-[13px] text-muted">Redactado con IA a partir de tu cálculo. Hemos comprobado que no añade cifras.</p>
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={ask} disabled={ai.status === "loading"} aria-busy={ai.status === "loading"}>
                <IconChat size={18} aria-hidden="true" />
                {ai.status === "loading" ? "Redactando…" : "Explícamelo más fácil"}
              </Button>
              {ai.status === "failed" && <p className="mt-3 text-[14px] text-muted">{ai.message}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
