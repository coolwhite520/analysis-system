const excel = require("exceljs");
const fs = require("fs");

let res = fs.createWriteStream("./a.xls");

const options = {
  stream: res,
  useStyles: true,
  useSharedStrings: true,
};

let workbook = new excel.stream.xlsx.WorkbookWriter(options);

let title = "hahah";
let worksheet = workbook.addWorksheet(title);
let headers = [
  { header: "Id", key: "id", width: 10 },
  { header: "Name", key: "name", width: 32 },
  { header: "D.O.B.", key: "DOB", width: 10, outlineLevel: 1 },
];
// 生成标题头
worksheet.columns = headers;

worksheet.addRow({ id: 6, name: "Barbara", DOB: new Date() });
worksheet.addRow({ id: 6, name: "Barbara", DOB: new Date() });
worksheet.addRow({ id: 6, name: "Barbara", DOB: new Date() });
worksheet.addRow({ id: 6, name: "Barbara", DOB: new Date() });
worksheet.addRow({ id: 6, name: "Barbara", DOB: new Date() });
// worksheet.addRows(rows);
worksheet.commit();
workbook.commit();
