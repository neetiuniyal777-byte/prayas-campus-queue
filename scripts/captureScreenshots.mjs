import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = fs.existsSync(chromePath) ? chromePath : edgePath;

const outDir = path.resolve("docs/screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const screens = [
  { name: "student_home", url: "http://localhost:3000/" },
  { name: "apply_page", url: "http://localhost:3000/service/bonafide/apply" },
  { name: "token_page", url: "http://localhost:3000/token/preview-token-id" },
  { name: "display_kiosk", url: "http://localhost:3000/display" },
  { name: "staff_dashboard", url: "http://localhost:3000/staff" },
  { name: "admin_overview", url: "http://localhost:3000/admin/data" }
];

const viewports = [
  { label: "1280px", width: 1280, height: 900 },
  { label: "360px", width: 360, height: 780 }
];

console.log("Using browser binary:", browser);

for (const screen of screens) {
  for (const vp of viewports) {
    const outFile = path.join(outDir, `${screen.name}_${vp.label}.png`);
    const args = [
      "--headless",
      "--disable-gpu",
      `--window-size=${vp.width},${vp.height}`,
      `--screenshot="${outFile}"`,
      `"${screen.url}"`
    ];
    console.log(`Capturing ${screen.name} (${vp.label})...`);
    try {
      execSync(`"${browser}" ${args.join(" ")}`, { timeout: 15000, stdio: "ignore" });
      const stats = fs.statSync(outFile);
      console.log(`✓ Generated ${screen.name}_${vp.label}.png (${Math.round(stats.size / 1024)} KB)`);
    } catch (e) {
      console.error(`Error on ${screen.name}:`, e.message);
    }
  }
}
