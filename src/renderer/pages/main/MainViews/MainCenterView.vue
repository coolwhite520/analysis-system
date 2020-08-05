<template>
  <div class="view-style" :style="{ height: contentViewHeight + 'px'}">
    <el-tabs
      class="el-tabs"
      v-model="activeIndex"
      type="border-card"
      closable
      @tab-remove="removeTab"
    >
      <el-tab-pane
        :key="item.tid"
        v-for="(item) in tableDataList"
        :label="item.title"
        :name="item.tid"
      >
        <keep-alive>
          <component :is="item.componentName" :tableData="item"></component>
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import NoDataView from "./DataCollection/NoDataView";
import TableDataView from "./DataCollection/TableDataView";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "activeIndex"]),
    activeIndex: {
      get: function () {
        return this.$store.state.ShowTable.activeIndex;
      },
      set: function (newValue) {
        this.$store.commit("ShowTable/SET_ACTIVEINDEX", newValue);
      },
    },
  },
  components: {
    "no-data-view": NoDataView,
    "table-data-view": TableDataView,
  },
  mounted() {},
  data() {
    return {
      // editableTabs: [
      //   {
      //     title: "标准采集",
      //     tid: "9999",
      //     componentName: "no-data-view",
      //   },
      // ],
      // tabIndex: 3,
    };
  },
  methods: {
    removeTab(targetName) {
      console.log(targetName, this.activeIndex);
      this.$store.commit(
        "ShowTable/REMOVE_TABLE_DATA_FROM_LIST",
        String(targetName)
      );
    },
  },
};
</script>
<style scoped>
.el-tabs {
  overflow-x: scroll; /*横向滚动*/
  width: 100%;
  height: 100%;
}
</style>