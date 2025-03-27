const excelDB = require('./excelDB');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize all Excel files
async function initialize() {
  try {
    await excelDB.getWorkbook('users.xlsx');
    await excelDB.getWorkbook('candidates.xlsx');
    await excelDB.getWorkbook('admins.xlsx');
    await excelDB.getWorkbook('jobs.xlsx');
    
    console.log('Excel files initialized successfully');
  } catch (err) {
    console.error('Error initializing Excel files:', err);
  }
}

initialize();