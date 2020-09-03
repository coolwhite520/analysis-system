<template>
  <div>
    <el-tabs
      v-model="activeName"
      type="card"
      @tab-click="handleClickTab(activeName)"
      closable
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="(item, index) of exampleDataList"
        :key="index"
        :label="item.fileName+'-'+item.sheetName+'-'+item.mbmc"
        :name="String(index)"
      >
        <explore-view :sheetItem="item" :activeName="index"></explore-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapState } from "vuex";
import exploreView from "./ExploreView";
export default {
  async mounted() {
    this.activeName = "0";
  },
  components: {
    "explore-view": exploreView,
  },
  data() {
    return {
      activeName: "0",
    };
  },
  computed: {
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  methods: {
    async removeTab(targetName) {
      this.$store.commit(
        "DataCollection/DELETE_DATA_LIST_BY_INDEX",
        targetName
      );
      this.activeName = "0";
      if (this.exampleDataList.length === 0) {
        await this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
        await this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      }
    },
    handleClickTab(index) {
      console.log(index);
    },
  },
};
</script>