import cases from "./Cases";

// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  QueryReportTemplateByMid: async function(mid) {
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
