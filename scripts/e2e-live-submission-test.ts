import { submitEnquiry, toCrmPayload, createIdempotencyKey } from "../lib/api/enquiries";

interface TestSubmission {
  id: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  description: string;
}

const TEST_CASES: TestSubmission[] = [
  {
    id: "CTA-01",
    source: "Hero Primary CTA",
    name: "IT Geek QA Test 01 - Hero Primary",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Microsoft 365 help",
    description: "AUTOMATED QA TEST – Hero Primary CTA – 2026-11-27",
  },
  {
    id: "CTA-02",
    source: "Hero Secondary CTA (Free Quote)",
    name: "IT Geek QA Test 02 - Hero Quote",
    email: "delivered@resend.dev",
    phone: "", // blank optional phone
    topic: "Free quote",
    description: "AUTOMATED QA TEST – Hero Secondary Quote CTA – 2026-11-27",
  },
  {
    id: "CTA-03",
    source: "Header Desktop CTA",
    name: "IT Geek QA Test 03 - Header Desktop",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Microsoft 365 help",
    description: "AUTOMATED QA TEST – Header Desktop CTA – 2026-11-27",
  },
  {
    id: "CTA-04",
    source: "Mobile Drawer CTA",
    name: "IT Geek QA Test 04 - Mobile Drawer",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Microsoft 365 help",
    description: "AUTOMATED QA TEST – Mobile Drawer CTA – 2026-11-27",
  },
  {
    id: "CTA-05",
    source: "Services Section CTA (Antivirus)",
    name: "IT Geek QA Test 05 - Services Security",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Antivirus & security help",
    description: "AUTOMATED QA TEST – Services Antivirus CTA – 2026-11-27",
  },
  {
    id: "CTA-06",
    source: "Common Issues CTA",
    name: "IT Geek QA Test 06 - Common Issues",
    email: "delivered@resend.dev",
    phone: "",
    topic: "Something else",
    description: "AUTOMATED QA TEST – Common Issues CTA – 2026-11-27",
  },
  {
    id: "CTA-07",
    source: "Pricing Plan Cards CTA (Online Support)",
    name: "IT Geek QA Test 07 - Pricing Plan",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Online support (A$99)",
    description: "AUTOMATED QA TEST – Pricing Online Support CTA – 2026-11-27",
  },
  {
    id: "CTA-08",
    source: "Pricing Quote Link",
    name: "IT Geek QA Test 08 - Pricing Quote Link",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Free quote",
    description: "AUTOMATED QA TEST – Pricing Free Quote Link – 2026-11-27",
  },
  {
    id: "CTA-09",
    source: "Final CTA Banner",
    name: "IT Geek QA Test 09 - Final CTA",
    email: "delivered@resend.dev",
    phone: "0412 345 678",
    topic: "Microsoft 365 help",
    description: "AUTOMATED QA TEST – Final CTA Banner – 2026-11-27",
  },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLiveTests() {
  console.log("===============================================================================");
  console.log("IT GEEK – 9 CTA LIVE SUBMISSION END-TO-END VERIFICATION");
  console.log("Endpoint: POST https://it-geek-backend.vercel.app/api/public/enquiries");
  console.log("Recipient sink: delivered@resend.dev (Official Resend Testing Sink)");
  console.log("===============================================================================\n");

  const results: Array<{
    id: string;
    source: string;
    topic: string;
    mappedCategory: string;
    enquiryId?: string;
    idempotencyKey: string;
    status: string;
    message: string;
  }> = [];

  let heroFirstKey = "";

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const key = createIdempotencyKey();
    if (i === 0) heroFirstKey = key;

    const payload = toCrmPayload(
      {
        name: tc.name,
        email: tc.email,
        phone: tc.phone,
        topic: tc.topic,
        message: tc.description,
      },
      key
    );

    console.log(`[${i + 1}/9] Submitting: ${tc.source}`);
    console.log(`       Input Topic: "${tc.topic}" -> Mapped Category: "${payload.serviceCategory}"`);
    console.log(`       IdempotencyKey: ${key}`);

    const res = await submitEnquiry(
      {
        name: tc.name,
        email: tc.email,
        phone: tc.phone,
        topic: tc.topic,
        message: tc.description,
      },
      {
        idempotencyKey: key,
        honeypot: "",
        startedAt: Date.now() - 5000, // human-like fill time (>2500ms)
      }
    );

    if (res.ok) {
      console.log(`       ✓ SUCCESS: Enquiry Reference ID = ${res.enquiryId}`);
      results.push({
        id: tc.id,
        source: tc.source,
        topic: tc.topic,
        mappedCategory: payload.serviceCategory,
        enquiryId: res.enquiryId,
        idempotencyKey: key,
        status: "PASS",
        message: "Enquiry created successfully in MongoDB",
      });
    } else {
      console.error(`       ✗ FAILED (${res.kind}): ${res.message}`);
      results.push({
        id: tc.id,
        source: tc.source,
        topic: tc.topic,
        mappedCategory: payload.serviceCategory,
        idempotencyKey: key,
        status: "FAIL",
        message: `${res.kind}: ${res.message}`,
      });
    }

    // Wait 1.2s between calls to prevent rate-limit bursts
    await sleep(1200);
  }

  // TEST 10: Idempotent Replay Verification
  console.log("\n[10/10] Testing Idempotent Replay on Hero CTA with previous key...");
  const tcHero = TEST_CASES[0];
  const replayRes = await submitEnquiry(
    {
      name: tcHero.name,
      email: tcHero.email,
      phone: tcHero.phone,
      topic: tcHero.topic,
      message: tcHero.description,
    },
    {
      idempotencyKey: heroFirstKey,
      honeypot: "",
      startedAt: Date.now() - 5000,
    }
  );

  if (replayRes.ok && replayRes.enquiryId === results[0].enquiryId) {
    console.log(`       ✓ IDEMPOTENT REPLAY SUCCESS: Re-returned existing Enquiry ID = ${replayRes.enquiryId}`);
  } else {
    console.error(`       ✗ IDEMPOTENT REPLAY FAILED: Expected ${results[0].enquiryId}, got ${replayRes.ok ? replayRes.enquiryId : "Error"}`);
  }

  console.log("\n===============================================================================");
  console.log("SUBMISSION SUMMARY:");
  console.table(results);
  console.log("===============================================================================");
}

runLiveTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
