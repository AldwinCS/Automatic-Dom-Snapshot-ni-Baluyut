// split-batches.js — per file basis, includes original filename
import fs from "fs";
import path from "path";
import readline from "readline";

// 🔁 List all 10k malicious files to split
const filesToSplit = ["malicious_6_10k.csv", "malicious_7_10k.csv"];

const OUTPUT_DIR = "uploads";
const BATCH_SIZE = 1000;

for (const fileName of filesToSplit) {
  const inputPath = path.join(OUTPUT_DIR, fileName);
  const baseName = path.parse(fileName).name; // e.g., "malicious_11_10k"

  let currentBatch = [];
  let header = "";
  let rowIndex = 0;

  const reader = readline.createInterface({
    input: fs.createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  reader.on("line", (line) => {
    if (rowIndex === 0) {
      header = line;
    } else {
      currentBatch.push(line);
      if (currentBatch.length === BATCH_SIZE) {
        saveBatch(baseName, rowIndex - BATCH_SIZE + 1, rowIndex);
      }
    }
    rowIndex++;
  });

  reader.on("close", () => {
    if (currentBatch.length > 0) {
      saveBatch(baseName, rowIndex - currentBatch.length, rowIndex - 1);
    }
    console.log(`✅ Finished splitting ${fileName} into 1000-row batches.`);
  });

  function saveBatch(base, startRow, endRow) {
    const batchFileName = `${base}_batch-${startRow}-to-${endRow}.csv`;
    const batchPath = path.join(OUTPUT_DIR, batchFileName);
    fs.writeFileSync(batchPath, `${header}\n${currentBatch.join("\n")}`);
    console.log(`📄 Saved ${batchFileName}`);
    currentBatch = [];
  }
}
