import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Excel文件路径
const excelPath = join(__dirname, '..', '..', '2023年以来化债主要政策脉络梳理-202603.xlsx');
console.log('Reading policy Excel file:', excelPath);

const workbook = xlsx.readFile(excelPath);
console.log('Sheet names:', workbook.SheetNames);

// 读取第一个工作表
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Data dimensions: ${data.length} rows, ${data[0] ? data[0].length : 0} columns`);

// 打印前5行
console.log('\nFirst 5 rows:');
for (let i = 0; i < Math.min(5, data.length); i++) {
  console.log(`Row ${i}:`, data[i]);
}

// 打印表头（第一行）
console.log('\nHeader row (row 0):', data[0]);

// 尝试识别列
console.log('\nColumn indices:');
if (data[0]) {
  data[0].forEach((col, idx) => {
    if (col) {
      console.log(`  ${idx}: "${col}"`);
    }
  });
}

// 查看一些样例数据
console.log('\nSample data rows (row 1-3):');
for (let i = 1; i < Math.min(4, data.length); i++) {
  if (data[i] && data[i].length > 0) {
    console.log(`Row ${i}:`);
    data[i].forEach((cell, idx) => {
      if (cell && data[0] && data[0][idx]) {
        console.log(`  ${data[0][idx]}: ${cell}`);
      }
    });
    console.log('');
  }
}