import { test } from "node:test";
import assert from "node:assert/strict";
import { assign, EXPERIMENTS } from "../lib/experiments";

test("la variante se sortea una vez por visita y es una de las declaradas", () => {
  const first = assign("nota_ejemplo", () => 0.99);
  assert.ok((EXPERIMENTS.nota_ejemplo.variants as readonly string[]).includes(first));
  assert.equal(first, "bloqueada");
  // Segunda llamada en la misma visita: la misma, aunque el azar diga otra cosa
  assert.equal(assign("nota_ejemplo", () => 0), first);
});
