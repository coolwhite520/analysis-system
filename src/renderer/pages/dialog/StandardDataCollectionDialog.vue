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
      title: `标准数据采集`,
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

<style scoped>
</style>



