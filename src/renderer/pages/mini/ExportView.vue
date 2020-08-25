<template>
  <div></div>
</template>

<script>
import path from "path";
import cases from "@/db/Cases.js";
import db from "@/db/db.js";
export default {
  methods: {
    async sleep(ms) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve("done");
        }, ms);
      });
    },
    async exportCsvAndExcel(ajid, filePath, headers, exportSql) {
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
      await cases.SwitchCase(ajid);
      let { rows } = await db.query(exportSql);
      for (let index = 0; index < rows.length; index++) {
        console.log(rows[index]);
        worksheet.addRow(rows[index]).commit();
        let percentage = parseInt(parseFloat(index / rows.length) * 100);
        let result = { success: true, errormsg: "", percentage: percentage };
        this.$electron.ipcRenderer.send("export-one-file-proccess", result);
      }
      worksheet.commit();
      workbook.commit();
      this.$electron.ipcRenderer.send("export-one-file-over", {});
    },
  },

  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on(
      "export-one-file-begin",
      async (event, data) => {
        let { ajid, filePath, exportSql, headers } = data;
        let extName = path.extname(filePath);
        switch (extName) {
          case ".txt":
            break;
          case ".xls":
          case ".xlsx":
          case ".csv":
            await _this.exportCsvAndExcel(ajid, filePath, headers, exportSql);
            break;
        }
      }
    );
  },
};
</script>