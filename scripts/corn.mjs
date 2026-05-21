const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const URL = "http://localhost:3000/api/fetch-news";

async function pull() {
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  console.log(`\n[${now}] Pulling news...`);
  try {
    const res = await fetch(URL);
    const data = await res.json();
    console.log(`✓ Inserted: ${data.inserted} | Regions:`, data.top_regions);
  } catch (err) {
    console.error(`✗ Error:`, err.message);
  }
}

// Run immediately then every 2 minutes
pull();
setInterval(pull, INTERVAL_MS);
console.log(`Cron started — pulling every 2 minutes from ${URL}`);
