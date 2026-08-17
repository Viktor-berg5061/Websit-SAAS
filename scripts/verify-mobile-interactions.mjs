import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const edge = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = await mkdtemp(join(tmpdir(), "webbtjanst-mobile-interactions-"));
const port = 49322;
const browser = spawn(edge, [
  "--headless=new", "--disable-gpu", "--no-first-run",
  `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, attempts = 50) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) { lastError = error; }
    await sleep(100);
  }
  throw lastError || new Error(`Unable to read ${url}`);
}

async function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  return {
    call(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() { socket.close(); },
  };
}

let failures = 0;
function check(condition, label, details = "") {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${details ? ` — ${details}` : ""}`);
}

const demos = {
  "lume-architecture": ["home", "projects", "project-detail", "studio", "contact"],
  "savor-catering": ["home", "menu", "events", "event-detail", "booking"],
  "nova-tech-saas": ["home", "infrastructure", "security", "pricing", "docs"],
  "vantage-legal": ["home", "expertise", "attorneys", "insights", "consultation"],
  "studio-pulse": ["home", "work", "work-detail", "lab", "contact"],
  "ecogarden-shop": ["home", "collection", "product-detail", "journal", "account"],
  "quantum-ai": ["home", "platform", "applications", "research", "docs"],
  "nordic-home": ["home", "listings", "listing-detail", "valuation", "contact"],
  "vantage-fitness": ["home", "compound", "protocol", "membership", "coaches"],
};

try {
  const targets = await getJson(`http://127.0.0.1:${port}/json`);
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("No Edge page target found");
  const cdp = await connect(page.webSocketDebuggerUrl);
  await cdp.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  async function navigate(path) {
    await cdp.call("Page.navigate", { url: `${base}${path}` });
    await sleep(700);
  }
  async function evaluate(expression, attempts = 12) {
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const result = await cdp.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
        return result.result.value;
      } catch (error) {
        lastError = error;
        await sleep(100);
      }
    }
    throw lastError;
  }
  async function pageState() {
    return evaluate(`({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
      heading: document.querySelector("h1,h2")?.textContent?.trim() || "",
      visibleText: document.body.innerText.length,
      smallTargets: [...document.querySelectorAll("a,button,summary,input")].filter(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && (r.width < 40 || r.height < 40);
      }).slice(0, 8).map(el => ({tag: el.tagName, text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height)}))
    })`);
  }

  await navigate("/index.html");
  let state = await pageState();
  check(state.scrollWidth <= state.width + 1, "startsida utan horisontell overflow");
  const menuOpened = await evaluate(`(() => {
    const toggle = document.querySelector(".nav-toggle");
    const drawer = document.querySelector(".nav-drawer");
    if (!toggle || !drawer) return false;
    toggle.click();
    return drawer.classList.contains("is-open") && drawer.getAttribute("aria-hidden") === "false" && toggle.getAttribute("aria-expanded") === "true";
  })()`);
  const menuClosed = await evaluate(`(() => {
    const toggle = document.querySelector(".nav-toggle");
    const drawer = document.querySelector(".nav-drawer");
    document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape", bubbles:true}));
    return !!toggle && !!drawer && !drawer.classList.contains("is-open") && drawer.getAttribute("aria-hidden") === "true" && toggle.getAttribute("aria-expanded") === "false";
  })()`);
  check(menuOpened && menuClosed, "mobilmeny öppnar och stänger");

  await navigate("/starta-projekt.html");
  const wizard = await evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const visible = name => !document.querySelector('[data-builder-step="' + name + '"]').hidden;
    const clickCard = (name, value) => {
      const input = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
      if (!input) throw new Error('Saknar val: ' + name + '=' + value);
      input.click();
    };
    clickCard('paket','start'); await sleep(180);
    const ai = visible('ai');
    document.querySelector('[data-builder-back="package"]').click(); await sleep(180);
    const backPackage = visible('package');
    clickCard('paket','start'); await sleep(180);
    const sameChoiceAgain = visible('ai');
    clickCard('ai','start'); await sleep(180);
    const maintenance = visible('maintenance');
    document.querySelector('[data-builder-back="ai"]').click(); await sleep(180);
    const backAi = visible('ai');
    clickCard('ai','start'); await sleep(180);
    clickCard('underhall','online'); await sleep(180);
    const contact = visible('contact');
    const submit = document.querySelector('.project-builder__submit');
    const summary = document.querySelector('[data-builder-choice]')?.textContent.trim();
    return {ai, backPackage, sameChoiceAgain, maintenance, backAi, contact, submitVisible: submit && !submit.hidden, summary};
  })()`);
  check(Object.entries(wizard).filter(([key]) => !["summary"].includes(key)).every(([, value]) => value), "fyrastegsflöde, tillbaka och samma val fungerar", JSON.stringify(wizard));
  state = await pageState();
  check(state.scrollWidth <= state.width + 1, "checkoutflöde utan horisontell overflow");

  await navigate("/starta-projekt.html?checkout=avbruten");
  const cancelledCheckoutStatus = await evaluate(`(() => {
    const status = document.querySelector(".form-status");
    return Boolean(
      status &&
      !status.hidden &&
      /avbröt|debiterats/i.test(status.textContent || "")
    );
  })()`);
  check(cancelledCheckoutStatus, "avbruten checkout visar tydlig status utan debitering");

  await navigate("/referenser.html");
  const refCards = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('a.ref-card--link[href]')];
    return {count: cards.length, allHref: cards.every(card => card.href.includes('/github-demos/index.html?'))};
  })()`);
  check(refCards.count === 9 && refCards.allHref, "alla nio referenskort är riktiga länkar", `${refCards.count} kort`);

  for (const [demo, pages] of Object.entries(demos)) {
    for (const pageId of pages) {
      await navigate(`/github-demos/index.html?view=portfolio&demo=${demo}&page=${pageId}`);
      state = await pageState();
      for (let attempt = 0; attempt < 12 && state.visibleText <= 120; attempt += 1) {
        await sleep(150);
        state = await pageState();
      }
      check(state.scrollWidth <= state.width + 1 && state.visibleText > 120 && state.heading.length > 0,
        `demo ${demo}/${pageId} mobil`, `${state.heading.slice(0, 45)}; ${state.visibleText} tecken`);
    }
  }

  await Promise.race([cdp.call("Browser.close").catch(() => {}), sleep(1000)]);
  cdp.close();
} finally {
  if (browser.exitCode === null) browser.kill();
  await Promise.race([new Promise((resolve) => browser.once("exit", resolve)), sleep(1000)]);
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {});
}

process.exitCode = failures ? 1 : 0;
