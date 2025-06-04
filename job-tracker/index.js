require("dotenv").config({ path: "./creds.env" });
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: "./aerial-bonfire-457101-p0-a57e3e4ee10b.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheetId = process.env.GOOGLE_SHEET_ID;

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
    console.error(err);
    res.status(500).json({ error: "❌ Could not save job" });
  }
});

// ✅ Route 2: Auto-fetch job title from a URL
app.get("/get-job-title", async (req, res) => {
  const { url } = req.query;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Try multiple selectors in order
    let title =
      $("h1").first().text() ||
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "Unknown Title";

    res.json({ title: title.trim() });
  } catch (err) {
    console.error("Error fetching job title:", err);
    res.status(500).json({ error: "❌ Could not fetch title" });
  }
});

// ✅ Route 3: Auto-fetch company from a URL
app.get("/get-company", async (req, res) => {
  try {
    const jobUrl = req.query.url;

    if (!jobUrl) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    const hostname = new URL(jobUrl).hostname;
    console.log("Parsed hostname:", hostname);

    // Split the domain
    const parts = hostname.split(".").filter(Boolean);

    // Common subdomains to ignore
    const ignore = ["www", "jobs", "careers"];

    // Remove ignored subdomains
    const filtered = parts.filter(p => !ignore.includes(p.toLowerCase()));

    let company = "unknown";

    if (filtered.length >= 2) {
      company = filtered[filtered.length - 2]; // get second-to-last part, e.g. fetchrewards from fetchrewards.com
    } else if (filtered.length === 1) {
      company = filtered[0];
    }

    return res.json({ company });
  } catch (err) {
    console.error("Error in /get-company:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});




app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});
