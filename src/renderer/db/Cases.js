const fs = require("fs");

/**
 * 获取函数的形参个数
 * @param {Function} func [要获取的函数]
 * @return {*} [形参的数组或undefind]
 */
function getFuncParameters(func) {
  if (typeof func == "function") {
    var mathes = /[^(]+\(([^)]*)?\)/gm.exec(
      Function.prototype.toString.call(func)
    );
    if (mathes[1]) {
      var args = mathes[1].replace(/[^,\w]*/g, "").split(",");
      return args;
    }
  }
}

// 获取案件相关的内容
module.exports = function(db) {
  const schema = require("./Schema")(db);
  return {
    // 查询案件状态列表下拉信息
    QueryCaseState: async function() {
      let sql = `SELECT ID::int, ITEM_CODE, ITEM_NAME,DESCN FROM st_dictionary WHERE PARENT_ID = 5  ORDER BY thesort; `;
      const res = await db.query(sql);
      console.log(sql);
      return res.rows; // id, item_code, item_name,
    },
    // 查询最大案件编号
    QueryCaseMaxCount: async function() {
      let sql = `SELECT MAX(AJID)::int FROM st_case`;
      const res = await db.query(sql);
      console.log(res.rows);
      return res.rows[0].max === null ? 0 : res.rows[0].max;
    },
    // 创建一个新的案件
    CreateNewCase: async function(
      AJBH,
      AJMC,
      AJLB,
      AJLBMC,
      ZCJDDM,
      ZCJDMC,
      CJSJ,
      JJSJ,
      XGSJ,
      ASJFSDDXZQHDM,
      ASJFSDDXZQMC,
      JYAQ,
      ZHAQ,
      CJR,
      SFSC,
      SFBDWKJ,
      SJLX
    ) {
      await schema.SwitchSchema("icap_base");
      let AJID = (await this.QueryCaseMaxCount()) + 1;
      let scheamName = await schema.CreateNewSchema(AJID, "baiyang");
      if (scheamName) {
        await schema.SwitchSchema(scheamName);
        let content = fs.readFileSync("./files/createNewCase.sql", "utf-8");
        await db.query(content);
        let params = [
          AJID,
          AJBH,
          AJMC,
          AJLB,
          AJLBMC,
          ZCJDDM,
          ZCJDMC,
          CJSJ,
          JJSJ,
          XGSJ,
          ASJFSDDXZQHDM,
          ASJFSDDXZQMC,
          JYAQ,
          ZHAQ,
          CJR,
          SFSC,
          SFBDWKJ,
          SJLX,
        ];
        let paramsArray = [];
        for (let param of params) {
          if (typeof param === "string") {
            paramsArray.push(`'${param}'`);
          } else if (typeof param === "number") {
            paramsArray.push(param);
          } else {
            console.log(typeof param);
          }
        }
        let paramsString = paramsArray.join(",");
        let sql = `INSERT INTO st_case(AJID,AJBH,AJMC,AJLB,AJLBMC,ZCJDDM,ZCJDMC,CJSJ,JJSJ,XGSJ,ASJFSDDXZQHDM,ASJFSDDXZQMC,JYAQ,ZHAQ,CJR,SFSC,SFBDWKJ,SJLX) VALUES(${paramsString})`;
        console.log(sql);
        await schema.SwitchSchema("icap_base");
        let res = await db.query(sql);
      } else {
        console.log("exist");
      }
    },
  };
};
