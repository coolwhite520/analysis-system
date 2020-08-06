import crypto from "crypto";

// var key = '751f621ea5c8f930';
// console.log('加密的key:', key.toString('hex'));
// var iv = '2624750004598718';
// console.log('加密的iv:', iv);
// var data = "Hello, nodejs. 演示aes-128-cbc加密和解密";
// console.log("需要加密的数据:", data);
// var crypted = encrypt(key, iv, data);
// console.log("数据加密后:", crypted);
// var dec = decrypt(key, iv, crypted);
// console.log("数据解密后:", dec);

export default {
  encrypt: function(key, iv, data) {
    let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let crypted = cipher.update(data, "utf8", "binary");
    crypted += cipher.final("binary");
    crypted = new Buffer(crypted, "binary").toString("base64");
    return crypted;
  },
  decrypt: function(key, iv, crypted) {
    crypted = new Buffer(crypted, "base64").toString("binary");
    let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decoded = decipher.update(crypted, "binary", "utf8");
    decoded += decipher.final("utf8");
    return decoded;
  },
};
