import cases from "./Cases";
export default {
  // 查询省份信息
  QueryProvince: async () => {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      const res = await client.query(
        "SELECT ID::int, PARENT_ID::int,NAME FROM st_location WHERE PARENT_ID = 0;"
      );
      return res.rows; //id , parent_id, name
    } finally {
      client.release();
    }
  },
  // 查询市信息
  QueryCityByProvinceID: async (provinceID) => {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT ID::int, PARENT_ID::int, NAME FROM st_location WHERE PARENT_ID = ${provinceID};`;
      const res = await client.query(sql);
      return res.rows; //id , parent_id, name
    } finally {
      client.release();
    }
  },

  // 查询地区
  QueryTownByCityID: async (cityID) => {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT ID::int, PARENT_ID::int, NAME FROM st_location WHERE PARENT_ID = ${cityID};`;
      const res = await client.query(sql);
      return res.rows; //id , parent_id, name
    } finally {
      client.release();
    }
  },
};
