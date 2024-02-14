const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors"); // Import cors
const { sendEmail } = require("./emailService.js");
const {
  getFlowData,
  getColumnsFromSheet,
  searchGoogleSheet,
} = require("./googleSheetsService.js");

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors()); // Use cors

app.post("/send-email", sendEmail);

app.get("/flow-data", getFlowData);
app.get("/column-from-sheet", getColumnsFromSheet);
app.get("/search-google-sheet", searchGoogleSheet);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
