"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Address, Dwelling, ListingStats, Zone, ZoneMode } from "@/lib/zonas/tipos";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { IconCheck, IconWarning } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

export interface ZoneResult {
  address: Address;
  zone: Zone;
  dwellings: Dwelling[];
  /** Anuncios de la zona ahora mismo (idealista), si hay llave y cobertura */
  listings: ListingStats | null;
  sources: { rentYear: number; salePeriod: string };
}

/**
 * Busca la dirección (CartoCiudad, IGN) y, con ella, los datos de la zona y las
 * viviendas del edificio (Catastro). La persona solo escribe su calle.
 */
export function ZoneLookup({
  mode,
  result,
  onResult,
  onDwelling,
  selectedRef,
}: {
  mode: ZoneMode;
  result: ZoneResult | null;
  onResult: (r: ZoneResult | null) => void;
  onDwelling: (d: Dwelling | null) => void;
  selectedRef: string | null;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const box = useRef<HTMLDivElement>(null);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 4) {
      setOptions([]);
      setState("idle");
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetch(`/api/zona?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { addresses?: Address[] };
        setOptions(data.addresses ?? []);
        setOpen(true);
        setActive(-1);
        setState("idle");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  async function choose(a: Address) {
    skip.current = true;
    setQuery(a.label);
    setOpen(false);
    setState("loading");
    try {
      const params = new URLSearchParams({ muni: a.muniCode, lat: String(a.lat), lng: String(a.lng), modo: mode });
      if (a.refCatastral) params.set("rc", a.refCatastral);
      const res = await fetch(`/api/zona?${params}`);
      if (!res.ok) throw new Error("zona");
      const data = (await res.json()) as Omit<ZoneResult, "address">;
      onResult({ address: a, ...data });
      onDwelling(data.dwellings.length === 1 ? data.dwellings[0] : null);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  function reset() {
    onResult(null);
    onDwelling(null);
    setQuery("");
    setOptions([]);
    setState("idle");
  }

  if (result) {
    const z = result.zone;
    const homes = result.dwellings;
    return (
      <div className="flex flex-col gap-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink">
          <IconCheck size={18} aria-hidden="true" className="text-brand-600" />
          <span className="font-medium">{result.address.label}</span>
          <span className="text-muted">
            {z.muniName}
            {z.sectionCode ? " · barrio localizado" : ""}
          </span>
          <Button variant="tertiary" className="-my-2 ml-auto" onClick={reset}>
            Cambiar
          </Button>
        </p>

        {homes.length > 1 && (
          <SelectField
            label="Tu vivienda en el edificio"
            value={selectedRef ?? ""}
            onChange={(v) => onDwelling(homes.find((d) => d.ref === v) ?? null)}
            options={[
              { value: "", label: `Elige la tuya (${homes.length} viviendas)` },
              ...homes.map((d) => ({ value: d.ref, label: `${d.label} — ${d.area} m²` })),
            ]}
            hint="Los metros y el año salen del Catastro. Si no la encuentras, escribe los metros abajo."
            className="max-w-md"
          />
        )}
        {homes.length === 1 && (
          <p className="text-[14px] text-muted">
            Catastro: {homes[0].area} m² {homes[0].year ? `· construido en ${homes[0].year}` : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={box} className="relative flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium text-ink-2">
        Dirección del piso
      </label>
      <div className="flex h-12 items-center rounded-(--radius-control) border border-line-strong bg-surface px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100 hover:border-ink/30">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-op-${active}` : undefined}
          autoComplete="off"
          placeholder="Calle Mayor 10, Alcalá de Henares"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => options.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || options.length === 0) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (e.key === "ArrowDown" ? (i + 1) % options.length : (i - 1 + options.length) % options.length));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              void choose(options[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="w-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        {state === "loading" && <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-brand-600" aria-hidden="true" />}
      </div>

      {open && options.length > 0 && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-auto rounded-(--radius-control) border border-line bg-surface py-1 shadow-raised"
        >
          {options.map((a, i) => (
            <li key={a.id} id={`${id}-op-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => void choose(a)}
                className={cn(
                  "flex min-h-11 w-full flex-col items-start gap-0.5 px-3.5 py-2 text-left transition-colors duration-100",
                  i === active ? "bg-subtle" : "",
                )}
              >
                <span className="text-[15px] text-ink">{a.label}</span>
                <span className="text-[13px] text-muted">
                  {a.postalCode} {a.muniName} ({a.provName})
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {state === "error" && (
        <p className="flex items-center gap-2 text-[13px] text-alert-700">
          <IconWarning size={16} aria-hidden="true" />
          No hemos podido consultar la dirección. Prueba otra vez o escribe los metros a mano.
        </p>
      )}
      <p className="text-[13px] leading-snug text-muted">
        Escribe calle, número y ciudad. No guardamos la dirección: solo la usamos para saber el barrio.
      </p>
    </div>
  );
}
