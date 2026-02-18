---

# 📋 Job Application Tracker

A full-stack automation tool designed to streamline the job hunt. This application allows you to manage your job applications through a clean web interface while using **Google Sheets** as a powerful, accessible backend database.

## 🚀 What it Does

* **Centralized Tracking:** Add, edit, and monitor the status of job applications (e.g., Applied, Interviewing, Offered, Rejected).
* **Google Sheets Integration:** Automatically syncs every entry to a Google Sheet in real-time. This means you can view your data on your phone or share the sheet with a career coach easily.
* **Status Management:** Keep track of interview dates, company names, and custom notes to ensure you never miss a follow-up.
* **Live Dashboard:** A React-based frontend provides a modern alternative to typing directly into a spreadsheet.

---

## 🛠 Prerequisites

* **Node.js** (v14+) & **npm**
* A **Google Cloud Project** with the Sheets API enabled.

---

## 🔑 Setup & Credentials

### 1. Credentials Placement

You need to provide your own Google Service Account credentials for the database to work:

* Download your JSON key file from the Google Cloud Console.
* Place the `.json` file and your `creds.env` inside the `job-tracker/` (backend) folder.

### 2. Update the Backend Configuration

You **must** tell the backend which file to look for.

1. Open `job-tracker/index.js`.
2. Find the `google.auth.GoogleAuth` section.
3. Update the `keyFile` string to match your specific filename:

```javascript
// job-tracker/index.js

const auth = new google.auth.GoogleAuth({
  /* 👇 UPDATE THIS LINE with your actual filename 👇 */
  keyFile: "./aerial-bonfire-457101-p0-a57e3e4ee10b.json", 
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

```

> [!WARNING]
> To prevent leaking your private keys, ensure `aerial-bonfire-*.json` and `creds.env` are added to your `.gitignore` file.

---

## 💻 Running the App

This project uses a `Makefile` to handle both the frontend and backend simultaneously.

### Installation

```bash
make install

```

### Development

* **Run Everything:** `make run` (Backend runs in background, Frontend in terminal).
* **View Logs:** `make logs` (To see the backend output).
* **Stop Everything:** `make stop`.

---
