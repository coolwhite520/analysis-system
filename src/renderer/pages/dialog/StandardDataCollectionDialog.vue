<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :visible.sync="standardDataVisible"
      :width="
        standardViewSwitch === 'process-import' ||
        (standardViewSwitch === 'begin-import' && exampleDataList.length === 0)
          ? '30%'
          : '65%'
      "
      :before-close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe6a1;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <component :is="standardViewSwitch"></component>
    </el-dialog>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import BeginImportData from "./standard/BeginImportData";
import ProcessImportData from "./standard/ProcessImportData";
import ExploreTabs from "./standard/ExploreTabs";

export default {
  components: {
    "begin-import": BeginImportData,
    "process-import": ProcessImportData,
    "explore-data": ExploreTabs,
  },
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible", "standardViewSwitch"]),
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  data() {
    return {
      title: `数据采集`,
    };
  },
  methods: {
    async handleClose() {
      if (this.standardViewSwitch === "process-import") {
        let result = await this.$electron.remote.dialog.showMessageBox(null, {
          type: "warning",
          title: "关闭",
          message: `当前正在进行数据导入操作，您确定要关闭窗口吗？`,
          buttons: ["确定", "取消"],
          defaultId: 0,
        });
        if (result.response === 0) {
        } else {
          return;
        }
      }
      this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "begin-import");
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
      await this.$electron.ipcRenderer.send("data-collection-close");
    },
  },
};
</script>

<style >
.standard-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 !important;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 100px);
  max-width: calc(100% - 100px);
  border-radius: 5px;
}
.standard-data-dialog .el-dialog__header {
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  height: 50px;
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}
.standard-data-dialog .el-dialog__title {
  color: white;
  font-size: 16px;
}
.standard-data-dialog .dialog-title {
  margin-top: -10px;
  -webkit-user-select: none;
}
</style>



