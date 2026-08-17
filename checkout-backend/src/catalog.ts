export const AI_BETA_END_ISO = "2026-09-17T21:59:59.000Z";

export const WEBSITE_CHOICES = ["start", "tillvaxt", "premium"] as const;
export const AI_CHOICES = ["nej", "start", "tillvaxt", "premium"] as const;
export const MAINTENANCE_CHOICES = ["nej", "online", "trygg", "aktiv", "partner"] as const;

export type WebsiteChoice = (typeof WEBSITE_CHOICES)[number];
export type AiChoice = (typeof AI_CHOICES)[number];
export type MaintenanceChoice = (typeof MAINTENANCE_CHOICES)[number];
export type FulfillmentLane = "website" | "ai_receptionist" | "maintenance";

export type CheckoutChoices = {
  website: WebsiteChoice;
  ai: AiChoice;
  maintenance: MaintenanceChoice;
};

export type CheckoutContact = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
};

export type CheckoutRequest = {
  choices: CheckoutChoices;
  contact: CheckoutContact;
};

const WEBSITE_AMOUNTS: Record<WebsiteChoice, number> = {
  start: 15_000,
  tillvaxt: 30_000,
  premium: 60_000,
};

const AI_REGULAR_AMOUNTS: Record<AiChoice, number> = {
  nej: 0,
  start: 3_500,
  tillvaxt: 8_500,
  premium: 24_800,
};

const AI_BETA_AMOUNTS: Record<AiChoice, number> = {
  nej: 0,
  start: 1_750,
  tillvaxt: 4_250,
  premium: 12_400,
};

const MAINTENANCE_AMOUNTS: Record<MaintenanceChoice, number> = {
  nej: 0,
  online: 500,
  trygg: 1_200,
  aktiv: 3_200,
  partner: 6_900,
};

function isOneOf<T extends readonly string[]>(value: unknown, choices: T): value is T[number] {
  return typeof value === "string" && choices.includes(value);
}

function requiredText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`${label} saknas.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) throw new Error(`${label} saknas.`);
  if (normalized.length > maxLength) throw new Error(`${label} är för långt.`);
  return normalized;
}

export function normalizeCheckoutRequest(raw: unknown): CheckoutRequest {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Ogiltig checkout-data.");
  const root = raw as Record<string, unknown>;
  const rawChoices = root.choices;
  const rawContact = root.contact;
  if (!rawChoices || typeof rawChoices !== "object" || Array.isArray(rawChoices)) throw new Error("Paketval saknas.");
  if (!rawContact || typeof rawContact !== "object" || Array.isArray(rawContact)) throw new Error("Kontaktuppgifter saknas.");
  const choices = rawChoices as Record<string, unknown>;
  const contact = rawContact as Record<string, unknown>;

  if (!isOneOf(choices.website, WEBSITE_CHOICES)) throw new Error("Ogiltigt hemsidepaket.");
  if (!isOneOf(choices.ai, AI_CHOICES)) throw new Error("Ogiltig AI-nivå.");
  if (!isOneOf(choices.maintenance, MAINTENANCE_CHOICES)) throw new Error("Ogiltig underhållsnivå.");

  const email = requiredText(contact.email, "E-post", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Ogiltig e-postadress.");
  const phone = requiredText(contact.phone, "Telefon", 32);
  if (!/^[+()\d\s.-]{6,32}$/.test(phone)) throw new Error("Ogiltigt telefonnummer.");

  return {
    choices: {
      website: choices.website,
      ai: choices.ai,
      maintenance: choices.maintenance,
    },
    contact: {
      company: requiredText(contact.company, "Företagsnamn", 160),
      contactName: requiredText(contact.contactName, "Kontaktperson", 160),
      phone,
      email,
    },
  };
}

export function buildQuote(choices: CheckoutChoices, now = new Date(), betaEnd = new Date(AI_BETA_END_ISO)) {
  const betaApplied = choices.ai !== "nej" && now.getTime() <= betaEnd.getTime();
  const aiInitialMonthly = betaApplied ? AI_BETA_AMOUNTS[choices.ai] : AI_REGULAR_AMOUNTS[choices.ai];
  const maintenanceMonthly = MAINTENANCE_AMOUNTS[choices.maintenance];
  const lanes: FulfillmentLane[] = ["website"];
  if (choices.ai !== "nej") lanes.push("ai_receptionist");
  if (choices.maintenance !== "nej") lanes.push("maintenance");

  return {
    currency: "sek" as const,
    oneTimeAmount: WEBSITE_AMOUNTS[choices.website],
    initialMonthlyAmount: aiInitialMonthly + maintenanceMonthly,
    regularMonthlyAmount: AI_REGULAR_AMOUNTS[choices.ai] + maintenanceMonthly,
    betaApplied,
    betaEndsAt: betaEnd.getTime(),
    hasRecurring: choices.ai !== "nej" || choices.maintenance !== "nej",
    lanes,
  };
}

export type StripePriceEnvironment = {
  website: Record<WebsiteChoice, string>;
  ai: Record<Exclude<AiChoice, "nej">, string>;
  maintenance: Record<Exclude<MaintenanceChoice, "nej">, string>;
  betaCouponId: string;
};

function requiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Serverkonfiguration saknas: ${name}`);
  return value;
}

export function stripePriceEnvironment(env: NodeJS.ProcessEnv = process.env): StripePriceEnvironment {
  return {
    website: {
      start: requiredEnv("STRIPE_PRICE_WEB_START", env),
      tillvaxt: requiredEnv("STRIPE_PRICE_WEB_TILLVAXT", env),
      premium: requiredEnv("STRIPE_PRICE_WEB_PREMIUM", env),
    },
    ai: {
      start: requiredEnv("STRIPE_PRICE_AI_START", env),
      tillvaxt: requiredEnv("STRIPE_PRICE_AI_TILLVAXT", env),
      premium: requiredEnv("STRIPE_PRICE_AI_PREMIUM", env),
    },
    maintenance: {
      online: requiredEnv("STRIPE_PRICE_MAINT_ONLINE", env),
      trygg: requiredEnv("STRIPE_PRICE_MAINT_TRYGG", env),
      aktiv: requiredEnv("STRIPE_PRICE_MAINT_AKTIV", env),
      partner: requiredEnv("STRIPE_PRICE_MAINT_PARTNER", env),
    },
    betaCouponId: requiredEnv("STRIPE_AI_BETA_COUPON_ID", env),
  };
}

export function stripeLineItems(choices: CheckoutChoices, prices: StripePriceEnvironment) {
  const items: Array<{ price: string; quantity: 1 }> = [{ price: prices.website[choices.website], quantity: 1 }];
  if (choices.ai !== "nej") items.push({ price: prices.ai[choices.ai], quantity: 1 });
  if (choices.maintenance !== "nej") items.push({ price: prices.maintenance[choices.maintenance], quantity: 1 });
  return items;
}
