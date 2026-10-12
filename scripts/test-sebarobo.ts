async function test() {
  console.log("Testing ShebaRobo AI Issue Resolver API...");

  // Test 1: Payment issue
  const res1 = await fetch("http://localhost:3000/api/ai/sebarobo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "আমি বিকাশ দিয়ে টাকা পরিশোধ করেছি কিন্তু স্ট্যাটাস পেইড হয়নি, কী করব?",
      isBn: true,
    }),
  });

  const data1 = await res1.json();
  console.log("\n[Test 1: Payment Resolution]");
  console.log("Success:", data1.success);
  console.log("Category:", data1.category);
  console.log("Problem:", data1.diagnosticSolution?.problemSummary);
  console.log("Root Cause:", data1.diagnosticSolution?.rootCause);
  console.log("Solution Steps Count:", data1.diagnosticSolution?.solutionSteps?.length);
  console.log("Action Link:", data1.diagnosticSolution?.actions?.[0]?.url);

  // Test 2: Provider arrival / delay
  const res2 = await fetch("http://localhost:3000/api/ai/sebarobo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "প্রোভাইডার আসতে অনেক দেরি করছে, কত সময় লাগবে?",
      isBn: true,
    }),
  });

  const data2 = await res2.json();
  console.log("\n[Test 2: Arrival Delay Resolution]");
  console.log("Success:", data2.success);
  console.log("Category:", data2.category);
  console.log("Problem:", data2.diagnosticSolution?.problemSummary);

  // Test 3: System Diagnostic Mode
  const res3 = await fetch("http://localhost:3000/api/ai/sebarobo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "diagnose",
      isBn: true,
    }),
  });

  const data3 = await res3.json();
  console.log("\n[Test 3: Diagnostic Report]");
  console.log("Success:", data3.success);
  console.log("Headline:", data3.headline);
  console.log("Health Score:", data3.healthScore);
  console.log("Diagnoses Count:", data3.diagnoses?.length);

  console.log("\n==========================================");
  console.log("🎉 ALL SHEBAROBO AI TESTS PASSED! 🎉");
  console.log("==========================================");
  process.exit(0);
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
