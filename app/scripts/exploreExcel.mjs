import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = join(__dirname, '..', '..', '各省财政及债务精简版数据.xlsx');
console.log('Reading Excel file:', excelPath);

const workbook = xlsx.readFile(excelPath);
console.log('Sheet names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Data dimensions: ${data.length} rows, ${data[0] ? data[0].length : 0} columns`);

// Print first 10 rows
console.log('\nFirst 10 rows:');
for (let i = 0; i < Math.min(10, data.length); i++) {
  console.log(`Row ${i}:`, data[i]);
}

// Find unique values in first column
const firstColValues = new Set();
for (let i = 0; i < data.length; i++) {
  if (data[i] && data[i][0]) {
    firstColValues.add(data[i][0]);
  }
}

console.log('\nUnique values in first column (first 30):');
Array.from(firstColValues).slice(0, 30).forEach(val => console.log(`  "${val}"`));

// Find rows containing "2023", "2022", etc.
const yearMarkers = [];
for (let i = 0; i < data.length; i++) {
  if (data[i] && data[i][0] && typeof data[i][0] === 'string') {
    const val = data[i][0];
    if (val.includes('2023') || val.includes('2022') || val.includes('2021') || val.includes('2020') || val.includes('2019')) {
      yearMarkers.push({ row: i, value: val });
    }
  }
}

console.log('\nYear markers found:');
yearMarkers.forEach(marker => console.log(`  Row ${marker.row}: "${marker.value}"`));

// Extract column headers (assume first row after year marker contains headers)
let headers = null;
for (let i = 0; i < data.length; i++) {
  if (data[i] && data[i][0] && typeof data[i][0] === 'string' && data[i][0].includes('2024')) {
    // Next row might be headers
    if (data[i+1]) {
      headers = data[i+1];
      console.log('\nHeaders found at row', i+1, ':', headers);
    }
    break;
  }
}
