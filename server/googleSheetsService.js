const { google } = require("googleapis");
const axios = require("axios");
require("dotenv").config();
const xlsx = require("xlsx");

// Replace with the ID of your public Google Sheet
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/* GOOGLE CONSOLE API CODE

  need credentials.json to be able to put a row


  const { google } = require('googleapis');

// Replace with your credentials and spreadsheet ID
const credentials = require('./path/to/credentials.json');
const spreadsheetId = 'your-spreadsheet-id';

// Load credentials and create a client
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function accessSheetData(sheetName) {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z100`, // Adjust the range based on your needs
    });

    const values = response.data.values;


    //returns an array of arrays : convert to array of objects with first row as header


    const headers = values[0]; // Assuming the first row contains headers

const dataObjects = values.slice(1).map(row => {
  const obj = {};
  headers.forEach((header, index) => {
    if(header != undefined)
    obj[header] = row[index];
  });
  return obj;
});

console.log('Data as array of objects:', dataObjects);


    if (values.length) {
      console.log('Data from Google Sheet:', values);
    } else {
      console.log('No data found.');
    }
  } catch (error) {
    console.error('Error accessing Google Sheet:', error.message);
  }
}

accessSheetData();

async function addRowToSheet() {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    //TODO: convert from object to array
    const valuesToAppend = [['New Data', '123', '456']]; // Replace with your data

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1:Z100`, // Adjust the range based on your needs
      valueInputOption: 'USER_ENTERED',
      resource: { values: valuesToAppend },
    });

    console.log('Row added successfully:', response.data.updates);
  } catch (error) {
    console.error('Error adding row to Google Sheet:', error.message);
  }
}

addRowToSheet();



*/

async function getGoogleSheet(desiredSheetName) {
  try {
    const response = await axios.get(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpcBujsydusroSmFY0C5NT1qvoPAWI3mIT9C3EvVQ9_qAlJi96jDqGv38NTzS1TqQ9HZsJcX09nmWP/pub?output=xlsx",
      { responseType: "arraybuffer", timeot: 10000 }
    );

    // Convert the binary response to a Buffer
    const dataBuffer = Buffer.from(response.data, "binary");

    // Read the .xlsx file
    const workbook = xlsx.read(dataBuffer, { type: "buffer" });

    let sheetData = {};

    // Process each sheet in the workbook
    workbook.SheetNames.forEach((sheetName) => {
      if (desiredSheetName && sheetName !== desiredSheetName) return;
      // Convert sheet to array of row objects
      sheetData[sheetName] = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        {
          defval: null,
        }
      );
    });

    return sheetData;
  } catch (error) {
    console.error("Error accessing Google Sheet:", error, error.message);
  }
}

const getFlowData = async (req, res) => {
  const flowData = await getGoogleSheet("Flow");
  res.status(200).json(flowData);
};

const searchGoogleSheet = async (req, res) => {
  const { sheetName, searchKey, searchValue, columns } = req.query;
  const sheetData = await getGoogleSheet(sheetName);
  let results = sheetData[sheetName].filter(
    (row) => row[searchKey] === searchValue
  );
  if (columns) {
    results = results.map((row) => {
      const newRow = {};
      columns.split(",").forEach((column) => {
        newRow[column] = row[column];
      });
      return newRow;
    });
  }

  //TODO: validate columns and add error handling
  res.status(200).json(results);
};

const getColumnsFromSheet = async (req, res) => {
  const { sheetName, columnNames } = req.query;
  const sheetData = await getGoogleSheet(sheetName);
  const columns = columnNames.split(",");
  const columnData = sheetData[sheetName].map((row) => {
    const newRow = {};
    columns.forEach((column) => {
      newRow[column] = row[column];
    });
    return newRow;
  });

  //TODO: validate columns and add error handling
  res.status(200).json(columnData);
};

module.exports = { getFlowData, searchGoogleSheet, getColumnsFromSheet };
