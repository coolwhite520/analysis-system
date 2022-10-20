import crypto from "crypto";
const key = "qwemoQAPydFvWWLq";
const iv = "wOzCypMUYVuiQO9f";
const log = require("@/utils/log");
export default {
  encrypt: function (data) {
    let cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let crypted = cipher.update(data, "utf8", "binary");
    crypted += cipher.final("binary");
    crypted = new Buffer(crypted, "binary").toString("base64");
    return crypted;
  },
  decrypt: function (crypted) {
    crypted = new Buffer(crypted, "base64").toString("binary");
    let decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decoded = decipher.update(crypted, "binary", "utf8");
    decoded += decipher.final("utf8");
    return decoded;
  },
};
