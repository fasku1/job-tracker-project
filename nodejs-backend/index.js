// 1. Setup & Imports
const path = require('path'); // Add this!
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const axios = require("axios");
const cheerio = require("cheerio");

if (!process.env.RENDER) {
  // This tells Node to look in the exact folder where index.js is sitting
  require("dotenv").config({ path: "./creds.env" }); 
}

const app = express();
const linkedin = "linkedin.com";

// 2. CORS Configuration
const allowedOrigins = [
  "https://poop-lover-99x2.vercel.app" // No trailing slash
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy error"), false);
  }
}));

app.use(express.json()); // Essential for parsing req.body

// 3. Google Auth Initializer
let auth;

// Check if the variable exists before trying to parse it
if (!process.env.GOOGLE_CREDENTIALS) {
  console.error("❌ CRITICAL ERROR: GOOGLE_CREDENTIALS not found in environment.");
} else {
  try {
    const googleCreds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials: googleCreds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } catch (error) {
    console.error("❌ JSON PARSE ERROR: Check your creds.env formatting.", error.message);
  }
}

const sheetId = process.env.GOOGLE_SHEET_ID;

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

// This logic works for both local and Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});