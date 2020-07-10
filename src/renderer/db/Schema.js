const { TRUE } = require("node-sass");

module.exports = function(db) {
  return {
    // 切换Schema， 一个schema 可以认为是一个案件
    SwitchSchema: async function(schemaName) {
      let sql = `SET search_path TO ${schemaName}`;
      const res = await db.query(sql);
      return res.command === "SET" ? true : false;
    },
    // 根据最大案件编号创建schema
    CreateNewSchema: async (ajid, userName) => {
      let scheamName = `icap_${ajid}`;
      let sql = `create SCHEMA if not exists ${scheamName} AUTHORIZATION ${userName}`;
      const res = await db.query(sql);
      console.log(sql);
      return res.command === "CREATE" ? scheamName : "";
    },
    // 删除schema
    DropSchema: async function(schemaName) {
      let sql = `DROP SCHEMA IF EXISTS ${schemaName}  CASCADE  ;`;
      const res = await db.query(sql);
    },
  };
};
