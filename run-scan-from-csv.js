// run-scan-from-csv.js
import path from "path";
import fsSync from "fs";
import { fileURLToPath } from "url";
import { scanUrls } from "./scanner_add.js";
import {
  readUrlsFromCsv,
  writeResultsToCsv,
  writeErrorLogToCsv,
  getCsvFilePath,
} from "./csv-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
const outputCsv = path.join(__dirname, "outputs", "dom-dataset.csv");
const errorCsv = path.join(__dirname, "outputs", `errors-${Date.now()}.csv`);

// Get optional CLI argument for specific batch file
const inputCsvArg = process.argv[2];

function findLatestCsvFile(dir) {
  const files = fsSync
    .readdirSync(dir)
    .filter((file) => file.endsWith(".csv"))
    .map((file) => ({
      file,
      time: fsSync.statSync(path.join(dir, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return files.length > 0 ? path.join(dir, files[0].file) : null;
}

(async () => {
  const targetCsv = inputCsvArg || findLatestCsvFile(uploadsDir);

  if (!targetCsv || !fsSync.existsSync(targetCsv)) {
    console.error("❌ No valid CSV file provided or found.");
    process.exit(1);
  }

  console.log(`📄 Found CSV: ${targetCsv}`);

  const urls = await readUrlsFromCsv(targetCsv);
  if (!urls.length) {
    console.warn("⚠️ No URLs found in this CSV.");
    process.exit(0);
  }

  const results = await scanUrls(urls);

  const errors = Object.entries(results)
    .filter(([, val]) => val.error)
    .map(([url, val]) => ({ url, error: val.error }));

  if (errors.length) {
    await writeErrorLogToCsv(errorCsv, errors);
    console.warn(`⚠️ Logged ${errors.length} errors to ${errorCsv}`);
  }

  await writeResultsToCsv(outputCsv, results);
  console.log("✅ Scan complete. Results saved to dom-dataset.csv");
})();
