const ExcelJS = require('exceljs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../data');

// Helper function to get workbook
async function getWorkbook(filename) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(path.join(dataDir, filename));
    return workbook;
  } catch (err) {
    // If file doesn't exist, create a new one with headers
    const newWorkbook = new ExcelJS.Workbook();
    const worksheet = newWorkbook.addWorksheet('Data');
    
    // Set headers based on filename
    if (filename === 'users.xlsx') {
      worksheet.addRow(['id', 'email', 'password', 'role', 'passwordResetToken', 'passwordResetExpires']);
    } else if (filename === 'candidates.xlsx') {
      worksheet.addRow(['id', 'userId', 'firstName', 'lastName', 'phone', 'resume', 'skills', 'applications']);
    } else if (filename === 'admins.xlsx') {
      worksheet.addRow(['id', 'userId', 'name', 'department', 'permissions']);
    } else if (filename === 'jobs.xlsx') {
      worksheet.addRow(['id', 'title', 'description', 'department', 'requirements', 'skillsRequired', 'postedBy', 'postedAt', 'status']);
    }
    
    await newWorkbook.xlsx.writeFile(path.join(dataDir, filename));
    return newWorkbook;
  }
}

// CRUD Operations
const excelDB = {
  // Create a new record
  async create(filename, data) {
    const workbook = await getWorkbook(filename);
    const worksheet = workbook.getWorksheet('Data');
    
    // Generate ID if not provided
    if (!data.id) data.id = uuidv4();
    
    // Convert arrays to strings for Excel storage
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key] = JSON.stringify(data[key]);
      }
    });
    
    worksheet.addRow(Object.values(data));
    await workbook.xlsx.writeFile(path.join(dataDir, filename));
    return data;
  },
  
  // Find all records
  async findAll(filename) {
    const workbook = await getWorkbook(filename);
    const worksheet = workbook.getWorksheet('Data');
    
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowData = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value;
          let value = cell.value;
          
          // Try to parse arrays
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // Leave as string if can't parse
            }
          }
          
          rowData[header] = value;
        });
        rows.push(rowData);
      }
    });
    
    return rows;
  },
  
  // Find one record by ID
  async findOne(filename, id) {
    const allRecords = await this.findAll(filename);
    return allRecords.find(record => record.id === id);
  },
  
  // Find by field
  async findByField(filename, field, value) {
    const allRecords = await this.findAll(filename);
    return allRecords.find(record => record[field] === value);
  },
  
  // Update a record
  async update(filename, id, newData) {
    const workbook = await getWorkbook(filename);
    const worksheet = workbook.getWorksheet('Data');
    
    let updated = false;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowId = row.getCell(1).value;
        if (rowId === id) {
          Object.keys(newData).forEach((key, index) => {
            // +1 because Excel columns start at 1 and we need to find the right column
            const headerRow = worksheet.getRow(1);
            let colNumber = 1;
            headerRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
              if (cell.value === key) {
                colNumber = colNum;
              }
            });
            
            let value = newData[key];
            if (Array.isArray(value)) {
              value = JSON.stringify(value);
            }
            
            row.getCell(colNumber).value = value;
          });
          updated = true;
        }
      }
    });
    
    if (updated) {
      await workbook.xlsx.writeFile(path.join(dataDir, filename));
      return this.findOne(filename, id);
    }
    return null;
  },
  
  // Delete a record
  async delete(filename, id) {
    const workbook = await getWorkbook(filename);
    const worksheet = workbook.getWorksheet('Data');
    
    let rowToDelete = null;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowId = row.getCell(1).value;
        if (rowId === id) {
          rowToDelete = row;
        }
      }
    });
    
    if (rowToDelete) {
      worksheet.spliceRows(rowToDelete.number, 1);
      await workbook.xlsx.writeFile(path.join(dataDir, filename));
      return true;
    }
    return false;
  }
};

module.exports = excelDB;