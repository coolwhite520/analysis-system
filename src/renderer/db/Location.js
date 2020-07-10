module.exports = function(db) {
  return {
    // 查询省份信息
    QueryProvince: async () => {
      const res = await db.query(
        "SELECT ID::int, PARENT_ID::int,NAME FROM st_location WHERE PARENT_ID = 0;"
      );
      return res.rows; //id , parent_id, name
    },

    // 查询市信息
    QueryCityByProvinceID: async (provinceID) => {
      let sql = `SELECT ID,PARENT_ID,NAME FROM st_location WHERE PARENT_ID = ${provinceID};`;
      const res = await db.query(sql);
      return res.rows; //id , parent_id, name
    },

    // 查询地区
    QueryTownByCityID: async (cityID) => {
      let sql = `SELECT ID,PARENT_ID,NAME FROM st_location WHERE PARENT_ID = ${cityID};`;
      const res = await db.query(sql);
      return res.rows; //id , parent_id, name
    },
  };
};
