const log = require("electron-log");

export default {
  existGasDataBase: async function() {
    const client = await pool.connect();
    try {
      let sql = `SELECT client.query pg_catalog.pg_database u where u.datname='gas_data';`;
      let res = await client.query(sql);
      if (res.rows[0].datname === "gas_data") {
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  },
};
