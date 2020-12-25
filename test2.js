const axios = require("axios");
const cheerio = require("cheerio");

(async function test() {
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
