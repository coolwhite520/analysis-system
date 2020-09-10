<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :visible.sync="standardDataVisible"
      :width="exampleDataList.length > 0 ? '65%': '30%'"
      :before-close="handleClose"
      :modal="false"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white;font-size:30px;">&#xe6a1;</i>
        <span class="title-text" style="color: white;">{{title}}</span>
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
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "begin-import");
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
    },
  },
};
</script>

<style >
.standard-data-dialog .el-dialog {
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
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
}
</style>



