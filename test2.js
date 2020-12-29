const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const Papa = require("papaparse");

(async function test() {
  const fs = require("fs");
  const through2 = require("through2");
  fs.createReadStream(
    "/Users/baiyang/Desktop/中国建设银行交易明细信息test.csv"
  ).pipe(
    through2({ objectMode: true }, function(chunk, enc, callback) {
      let returnChar = 10;
      // for (let index = chunk.length - 1; index >= 0; index--) {
      //   if (returnChar === chunk[index]) {
      //     console.log(index);
      //   }
      // }
      let utf8Str = iconv.decode(chunk, "gb2312");
      let lines = utf8Str.split("\n");
      for (let line of lines) {
        let rowObj = Papa.parse(line, {
          skipEmptyLines: "greedy",
          delimiter: ",",
        });
        if (rowObj.data.length > 0) {
          let row = rowObj.data[0].map((item) =>
            item
              .replace(/\"/g, "")
              .replace(/\'/g, "")
              .replace(/\\/g, "\\\\")
              .replace(/^\s+|\s+$/g, "")
          );
          let insertStr = row.join("\t") + "\n";
          console.log(insertStr);
        }
      }
    })
  );
  return;
  let promiseArr = [];
  for (let i = 0; i < 100; i++) {
    promiseArr.push(
      (async function() {
        let ret = await axios.get(
          "http://www.guabu.com/bank/?cardid=6217002160026016281"
        );
        const $ = cheerio.load(ret.data);
        let cardNo = $(
          "#mainleft > table > tbody > tr:nth-child(2) > td:nth-child(2)"
        ).text();
        let cardLocation = $(
          "#mainleft > table > tbody > tr:nth-child(3) > td:nth-child(2)"
        ).text();
        let cardBelongsTo = $(
          "#mainleft > table > tbody > tr:nth-child(4) > td:nth-child(2)"
        ).text();
        console.log(i, cardNo, cardBelongsTo, cardLocation);
      })()
    );
  }
  await Promise.all(promiseArr);
})();
