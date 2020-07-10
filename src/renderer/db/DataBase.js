const { Pool } = require("pg");
const config = {
  user: "baiyang",
  host: "127.0.0.1",
  database: "gas_data",
  port: 5432,
};
const pool = new Pool(config);
module.exports = pool;
