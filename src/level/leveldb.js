const level = require("level");
const { remote } = require("electron");
let resoreDbPath = remote.getGlobal("resoreDbPath");
const db = level(resoreDbPath, { valueEncoding: "json" });

async function set(key, value) {
  return new Promise((resolve, reject) => {
    if (key && value) {
      console.log("dbSet:", key, value);
      db.put(key, value, function(error) {
        if (error) reject(error);
        else resolve("success");
      });
    } else {
      reject("no key or value");
    }
  });
}

async function get(key) {
  return new Promise((resolve, reject) => {
    if (key) {
      console.log("dbGet:", key);
      db.get(key, function(error, value) {
        if (error) reject(error);
        else resolve(value);
      });
    } else {
      reject("no key", key);
    }
  });
}

async function del(key) {
  return new Promise((resolve, reject) => {
    if (key) {
      db.del(key, function(error) {
        if (error) reject(error);
        else resolve("done");
      });
    } else {
      reject("no key");
    }
  });
}

async function find(find) {
  let list = [];
  return new Promise((resolve, reject) => {
    var option = {
      keys: true,
      values: true,
      revers: false,
      limit: 20000,
      fillCache: true,
    };
    if (!find) return resolve({ success: false, msg: "find empty", list });
    else {
      if (find.prefix) {
        option.start = find.prefix;
        option.end =
          find.prefix.substring(0, find.prefix.length - 1) +
          String.fromCharCode(
            find.prefix[find.prefix.length - 1].charCodeAt() + 1
          );
      }
      if (find.limit) option.limit = find.limit;
      db.createReadStream(option)
        .on("data", function(data) {
          data && list.push({ key: data.key, value: data.value });
        })
        .on("error", function(err) {
          reject({ success: false, msg: err, list });
        })
        .on("close", function() {})
        .on("end", function() {
          return resolve({ success: true, list });
        });
    }
  });
}
// module.exports = {
//   get,
//   set,
//   del,
// };

export default {
  get,
  set,
  del,
  find,
};
