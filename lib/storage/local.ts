"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "meda:storage";

function read<T>(key: string, parse: (v: unknown) => T | null): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Estado persistido solo en este dispositivo.
 * `hydrated` evita parpadeos: hasta montar, se usa el valor inicial.
 */
export function useLocalState<T>(
  key: string,
  initial: T,
  parse: (v: unknown) => T | null,
): [T, (next: T | ((prev: T) => T)) => void, { hydrated: boolean; saved: boolean; clear: () => void }] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  /** true si hay datos guardados en este dispositivo (no solo los de ejemplo) */
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = read(key, parse);
    if (stored !== null) setValue(stored);
    setSaved(stored !== null);
    setHydrated(true);
    const sync = (e: Event) => {
      if (e instanceof StorageEvent && e.key !== key) return;
      if (e instanceof CustomEvent && e.detail !== key) return;
      const next = read(key, parse);
      setValue(next ?? initial);
      setSaved(next !== null);
    };
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
    // `initial` y `parse` se consideran estables por clave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVENT, { detail: key })));
        } catch {
          // Modo privado o almacenamiento lleno: seguimos en memoria.
        }
        return resolved;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    } catch {
      // Ignorado a propósito.
    }
    setValue(initial);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set, { hydrated, saved, clear }];
}
