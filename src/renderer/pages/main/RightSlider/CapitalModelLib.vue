<template >
  <div :style="{ height: contentViewHeight + 'px'}">
    <el-tabs
      class="rightTab"
      tab-position="bottom"
      type="card"
      closable
      :style="{ height: contentViewHeight + 'px'}"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="(item) in currentTableData.rightTabs.filter( obj=> obj.visible === true)"
        :key="item.tabIndex"
        :name="item.tabIndex"
      >
        <span slot="label" style="font-size:10px;" class="iconfont" v-html="item.title"></span>
        <component :is="item.componentName" :renderData="item"></component>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import ModelView from "./child/ModelView";
import ModelListView from "./child/ModelListView";
export default {
  mounted() {},
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  components: {
    "model-list-view": ModelListView,
    "model-view": ModelView,
  },
  methods: {
    handleTabRemove(tabIndex) {
      console.log(tabIndex);
      //更新rightTabs的显示和隐藏
      this.$store.commit("ShowTable/SET_RIGHT_TAB_VISIBLE", {
        pageIndex: this.currentTableData.pageIndex,
        tabIndex,
        visible: false,
      });
    },
  },
};
</script>

<style>
.rightTab .el-tabs__item {
  /* background-color: white; */
}
.rightTab .el-tabs__nav-scroll {
  background-color: #f5f7fa;
}
</style>
