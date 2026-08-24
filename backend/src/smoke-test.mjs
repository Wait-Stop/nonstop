const BASE = process.env.BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

const checks = [
  ["health", () => request("/api/health")],
  ["regions", () => request("/api/regions")],
  ["region-detail", () => request("/api/regions/cheongju")],
  ["policies", () => request("/api/policies")],
  ["policy-detail", () => request("/api/policies/CB_HOUSING_001")],
  ["recommendations", () => request("/api/recommendations", {
    method: "POST",
    body: JSON.stringify({
      persist: false,
      condition: {
        age: "30대",
        major: "공학계열",
        job: "IT·개발",
        salary: "3,600~4,500만원",
        rent: "60~80만원",
        transport: "자가용",
        preferredRegions: ["청주시", "진천군"],
        recommendRegion: false,
      },
    }),
  })],
  ["policy-recommendations", () => request("/api/policies/recommendations", {
    method: "POST",
    body: JSON.stringify({
      condition: {
        age: "20대",
        preferredRegions: ["청주시"],
        job: "IT·개발",
        salary: "3,000~3,600만원",
        rent: "40~50만원",
        interestedCategories: ["주거", "일자리"],
      },
    }),
  })],
  ["cost", () => request("/api/cost-simulations", {
    method: "POST",
    body: JSON.stringify({
      regionId: "cheongju",
      income: { salary: "3,600~4,500만원" },
      housing: { rent: "60~80만원", deposit: 1000, maintenanceFee: 8 },
      transport: { type: "버스" },
      policy: { includeSupport: true, monthlySupportAmount: 20 },
    }),
  })],
  ["commute", () => request("/api/commute-simulations", {
    method: "POST",
    body: JSON.stringify({
      regionId: "cheongju",
      job: "IT·개발",
      transport: { type: "버스", maxCommuteMinutes: 40 },
    }),
  })],
  ["ai-chat", () => request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message: "차 없으면 청주랑 충주 중 어디가 좋아?",
      condition: { transport: "버스", preferredRegions: ["청주시", "충주시"] },
      context: { regionIds: ["cheongju", "chungju"], policyIds: ["CB_HOUSING_001"] },
    }),
  })],
  ["checklist", () => request("/api/policies/CB_HOUSING_001/checklist")],
];

for (const [name, run] of checks) {
  const data = await run();
  console.log(`ok ${name}`, Array.isArray(data) ? `items=${data.length}` : Object.keys(data).join(","));
}
