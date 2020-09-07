import cases from "./Cases";
export default {
  // 查询省份信息
  QueryProvince: async () => {
    await cases.SwitchDefaultCase();
    const res = await global.db.query(
      "SELECT ID::int, PARENT_ID::int,NAME FROM st_location WHERE PARENT_ID = 0;"
    );
    return res.rows; //id , parent_id, name
  },
  // 查询市信息
  QueryCityByProvinceID: async (provinceID) => {
    await cases.SwitchDefaultCase();
    let sql = `SELECT ID::int, PARENT_ID::int, NAME FROM st_location WHERE PARENT_ID = ${provinceID};`;
    const res = await global.db.query(sql);
    return res.rows; //id , parent_id, name
  },

  // 查询地区
  QueryTownByCityID: async (cityID) => {
    await cases.SwitchDefaultCase();
    let sql = `SELECT ID::int, PARENT_ID::int, NAME FROM st_location WHERE PARENT_ID = ${cityID};`;
    const res = await global.db.query(sql);
    return res.rows; //id , parent_id, name
  },
};
