"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { INFO_NAV, NAV, PERSONAL_NAV } from "@/lib/site";
import { useProfile } from "@/lib/storage/hooks";
import { ButtonLink } from "@/components/ui/Button";
import { IconClose, IconMenu, IconWallet } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { Logo } from "./Logo";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** "Mis números" con su estado: el usuario sabe si ya los ha guardado. */
function ProfileChip({ className }: { className?: string }) {
  const pathname = usePathname();
  const [, , { hydrated, saved }] = useProfile();
  const active = isActive(pathname, "/mi-situacion");
  return (
    <Link
      href="/mi-situacion"
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[15px] transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-brand-600",
        active ? "bg-subtle text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink",
        className,
      )}
    >
      <span className="relative">
        <IconWallet size={20} aria-hidden="true" />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-canvas transition-colors duration-200",
            hydrated && saved ? "bg-brand-500" : "bg-line-strong",
          )}
        />
      </span>
      <span>Mis números</span>
      <span className="sr-only">{hydrated && saved ? "(guardados)" : "(sin guardar)"}</span>
    </Link>
  );
}

function SheetLink({ href, label, description }: { href: string; label: string; description?: string }) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-13 items-center justify-between gap-3 rounded-xl px-3 transition-colors duration-150",
        active ? "bg-subtle" : "active:bg-subtle",
      )}
    >
      <span>
        <span className="block text-[17px] font-medium text-ink">{label}</span>
        {description && <span className="block text-[13px] text-muted">{description}</span>}
      </span>
      {active && <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => dialog.current?.close(), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Herramientas" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-full px-3.5 text-[15px] transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-brand-600",
                      active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active && <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-[11px] h-0.5 rounded-full bg-ink" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ProfileChip className="max-md:hidden" />
          <ButtonLink href="/calculadoras" className="max-sm:hidden">
            Calcular ahora
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-brand-600 lg:hidden"
            aria-haspopup="dialog"
            aria-label="Abrir menú"
            onClick={() => dialog.current?.showModal()}
          >
            <IconMenu size={22} />
          </button>
        </div>
      </div>

      {/* Móvil: hoja inferior, al alcance del pulgar */}
      <dialog
        ref={dialog}
        aria-label="Menú"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className={cn(
          "mt-auto mb-0 max-h-[88dvh] w-full max-w-none rounded-t-[1.75rem] bg-surface p-0 text-ink shadow-raised lg:hidden",
          "backdrop:bg-night/40 backdrop:backdrop-blur-[2px]",
          "open:translate-y-0 open:transition-[translate,overlay,display] open:duration-300 open:ease-(--ease-out) starting:open:translate-y-full",
        )}
      >
        <div className="flex flex-col gap-6 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <span aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-line-strong" />
          </div>
          <div className="-mt-4 flex items-center justify-between">
            <p className="px-3 text-[13px] font-medium text-muted">Herramientas</p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Cerrar menú"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-subtle focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <IconClose size={20} />
            </button>
          </div>
          <nav aria-label="Menú móvil" className="-mt-4 flex flex-col gap-5">
            <div className="flex flex-col">
              {NAV.map((n) => (
                <SheetLink key={n.href} href={n.href} label={n.label} />
              ))}
            </div>
            <div>
              <p className="mb-1 px-3 text-[13px] font-medium text-muted">Tus cosas · solo en este móvil</p>
              {PERSONAL_NAV.map((n) => (
                <SheetLink key={n.href} {...n} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line px-3 pt-3">
              {INFO_NAV.map((n) => (
                <Link key={n.href} href={n.href} className="inline-flex min-h-11 items-center text-[15px] text-muted">
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
          <ButtonLink href="/calculadoras" size="lg" className="w-full">
            Calcular ahora
          </ButtonLink>
        </div>
      </dialog>
    </header>
  );
}
