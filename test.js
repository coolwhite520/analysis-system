const ExcelJS = require("exceljs");
const fs = require("fs");

(async () => {
  let filePathName = "/Users/baiyang/Desktop/15210864421张三.xlsx";
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePathName);

  for await (const worksheetReader of workbook) {
    if (worksheetReader.id === "1") {
      for await (const row of worksheetReader) {
        for (let index = 1; index <= row.actualCellCount; index++) {
          let cell = row.getCell(index);
          console.log(cell);
          break;
          // expect(cell.type).toEqual(ExcelJS.ValueType.Date);
        }
        // log.info(row.values.slice(1));
        // let rowData = row.values.slice(1);
        // rowData = rowData.map((el) => String(el).trim());
        // log.info(rowData);
        // break;
      }
      // log.info(worksheetReader);
    }
  }
  // for await (const { eventType, value } of workbook.parse()) {
  //   switch (eventType) {
  //     case "shared-strings":
  //     // 值是共享字符串
  //     case "worksheet":
  //     // 值是worksheetReader
  //     case "hyperlinks":
  //     // 值是hyperlinksReader
  //   }
  // }
})();
