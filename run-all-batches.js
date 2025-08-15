// run-all-batches.js
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const uploadDir = path.join("uploads");

// Match files like: malicious_11_10k.csv to malicious_15_10k.csv
const validFiles = fs
  .readdirSync(uploadDir)
  .filter((f) => /^malicious_(\d+)_10k\.csv$/.test(f))
  .map((f) => {
    const match = f.match(/^malicious_(\d+)_10k\.csv$/);
    return {
      file: f,
      index: parseInt(match[1], 10),
    };
  })
  .filter(({ index }) => index >= 11 && index <= 15)
  .sort((a, b) => a.index - b.index);

if (validFiles.length === 0) {
  console.error("❌ No matching malicious_*.csv files found.");
  process.exit(1);
}

// 🔁 Run each malicious CSV
for (const { file } of validFiles) {
  const batchPath = path.join(uploadDir, file);
  console.log(`\n🚀 Scanning batch: ${file}`);
  try {
    execSync(`node run-scan-from-csv.js "${batchPath}"`, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Error scanning ${file}:`, error.message);
  }
}
