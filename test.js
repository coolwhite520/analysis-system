// var xlsx = require("node-xlsx").default;
// // parse方法的参数为要解析的excel的路径
// var list = xlsx.parse(
//   "/Users/baiyang/Desktop/未命名文件夹/交易明细汇总的副本.xlsx"
// );
// // 输出数据
// let colsName = [];
// for (let sheet of list) {
//   let sheetName = sheet.name;
//   for (let row of sheet.data) {
//     if (colsName.length === 0) {
//       colsName = row;
//       return;
//     }
//   }
// }
// console.log(colsName);
const fs = require("fs");
const xlsx = require("xlsx");
let filePathName = `/Users/baiyang/Desktop/未命名文件夹/交易明细汇总的副本2.xlsx`;
function parse(input) {
  let book = xlsx.readFileSync(input);
  book.SheetNames.forEach(function(name) {
    let sheet = book.Sheets[name];
    let range = xlsx.utils.decode_range(sheet["!ref"]);
    let json = xlsx.utils.sheet_to_json(sheet);
    console.log(json);
  });
}

parse(filePathName);
