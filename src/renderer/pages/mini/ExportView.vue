<template>
  <div></div>
</template>

<script>
import path from "path";
import { Pool, Client, Query } from "pg";
import cases from "@/db/Cases.js";
export default {
  methods: {
    async sleep(ms) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve("done");
        }, ms);
      });
    },
    async exportCsvAndExcel(ajid, filePath, headers, exportSql, sumRowCount) {
      if (!global.pool) {
        global.pool = new Pool(await this.$electron.remote.getGlobal("dbCon"));
      }
      let client = await global.pool.connect();
      try {
        let extName = path.extname(filePath);
        let fileName = path.basename(filePath);
        fileName = fileName.replace(extName, "");
        const excel = require("exceljs");
        const fs = require("fs");
        let res = fs.createWriteStream(filePath);
        const options = {
          stream: res,
          useStyles: true,
          useSharedStrings: true,
        };
        let workbook = new excel.stream.xlsx.WorkbookWriter(options);
        workbook.creator = "fanfu";
        workbook.lastModifiedBy = "";
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();
        let worksheet = workbook.addWorksheet(fileName, {
          headerFooter: {
            firstHeader: "繁复科技出品",
            firstFooter: "繁复科技出品",
          },
        });
        let columns = headers.map((el) => {
          return {
            header: el.fieldcname,
            key: el.fieldename,
            width: 10,
          };
        });
        // 生成标题头
        worksheet.columns = columns;
        await cases.SwitchCase(client, ajid);
        // 采用异步的方式进行
        const Query = require("pg").Query;
        const query = new Query(exportSql);
        const result = client.query(query);
        let index = 0;
        let currentPercentage = 0;

        function convert(row) {
          for (let k in row) {
            if (row[k] instanceof Date) {
              row[k] = row[k].Format("yyyy-MM-dd hh:mm:ss");
            }
          }
        }

        query.on("row", (row) => {
          convert(row);
          worksheet.addRow(row).commit();
          index++;
          let percentage = parseInt(parseFloat(index / sumRowCount) * 100);
          if (currentPercentage !== percentage) {
            currentPercentage = percentage;
            console.log(percentage);
            let result = {
              success: true,
              errormsg: "",
              percentage: percentage,
            };
            this.$electron.ipcRenderer.send("export-one-file-proccess", result);
          }
        });
        query.on("end", () => {
          worksheet.commit();
          workbook.commit();
          this.$electron.ipcRenderer.send("export-one-file-over", {});
          console.log("query done");
          client.release();
        });
        query.on("error", (err) => {
          console.error(err.stack);
          let result = { success: false, errormsg: err.message };
          this.$electron.ipcRenderer.send("export-one-file-proccess", result);
        });

        // let { rows } = await client.query(exportSql);
        // for (let index = 0; index < rows.length; index++) {
        //   worksheet.addRow(rows[index]).commit();
        //   let percentage = parseInt(parseFloat(index / rows.length) * 100);
        //   let result = { success: true, errormsg: "", percentage: percentage };
        //   this.$electron.ipcRenderer.send("export-one-file-proccess", result);
        // }
        // worksheet.commit();
        // workbook.commit();
        // this.$electron.ipcRenderer.send("export-one-file-over", {});
      } finally {
        //
      }
    },
  },

  async mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on(
      "export-one-file-begin",
      async (event, data) => {
        let { ajid, filePath, exportSql, headers, sumRowCount } = data;
        let extName = path.extname(filePath);
        switch (extName) {
          case ".txt":
            break;
          case ".xls":
          case ".xlsx":
          case ".csv":
            await _this.exportCsvAndExcel(
              ajid,
              filePath,
              headers,
              exportSql,
              sumRowCount
            );
            break;
        }
      }
    );
  },
};
</script>