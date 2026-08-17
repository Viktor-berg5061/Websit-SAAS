import fs from "node:fs";
import path from "node:path";

const root = path.resolve("site");
const required = ["index.html", "starta-projekt.html", "robots.txt", "sitemap.xml", "CNAME"];
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

const project = fs.readFileSync(path.join(root, "starta-projekt.html"), "utf8");
if (!project.includes("https://neat-gnu-616.convex.site/api/checkout/session")) {
  throw new Error("Production checkout endpoint is missing");
}
const mainJs = fs.readFileSync(path.join(root, "assets", "js", "main.js"), "utf8");
if (!mainJs.includes("https://neat-gnu-616.convex.site/api/lead")) {
  throw new Error("Production lead endpoint is missing");
}

const combined = inspectable.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const value of ["+46 70 494 90 87", "tel:+46704949087", "vberg024@gmail.com"]) {
  if (!combined.includes(value)) throw new Error(`Required contact value is missing: ${value}`);
}

if (fs.readFileSync(path.join(root, "CNAME"), "utf8").trim() !== "www.webbtjanst.com") {
  throw new Error("CNAME must be www.webbtjanst.com");
}

console.log(`Verified ${files.length} production files including ${htmlFiles.length} HTML pages.`);
