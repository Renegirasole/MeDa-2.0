import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLead } from "../lib/leads";
import { goalText, monthlyEmail } from "../lib/email";

const ok = { email: " Ana@Correo.com ", consent: true, category: "coche", amount: 16000.4 };

test("alta válida: email normalizado e importe redondeado", () => {
  const r = parseLead(ok);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.lead, { email: "ana@correo.com", category: "coche", amount: 16000 });
});

test("sin consentimiento no hay alta", () => {
  assert.deepEqual(parseLead({ ...ok, consent: false }), { ok: false, error: "consent" });
  assert.deepEqual(parseLead({ ...ok, consent: "true" }), { ok: false, error: "consent" });
});

test("rechaza emails, categorías e importes raros", () => {
  assert.deepEqual(parseLead({ ...ok, email: "ana@correo" }), { ok: false, error: "email" });
  assert.deepEqual(parseLead({ ...ok, category: "yate" }), { ok: false, error: "category" });
  assert.deepEqual(parseLead({ ...ok, amount: -1 }), { ok: false, error: "amount" });
  assert.deepEqual(parseLead(null), { ok: false, error: "email" });
});

test("el campo trampa delata a los bots", () => {
  assert.deepEqual(parseLead({ ...ok, website: "http://spam" }), { ok: false, error: "bot" });
});

test("nunca se aceptan datos del perfil", () => {
  const r = parseLead({ ...ok, monthlyIncome: 2000, savings: 5000 });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(Object.keys(r.lead).sort(), ["amount", "category", "email"]);
});

test("el email lleva el objetivo, el botón y la baja", () => {
  assert.equal(goalText({ category: "alquilar-vivienda", amount: 850 }).replace(/\s/g, " "), "alquilar vivienda de 850 € al mes");
  const m = monthlyEmail({ category: "coche", amount: 16000 }, "https://medaono.com/api/avisos/baja?id=x&t=y");
  assert.ok(m.html.includes("Darme de baja"));
  assert.ok(m.text.includes("https://medaono.com/api/avisos/baja?id=x&t=y"));
  assert.ok(!m.html.includes("<script"));
});
