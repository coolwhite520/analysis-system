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
  GetMaxID: async function() {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let res = await client.query(
        "SELECT MAX(ID)::int maxid FROM mz_report_records"
      );
      let count = res.rows[0].maxid;
      return isNaN(count) ? 0 : count;
    } finally {
      client.release();
    }
  },
  DelReportRecordById: async function(id) {
    const client = await global.pool.connect();
    try {
      let sql = "DELETE FROM mz_report_records WHERE ID=" + id;
      await cases.SwitchDefaultCase(client);
      await client.query(sql);
      return true;
    } finally {
      client.release();
    }
  },
  InsertNewRow: async function(ajid, ajmc, reportName, dirPath) {
    const client = await global.pool.connect();
    try {
      let id = (await this.GetMaxID()) + 1;
      if (id < 1000000000) {
        id = 1000000000;
      }
      await cases.SwitchDefaultCase(client);
      let sql = `INSERT INTO mz_report_records(ID, ReportName, ReportAjid, CaseName, CreateTime, FileContent) 
      VALUES ('${id}','${reportName}','${ajid}','${ajmc}','${new Date().Format(
        "yyyy-MM-dd hh:mm:ss"
      )}', E'${dirPath}'::bytea)`;
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } finally {
      client.release();
    }
  },
  QueryHistoryReport: async function() {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT * FROM mz_report_records  ORDER BY createtime DESC`;
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } finally {
      client.release();
    }
  },
};
