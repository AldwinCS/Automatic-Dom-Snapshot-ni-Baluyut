// run-all-batches.js — scans batch-* files generated from each malicious_XX_10k.csv
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const uploadDir = path.join("uploads");

// ---- Configure index range (inclusive) ----
const RANGE_START = 11;
const RANGE_END = 15;
// --------------------------------------------

// Match files like: malicious_11_10k_batch-1-to-1000.csv
const allBatchFiles = fs
  .readdirSync(uploadDir)
  .filter((f) => /^malicious_(\d+)_10k_batch-\d+-to-\d+\.csv$/.test(f))
  .map((f) => {
    const match = f.match(/^malicious_(\d+)_10k_batch-\d+-to-\d+\.csv$/);
    return {
      file: f,
      index: parseInt(match[1], 10),
    };
  })
  .filter(({ index }) => index >= RANGE_START && index <= RANGE_END)
  .sort((a, b) => a.index - b.index);

if (allBatchFiles.length === 0) {
  console.error("❌ No matching batch files found in range.");
  process.exit(1);
}

console.log("🗂️  Batch files to scan:");
allBatchFiles.forEach(({ file }) => console.log(" •", file));

const failures = [];

for (const { file } of allBatchFiles) {
  const filePath = path.join(uploadDir, file);
  console.log(`\n🚀 Scanning: ${file}`);

  try {
    execSync(`node scanner_add.js "${filePath}"`, { stdio: "inherit" });
    console.log(`✅ Done: ${file}`);
  } catch (error) {
    console.error(`❌ Error scanning ${file}: ${error.message || error}`);
    failures.push(file);
    continue;
  }
}

// Summary
console.log("\n===== SUMMARY =====");
console.log(`Total Files: ${allBatchFiles.length}`);
console.log(`Succeeded : ${allBatchFiles.length - failures.length}`);
console.log(`Failed    : ${failures.length}`);
if (failures.length) console.log("❌ Failed files:", failures.join(", "));
