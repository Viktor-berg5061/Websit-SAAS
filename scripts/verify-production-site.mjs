import fs from "node:fs";
import path from "node:path";

const root = path.resolve("site");
const required = [
  "index.html",
  "boka-mote.html",
  "starta-projekt.html",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "favicon.svg",
  "favicon.ico",
  "favicon-48x48.png",
  "apple-touch-icon.png",
];
const forbidden = [
  "trycloudflare.com",
  "rosy-parakeet-562",
  "+46 73 650 21 84",
  "+46736502184",
  "info@webbtjanst.com",
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Missing required production file: ${relative}`);
  }
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (htmlFiles.length < 100) {
  throw new Error(`Expected at least 100 HTML files, found ${htmlFiles.length}`);
}

const inspectable = files.filter((file) => /\.(?:html|js|css|xml|txt)$/i.test(file));
for (const file of inspectable) {
  const content = fs.readFileSync(file, "utf8");
  for (const value of forbidden) {
    if (content.includes(value)) {
      throw new Error(`Forbidden stale value ${JSON.stringify(value)} in ${path.relative(root, file)}`);
    }
  }
}

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (/href="(?:\.\.\/)*index\.html"/.test(content)) {
    throw new Error(`Home link exposes index.html in ${path.relative(root, file)}`);
  }
}

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const value of [
  '<link rel="icon" href="/favicon.ico" sizes="any">',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
]) {
  if (!home.includes(value)) throw new Error(`Homepage favicon declaration is missing: ${value}`);
}
if (!home.includes('window.location.pathname === "/index.html"')) {
  throw new Error("Homepage does not clean the legacy /index.html address");
}

const project = fs.readFileSync(path.join(root, "starta-projekt.html"), "utf8");
if (!project.includes("https://neat-gnu-616.convex.site/api/checkout/session")) {
  throw new Error("Production checkout endpoint is missing");
}
const mainJs = fs.readFileSync(path.join(root, "assets", "js", "main.js"), "utf8");
if (!mainJs.includes("https://neat-gnu-616.convex.site/api/lead")) {
  throw new Error("Production lead endpoint is missing");
}
const booking = fs.readFileSync(path.join(root, "boka-mote.html"), "utf8");
if (!booking.includes("https://calendar.google.com/calendar/appointments/schedules/")) {
  throw new Error("Google booking schedule is missing");
}
if (!booking.includes('data-booking-person="viktor"') || !booking.includes('data-booking-person="john"')) {
  throw new Error("Booking-person choices are incomplete");
}

const combined = inspectable.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const value of ["+46 70 494 90 87", "tel:+46704949087", "vberg024@gmail.com"]) {
  if (!combined.includes(value)) throw new Error(`Required contact value is missing: ${value}`);
}

if (fs.readFileSync(path.join(root, "CNAME"), "utf8").trim() !== "www.webbtjanst.com") {
  throw new Error("CNAME must be www.webbtjanst.com");
}

console.log(`Verified ${files.length} production files including ${htmlFiles.length} HTML pages.`);
