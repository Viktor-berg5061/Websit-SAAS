import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve("site");
const cleanUrlScript = `<script data-clean-public-url>
  (function () {
    var path = window.location.pathname;
    if (!path.endsWith(".html")) return;
    var cleanPath = path.endsWith("/index.html")
      ? path.slice(0, -10) || "/"
      : path.slice(0, -5);
    window.history.replaceState(null, "", cleanPath + window.location.search + window.location.hash);
  })();
</script>`;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function cleanPageUrl(stem, suffix = "") {
  if (stem.endsWith("index")) {
    const directory = stem.slice(0, -"index".length);
    return `${directory || "/"}${suffix}`;
  }
  return `${stem}${suffix}`;
}

for (const file of walk(siteRoot).filter((entry) => entry.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");

  html = html.replace(
    /\b(href|action)=(["'])([^"']*?)\.html((?:[?#][^"']*)?)\2/g,
    (match, attribute, quote, stem, suffix) =>
      `${attribute}=${quote}${cleanPageUrl(stem, suffix)}${quote}`,
  );
  html = html.replace(
    /\bcontent=(["'])(https:\/\/www\.webbtjanst\.com\/[^"']*?)\.html((?:[?#][^"']*)?)\1/g,
    (match, quote, stem, suffix) =>
      `content=${quote}${cleanPageUrl(stem, suffix)}${quote}`,
  );
  html = html.replace(
    /<script>\s*if \(window\.location\.pathname === "\/index\.html"\) \{\s*window\.history\.replaceState\(null, "", "\/" \+ window\.location\.search \+ window\.location\.hash\);\s*\}\s*<\/script>/,
    cleanUrlScript,
  );

  if (!html.includes("data-clean-public-url")) {
    html = html.replace(
      /(<meta\s+name=["']viewport["'][^>]*>)/i,
      `$1\n${cleanUrlScript}`,
    );
  }

  if (!html.includes("data-clean-public-url")) {
    throw new Error(`Could not add clean URL handling to ${path.relative(siteRoot, file)}`);
  }

  fs.writeFileSync(file, html);
}

const sitemapPath = path.join(siteRoot, "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");
sitemap = sitemap.replace(
  /(https:\/\/www\.webbtjanst\.com\/[^<]*?)\.html(?=<\/loc>)/g,
  (match, stem) => cleanPageUrl(stem),
);
fs.writeFileSync(sitemapPath, sitemap);

const mainPath = path.join(siteRoot, "assets", "js", "main.js");
let main = fs.readFileSync(mainPath, "utf8");
main = main.replaceAll('a[href="boka-mote.html"]', 'a[href$="boka-mote"]');
main = main.replaceAll('link.href = "boka-mote.html";', 'link.href = "/boka-mote";');
fs.writeFileSync(mainPath, main);

const demoRedirectPath = path.join(siteRoot, "demo.html");
let demoRedirect = fs.readFileSync(demoRedirectPath, "utf8");
demoRedirect = demoRedirect.replaceAll("github-demos/index.html?", "github-demos/?");
fs.writeFileSync(demoRedirectPath, demoRedirect);

for (const file of walk(path.join(siteRoot, "github-demos", "assets")).filter((entry) => entry.endsWith(".js"))) {
  let javascript = fs.readFileSync(file, "utf8");
  javascript = javascript.replaceAll("../index.html", "../");
  javascript = javascript.replaceAll("../referenser.html", "../referenser");
  fs.writeFileSync(file, javascript);
}

console.log("Converted public page links and legacy addresses to extensionless URLs.");
