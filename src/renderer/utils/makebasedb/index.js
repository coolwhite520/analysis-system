const crypto = require("crypto"); //用来加密
const zlib = require("zlib"); //用来压缩
const fs = require("fs");
const passwordEn = new Buffer(process.env.PASS || "password");
const encryptStream = crypto.createCipher("aes-256-cbc", passwordEn);
const path = require("path");

class Maker {
  async doEncryptFile(sqlFile) {
    return new Promise((resolve, reject) => {
      let outFile = sqlFile + ".dat";
      const gzip = zlib.createGzip();
      const readStream = fs.createReadStream(sqlFile);
      const writeStream = fs.createWriteStream(outFile);
      readStream //读取
        .pipe(encryptStream) //加密
        .on("error", (err) => {
          reject(err);
        })
        .pipe(gzip) //压缩
        .on("error", (err) => {
          reject(err);
        })
        .pipe(writeStream) //写入
        .on("finish", () => {
          //写入结束的回调
          resolve("done");
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }
}

module.exports = Maker;
