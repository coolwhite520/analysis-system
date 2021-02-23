const crypto = require("crypto");
const fs = require("fs");
const { resolve } = require("path");
const password = "password";

async function EncyptIpDatFile(srcFilePath, desFilepath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(srcFilePath);
    const encryptStream = crypto.createCipher("aes-256-cbc", password);
    const writeStream = fs.createWriteStream(desFilepath);
    // 加密文件流
    readStream
      .pipe(encryptStream)
      .pipe(writeStream)
      .on("finish", function() {
        console.log("done");
        resolve("done");
      })
      .on("error", function(err) {
        reject(err);
      });
  });
}

async function DecpytFileIpDatFile(desFilePath) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    const readStream = fs.createReadStream(desFilePath);
    const decryptStream = crypto.createDecipher("aes-256-cbc", password);
    //解密文件流
    readStream
      .pipe(decryptStream)
      .on("data", function(chunk) {
        chunks.push(...chunk);
      })
      .on("finish", function() {
        console.log("done");
        resolve(Buffer.from(chunks));
      })
      .on("error", function(err) {
        reject(err);
      });
  });
}

let long_0 = [];
let uint_0 = [];
let str = [];

function method_5(byte_1, byte_2, byte_3, byte_4) {
  return (byte_1 | (byte_2 << 8) | (byte_3 << 16) | (byte_4 << 24)) >>> 0;
}

async function initIPDataBase(baseDbFilePath) {
  if (!fs.existsSync(baseDbFilePath)) {
    throw new Error(`${baseDbFilePath} is not exist`);
  }
  let byte_0 = await DecpytFileIpDatFile(baseDbFilePath);
  for (let i = 0; i < 256; i++) {
    let num = i * 8 + 4;
    let num2 = method_5(
      byte_0[num],
      byte_0[num + 1],
      byte_0[num + 2],
      byte_0[num + 3]
    );
    let num3 = method_5(
      byte_0[num + 4],
      byte_0[num + 5],
      byte_0[num + 6],
      byte_0[num + 7]
    );
    long_0[i * 2] = num2;
    long_0[i * 2 + 1] = num3;
  }
  let num4 = method_5(byte_0[0], byte_0[1], byte_0[2], byte_0[3]);
  let num5 = 0;
  while (num5 < num4) {
    let num6 = 2052 + num5 * 8;
    let num7 = method_5(
      byte_0[num6],
      byte_0[1 + num6],
      byte_0[2 + num6],
      byte_0[3 + num6]
    );
    let index =
      byte_0[4 + num6] + (byte_0[5 + num6] << 8) + (byte_0[6 + num6] << 16);
    let count = byte_0[7 + num6];
    uint_0[num5] = num7;
    str[num5] = byte_0.slice(index, index + count).toString();
    num5++;
  }
}

function ip2int(ip) {
  var num = 0;
  ip = ip.split(".");
  num =
    Number(ip[0]) * 256 * 256 * 256 +
    Number(ip[1]) * 256 * 256 +
    Number(ip[2]) * 256 +
    Number(ip[3]);
  num = num >>> 0;
  return num;
}

function ip2int_0(ip) {
  var num = 0;
  ip = ip.split(".");
  num = Number(ip[0]);
  return num;
}

function GetIndex(x, y, long_ip) {
  let result = 0;
  while (x <= y) {
    let num = parseInt((x + y) / 2);
    if (Number(uint_0[num]) >= long_ip) {
      result = num;
      if (num == 0) {
        break;
      }
      y = num - 1;
    } else {
      x = num + 1;
    }
  }
  return result;
}

function FindLocationByIp(ip) {
  let long_ip = ip2int(ip);
  let num = ip2int_0(ip);
  let x = long_0[num * 2];
  let y = long_0[num * 2 + 1];
  let index = x == y ? x : GetIndex(x, y, long_ip);
  return str[index];
}

// (async function() {
//   await EncyptIpDatFile(
//     "/Users/baiyang/Desktop/ips.dat",
//     "/Users/baiyang/Desktop/ips_en.dat"
//   );
//   await initIPDataBase();
//   for (let i = 0; i < 100; i++) {
//     let strLocation = FindLocationByIp("72.48.22.199");
//     console.log(strLocation);
//   }
// })();

export default {
  initIPDataBase,
  FindLocationByIp,
};
