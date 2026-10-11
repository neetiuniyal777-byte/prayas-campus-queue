import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually if not in process.env
let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [k, ...v] = trimmed.split("=");
      if (k === "NEXT_PUBLIC_SUPABASE_URL") url = v.join("=").trim();
      if (k === "SUPABASE_SERVICE_ROLE_KEY") key = v.join("=").trim();
    }
  } catch {}
}

if (!url || !key) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function cleanupTestData() {
  console.log("==================================================");
  console.log("CLEANUP TEST DATA: Resetting Today's Queue & Counters");
  console.log("==================================================");

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  console.log(`Target Service Date (Asia/Kolkata): ${today}`);

  try {
    // 1. Fetch today's tokens
    const { data: todayTokens } = await supabase
      .from("tokens")
      .select("id, application_id")
      .eq("service_date", today);

    const tokenIds = (todayTokens || []).map((t) => t.id);
    const appIds = (todayTokens || []).map((t) => t.application_id).filter(Boolean);

    if (tokenIds.length > 0) {
      console.log(`Deleting ${tokenIds.length} token events...`);
      await supabase.from("token_events").delete().in("token_id", tokenIds);

      console.log(`Deleting ${tokenIds.length} tokens...`);
      await supabase.from("tokens").delete().in("id", tokenIds);
    }

    if (appIds.length > 0) {
      console.log(`Deleting ${appIds.length} applications...`);
      await supabase.from("applications").delete().in("id", appIds);
    }

    // 2. Reset daily counters for today
    console.log(`Resetting daily_counters for ${today}...`);
    const { error: counterErr } = await supabase
      .from("daily_counters")
      .delete()
      .eq("service_date", today);

    if (counterErr) {
      console.error("Counter reset error:", counterErr.message);
    }

    // 3. Sync public queue state if function exists
    try {
      await supabase.rpc("sync_public_queue_state");
    } catch {}

    console.log("==================================================");
    console.log("SUCCESS: Today's counters, tokens, and applications reset.");
    console.log("Next token issued will start at 001.");
    console.log("==================================================");
  } catch (err) {
    console.error("Cleanup failed:", err.message);
    process.exit(1);
  }
}

cleanupTestData();
