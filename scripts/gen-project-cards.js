#!/usr/bin/env node
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const username = process.argv[2] || "Kira-Kohler";

const REPO_ICON = `<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>`;

const LANG_COLORS = {
  Rust: "#dea584",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

const staticProjects = [
  {
    file: "valoshop.svg",
    title: "ValoShop",
    lines: [
      "Check the store rotation on your VALORANT account and",
      "share which skins you own with a public checker.",
    ],
    tagDot: "#C084FC",
    tagLabel: "Website",
  },
  {
    file: "k1r4fn.svg",
    title: "K1R4FN",
    lines: [
      "A hybrid Fortnite server with access to any cosmetic in",
      "the game — even unreleased ones. Own internal API.",
    ],
    tagDot: "#6D28D9",
    tagLabel: "Private",
  },
  {
    file: "k1r4labs-bot.svg",
    title: "K1R4LABS Bot",
    lines: [
      "Multi-purpose Discord bot with deep VALORANT integration",
      "— store, instalock, skins, party — plus 20+ utilities.",
    ],
    tagDot: "#6D28D9",
    tagLabel: "Private",
  },
];

const repoProjects = ["ClashRPC", "riot-account-switcher", "BetterAimAssist"];

function wrap(text, maxLen) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxLen) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function card({ title, lines, tagDot, tagLabel, meta }, delay) {
  const descTspans = lines
    .map((l) => `<tspan dy="1.2em" x="25">${escapeXml(l)}</tspan>`)
    .join("");

  const metaSvg = meta || `
    <g transform="translate(30, 65)">
      <circle cx="0" cy="-5" r="6" fill="${tagDot}" class="dot" style="animation-delay:${delay}ms"/>
      <text class="gray" x="15">${escapeXml(tagLabel)}</text>
    </g>`;

  return `<svg width="400" height="140" viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #C084FC; }
    .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #E9D5FF; }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #E9D5FF; }
    .icon { fill: #A855F7; animation: pulse 3.2s ease-in-out infinite; }
    .border { animation: glow 3.2s ease-in-out infinite; }
    .dot { animation: pulse 3.2s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
    @keyframes glow { 0%, 100% { stroke-opacity: .15; } 50% { stroke-opacity: .65; } }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" width="399" fill="#0D0221" stroke="#A855F7" stroke-width="1" class="border" style="animation-delay:${delay}ms"/>
  <g transform="translate(25, 35)">
    <g transform="translate(0, 0)">
      <svg class="icon" x="0" y="-13" viewBox="0 0 16 16" width="16" height="16" style="animation-delay:${delay}ms">${REPO_ICON}</svg>
    </g>
    <g transform="translate(25, 0)">
      <text x="0" y="0" class="header">${escapeXml(title)}</text>
    </g>
  </g>
  <g transform="translate(0, 55)">
    <text class="description" x="25" y="-5">${descTspans}</text>
    ${metaSvg}
  </g>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const outDir = path.resolve(__dirname, "..", "assets", "projects");
fs.mkdirSync(outDir, { recursive: true });

staticProjects.forEach((p, i) => {
  const delay = i * 400;
  fs.writeFileSync(path.join(outDir, p.file), card(p, delay), "utf8");
  console.log(`Generated ${p.file}`);
});

repoProjects.forEach((repo, i) => {
  const delay = (staticProjects.length + i) * 400;
  const raw = execFileSync(
    "gh",
    ["api", `repos/${username}/${repo}`, "--jq", "{description, language, stars: .stargazers_count, forks: .forks_count}"],
    { encoding: "utf8" }
  );
  const info = JSON.parse(raw);
  const langColor = LANG_COLORS[info.language] || "#A855F7";
  const lines = wrap(info.description || repo, 57);

  const starIcon = `<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>`;

  const meta = `
    <g transform="translate(30, 65)">
      <circle cx="0" cy="-5" r="6" fill="${langColor}" class="dot" style="animation-delay:${delay}ms"/>
      <text class="gray" x="15">${escapeXml(info.language || "Code")}</text>
      <g transform="translate(${20 + (info.language || "Code").length * 6.3}, 0)">
        <svg class="icon" y="-12" viewBox="0 0 16 16" width="14" height="14" style="animation-delay:${delay}ms">${starIcon}</svg>
        <text class="gray" x="18">${info.stars}</text>
      </g>
    </g>`;

  fs.writeFileSync(
    path.join(outDir, `${repo.toLowerCase()}.svg`),
    card({ title: repo, lines, meta }, delay),
    "utf8"
  );
  console.log(`Generated ${repo.toLowerCase()}.svg (${info.language}, ${info.stars} stars)`);
});
