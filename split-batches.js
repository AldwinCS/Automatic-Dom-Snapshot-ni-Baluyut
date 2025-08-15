// split-batches.js — full dataset mode
import fs from "fs";
import path from "path";
import readline from "readline";

const INPUT_FILE = path.join("uploads", "latest_dataset.csv");
const OUTPUT_DIR = "uploads";
const BATCH_SIZE = 1000;

let currentBatch = [];
let header = "";
let rowIndex = 0;

const reader = readline.createInterface({
  input: fs.createReadStream(INPUT_FILE),
  crlfDelay: Infinity,
});

reader.on("line", (line) => {
  if (rowIndex === 0) {
    header = line;
  } else {
    currentBatch.push(line);
    if (currentBatch.length === BATCH_SIZE) {
      saveBatch(rowIndex - BATCH_SIZE + 1, rowIndex);
    }
  }
  rowIndex++;
});

reader.on("close", () => {
  if (currentBatch.length > 0) {
    saveBatch(rowIndex - currentBatch.length, rowIndex - 1);
  }
  console.log("✅ Finished splitting entire file into 1000-row batches.");
});

function saveBatch(startRow, endRow) {
  const fileName = `batch-${startRow}-to-${endRow}.csv`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, `${header}\n${currentBatch.join("\n")}`);
  console.log(`📄 Saved ${fileName}`);
  currentBatch = [];
}
