// run-all-batches.js — scans every row inside batch-* files generated from each malicious_XX_10k.csv
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";

// ---- Configuration ----
const uploadDir = path.join("uploads");
const RANGE_START = 11;
const RANGE_END = 15;
// ------------------------

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

async function scanBatchFile(filePath) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    rl.on("line", (line) => {
      if (isFirstLine) {
        isFirstLine = false; // Skip header
        return;
      }

      const url = line.trim();
      if (!url) return;

      try {
        console.log(`🔍 Scanning URL: ${url}`);
        execSync(`node scanner_add.js "${url}"`, { stdio: "inherit" });
      } catch (error) {
        console.error(
          `❌ Error scanning URL: ${url}\n`,
          error.message || error
        );
        failures.push(url);
      }
    });

    rl.on("close", resolve);
  });
}

async function main() {
  for (const { file } of allBatchFiles) {
    const filePath = path.join(uploadDir, file);
    console.log(`\n🚀 Processing batch file: ${file}`);
    await scanBatchFile(filePath);
  }

  // Summary
  console.log("\n===== SUMMARY =====");
  console.log(`Total Files: ${allBatchFiles.length}`);
  console.log(`Failed URLs: ${failures.length}`);
  if (failures.length) {
    console.log("❌ Failed URLs:");
    failures.forEach((f) => console.log(" •", f));
  }
}

main();
