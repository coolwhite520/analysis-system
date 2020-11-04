const Maker = require(".");

const myMaker = require("./index");

(async () => {
  let maker = new myMaker();
  await maker.doEncryptFile("/Users/baiyang/Desktop/postgresql-12.4-3-osx.dmg");
  // await maker.doDecryptFile(
  //   "/Users/baiyang/Desktop/icap_base.sql.dat",
  //   "/Users/baiyang/Desktop/icap_base.sql2"
  // );
})();
