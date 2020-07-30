<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="standardDataVisible"
      width="80%"
      :before-close="handleClose"
      :modal="false"
    >
      <component :is="componentName"></component>
    </el-dialog>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import BeginImportData from "./standard/BeginImportData";
export default {
  components: {
    "begin-import": BeginImportData,
  },
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible"]),
  },
  data() {
    return {
      title: `标准数据采集`,
      componentName: "begin-import",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
    },
  },
};
</script>

<style scoped>
</style>



