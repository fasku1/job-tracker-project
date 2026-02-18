---

## 🔑 Setup & Credentials

To allow the backend to communicate with Google Sheets, you must provide your own service account credentials.

### 1. File Placement

* Download your JSON key file from the Google Cloud Console.
* Place it inside the `job-tracker/` (backend) folder.
* Ensure your `.env` file (based on `creds.env`) is also in this folder.

### 2. Update the Backend Code

Because Google generates a unique ID for every credential file, you must link it in your code.

Open `job-tracker/index.js` and locate the `GoogleAuth` configuration. Update the `keyFile` path to match your specific filename:

```javascript
// job-tracker/index.js

const auth = new google.auth.GoogleAuth({
  // UPDATE THIS LINE with your actual filename:
  keyFile: "./aerial-bonfire-457101-p0-a57e3e4ee10b.json", 
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

```

> [!CAUTION]
> **Security Warning:** Do not share or commit your `.json` or `.env` files. If you are using Git, add `aerial-bonfire-*.json` and `*.env` to your `.gitignore` immediately.

---

### 💡 Pro-Tip for your README

If you decide to use the **dynamic file-finding code** I shared earlier, you could change this section to say:

> "The backend is configured to automatically find any file starting with `aerial-bonfire-`. Just ensure your credential file is named correctly and placed in the `job-tracker/` folder."