import cases from "./Cases";
import Default from "@/utils/sql/Default";
const log = require("@/utils/log");

const list_0 = [
  "#d6a799",
  "#74bcc5",
  "#5f7b8d",
  "#e37a55",
  "#83d7b0",
  "#9a99d6",
  "#5d7cbc",
  "#c77676",
  "#d699c5",
  "#8d5f66",
];
const list_1 = [
  "#d6a799",
  "#74bcc5",
  "#5f7b8d",
  "#e37a55",
  "#83d7b0",
  "#9a99d6",
  "#5d7cbc",
  "#c77676",
  "#d699c5",
  "#8d5f66",
  "#d6bd99",
  "#6a768f",
  "#66798b",
  "#aa7a96",
  "#6c9780",
  "#d6c198",
  "#5d7cbc",
  "#9a99d6",
  "#7c6b91",
  "#b6c88f",
  "#99d5d6",
  "#99c1d6",
  "#d69999",
  "#d299d6",
  "#9bd8bc",
  "#d0d699",
  "#99ced6",
  "#b199d6",
  "#c77676",
  "#9dd699",
  "#d6c799",
  "#99b9d6",
  "#d699c5",
  "#c77685",
  "#6c9871",
  "#ddaf65",
  "#6f7e8b",
  "#5f728d",
  "#ba5353",
  "#b3d699",
  "#e19664",
  "#9fbfe0",
  "#8d5f66",
  "#76b1c7",
  "#99d6a6",
  "#ab634d",
  "#9ed9e4",
  "#8d6d5f",
  "#768bc7",
  "#536c4e",
];

function CA_PageItem() {
  this.Index;
  this.ExtendIndex;
  this.LABEL_ID;
  this.Index_Parent;
  this.LABEL_NAME;
  this.LABEL_TIP;
  this.ITEM_OBJ;
  this.PageType;
  this.ParentType;
  this.IsPreview;
  this.Items = [];
}
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
  GetChildFromParentId: function(rows, id) {
    let array = [];
    for (let item of rows) {
      if (item["parentid"] == id) {
        array.push(item);
      }
    }
    return array;
  },

  //解析datetable
  GetPgItem: function(dataRow_0) {
    let cA_PageItem = new CA_PageItem();
    let obj = dataRow_0["tid"];
    let obj2 = dataRow_0["parentid"];
    let obj3 = dataRow_0["title"];
    //let arg_35_0 = dataRow_0["color"];
    //let arg_41_0 = dataRow_0["state"];
    //let arg_4D_0 = dataRow_0["type"];
    //let arg_59_0 = dataRow_0["sort"];
    let obj4 = dataRow_0["ischecked"];
    cA_PageItem.Index = obj == null || obj == undefined ? -1 : parseInt(obj);
    cA_PageItem.ExtendIndex = cA_PageItem.Index;
    cA_PageItem.LABEL_ID = obj == null || obj == undefined ? "" : obj;
    cA_PageItem.Index_Parent =
      obj2 == null || obj2 == undefined ? -1 : parseInt(obj2);
    cA_PageItem.LABEL_NAME = obj3 == null || obj3 == undefined ? "" : obj3;
    cA_PageItem.LABEL_TIP = cA_PageItem.LABEL_NAME;
    cA_PageItem.ITEM_OBJ = dataRow_0;
    cA_PageItem.PageType = 0 /*MenuType.N*/;
    //cA_PageItem.ParentType = cA_PageItem.SelectDataSourceType;
    cA_PageItem.IsPreview = obj4 == "1";
    return cA_PageItem;
  },
  GetPgItemChild: function(ca_PageItem_1, rows) {
    let array = this.GetChildFromParentId(rows, ca_PageItem_1.LABEL_ID);
    if (array.length == 0) {
      return;
    }
    for (let dataRow_ of array) {
      let cA_PageItem = this.GetPgItem(dataRow_);
      ca_PageItem_1.Items.push(cA_PageItem);
      this.GetPgItemChild(cA_PageItem, rows);
    }
  },
  // 读取资金用途表
  GetDataTable: async function(INorOut) {
    const client = await global.pool.connect();
    try {
      let sql = `select p.*,c.filtercontent from icap_base.layout_purpose p left join icap_base.layout_purpose_child c on p.tid=c.purposeid where p.state in (0,2) and ischecked=1 and p.type = ${INorOut};`;
      return await client.query(sql);
    } finally {
      client.release();
    }
  },
  GetSort: function(list_1, value) {
    let res = [];
    if (list_1 == undefined || list_1 == null || list_1.length == 0) {
      return res;
    }
    for (let current of list_1) {
      if (current["sort"] == value) {
        res.push(current);
      }
    }
    return res;
  },
  GetChildList: function(sort, tid, list_1) {
    let res = [];
    if (list_1 == undefined || list_1 == null || list_1.length == 0) {
      return res;
    }
    for (let current of list_1) {
      if (current["sort"] == sort && current["parentid"] == tid) {
        res.push(current);
      }
    }
    return res;
  },
  FindParentLABEL_NAME(data, parentid) {
    for (let i = 0, len = data.Items.length; i < len; i++) {
      if (data.Items[i].LABEL_ID == parentid) {
        return data.Items[i].LABEL_NAME;
      }
    }
    return "";
  },
  //返回列表以及饼状图结果集
  async GetFundUseSqlTable(list, jdbz_, ajid) {
    let data = await this.GetNavMenuData();
    let dt = await this.AnalysisSql(list, jdbz_, ajid);
    let res = [];
    let picitem = [];
    for (let i = 0, len = dt.rows.length; i < len; i++) {
      if (dt.rows[i].je != null && dt.rows[i].je != undefined) {
        let item = {};
        let item2 = {};
        item.tid = dt.rows[i].tid;
        item.parentid = dt.rows[i].parentid;
        item.JDBZ = jdbz_;
        if (jdbz_ == "进") {
          item.JZJE = dt.rows[i].je;
          item.JZBS = dt.rows[i].count;
          item.YTLB = this.FindParentLABEL_NAME(data[0], dt.rows[i].parentid);
        } else {
          item.CZJE = dt.rows[i].je;
          item.CZBS = dt.rows[i].count;
          item.YTLB = this.FindParentLABEL_NAME(data[1], dt.rows[i].parentid);
        }
        item.ZJYT = dt.rows[i].title;
        item.GLZHS = dt.rows[i].cxzh;
        item.GLRS = dt.rows[i].jyzjhm;
        item.GLDSZHS = dt.rows[i].jydfzkh;
        item.GLDSRS = dt.rows[i].jydfzjhm;
        res.push(item);
        item2.title = dt.rows[i].title;
        item2.rate = parseFloat(dt.rows[i].rate).toFixed(1);
        item2.color = dt.rows[i].color;
        picitem.push(item2);
      }
    }
    let observableCollection = this.Get_observableCollection(dt.rows);
    return { rows: res, legendData: observableCollection, pieData: picitem };
  },
  //拼接执行sql
  AnalysisSql: async function(list_1, string_2, caseId, condition = "") {
    const client = await global.pool.connect();
    try {
      let text =
        "select p.*,t.je,t.rate,t.jyzjhm jyzjhm,t.cxzh cxzh,t.jydfzjhm jydfzjhm,t.jydfzkh jydfzkh,t.count count from icap_base.layout_purpose p left join (select p.tid,t.je,t.je/sum(t.je) over()*100  rate,t.jyzjhm jyzjhm,t.cxzh cxzh,t.jydfzjhm jydfzjhm,t.jydfzkh jydfzkh,t.count count from icap_base.layout_purpose p ";
      text += "left join (select ";
      let list = this.GetSort(list_1, "2");
      if (list.length > 0) {
        text += " CASE";
        for (let i = 0; i < list.length; i++) {
          let m = list[i];
          let list2 = eval("(" + m.filtercontent + ")");
          if (list2 != null && list2 != undefined) {
            text += " WHEN ";
            for (let current of list2) {
              if (
                current.DataFiltratorModelList == undefined ||
                current.DataFiltratorModelList == null
              ) {
                if (current.Logical == "EqualTo") {
                  text =
                    text +
                    " " +
                    current.ColumnName +
                    "='" +
                    current.StrValue +
                    "' ";
                } else if (current.Logical == "Contains") {
                  text =
                    text +
                    " POSITION('" +
                    current.StrValue +
                    "' in " +
                    current.ColumnName +
                    " ) > 0 ";
                }
                if (current.LineCode == "且") {
                  text += " AND ";
                } else {
                  text += " OR ";
                }
              } else {
                text += " ( ";
                for (let current2 of current.DataFiltratorModelList) {
                  if (current2.Logical == "EqualTo") {
                    text =
                      text +
                      " " +
                      current2.ColumnName +
                      "='" +
                      current2.StrValue +
                      "' ";
                  } else if (current2.Logical == "Contains") {
                    text =
                      text +
                      " POSITION('" +
                      current2.StrValue +
                      "' in " +
                      current2.ColumnName +
                      " ) > 0 ";
                  }
                  if (current2.LineCode == "且") {
                    text += " AND ";
                  } else {
                    text += " OR ";
                  }
                }
                if (text.slice(-4) == "AND ") {
                  text = text.slice(0, -4);
                }
                if (text.slice(-3) == "OR ") {
                  text = text.slice(0, -3);
                }
                text += " ) ";
                if (current.LineCode == "且") {
                  text += " AND ";
                } else {
                  text += " OR ";
                }
              }
            }
            if (text.slice(-4) == "AND ") {
              text = text.slice(0, -4);
            }
            if (text.slice(-3) == "OR ") {
              text = text.slice(0, -3);
            }
            let list3 = this.GetChildList("3", m.tid, list_1);
            if (list3.length > 0) {
              text += " OR ( ";
              for (let current3 of list3) {
                text = text + " zysm='" + current3.title + "' ";
                text += " OR ";
              }
              if (text.slice(-3) == "OR ") {
                text = text.slice(0, -3);
              }
              text += " ) ";
            }
            text = text + " THEN " + m.tid + " ";
          } else {
            let list4 = this.GetChildList("3", m.tid, list_1);
            if (list4.length > 0) {
              text += " WHEN ";
              for (let current4 of list3) {
                text = text + " zysm='" + current4.title + "' ";
                text += " OR ";
              }
              if (text.slice(-3) == "OR ") {
                text = text.slice(0, -3);
              }
              text = text + " THEN " + m.tid + " ";
            }
          }
        }
        if (text.slice(-4) == "CASE") {
          text += " when 0=0 then 0 ";
        }
        text = text + " else " + (string_2 == "进" ? "256" : "257") + " END ";
      } else {
        text += " 0 ";
      }
      text +=
        ` TID,sum(jyje) je,count(distinct (jyzjhm,jymc)) jyzjhm,count(distinct (cxzh,jymc)) cxzh,count(distinct (jydfzjhm,jydfmc)) jydfzjhm,count(distinct (jydfzkh,jydfmc)) jydfzkh,count(*) count from ` +
        Default.GetBankDetailTableSql("gas_bank_records").replace(
          /\$AJID\$/g,
          caseId
        ) +
        ` where ajid=` +
        caseId +
        ` and jdbz='` +
        string_2 +
        `' ` +
        condition +
        ` GROUP BY TID) t on p.tid=t.tid where p.sort not in (0,1) and p.type=` +
        (string_2 == "进" ? "0" : "1") +
        ` and p.sort!=0) t on p.tid=t.tid`;
      //console.log(text)
      await cases.SwitchCase(client, caseId);
      let res = await client.query(text);
      return res;
    } finally {
      client.release();
    }
  },
  // 资金用户模型的tree结构
  GetNavMenuData: async function() {
    const client = await global.pool.connect();
    try {
      let observableCollection = [];
      let safeSql =
        "select * from icap_base.layout_purpose where state in (0,2) and sort in (0,1,2) and tid not in (254,255,256,257) order by sort,tid ";
      // await cases.SwitchCase(client, ajid);
      let dataTable_0 = await client.query(safeSql);
      if (dataTable_0 != null || dataTable_0.rows.length > 0) {
        let array = this.GetChildFromParentId(dataTable_0.rows, "-1");
        if (array.length != 0) {
          for (let dataRow_ of array) {
            let cA_PageItem = this.GetPgItem(dataRow_);
            this.GetPgItemChild(cA_PageItem, dataTable_0.rows);
            observableCollection.push(cA_PageItem);
          }
        }
      }
      return observableCollection;
    } catch (e) {
      console.log("<<<===============", e.message);
    } finally {
      client.release();
    }
  },

  ////////////////////////////饼状图////////////////////////////////////////
  Get_observableCollection: function(list_1) {
    let arg_44_0 = list_1.filter(
      (item) =>
        item.sort == "1" &&
        (item.state == "0" || item.state == "2") &&
        item.ischecked == "1"
    ); //过滤出根节点
    let list = arg_44_0.sort(function(a1, a2) {
      return parseInt(a1.tid) - parseInt(a2.tid);
    });
    let observableCollection = [];
    if (list.length > 0) {
      let num = 0.0; //总金额
      for (let l of list_1) {
        if (!Default.IsNullOrEmpty(l.je)) {
          num += parseFloat(l.je);
        }
      }
      for (let model of list) {
        let arg_B2_0 = list_1.filter(
          (item) =>
            item.parentid == model.tid &&
            (item.state == "0" || item.state == "2") &&
            item.ischecked == "1"
        ); //过滤出子节点
        let arg_FB_0 = arg_B2_0.sort(function(a1, a2) {
          return parseInt(a1.tid) - parseInt(a2.tid);
        });
        let num2 = 0.0;
        let num3 = 0.0;
        let num4 = 0.0;
        let num5;
        for (let current of arg_FB_0) {
          if (
            !Default.IsNullOrEmpty(current.rate) &&
            !Default.IsNullOrEmpty(current.je)
          ) {
            num3 = parseFloat(current.je);
            if (num3 > 0) {
              num3 = num2;
              num4 = parseFloat(current.je);
              num2 = num3 + num4;
            }
          }
        }
        num4 = num2;
        if (num4 != 0) {
          let chartModel2 = {};
          num3 = num2; //当前类别总金额
          num5 = num; //总金额
          chartModel2.rate = ((num3 / num5) * 100).toFixed(2); //百分比
          chartModel2.color = model.color;
          chartModel2.title = model.title;
          chartModel2.tid = model.tid;
          chartModel2.parentid = model.parentid;
          chartModel2.je = String(num2.toFixed(2));
          //chartModel2.SecondModel = list2;
          observableCollection.push(chartModel2);
        }
      }
      if (observableCollection.length > 0) {
        return observableCollection;
      }
    }
    if (observableCollection.length <= 0) {
      let chartModel3 = {};
      chartModel3.rate = 100.0;
      chartModel3.color = "#d6a799";
      chartModel3.title = "其他";
      chartModel2.je = "100";
      observableCollection.push(chartModel3);
    }
    return observableCollection;
  },
};
