/**
 * Concurrency Test: 50 Simultaneous Token Requests
 * 
 * Tests that under rapid simultaneous requests, the locking mechanism
 * produces 100% unique token numbers without duplicates or race conditions.
 */

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

const args = process.argv.slice(2);
if (!args.includes("--run-test") && process.env.ALLOW_CONCURRENCY_TEST !== "true") {
  console.warn("================================================================================");
  console.warn("SAFETY WARNING: Concurrency test creates 50 test tokens and records.");
  console.warn("To prevent accidental load/pollution on production data, you must provide the flag:");
  console.warn("  node tests/concurrency_test.mjs --run-test");
  console.warn("Or set env variable: ALLOW_CONCURRENCY_TEST=true");
  console.warn("================================================================================");
  process.exit(1);
}

async function runConcurrencyTest() {
  console.log("=================================================");
  console.log("Starting Concurrency Test: 50 Simultaneous Token Requests");
  console.log(`Target URL: ${BASE_URL}/api/applications`);
  console.log("Flag --run-test verified.");
  console.log("=================================================\n");

  const REQUEST_COUNT = 50;
  const requests = [];

  const runId = Date.now().toString().slice(-4);
  for (let i = 1; i <= REQUEST_COUNT; i++) {
    const letters = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet"];
    const nameWord = letters[i % letters.length] + " " + letters[(i * 3) % letters.length];
    const studentTufId = `TUF_${runId}_${String(i).padStart(3, "0")}`;
    const payload = {
      serviceSlug: "bonafide",
      fullName: `Student ${nameWord}`,
      classYear: "FE",
      branch: "Computer Engineering",
      tufId: studentTufId,
      division: "Div A",
      academicYear: "2026-27",
      extraFields: {
        purpose: "Scholarship",
        copies: 1,
      },
    };

    const reqPromise = fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const data = await res.json();
      return {
        index: i,
        status: res.status,
        data,
      };
    }).catch((err) => ({
      index: i,
      status: 500,
      error: err.message,
    }));

    requests.push(reqPromise);
  }

  const startTime = Date.now();
  console.log(`Firing ${REQUEST_COUNT} requests in parallel...`);
  const results = await Promise.all(requests);
  const elapsedMs = Date.now() - startTime;

  console.log(`Completed ${REQUEST_COUNT} requests in ${elapsedMs}ms.\n`);

  // Verify uniqueness
  const tokenLabels = [];
  const tokenNumbers = [];
  let successCount = 0;
  let failureCount = 0;

  for (const res of results) {
    if (res.status === 200 && res.data?.token?.label) {
      successCount++;
      tokenLabels.push(res.data.token.label);
      tokenNumbers.push(res.data.token.number);
    } else {
      failureCount++;
      console.log(`Request #${res.index} error:`, res.data?.error || res.error);
    }
  }

  const uniqueLabels = new Set(tokenLabels);
  const hasDuplicates = uniqueLabels.size !== tokenLabels.length;

  console.log("------------------ TEST RESULTS ------------------");
  console.log(`Total Requests:    ${REQUEST_COUNT}`);
  console.log(`Successful:        ${successCount}`);
  console.log(`Failed:            ${failureCount}`);
  console.log(`Unique Tokens:     ${uniqueLabels.size}`);
  console.log(`Has Duplicates:    ${hasDuplicates ? "FAIL (Duplicates Detected!)" : "PASS (All Unique!)"}`);
  console.log("Sample tokens:", tokenLabels.slice(0, 10).join(", "), "...");
  console.log("--------------------------------------------------");

  if (hasDuplicates) {
    console.error("TEST FAILED: Duplicate tokens were issued under concurrency!");
    process.exit(1);
  } else {
    console.log("TEST PASSED: Concurrency locking guarantees zero duplicate tokens.");
    process.exit(0);
  }
}

runConcurrencyTest();
