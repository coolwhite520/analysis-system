import db from "./db";
import cases from "./Cases";

// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  QueryReportTemplateByMid: async function(mid) {
    try {
      await cases.SwitchDefaultCase();
      let sql = `select modelname, gpsqltemplate, orderby, mpids, out_type::int, describe from layout_model_info where mid=${mid}`;
      const res = await db.query(sql);
      console.log(sql, res);
      return {
        success: true,
        title: res.rows[0].modelname,
        pgsqltemplate: res.rows[0].gpsqltemplate,
        orderby: res.rows[0].orderby,
        mpids: res.rows[0].mpids ? res.rows[0].mpids.split(",") : [],
        showType: res.rows[0].out_type,
        describe: res.rows[0].describe,
      };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  },
};
