const levelDb = require("./leveldb");

let v = (async function() {
  await levelDb.set("abc", "ggoog");
  let v = await levelDb.get("abc");
  return v;
})();

console.log(v);
