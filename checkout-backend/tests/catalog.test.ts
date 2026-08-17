import assert from "node:assert/strict";
import test from "node:test";
import {
  AI_BETA_END_ISO,
  AI_CHOICES,
  MAINTENANCE_CHOICES,
  WEBSITE_CHOICES,
  buildQuote,
  normalizeCheckoutRequest,
  stripeLineItems,
  type StripePriceEnvironment,
} from "../src/catalog.js";

test("normaliserar godkända paket- och kontaktval", () => {
  const result = normalizeCheckoutRequest({
    choices: { website: "tillvaxt", ai: "start", maintenance: "online" },
    contact: { company: "  Exempel AB ", contactName: " Ada  Lovelace ", phone: "+46 70 123 45 67", email: "ADA@EXAMPLE.SE" },
  });
  assert.deepEqual(result, {
    choices: { website: "tillvaxt", ai: "start", maintenance: "online" },
    contact: { company: "Exempel AB", contactName: "Ada Lovelace", phone: "+46 70 123 45 67", email: "ada@example.se" },
  });
});

test("avvisar klientskapade pris- och paketvärden", () => {
  assert.throws(() => normalizeCheckoutRequest({
    choices: { website: "gratis", ai: "nej", maintenance: "nej" },
    contact: { company: "X", contactName: "Y", phone: "0701234567", email: "y@example.se" },
  }), /Ogiltigt hemsidepaket/);
});

test("beta ger halvt AI-pris endast före det auktoritativa slutdatumet", () => {
  const choices = { website: "start", ai: "premium", maintenance: "trygg" } as const;
  const active = buildQuote(choices, new Date("2026-09-17T21:59:58Z"));
  const ended = buildQuote(choices, new Date("2026-09-17T22:00:00Z"));
  assert.equal(active.betaApplied, true);
  assert.equal(active.initialMonthlyAmount, 13_600);
  assert.equal(active.regularMonthlyAmount, 26_000);
  assert.equal(ended.betaApplied, false);
  assert.equal(ended.initialMonthlyAmount, 26_000);
  assert.equal(active.betaEndsAt, new Date(AI_BETA_END_ISO).getTime());
});

test("skapar separata leveransbanor utan Jarvis som flaskhals", () => {
  assert.deepEqual(buildQuote({ website: "premium", ai: "nej", maintenance: "nej" }).lanes, ["website"]);
  assert.deepEqual(buildQuote({ website: "premium", ai: "start", maintenance: "aktiv" }).lanes, ["website", "ai_receptionist", "maintenance"]);
});

test("Stripe-rader byggs endast från serverns allowlist", () => {
  const prices: StripePriceEnvironment = {
    website: { start: "price_web_start", tillvaxt: "price_web_growth", premium: "price_web_premium" },
    ai: { start: "price_ai_start", tillvaxt: "price_ai_growth", premium: "price_ai_premium" },
    maintenance: { online: "price_m_online", trygg: "price_m_safe", aktiv: "price_m_active", partner: "price_m_partner" },
    betaCouponId: "coupon_beta",
  };
  assert.deepEqual(stripeLineItems({ website: "start", ai: "tillvaxt", maintenance: "nej" }, prices), [
    { price: "price_web_start", quantity: 1 },
    { price: "price_ai_growth", quantity: 1 },
  ]);
});

test("alla 60 tillåtna paketkombinationer ger korrekta Stripe-rader och totalsummor", () => {
  const prices: StripePriceEnvironment = {
    website: { start: "price_web_start", tillvaxt: "price_web_growth", premium: "price_web_premium" },
    ai: { start: "price_ai_start", tillvaxt: "price_ai_growth", premium: "price_ai_premium" },
    maintenance: { online: "price_m_online", trygg: "price_m_safe", aktiv: "price_m_active", partner: "price_m_partner" },
    betaCouponId: "coupon_beta",
  };
  let checked = 0;

  for (const website of WEBSITE_CHOICES) {
    for (const ai of AI_CHOICES) {
      for (const maintenance of MAINTENANCE_CHOICES) {
        const choices = { website, ai, maintenance };
        const quote = buildQuote(choices, new Date("2026-08-17T12:00:00Z"));
        const items = stripeLineItems(choices, prices);

        assert.equal(items.length, 1 + Number(ai !== "nej") + Number(maintenance !== "nej"));
        assert.equal(items[0]?.price, prices.website[website]);
        assert.equal(quote.hasRecurring, ai !== "nej" || maintenance !== "nej");
        assert.equal(quote.betaApplied, ai !== "nej");
        if (ai !== "nej") assert.ok(items.some((item) => item.price === prices.ai[ai]));
        if (maintenance !== "nej") assert.ok(items.some((item) => item.price === prices.maintenance[maintenance]));
        checked += 1;
      }
    }
  }

  assert.equal(checked, 60);
});
