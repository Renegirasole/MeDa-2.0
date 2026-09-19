"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { buildPlans, evaluateOne, maxAffordable, PASSING_SCORE, type FinancialProfile, type PurchaseInput } from "@/lib/engine";
import { CATEGORY_BY_SLUG, type CategorySlug } from "@/lib/data/categories";
import { dealLinks } from "@/lib/affiliates";
import { decodeShare } from "@/lib/share";
import { makeScoreCard } from "@/lib/scorecard";
import { track } from "@/lib/analytics";
import { secondaryNotes } from "@/lib/explain/insight";
import { useCombo, useProfile } from "@/lib/storage/hooks";
import { VERDICT_COPY } from "@/lib/copy";
import { formatScore } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button, buttonClass } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { PartnerLinks } from "@/components/ui/PartnerLinks";
import { IconCheck, IconInfo, IconLock, IconStack } from "@/components/ui/icons";
import { toneFor } from "@/components/ui/ScoreScale";
import { cn } from "@/components/ui/cn";
import { ProfileForm } from "./ProfileForm";
import { PurchaseForm } from "./PurchaseForm";
import { ResultCard } from "./ResultCard";
import { FactorList } from "./FactorList";
import { Explanation } from "./Explanation";
import { PlansList, recommendedTier } from "./PlansList";
import { ShareButton } from "./ShareButton";
import { GoalBlock } from "./GoalBlock";
import { Step } from "./Step";

/** Bloque de la segunda mitad: titular propio, sin caja de más. */
function Block({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-24 border-t border-line pt-10 md:pt-14">
      <p className="text-[13px] font-medium text-brand-700">{eyebrow}</p>
      <h2 id={`${id}-t`} className="mt-2 mb-7 text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-ink md:text-[2rem]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AffordabilityCalculator({ slug }: { slug: CategorySlug }) {
  const category = CATEGORY_BY_SLUG[slug];

  const [storedProfile, setStoredProfile, { hydrated, saved }] = useProfile();
  const [sharedProfile, setSharedProfile] = useState<FinancialProfile | null>(null);
  const profile = sharedProfile ?? storedProfile;
  const [purchase, setPurchaseState] = useState<PurchaseInput>(category.defaults);
  // Sin números propios (ni guardados ni compartidos) la nota es de ejemplo, no del usuario.
  const example = !sharedProfile && !(hydrated && saved);

  const started = useRef(false);
  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("calculo_empezado", { categoria: slug });
  }
  function setPurchase(p: PurchaseInput) {
    markStarted();
    setPurchaseState(p);
  }

  // Enlaces compartidos: /calculadoras/coche#s=<token>
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("s");
    const shared = decodeShare(token);
    if (!shared) return;
    setPurchaseState(shared.purchase);
    if (shared.profile) setSharedProfile(shared.profile);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  const [combo, setCombo] = useCombo();
  const [added, setAdded] = useState(false);
  // La barra móvil sobra cuando el resultado ya está a la vista.
  const [resultVisible, setResultVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById("resultado");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setResultVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const result = useMemo(() => evaluateOne(profile, purchase, category.guideline), [profile, purchase, category.guideline]);
  const plans = useMemo(() => buildPlans(profile, purchase, category.guideline), [profile, purchase, category.guideline]);
  const what = category.slug === "otro" ? "este gasto" : `este gasto en ${category.name.toLowerCase()}`;
  const recurring = category.kind === "recurring";
  const passes = result.score >= PASSING_SCORE;
  const anyPlanPasses = recommendedTier(plans) !== null;
  const notes = secondaryNotes(result);
  // Los partners abren con lo que ya sabemos: tope que te da e importe a financiar.
  const links = useMemo(() => {
    if (example) return dealLinks(slug);
    const max = maxAffordable(profile, purchase, category.guideline);
    const deal = passes ? purchase : max?.purchase;
    const cap = max ? (recurring ? max.purchase.monthlyFee : max.purchase.price) : undefined;
    return dealLinks(slug, {
      budget: passes ? Math.max(cap ?? 0, recurring ? purchase.monthlyFee : purchase.price) : cap,
      loan: deal && deal.termMonths > 0 ? deal.price - deal.downPayment : undefined,
    });
  }, [example, slug, profile, purchase, category.guideline, passes, recurring]);
  const tone = toneFor(result.verdict);

  // Un cálculo cuenta como completado cuando la nota es con números propios y
  // lleva 2 s sin cambiar (así no se mide cada tecla). Una vez por visita.
  const completed = useRef(false);
  useEffect(() => {
    if (example || completed.current) return;
    const t = window.setTimeout(() => {
      completed.current = true;
      track("calculo_completado", { categoria: slug, veredicto: result.verdict, nota: Math.round(result.score) });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [example, result, slug]);

  function updateProfile(p: FinancialProfile) {
    markStarted();
    setSharedProfile(null);
    setStoredProfile(p);
  }

  function addToCombo() {
    setCombo([...combo.filter((c) => c.slug !== slug), { id: `${slug}-${Date.now()}`, slug, label: category.name, purchase }]);
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      {/* 1. Datos y resultado en vivo */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          {sharedProfile && (
            <div role="status" className="flex flex-col gap-3 rounded-card bg-caution-50 p-4 text-[15px] text-ink sm:flex-row sm:items-center sm:justify-between">
              <p>Estás viendo los números de quien te lo ha compartido.</p>
              <Button variant="secondary" onClick={() => setSharedProfile(null)}>
                Usar los míos
              </Button>
            </div>
          )}
          <Step
            n={1}
            title="Tu situación"
            aside={
              <span className="hidden items-center gap-1.5 text-[13px] text-muted sm:flex">
                <IconLock size={14} aria-hidden="true" /> Solo en este dispositivo
              </span>
            }
          >
            <ProfileForm profile={profile} onChange={updateProfile} />
          </Step>
          <Step n={2} title={category.kind === "purchase" ? "Qué quieres comprar" : "Qué quieres pagar"}>
            <PurchaseForm category={category} purchase={purchase} onChange={setPurchase} />
          </Step>
        </div>

        <div className="lg:sticky lg:top-24">
          <ResultCard id="resultado" result={result} example={example}>
            <a href="#por-que" className={buttonClass("secondary", "md", "sm:flex-1")}>
              Por qué esta nota
            </a>
            <a href="#siguiente" className={buttonClass(passes ? "primary" : "secondary", "md", "sm:flex-1")}>
              {passes ? "Siguiente paso" : "Cómo llegar"}
            </a>
          </ResultCard>
        </div>
      </div>

      {/* 2. Por qué */}
      <Block id="por-que" eyebrow="Transparencia" title="Por qué te sale esta nota">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <FactorList result={result} />
          <div className="flex flex-col gap-6">
            {notes.length > 0 && (
              <ul className="flex flex-col gap-3">
                {notes.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink-2">
                    <IconInfo size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                    {n}
                  </li>
                ))}
              </ul>
            )}
            <Disclosure summary="Leer la explicación completa" defaultOpen={notes.length === 0} className="border-y border-line py-3">
              <Explanation result={result} what={what} />
            </Disclosure>
          </div>
        </div>
      </Block>

      {/* 3. Opciones */}
      <Block id="opciones" eyebrow="Tus opciones" title="La misma compra, en tres planes">
        <PlansList plans={plans} recurring={recurring} />
        <p className="mt-4 text-[13px] text-muted">Mismas reglas para los tres. El recomendado es el más completo que aprueba.</p>
      </Block>

      {/* 4. Siguiente paso */}
      <Block id="siguiente" eyebrow="Siguiente paso" title={example ? "Tu siguiente paso" : passes ? "Te da. Ahora, al mejor precio" : anyPlanPasses ? "Así, no. Pero hay camino" : "Todavía no. Así llegas"}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            {!example && <GoalBlock profile={profile} purchase={purchase} guideline={category.guideline} result={result} recurring={recurring} />}
            {example ? (
              <p className="text-[15px] leading-relaxed text-ink-2">
                <a href="#paso-1" className="font-medium text-ink underline underline-offset-4 hover:text-brand-700">
                  Pon tus números
                </a>{" "}
                y te diremos si te da y dónde buscar el mejor precio.
              </p>
            ) : anyPlanPasses ? (
              <PartnerLinks
                links={links}
                context={slug}
                title={passes ? "Dónde buscar el mejor precio" : "Busca opciones más asequibles"}
              />
            ) : (
              <p className="text-[15px] leading-relaxed text-ink-2">
                Como ahora mismo ningún plan te da, no te mandamos a comprar. Vuelve cuando cambien tus números: los guardamos en
                este dispositivo.
              </p>
            )}
          </div>

          <Card className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="font-semibold text-ink">Guárdalo o compártelo</p>
              <p className="mt-1 text-[14px] leading-snug text-muted">Sin cuenta: todo se queda en tu dispositivo o en el enlace.</p>
            </div>
            <ShareButton
              path={`/calculadoras/${slug}`}
              title={category.question}
              purchase={purchase}
              profile={profile}
              card={example ? null : makeScoreCard(slug, result.score, recurring ? purchase.monthlyFee : purchase.price)}
            />
            <div className="border-t border-line pt-4">
              {added ? (
                <p className="flex min-h-11 items-center gap-2 text-[15px] text-ink">
                  <IconCheck size={18} className="text-brand-600" aria-hidden="true" />
                  Añadido a tu lista.
                  <Link href="/combinar" className="font-medium underline underline-offset-4 hover:text-brand-700">
                    ¿Te da todo junto?
                  </Link>
                </p>
              ) : (
                <Button variant="tertiary" onClick={addToCombo} className="-ml-4">
                  <IconStack size={18} aria-hidden="true" />
                  Añadir a mi lista
                </Button>
              )}
            </div>
          </Card>
        </div>
      </Block>

      {/* Móvil: la nota siempre a mano mientras rellenas */}
      <a
        href="#resultado"
        aria-hidden={resultVisible}
        tabIndex={resultVisible ? -1 : undefined}
        className={cn(
          "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 rounded-2xl bg-night px-4 py-3 text-white shadow-raised transition-[transform,opacity] duration-200 ease-(--ease-out) active:scale-[0.98] lg:hidden",
          resultVisible && "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0",
        )}
      >
        <span className="flex items-center gap-2.5 text-[15px] font-medium">
          <span aria-hidden="true" className={cn("size-2.5 rounded-full transition-colors duration-200", example ? "bg-night-muted" : tone.fill)} />
          {example ? (
            <span>
              Ejemplo <span className="text-night-muted">· pon tus números</span>
            </span>
          ) : (
            <span>
              <span className="num font-semibold">{formatScore(result.score)}</span>
              <span className="text-night-muted">/10</span> · {VERDICT_COPY[result.verdict].label}
            </span>
          )}
        </span>
        <span className="text-[14px] text-night-muted">Ver resultado</span>
      </a>
    </div>
  );
}
