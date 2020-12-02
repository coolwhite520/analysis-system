const Maker = require(".");

const myMaker = require("./index");

(async () => {
  // ./pg_dump -n icap_base -O -f ./base.dat -U postgres gggggg

  let maker = new myMaker();

  await maker.doEncryptFile("/Users/baiyang/Desktop/base.dat");
  // await maker.doDecryptFile(
  //   "/Users/baiyang/Desktop/icap_base.sql.dat",
  //   "/Users/baiyang/Desktop/icap_base.sql2"
  // );
})();
