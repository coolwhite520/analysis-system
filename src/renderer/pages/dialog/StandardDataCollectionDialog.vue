<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="standardDataVisible"
      width="65%"
      :before-close="handleClose"
      :modal="false"
    >
      <component :is="standardViewSwitch"></component>
    </el-dialog>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import BeginImportData from "./standard/BeginImportData";
import ProcessImportData from "./standard/ProcessImportData";
import ExploreData from "./standard/ExploreData";

export default {
  components: {
    "begin-import": BeginImportData,
    "process-import": ProcessImportData,
    "explore-data": ExploreData,
  },
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible", "standardViewSwitch"]),
  },
  data() {
    return {
      title: `数据采集`,
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "begin-import");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
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
}
.standard-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}
.standard-data-dialog .el-dialog__title {
  color: white;
  font-size: 16px;
}
.auto-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
}
.auto-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}
.auto-data-dialog .el-dialog__title {
  color: white;
}
</style>



