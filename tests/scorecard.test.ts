import { test } from "node:test";
import assert from "node:assert/strict";
import { makeScoreCard, parseScoreCard, scoreCardQuery, scoreCardThing, scoreCardVerdict } from "../lib/scorecard";

const plain = (s: string) => s.replace(/\s/g, " ");

test("ida y vuelta por la URL", () => {
  const card = makeScoreCard("coche", 7.64, 16000.4);
  assert.deepEqual(card, { slug: "coche", score: 7.6, amount: 16000 });
  assert.deepEqual(parseScoreCard(new URLSearchParams(scoreCardQuery(card))), card);
});

test("rechaza lo que no es una nota", () => {
  assert.equal(parseScoreCard(new URLSearchParams("c=yate&n=7")), null);
  assert.equal(parseScoreCard(new URLSearchParams("c=coche&n=11")), null);
  assert.equal(parseScoreCard(new URLSearchParams("c=coche&n=abc")), null);
  assert.equal(parseScoreCard(new URLSearchParams("c=coche&n=5&i=-3")), null);
  assert.equal(parseScoreCard({ c: "coche" }), null);
});

test("sin importe, la frase no lleva cifra", () => {
  const card = parseScoreCard({ c: "otro", n: "5" })!;
  assert.equal(card.amount, 0);
  assert.equal(scoreCardThing(card), "ese gasto");
  assert.ok(!scoreCardQuery(card).includes("i="));
});

test("gasto mensual: «al mes»", () => {
  assert.equal(plain(scoreCardThing(makeScoreCard("alquilar-vivienda", 6, 850))), "un alquiler de 850 € al mes");
  assert.equal(plain(scoreCardThing(makeScoreCard("coche", 6, 16000))), "un coche de 16.000 €");
});

test("el veredicto sale de los umbrales del motor", () => {
  assert.equal(scoreCardVerdict(makeScoreCard("coche", 7, 1)), "yes");
  assert.equal(scoreCardVerdict(makeScoreCard("coche", 6.9, 1)), "tight");
  assert.equal(scoreCardVerdict(makeScoreCard("coche", 1, 1)), "no");
});

test("nunca viajan datos del perfil", () => {
  const q = scoreCardQuery(makeScoreCard("coche", 7, 16000));
  assert.deepEqual([...new URLSearchParams(q).keys()].sort(), ["c", "i", "n"]);
});
