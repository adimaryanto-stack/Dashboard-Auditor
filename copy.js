const fs = require('fs');
const path1 = 'c:\\Users\\Anakku Media Webinar\\Downloads\\PRD_FINAL_Transparansi_Anggaran_Pendidikan.md';
const path2 = 'd:\\Work From Home Y545\\Web Development\\kalkulasi-spreadsheet\\PRD\\MASTER_PRD.md';
fs.copyFileSync(path1, path2);
console.log("Copy successful");
