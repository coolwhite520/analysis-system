import cases from "./Cases";
const log = require("@/utils/log");
// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  // 查询当前tid对应的模型库model_mids , product_code（不同产品进行区分模型）
  QueryModelmidsByTid: async function(tid) {
    const client = await global.pool.connect();
    try {
      let sql = ` SELECT model_mids,product_code FROM icap_base.layout_menu_model where length(model_mids)>0 and menu_tid='${tid}' and product_code='200'`;
      const res = await client.query(sql);
      return res.rows.length > 0 ? res.rows[0].model_mids : "";
    } finally {
      client.release();
    }
  },
  // 根据模型库获取模型大列表
  QueryModelListByMids: async function(mids) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT * FROM layout_model_info_sort s, layout_model_info m WHERE m.mid<>600 AND s.mid=m.mid AND  m.mid  in (${mids}) ORDER BY  s.soft_200  ASC `;
      console.log(sql);
      const res = await client.query(sql);
      return res.rows;
    } finally {
      client.release();
    }
  },
  // 根据模型id获取模型的模版
  QueryModelSqlTemplateByMid: async function(mid) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `select modelname, gpsqltemplate, orderby, mpids, out_type::int, describe from layout_model_info where mid=${mid}`;
      const res = await client.query(sql);
      return {
        success: true,
        title: res.rows[0].modelname,
        pgsqltemplate: res.rows[0].gpsqltemplate,
        orderby: res.rows[0].orderby,
        mpids: res.rows[0].mpids ? res.rows[0].mpids.split(",") : [],
        showType: res.rows[0].out_type,
        describe: res.rows[0].describe,
      };
    } finally {
      client.release();
    }
  },
};
