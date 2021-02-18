import Default from "./Default";
const log = require("@/utils/log");
// let PageItem = {
//   Index: 0, //页面ID
//   CurrentExeSql: "", //模板sql
//   Tb_Name: "", //页面表名，目前报告中没有该参数
// };
// //转出列表
// let SoftTypeListZC = [
//   { Soft_No: 10, Soft_Type: "CZJE", Soft_Name: "转出总金额" },
//   { Soft_No: 10, Soft_Type: "CZCS", Soft_Name: "转出总笔数" },
// ];
// //转入列表
// let SoftTypeListZR = [
//   { Soft_No: 10, Soft_Type: "JZJE", Soft_Name: "转入总金额" },
//   { Soft_No: 10, Soft_Type: "JZCS", Soft_Name: "转入总笔数" },
// ];
// //默认报告参数
// let ReportParameter = {
//   MIN_HLJE: "20000", //最小获利金额
//   MIN_GLRS: "2", //最小关联人数
//   Soft_No607: "10", //排序前几（主要转出对手）
//   Soft_No608: "10", //排序前几（主要转入对手）
//   JYSJQJ: "48", //交易时间区间
//   MIN_JYJE: "0", //交易最小金额
//   MIN_CJB: "0.9", //出进比最小值
//   MAX_CJB: "1.1", //出进比最大值
//   JyfsSoftNo: "20", //交易方式前几条
//   Condtion: "", //
//   JyJCZCE: "100",
//   JYZH: "",
//   MaxLevel: "4",
//   MinLevel: "0",
//   bool_0: "",
//   IsChecked605: true, //主要获利对手分析
//   IsChecked606: true, //密切联系对手分析
//   IsChecked607: true, //主要转出对手
//   IsChecked608: true, //主要转入对手
//   IsChecked609: true, //即进即出分析_按小时
//   IsChecked610: true, //交易方式统计
//   SoftTypeObj607: SoftTypeListZC[0], //主要转出对手
//   SoftTypeObj608: SoftTypeListZR[0], //主要转入对手
// };

function GetReportSql(caseId, item, param) {
  try {
    let newValue = "10";
    let newValue2 = "10";
    if (item.Index == 607) {
      newValue = param.Soft_No607;
      newValue2 = param.SoftTypeObj607.Soft_Type;
    } else if (item.Index == 608) {
      newValue = param.Soft_No608;
      newValue2 = param.SoftTypeObj608.Soft_Type;
    }
    return item.CurrentExeSql.replace(
      /\$MODEL_FILTER_GROUP\$/g,
      Default.GetBankDetailTableSql("ff_bank_records")
    )
      .replace(/\$AJID\$/g, caseId)
      .replace(/\$TABLENAME\$/g, item.Tb_Name)
      .replace(/\$MODEL_FILTER\$/g, param.Condtion)
      .replace(/\$GLRS\$/g, param.MIN_GLRS)
      .replace(/\$PXQJ\$/g, newValue)
      .replace(/\$PXFS\$/g, newValue2)
      .replace(/\$JYSJQJ\$/g, param.JYSJQJ)
      .replace(/\$CJBZXZ\$/g, param.MIN_CJB)
      .replace(/\$CJBZDZ\$/g, param.MAX_CJB)
      .replace(/\$ZXHLJE\$/g, param.MIN_HLJE)
      .replace(/\$ZXJYJE\$/g, param.MIN_JYJE)
      .replace(/\$JYFSTS\$/g, param.JyfsSoftNo);
  } catch (e) {
    log.error(e);
    return null;
  }
}
export default {
  GetReportSql,
};
