# Webbtjänst checkout backend

Isolerad Convex-backend för Webbtjänsts order- och betalningsflöde. Den ersätter den gamla JSONL-leadcapture-vägen för checkout och är kopplad till produktionsdeploymenten `neat-gnu-616`.

## Flöde

1. Webbläsaren skickar endast stabila val-ID:n och fyra kontaktfält till `/api/checkout/session`.
2. Servern validerar valen mot katalogen, skapar ett orderutkast och skapar en Stripe Checkout Session.
3. Stripe webhook verifieras kryptografiskt. Endast en faktiskt betald session skapar leveransjobb.
4. En betald order delas upp i `website`, `ai_receptionist` och/eller `maintenance` i en transaktionell outbox.
5. VPS-dispatchern claimar jobb med lease, retry/backoff och dead-letter. Jarvis får sammanfattning och undantag men blockerar inte varje order.

## Stripe-kontrakt

- Tre engångspriser för hemsidepaketen.
- Tre ordinarie återkommande AI-priser.
- Fyra återkommande underhållspriser.
- En 50 %-kupong med `duration=once`, begränsad till de tre AI-produkterna. Den används bara när serverklockan är före beta-slutet.
- Checkout kör `payment` när inga månadsval finns och `subscription` när minst ett månadsval finns. Engångspriset ligger på första abonnemangsfakturan.
- Dynamiska betalningsmetoder lämnas till Stripe Dashboard; koden hårdkodar inte Klarna eller kort.

## Säkerhet

- Secrets sätts med `npx convex env set` och får aldrig ligga i repot.
- Stripe metadata innehåller bara `order_ref`, aldrig kunduppgifter.
- Webhook-event är idempotenta via Stripe event-ID.
- Dispatcher-API kräver separat Bearer-token och returnerar PII endast till autentiserad worker.
- Kontaktuppgifter och vanliga webbplatsförfrågningar får ett explicit gallringsdatum och raderas av det dagliga Convex-jobbet.

## Lokal verifiering

```powershell
npm install
npm test
npm run typecheck
```

Det deterministiska katalogtestet går igenom samtliga **60** tillåtna kombinationer
(3 hemsidepaket × 4 AI-val inklusive nej × 5 underhållsval inklusive nej). Det
verifierar exakta Stripe-priser, `payment` kontra `subscription` och att
betarabatten endast kan appliceras på en vald AI-rad.

Den 17 augusti 2026 verifierades riktiga men obetalda Checkout Sessions i
Stripe live-läge för både en webbplats utan månadsval och en blandad kombination.
Sessionerna löpte ut utan debitering. Betakupongen gav 50 % endast på AI-raden
och 0 kr rabatt på hemside- och underhållsraderna. Stripe levererade
`checkout.session.expired` till den signerade Convex-webhooken, som uppdaterade
ordern och svarade HTTP 200.

Convex-kodgenerering och deployment kräver en uttryckligen vald deployment. Produktion deployas av GitHub Actions med `CONVEX_DEPLOY_KEY`; Stripe-hemligheter lagras endast som Convex production environment variables.
