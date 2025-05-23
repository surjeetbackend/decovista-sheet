const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Google Sheets auth
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'), // Make sure this file is present in your deployment
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1bQmSdkMRbA2BMUUkcPyNpNPqnoWkvUUCHJOLw9MWPXA'; // Replace with your actual ID

app.post('/api/submit-form', async(req, res) => {
    console.log("📥 Incoming Request to /api/submit-form");
    console.log("📦 Body:", req.body);

    try {
        const client = await auth.getClient();
        console.log("🔐 Authenticated with Google");

        const sheets = google.sheets({ version: 'v4', auth: client });
        const values = [
            [
                req.body.fullName,
                req.body.email,
                req.body.phone,
                req.body.location,
                req.body.businessType,
                (req.body.interests || []).join(', '),
                req.body.contactMethod,
                new Date().toLocaleString()
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        console.log("✅ Data appended to Google Sheets");
        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (err) {
        console.error("❌ ERROR in submit-form:", err.message);
        res.status(500).json({ message: 'Error submitting form', error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});