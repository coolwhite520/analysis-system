const excel = require("exceljs");
const fs = require("fs");

(async () => {
  let filePathName = "/Users/baiyang/Desktop/未命名文件夹/交易明细汇总.xlsx";
  const workbook = new excel.Workbook();
  let now = new Date().getSeconds();
  await workbook.xlsx.read(fs.createReadStream(filePathName));
  workbook.eachSheet(function(worksheet, id) {
    console.log(worksheet.name);
    let end = new Date().getSeconds();
    console.log(end - now);
  });
  // const workbookReader = new excel.stream.xlsx.WorkbookReader(filePathName);
  // for await (const worksheetReader of workbookReader) {
  //   console.log(worksheetReader.id, worksheetReader.name);
  //   for await (const row of worksheetReader) {
  //     // console.log(JSON.stringify(row.values));
  //   }
  // }
})();
