"use client";

import { useState } from "react";
import { formatEUR, formatMonths } from "@/lib/format";
import { useProfile } from "@/lib/storage/hooks";
import { ArrowGlyph, Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { Stat } from "@/components/ui/Stat";
import { ProfileForm } from "./ProfileForm";

/** Mis números: se rellenan una vez y valen para todas las herramientas. */
export function ProfileEditor() {
  const [profile, setProfile, { hydrated, saved, clear }] = useProfile();
  const [confirming, setConfirming] = useState(false);
  const free = profile.monthlyIncome - profile.monthlyExpenses - profile.monthlyDebtPayments;
  const cushionNow =
    profile.monthlyExpenses + profile.monthlyDebtPayments > 0
      ? Math.max(0, profile.savings - profile.upcomingExpenses) / (profile.monthlyExpenses + profile.monthlyDebtPayments)
      : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8">
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Tu situación</h2>
          {hydrated && (
            <span className="flex items-center gap-1.5 text-[13px] text-muted" aria-live="polite">
              {saved ? (
                <>
                  <IconCheck size={14} className="text-brand-600" aria-hidden="true" /> Guardado
                </>
              ) : (
                "Valores de ejemplo"
              )}
            </span>
          )}
        </div>
        <ProfileForm profile={profile} onChange={setProfile} expanded />
      </Card>

      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <Card tone="night" className="p-5 sm:p-7">
          <p className="text-[13px] font-medium text-night-muted">Hoy, antes de comprar nada</p>
          <dl className="mt-5 grid grid-cols-2 gap-5">
            <Stat
              tone="night"
              lead
              label={free >= 0 ? "Te sobra al mes" : "Te falta al mes"}
              value={<span className={free < 0 ? "text-alert-300" : undefined}>{formatEUR(Math.abs(free))}</span>}
            />
            <Stat tone="night" lead label="Tu colchón cubre" value={formatMonths(cushionNow)} />
          </dl>
          <ButtonLink href="/calculadoras" variant="inverse" size="lg" className="mt-7 w-full">
            Comprobar una compra
            <ArrowGlyph />
          </ButtonLink>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-2">
            <IconShield size={20} className="mt-px shrink-0 text-brand-600" aria-hidden="true" />
            Se guarda solo en este navegador. No hay cuenta, no lo enviamos a ningún servidor y puedes borrarlo cuando quieras.
          </p>
          <div className="mt-4 border-t border-line pt-3">
            {confirming ? (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirmar borrado">
                <p className="w-full text-[14px] text-ink">¿Borrar tus números de este dispositivo?</p>
                <Button
                  variant="destructive"
                  className="border border-alert-500/40"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                >
                  Sí, borrar
                </Button>
                <Button variant="tertiary" onClick={() => setConfirming(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="destructive" className="-ml-4" onClick={() => setConfirming(true)} disabled={!saved}>
                Borrar mis datos
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
