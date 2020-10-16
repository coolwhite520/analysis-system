const level = require("level");
const db = level("./data");

function set(key, value) {
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

function get(key) {
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

function del(key) {
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

export default {
  get,
  set,
  del,
};
