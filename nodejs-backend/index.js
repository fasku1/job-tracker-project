// 1. Setup & Imports (MUST BE AT THE TOP)
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv"); // <--- Added this line!

// 2. Load Environment Variables
dotenv.config({ path: './creds.env' });

console.log("--- Debugging Env Load ---");
console.log("Sheet ID exists:", !!process.env.GOOGLE_SHEET_ID);
console.log("Creds length:", process.env.GOOGLE_CREDENTIALS ? process.env.GOOGLE_CREDENTIALS.length : "UNDEFINED");
console.log("--------------------------");

const app = express();
app.use(express.json()); // <--- IMPORTANT: Needed to read the data from your React form!
app.use(cors({ origin: "*" }));

// 3. Google Auth Initializer
let auth;
const linkedin = "linkedin.com";
const sheetId = process.env.GOOGLE_SHEET_ID;

if (!process.env.GOOGLE_CREDENTIALS) {
  console.error("❌ CRITICAL ERROR: GOOGLE_CREDENTIALS not found.");
} else {
  try {
    // Safety fix for private key newlines
    const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    if (creds.private_key) {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    }

    auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    console.log("✅ Google Auth Ready");
  } catch (error) {
    console.error("❌ JSON PARSE ERROR:", error.message);
  }
}

// 4. Routes
app.get("/", (req, res) => res.json({ message: "FaskuHQ Backend Live! 🚀" }));

// ✅ Route 1: Add job to Google Sheet
app.post("/add-job", async (req, res) => {
  const { jobTitle, jobUrl, company, dateApplied, favoriteJob } = req.body;

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A2", // ✅ starts below the header
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[`=HYPERLINK("${jobUrl}", "${jobTitle} @ ${company}")`, dateApplied, favoriteJob ? "Pending ⭐" : "Pending"]],
      },
    });

    res.json({ message: "✅ Job saved!" });
  } catch (err) {
    console.error("Google Sheets Error:", err); // Look at your Terminal for this!
    res.status(500).json({
      error: "❌ Could not save job",
      details: err.message // This sends the real reason to React
    });
  }
});

// ✅ Route 2: Auto-fetch job title from a URL
app.get("/get-job-title", async (req, res) => {
  const { url } = req.query;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let title = "";

    if (url.includes(linkedin)) {
      title = $("h1").first().text();
    } else {
      title =
        $("h1").first().text() ||
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        "Unknown Title";
    }

    res.json({ title: title.trim() });

  } catch (err) {
    console.error("Error fetching job title:", err);
    res.status(500).json({ error: "❌ Could not fetch title" });
  }
});

// ✅ Route 3: Auto-fetch company from a URL
app.get("/get-company", async (req, res) => {
  try {

    const { url } = req.query;

    let company = "";

    if (url.includes("linkedin.com")) {
      try {
        const { data } = await axios.get(url);
        console.log(data.slice(0, 1000)); // Show the first 1000 characters of the HTML
        const $ = cheerio.load(data);

        const raw = $('a.topcard__org-name-link.topcard__flavor--black-link').first().text().trim();
        company = raw || "didn't work";
      } catch (err) {
        console.error("Error in /get-company:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    else {
      let hostname;
      try {
        hostname = new URL(url).hostname;
      } catch (error) {
        console.error("Error parsing URL:", error.message);
        return res.status(400).json({ error: "Invalid URL" });
      }

      const parts = hostname.split(".").filter(Boolean);
      const ignore = ["www", "jobs", "careers"];
      const filtered = parts.filter(p => !ignore.includes(p.toLowerCase()));

      if (filtered.length >= 2) {
        company = filtered[filtered.length - 2];
      } else if (filtered.length === 1) {
        company = filtered[0];
      } else {
        company = "unknown";
      }
    }

    return res.json({ company });
  } catch (err) {
    console.error("Error in /get-company:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. Export and Listen
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});