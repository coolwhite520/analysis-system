const Maker = require(".");

const myMaker = require("./index");

(async () => {
  let maker = new myMaker();
  await maker.doEncryptFile("/Users/baiyang/Desktop/icap_base.sql");
  // await maker.doDecryptFile(
  //   "/Users/baiyang/Desktop/icap_base.sql.dat",
  //   "/Users/baiyang/Desktop/icap_base.sql2"
  // );
})();
