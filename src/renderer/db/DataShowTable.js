import db, { emit } from "./db";
import cases from "./Cases";
import model from "./Models";
import sqlFormat from "@/utils/sql/ModelSqlFormat";

function getSameFieldArray(arr1, arr2) {
  var arr = [];
  if (arr1.length > arr2.length) {
    for (var i in arr1) {
      if (arr2.indexOf(arr1[i]) != "-1") {
        if (arr.indexOf(arr1[i]) == "-1") {
          arr.push(arr1[i]);
        }
      }
    }
  } else {
    for (var i in arr2) {
      if (arr1.indexOf(arr2[i]) != "-1") {
        if (arr.indexOf(arr2[i]) == "-1") {
          arr.push(arr2[i]);
        }
      }
    }
  }
  return arr;
}

export default {
  // 根据tid获取显示的列名称list
  QueryTableShowCFields: async function(tid) {
    try {
      await cases.SwitchDefaultCase();
      let sql = `SELECT cname as fieldcname, lower(cfield) as fieldename, cid, showrightbtn_type, link_mid::int, data_type FROM icap_base.layout_table_column
       WHERE TID='${tid}' and (SHOWABLE is null or SHOWABLE ='Y')  
      ORDER BY thesort ASC;`;
      console.log(sql);
      let result = await db.query(sql);
      return { success: true, rows: result.rows };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },

  // 查询所有的基础表的信息
  QueryBaseTableData: async function(
    ajid,
    tid,
    tableename,
    filter,
    offset,
    count
  ) {
    try {
      let ret = await this.QueryTableShowCFields(tid);
      let headers = ret.rows;
      let showFields = [];
      for (let item of headers) {
        showFields.push(item.fieldename.toLowerCase());
      }
      await cases.SwitchCase(ajid);

      let querySqlTemp = "";
      let countSqlTemp = "";

      switch (tid) {
        case "1": //个人
          querySqlTemp = global.dataCenterTableTemplate.personTemplate.querySql;
          countSqlTemp = global.dataCenterTableTemplate.personTemplate.countSql;
          break;
        case "2": // 单位
          querySqlTemp =
            global.dataCenterTableTemplate.person2Template.querySql;
          countSqlTemp =
            global.dataCenterTableTemplate.person2Template.countSql;
          break;
        case "3":
          querySqlTemp =
            global.dataCenterTableTemplate.accountTemplate.querySql;
          countSqlTemp =
            global.dataCenterTableTemplate.accountTemplate.countSql;
          break;
        case "4":
          querySqlTemp = global.dataCenterTableTemplate.bankTemplate.querySql;
          countSqlTemp = global.dataCenterTableTemplate.bankTemplate.countSql;
          break;
        case "14":
          querySqlTemp = global.dataCenterTableTemplate.taxTemplate.querySql;
          countSqlTemp = global.dataCenterTableTemplate.taxTemplate.countSql;
          break;
        default:
          querySqlTemp = global.dataCenterTableTemplate.otherTemplate.querySql;
          countSqlTemp = global.dataCenterTableTemplate.otherTemplate.countSql;
          break;
      }
      let querySql = querySqlTemp
        .replace(/\$AJID\$/g, ajid)
        .replace(/\$FIELDS\$/g, showFields)
        .replace(/\$TABLENAME\$/g, tableename)
        .replace(/\$FILTER\$/g, filter)
        .replace(/\$COUNT\$/g, count)
        .replace(/\$OFFSET\$/g, offset);
      let countSql = countSqlTemp
        .replace(/\$AJID\$/g, ajid)
        .replace(/\$FIELDS\$/g, showFields)
        .replace(/\$FILTER\$/g, filter)
        .replace(/\$TABLENAME\$/g, tableename);

      console.log(querySql);
      let result = await db.query(querySql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = {};
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let cell = { value, error: false };
            newRow[k] = cell;
          }
        }
        retRows.push(newRow);
      }

      // 查询结果集的总量
      let resultCount = await db.query(countSql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 执行模型并获取结果集
  QueryModelTable: async function(ajid, tid, sql, offset, count) {
    try {
      let { rows } = await this.QueryTableShowCFields(tid);
      let headers = rows;
      let showFields = [];
      for (let item of headers) {
        showFields.push(item.fieldename.toLowerCase());
      }
      await cases.SwitchCase(ajid);
      let result = await db.query(sql);
      console.log({ result });
      // 数据过滤
      let resultFields = [];
      for (let item of result.fields) {
        resultFields.push(item.name.toLowerCase());
      }
      // 根据展示列和结果列的数组获取相同的元素数组作为headers
      showFields = getSameFieldArray(showFields, resultFields);
      let newHeaders = [];
      for (let header of headers) {
        if (showFields.includes(header.fieldename.toLowerCase())) {
          newHeaders.push(header);
        }
      }
      console.log({ newHeaders, showFields, resultFields });
      let retRows = [];
      let sum = result.rows.length;
      if (sum === 0) {
        return { success: true, headers: newHeaders, rows: retRows, sum };
      }
      for (let index = offset; index < offset + count; index++) {
        if (sum < index + 1) {
          break;
        }
        let row = result.rows[index];
        let newRow = {};
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let cell = { value, error: false, link: false };
            newRow[k] = cell;
          }
        }
        retRows.push(newRow);
      }
      return { success: true, headers: newHeaders, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
};
