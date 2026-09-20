"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { buildOptions, selectionName, type PlaceOption, type PlaceSelection } from "@/lib/viajes/lugares";
import { usePlaces } from "@/lib/viajes/hooks";
import { IconClose, IconGlobe, IconPin, IconSearch } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

const GROUP_TITLE: Record<PlaceOption["group"], string | null> = { catalogo: null, mundo: "En todo el mundo" };
const GROUP_ICON = { catalogo: IconPin, mundo: IconGlobe } as const;

interface Props {
  label: string;
  placeholder: string;
  kind: "origin" | "destination";
  value: PlaceSelection;
  onChange: (value: PlaceSelection) => void;
  /** Título de la lista cuando aún no se ha escrito nada */
  catalogTitle: string;
  className?: string;
}

/**
 * Buscador de ciudad: al abrirlo enseña las que tenemos revisadas a mano y,
 * al escribir, cualquier ciudad con aeropuerto del mundo.
 */
export function PlaceField({ label, placeholder, kind, value, onChange, catalogTitle, className }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState(selectionName(value));
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = typing ? text : "";
  const remote = usePlaces(query);
  const options = useMemo(
    () => buildOptions(kind, query, remote.status === "ok" ? remote.places : []),
    [kind, query, remote],
  );
  const activeIndex = Math.min(active, Math.max(0, options.length - 1));

  function choose(option: PlaceOption) {
    onChange(option.selection);
    setText(selectionName(option.selection));
    setTyping(false);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && options[activeIndex]) {
      e.preventDefault();
      choose(options[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setText(selectionName(value));
      setTyping(false);
    }
  }

  const status =
    remote.status === "loading"
      ? "Buscando en todo el mundo…"
      : remote.status === "error"
        ? "No hemos podido buscar fuera de la lista ahora mismo."
        : remote.status === "ok" && options.length === 0
          ? "Sin resultados. Prueba con la ciudad con aeropuerto más cercana."
          : null;

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <label htmlFor={`${id}-input`} className="text-[14px] font-medium text-ink-2">
        {label}
      </label>
      <div
        className={cn(
          "relative flex h-12 items-center rounded-(--radius-control) border border-line-strong bg-surface transition-[border-color,box-shadow] duration-150",
          "hover:border-ink/30 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100",
        )}
      >
        <IconSearch size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 text-muted" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[activeIndex] ? `${id}-${options[activeIndex].key}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={text}
          onFocus={(e) => {
            setOpen(true);
            setActive(0);
            e.currentTarget.select();
          }}
          onBlur={() => {
            setOpen(false);
            // Si se deja a medias, se vuelve a la ciudad elegida: nunca queda vacío.
            setText(selectionName(value));
            setTyping(false);
          }}
          onChange={(e) => {
            setText(e.target.value);
            setTyping(true);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="h-full w-full min-w-0 flex-1 bg-transparent pr-10 pl-10 text-base text-ink outline-none placeholder:text-muted/70"
        />
        {text && (
          <button
            type="button"
            aria-label={`Borrar ${label.toLowerCase()}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setText("");
              setTyping(true);
              setOpen(true);
              setActive(0);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-ink"
          >
            <IconClose size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-(--radius-control) border border-line bg-surface shadow-[0_4px_24px_-6px_rgb(13_23_18/0.18)]">
          <ul id={listId} role="listbox" aria-label={label} className="max-h-80 overflow-y-auto py-1">
            {!typing && (
              <li role="presentation" className="px-4 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
                {catalogTitle}
              </li>
            )}
            {options.map((option, i) => {
              const title = GROUP_TITLE[option.group];
              const showTitle = title && options[i - 1]?.group !== option.group;
              const Icon = GROUP_ICON[option.group];
              const selected = i === activeIndex;
              return (
                <li key={option.key} role="presentation">
                  {showTitle && (
                    <p className="border-t border-line px-4 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
                      {title}
                    </p>
                  )}
                  <div
                    id={`${id}-${option.key}`}
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(option)}
                    className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5", selected && "bg-subtle")}
                  >
                    <Icon size={17} aria-hidden="true" className={cn("shrink-0", selected ? "text-brand-700" : "text-muted")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{option.name}</span>
                      <span className="block truncate text-[13px] text-muted">{option.detail}</span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {status && (
            <p aria-live="polite" className="border-t border-line px-4 py-2.5 text-[13px] text-muted">
              {status}
            </p>
          )}
          {!typing && (
            <p className="border-t border-line px-4 py-2.5 text-[13px] text-muted">
              ¿No está? Escribe cualquier ciudad del mundo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
