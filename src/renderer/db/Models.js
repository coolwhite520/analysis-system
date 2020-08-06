import db from "./db";
import cases from "./Cases";

// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  // 查询当前tid对应的模型库model_mids , product_code（不同产品进行区分模型）
  QueryModelmidsByTid: async function(tid) {
    try {
      await cases.SwitchDefaultCase();
      let sql = ` SELECT model_mids,product_code FROM layout_menu_model where length(model_mids)>0 and menu_tid='${tid}'`;
      const res = await db.query(sql);
      console.log(sql, res);
      return res.rows.length > 0 ? res.rows[0].model_mids : "";
    } catch (e) {
      console.log(e);
    }
  },
  // 根据模型库获取模型大列表
  QueryModelListByMids: async function(mids) {
    try {
      await cases.SwitchDefaultCase();
      let sql = `SELECT * FROM layout_model_info_sort s, layout_model_info m WHERE m.mid<>600 AND s.mid=m.mid AND  m.mid  in (${mids}) ORDER BY  s.soft_200  ASC `;
      const res = await db.query(sql);
      console.log(sql, res);
      return res.rows;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  excuteModel: async function(ajid, tid) {
    try {
    } catch (e) {}
  },
};
