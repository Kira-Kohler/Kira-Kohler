#!/usr/bin/env node
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const username = process.argv[2] || "Kira-Kohler";

const query = `
query($login:String!){
  user(login:$login){
    contributionsCollection{
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ date contributionCount } }
      }
    }
  }
}`;

const raw = execFileSync(
  "gh",
  ["api", "graphql", "-f", `query=${query}`, "-f", `login=${username}`],
  { encoding: "utf8" }
);
const data = JSON.parse(raw);
const cal = data.data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const PAD_X = 20;
const PAD_TOP = 76;
const PAD_BOTTOM = 34;
const DAY_LABEL_W = 24;

const colors = ["#170a30", "#4c1d95", "#6d28d9", "#a855f7", "#e9d5ff"];
function bucket(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const gridW = weeks.length * STEP - GAP;
const gridH = 7 * STEP - GAP;
const width = PAD_X * 2 + DAY_LABEL_W + gridW;
const height = PAD_TOP + gridH + PAD_BOTTOM;

let cells = "";
let monthLabels = "";
let lastMonth = -1;

weeks.forEach((w, wi) => {
  w.contributionDays.forEach((d, di) => {
    const date = new Date(d.date + "T00:00:00Z");
    const x = PAD_X + DAY_LABEL_W + wi * STEP;
    const y = PAD_TOP + di * STEP;
    const b = bucket(d.contributionCount);
    const c = colors[b];
    const delay = wi * 90 + di * 15;
    const cls = b === 4 ? "cell glow" : "cell";
    cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" ry="2.5" fill="${c}" class="${cls}" style="animation-delay:${delay}ms"><title>${d.date}: ${d.contributionCount} contributions</title></rect>\n`;

    if (di === 0) {
      const m = date.getUTCMonth();
      if (m !== lastMonth) {
        monthLabels += `<text x="${x}" y="${PAD_TOP - 10}" fill="#a855f7" font-size="11" font-family="'Segoe UI',Helvetica,Arial,sans-serif">${months[m]}</text>\n`;
        lastMonth = m;
      }
    }
  });
});

const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]
  .map((lbl, i) => lbl ? `<text x="${PAD_X}" y="${PAD_TOP + i * STEP + 8}" fill="#a1a1c2" font-size="9" font-family="'Segoe UI',Helvetica,Arial,sans-serif">${lbl}</text>` : "")
  .join("\n");

const legendX = width - PAD_X - (colors.length * (CELL + 4)) - 70;
const legendY = height - 18;
let legend = `<text x="${legendX - 42}" y="${legendY + 8}" fill="#a1a1c2" font-size="9" font-family="'Segoe UI',Helvetica,Arial,sans-serif">Less</text>\n`;
colors.forEach((c, i) => {
  legend += `<rect x="${legendX + i * (CELL + 4)}" y="${legendY}" width="${CELL}" height="${CELL}" rx="2.5" ry="2.5" fill="${c}"/>\n`;
});
legend += `<text x="${legendX + colors.length * (CELL + 4) + 6}" y="${legendY + 8}" fill="#a1a1c2" font-size="9" font-family="'Segoe UI',Helvetica,Arial,sans-serif">More</text>\n`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .cell { animation: wave 6s ease-in-out infinite; }
    @keyframes wave { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }
    .glow { animation: waveGlow 6s ease-in-out infinite; }
    @keyframes waveGlow { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
    .heading { opacity: 0; animation: headingIn .7s ease forwards; }
    @keyframes headingIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
  <rect width="${width}" height="${height}" rx="14" ry="14" fill="#0D0221" stroke="#6D28D9" stroke-opacity="0.35" stroke-width="1"/>
  <text x="${PAD_X}" y="26" fill="#C084FC" font-size="16" font-weight="700" font-family="'Segoe UI',Helvetica,Arial,sans-serif" class="heading">Contribution Heatmap</text>
  <text x="${PAD_X}" y="42" fill="#E9D5FF" font-size="11" font-family="'Segoe UI',Helvetica,Arial,sans-serif" class="heading" style="animation-delay:.1s">${cal.totalContributions} contributions in the last year</text>
  ${monthLabels}
  ${dayLabels}
  ${cells}
  ${legend}
</svg>`;

const target = path.resolve(__dirname, "..", "assets", "contributions.svg");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, svg, "utf8");
console.log(`Generated ${target} (${width}x${height}px, ${cal.totalContributions} contributions)`);
