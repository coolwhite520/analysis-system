<template>
  <div></div>
</template>
<script>
import { Pool } from "pg";
import DataSupplementWinModel from "@/utils/sql/DataComplementModel.js";

export default {
  data() {
    return {
      dataSupplementInstance: null,
    };
  },
  methods: {
    async onDataCompletionBegin(event, args) {
      let { ajid, type, val, data } = args;
      if (this.dataSupplementInstance === null) {
        this.dataSupplementInstance = new DataSupplementWinModel(ajid);
      }
      let dataRows;
      let num = 0;
      let count = 0;

      if (type === "select") {
        try {
          num = await this.dataSupplementInstance.GetAllEmptyRowCount();
          count = await this.dataSupplementInstance.GetCanSuppleentRowCount(
            !val
          );
          if (val) {
            dataRows = await this.dataSupplementInstance.GetAllData();
          } else {
            dataRows = await this.dataSupplementInstance.GetMasterData();
          }
          let filterKey = [
            "IsChecked",
            "Khyh",
            "KhyhIsenable",
            "KhyhList",
            "Zh",
            "Zhmc",
            "ZhmcIsenable",
            "ZhmcList",
            "Zzhm",
            "ZzhmIsenable",
            "ZzhmList",
          ];
          dataRows = dataRows.map((row) => {
            let obj = {};
            for (let k in row) {
              if (filterKey.includes(k)) {
                obj[k] = row[k];
              }
            }
            return obj;
          });

          this.$electron.ipcRenderer.send("data-completion-end", {
            type,
            success: true,
            msg: "",
            data: {
              num,
              count,
              dataRows,
            },
          });
        } catch (e) {
          this.$electron.ipcRenderer.send("data-completion-end", {
            type,
            success: false,
            msg: e.message,
          });
        }
      } else {
        try {
          await this.dataSupplementInstance.UpdataAllData(
            data.dataRows,
            (obj) => {
              this.$electron.ipcRenderer.send("data-completion-end", obj);
            }
          );
          this.$electron.ipcRenderer.send("data-completion-end", {
            type,
            success: true,
          });
        } catch (e) {
          this.$electron.ipcRenderer.send("data-completion-end", {
            type,
            success: false,
            msg: e.message,
          });
        }
      }
    },
  },
  async beforeMount() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
    global.pool = new Pool(await this.$electron.remote.getGlobal("dbCon"));
  },
  destroyed() {
    global.pool.end();
  },
  mounted() {
    this.$electron.ipcRenderer.send("data-completion-ready");
    this.$electron.ipcRenderer.on(
      "data-completion-begin",
      this.onDataCompletionBegin
    );
  },
};
</script>