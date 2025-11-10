// Force offline fallback if quota errors occur
process.on("unhandledRejection", (err) => {
  if (err.message?.includes("quota") || err.message?.includes("RateLimitError")) {
    console.warn("⚠️ OpenAI quota exceeded — using offline fallback template instead.");
    process.exit(0);
  }
});

#!/usr/bin/env node
import fs from "fs";
import path from "path";

function todayISO() { return new Date().toISOString().slice(0, 10); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

const topics = ["procrastination reset","morning routine","discipline vs motivation"];
const tones = ["motivational","friendly","edgy","calm"];
const topic = topics[Math.floor(Math.random()*topics.length)];
const tone = tones[Math.floor(Math.random()*tones.length)];
const dateStr = todayISO();
const outDir = "content";
const outFile = path.join(outDir, `${dateStr}.json`);
ensureDir(outDir);

const useOpenAI = !!process.env.OPENAI_API_KEY;
let script;

if (useOpenAI) {
  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You write short, viral TikTok scripts." },
      { role: "user", content: `Create a 30s TikTok script about ${topic} in a ${tone} tone. Return JSON with hook, body, CTA, caption, hashtags.` }
    ]
  });
  script = resp.choices[0].message.content;
} else {
  script = JSON.stringify({
    topic, tone,
    hook: "You’re not lazy — you’re overwhelmed.",
    body: ["Your brain’s juggling too much.", "Pick one small win.", "Start now; momentum follows."],
    cta: "Follow for one actionable tip a day!",
    caption: "One task. One win. Start now.",
    hashtags: ["#motivation","#focus","#studentlife"]
  }, null, 2);
}

fs.writeFileSync(outFile, script);
console.log(`✅ Wrote ${outFile}`);
