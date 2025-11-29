/*
  Production Smoke Test
  - Reads BASE_URL from env (or NEXT_PUBLIC_APP_URL), e.g. https://your-domain.tld
  - Performs simple HTTP checks to validate deployed app availability
  Usage (Windows CMD):
    set BASE_URL=https://your-domain.tld && npx tsx scripts/prod-smoke-test.ts
*/

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL;

if (!BASE_URL) {
  console.error("ERROR: Set BASE_URL or NEXT_PUBLIC_APP_URL to your production URL, e.g. https://your-domain.tld");
  process.exit(1);
}

interface CheckResult {
  name: string;
  ok: boolean;
  status?: number;
  note?: string;
  error?: string;
}

async function check(name: string, path: string, init?: RequestInit): Promise<CheckResult> {
  const url = BASE_URL.replace(/\/$/, "") + path;
  try {
    const res = await fetch(url, init);
    // Consider 2xx as pass; 3xx also acceptable for pages, so treat < 400 as pass
    const ok = res.status < 400;
    const note = res.headers.get("content-type") || "";
    return { name, ok, status: res.status, note };
  } catch (err: any) {
    return { name, ok: false, error: err?.message || String(err) };
  }
}

async function main() {
  console.log(`\n🔍 Production Smoke Test on ${BASE_URL}\n`);
  const results: CheckResult[] = [];

  // Basic pages
  results.push(await check("Home page", "/"));
  results.push(await check("Login page", "/login"));
  results.push(await check("Register page", "/register"));
  results.push(await check("Dashboard (likely protected)", "/dashboard"));

  // API basic checks (these may be protected; we only check availability/status codes)
  results.push(await check("Conversations API (should exist)", "/api/conversations", { method: "GET" }));
  // Health endpoint (optional): will not fail the suite if 404
  const health = await check("Health endpoint (optional)", "/api/health", { method: "GET" });
  if (health.status === 404) {
    health.ok = true; // don't penalize if not implemented
    health.note = "Not implemented (404), ignoring";
  }
  results.push(health);

  // AI chat API - expect 401/400 without auth/payload, still proves route exists
  results.push(await check(
    "AI chat endpoint (existence)",
    "/api/chat/ai",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: "test", userId: "test", messages: [{ role: "user", content: "ping" }] })
    }
  ));

  // Print results
  console.log("\n📊 Results:\n");
  let pass = 0, fail = 0;
  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    const extra = r.status ? ` (status ${r.status})` : r.error ? ` (${r.error})` : "";
    const note = r.note ? ` - ${r.note}` : "";
    console.log(`${icon} ${r.name}${extra}${note}`);
    r.ok ? pass++ : fail++;
  }

  console.log("\n––––––––––––––––––––––––––––––––––––\n");
  console.log(`✅ Passed: ${pass}`);
  console.log(`❌ Failed: ${fail}`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
