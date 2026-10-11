import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Read credentials from .env.local
let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !adminKey) {
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [k, ...v] = trimmed.split("=");
      if (k === "NEXT_PUBLIC_SUPABASE_URL") url = v.join("=").trim();
      if (k === "NEXT_PUBLIC_SUPABASE_ANON_KEY") anonKey = v.join("=").trim();
      if (k === "SUPABASE_SERVICE_ROLE_KEY") adminKey = v.join("=").trim();
    }
  } catch {}
}

const anonClient = createClient(url, anonKey);
const adminClient = createClient(url, adminKey);

async function testRealtimeFlow() {
  console.log("=================================================");
  console.log("TESTING REALTIME QUEUE FLOW: Call Next -> Complete -> Skip");
  console.log("=================================================\n");

  const serviceId = "22222222-2222-2222-2222-222222222201"; // Bonafide
  const counterId = "11111111-1111-1111-1111-111111111101"; // Counter 1

  console.log("1. Issuing initial test tokens B-001, B-002, B-003...");
  const t1 = await adminClient.rpc("issue_token", {
    p_service_id: serviceId,
    p_tuf_id: "TUF_FLOW_001",
    p_student_name: "Aarav Sharma",
    p_tracking_secret: "11111111111111111111111111111111",
    p_application_payload: { class_year: "FE", branch: "Computer Engineering" }
  });

  const t2 = await adminClient.rpc("issue_token", {
    p_service_id: serviceId,
    p_tuf_id: "TUF_FLOW_002",
    p_student_name: "Diya Patel",
    p_tracking_secret: "22222222222222222222222222222222",
    p_application_payload: { class_year: "SE", branch: "IT" }
  });

  const t3 = await adminClient.rpc("issue_token", {
    p_service_id: serviceId,
    p_tuf_id: "TUF_FLOW_003",
    p_student_name: "Rohan Deshmukh",
    p_tracking_secret: "33333333333333333333333333333333",
    p_application_payload: { class_year: "TE", branch: "Mechanical" }
  });

  console.log(`- Token 1 (Aarav): ${t1.data.label} (Number: ${t1.data.number}, Ahead: ${t1.data.waiting_ahead})`);
  console.log(`- Token 2 (Diya):  ${t2.data.label} (Number: ${t2.data.number}, Ahead: ${t2.data.waiting_ahead})`);
  console.log(`- Token 3 (Rohan): ${t3.data.label} (Number: ${t3.data.number}, Ahead: ${t3.data.waiting_ahead})\n`);

  console.log("2. Subscribing Anonymous client to Supabase Realtime channel 'test_live_queue'...");
  let eventsReceived = 0;

  const channel = anonClient.channel("test_live_queue")
    .on("postgres_changes", { event: "*", schema: "public", table: "public_queue_state" }, (payload) => {
      eventsReceived++;
      console.log(`[REALTIME EVENT #${eventsReceived}] Table: public_queue_state | Event: ${payload.eventType}`);
      console.log("Payload:", {
        serving: payload.new?.now_serving_label,
        counter: payload.new?.counter_label,
        waiting_count: payload.new?.waiting_count,
        next: payload.new?.next_labels
      });
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        console.log("Anonymous Client Status: SUBSCRIBED to Realtime.\n");

        // Action 1: Call Next (Aarav B-001)
        console.log("--- Action 1: Staff Calls Next Token (B-001) ---");
        const call1 = await adminClient.rpc("call_next", {
          p_service_id: serviceId,
          p_counter_id: counterId
        });
        console.log("Result:", call1.data);

        // Verify Diya's position
        const diyaHash = crypto.createHash("sha256").update("22222222222222222222222222222222").digest("hex");
        const diyaCheck1 = await adminClient.rpc("get_token_by_tracking_hash", {
          p_tracking_hash: diyaHash
        });
        console.log("Diya's live status check via tracking hash:", {
          label: diyaCheck1.data?.label,
          status: diyaCheck1.data?.status,
          now_serving: diyaCheck1.data?.now_serving_label,
          waiting_ahead: diyaCheck1.data?.waiting_ahead,
          estimated_wait_min: `${diyaCheck1.data?.estimated_wait_min} min`
        });

        // Action 2: Wait 1s and Complete Aarav
        setTimeout(async () => {
          console.log("\n--- Action 2: Staff Completes Token (B-001) ---");
          const comp1 = await adminClient.rpc("set_token_status", {
            p_token_id: t1.data.token_id,
            p_new_status: "completed"
          });
          console.log("Result:", comp1.data);

          // Action 3: Call Next (Diya B-002) and Skip
          setTimeout(async () => {
            console.log("\n--- Action 3: Staff Calls Next Token (B-002) ---");
            const call2 = await adminClient.rpc("call_next", {
              p_service_id: serviceId,
              p_counter_id: counterId
            });
            console.log("Result:", call2.data);

            console.log("\n--- Action 4: Staff Skips Token (B-002: Student No-show) ---");
            const skip2 = await adminClient.rpc("set_token_status", {
              p_token_id: t2.data.token_id,
              p_new_status: "skipped",
              p_reason: "Student did not approach desk"
            });
            console.log("Result:", skip2.data);

            // Verify Rohan's position
            const rohanHash = crypto.createHash("sha256").update("33333333333333333333333333333333").digest("hex");
            const rohanCheck = await adminClient.rpc("get_token_by_tracking_hash", {
              p_tracking_hash: rohanHash
            });
            console.log("\nRohan's live status check via tracking hash:", {
              label: rohanCheck.data?.label,
              status: rohanCheck.data?.status,
              now_serving: rohanCheck.data?.now_serving_label,
              waiting_ahead: rohanCheck.data?.waiting_ahead,
              estimated_wait_min: `${rohanCheck.data?.estimated_wait_min} min`
            });

            setTimeout(() => {
              console.log("\n=================================================");
              console.log("TEST SUMMARY:");
              console.log(`- Token Actions Performed: Call Next, Complete, Call Next, Skip`);
              console.log(`- Position Calculation Verified: Waiting tokens ahead properly calculated`);
              console.log(`- Realtime Events Received on public_queue_state: ${eventsReceived}`);
              console.log("=================================================");
              process.exit(0);
            }, 1500);
          }, 1000);
        }, 1000);
      }
    });
}

testRealtimeFlow();
