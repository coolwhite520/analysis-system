const ExcelJS = require("exceljs");
const fs = require("fs");
const moment = require("moment");
// let d = moment(43560);
let filePathName = "/Users/baiyang/Desktop/15210864421张三.xlsx";
let csvPathName = "/Users/baiyang/Desktop/未命名文件夹/交易明细汇总.csv";
var { Pool } = require("pg");
var copyFrom = require("pg-copy-streams").from;
const csv = require("@fast-csv/parse");

function aaaa(b) {
  b.ii = "aa";
}

let obj = {};
aaaa(obj);
console.log(obj);

return;
(async function() {
  return new Promise(function(resolve, reject) {
    try {
      console.log("hahahaha");
      throw new Error("hahahah");
      resolve("hahahah");
    } finally {
      console.log("bbbbbb");
    }
  });
})();

return;
(async function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve("done");
    }, ms);
  });
})(1000000);

// path.resolve(__dirname, "assets", "parse.csv")
let rows = (function parseCsvFile() {
  let rows = [];
  return new Promise(function(resolve, reject) {
    fs.createReadStream(csvPathName)
      .pipe(
        csv.parse({
          trim: true,
          headers: true,
          objectMode: true,
          ignoreEmpty: true,
          maxRows: 2,
        })
      )
      .on("error", (error) => {
        console.error(error);
        reject(error);
      })
      .on("data", (row) => {
        console.log(row);
        rows.push(row);
      })
      .on("end", (rowCount) => {
        console.log(`Parsed ${rowCount} rows`);
        resolve(rows);
      });
  });
})();
console.log(rows);
return;
// "127.0.0.1", "gas_data", "", 5432
var pool = new Pool({
  user: "baiyang",
  host: "127.0.0.1",
  database: "gas_data",
  password: "",
  port: 5432,
});

pool.connect(async function(err, client, done) {
  let sql = `SET search_path TO icap_8`;
  const res = await client.query(sql);
  // console.log(res);
  var streamFrom = client.query(
    copyFrom("COPY gas_phone_call_info_220001_38_temp  FROM STDIN")
  );
  streamFrom.on("error", function(e) {
    console.log(e);
  });
  streamFrom.on("finish", function(e) {
    console.log(e, "finish....");
  });
  let count = 1;
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePathName);
  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      if (!row.hasValues) continue;
      let values = [];
      for (let cindex = 1; cindex <= row.actualCellCount; cindex++) {
        let cell = row.getCell(cindex);
        values.push(cell.toString());
      }
      for (let i = values.length; i < 35; i++) {
        values.push(`${i}`);
      }

      values = values.join("\t") + "\n";
      console.log(values, count++);

      streamFrom.write(values, function(err) {
        if (err) console.log(err);
      });
      // if (count == 10) break;
    }
  }
  streamFrom.end();
});

return;
function formatExcelDate(numb, format = "-") {
  const time = new Date(new Date(1900, 0, numb));
  // time.setYear(time.getFullYear() - 70);
  // time.setHours(time.getHours() - 8);
  const year = time.getFullYear() + "";
  const month = time.getMonth() + 1 + "";
  const date = time.getDate() - 1 + "";
  const hours = time.getHours().toLocaleString();
  const minutes = time.getMinutes();

  if (format && format.length === 1) {
    return year + format + month + format + date + " " + hours + ":" + minutes;
  }
  return (
    year + (month < 10 ? "0" + month : month) + (date < 10 ? "0" + date : date)
  );
}
function formatExcelTime(numb) {
  const time = new Date(new Date(1900, 0, 0, numb));
  let hour = time.getHours() + "";
  hour = hour.length === 1 ? "0" + hour : hour;
  let min = time.getMinutes() + "";
  min = min.length === 1 ? "0" + min : min;

  return hour + ":" + min;
}
console.log(formatExcelTime(0.50847));

// console.log(d);
return;
(async () => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePathName);

  for await (const worksheetReader of workbook) {
    // console.log(worksheetReader.workbook.sharedStrings);
    if (worksheetReader.id === "1") {
      for await (const row of worksheetReader) {
        for (let index = 1; index <= row.actualCellCount; index++) {
          console.log(row.workbook.ReadStream);
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
