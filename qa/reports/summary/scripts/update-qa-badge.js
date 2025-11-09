#!/usr/bin/env node
/**
 * update-qa-badge.js
 * Reads latest qa_dashboard.json → generates a badge in README.
 */
import fs from "fs";

const summaryPath = "qa/reports/summary/qa_dashboard.json";
const readmePath = "README.md";

if (!fs.existsSync(summaryPath)) {
  console.error("❌ QA summary not found at", summaryPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const pct = Math.round((data.summary?.pass_rate ?? 0) * 100);
const color =
  pct >= 98 ? "brightgreen" :
  pct >= 95 ? "green" :
  pct >= 90 ? "yellow" :
  pct >= 80 ? "orange" : "red";

const badge = `![QA Consistency](https://img.shields.io/badge/QA%20Consistency-${pct}%25-${color}.svg)`;

let readme = fs.readFileSync(readmePath, "utf8");
const regex = /!\[QA Consistency\]\(.*?\)/;

if (regex.test(readme)) {
  readme = readme.replace(regex, badge);
} else {
  readme = readme.replace(/^# .*$/m, (m) => `${m}\n\n${badge}`);
}

fs.writeFileSync(readmePath, readme);
console.log(`✅ Updated README with QA Consistency badge: ${pct}%`);
