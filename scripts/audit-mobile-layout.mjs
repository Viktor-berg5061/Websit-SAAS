import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const urls = process.argv.slice(2);
const screenshotDir = process.env.MOBILE_AUDIT_DIR;
if (!urls.length) {
  console.error("Usage: node scripts/audit-mobile-layout.mjs <url> [...url]");
  process.exit(2);
}

const edge = process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = await mkdtemp(join(tmpdir(), "webbtjanst-mobile-audit-"));
const port = 49321;
const browser = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function json(url, attempts = 40) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (error) {
      lastError = error;
    }
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

let failed = false;
try {
  const targets = await json(`http://127.0.0.1:${port}/json`);
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("No Edge page target found");
  const cdp = await connect(page.webSocketDebuggerUrl);
  await cdp.call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });

  for (const url of urls) {
    await cdp.call("Page.navigate", { url });
    await sleep(900);
    const result = await cdp.call("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id || "",
              classes: [...element.classList].slice(0, 4).join("."),
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
              width: Math.round(rect.width * 10) / 10,
            };
          })
          .filter(({ width, left, right }) => width > 1 && (left < -1 || right > viewportWidth + 1))
          .slice(0, 30);
        return {
          viewportWidth,
          bodyScrollWidth: document.body.scrollWidth,
          rootScrollWidth: document.documentElement.scrollWidth,
          offenders,
        };
      })()`,
    });
    const audit = result.result.value;
    // A closed fixed-position navigation drawer intentionally lives outside the
    // viewport. It does not expand the page and therefore is not layout overflow.
    const ok = audit.rootScrollWidth <= audit.viewportWidth + 1;
    failed ||= !ok;
    console.log(JSON.stringify({ url, ok, ...audit }));
    if (screenshotDir) {
      await mkdir(screenshotDir, { recursive: true });
      const shot = await cdp.call("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      const parsed = new URL(url);
      const suffix = [parsed.pathname, parsed.searchParams.get("demo"), parsed.searchParams.get("page")]
        .filter(Boolean)
        .join("-");
      const name = suffix.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
      await writeFile(join(screenshotDir, `${name}.png`), Buffer.from(shot.data, "base64"));
    }
  }
  await cdp.call("Browser.close").catch(() => {});
  cdp.close();
} finally {
  if (browser.exitCode === null) browser.kill();
  await Promise.race([
    new Promise((resolve) => browser.once("exit", resolve)),
    sleep(1000),
  ]);
  try {
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // Edge can briefly retain profile files on Windows. Audit output is still valid.
  }
}

process.exitCode = failed ? 1 : 0;
