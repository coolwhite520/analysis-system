<template >
  <div :style="{ height: contentViewHeight + 'px' }">
    <el-tabs
      class="rightTab"
      tab-position="bottom"
      type="border-card"
      closable
      :style="{ height: contentViewHeight + 'px' }"
      @tab-remove="handleTabRemove"
      v-model="ActiveName"
    >
      <el-tab-pane
        v-for="item in currentTableData.rightTabs"
        :key="item.componentName"
        :name="item.componentName"
      >
        <span
          slot="label"
          style="font-size: 10px"
          class="iconfont"
          v-html="item.title"
        ></span>
        <component :is="item.componentName" :renderData="item"></component>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import ModelView from "./child/ModelView";
import ModelListView from "./child/ModelListView";
import EntityListView from "./child/EntityListView";
export default {
  mounted() {},
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
    ActiveName: {
      get: function () {
        return this.currentTableData.rightActiveName;
      },
      set: function (newValue) {
        console.log({ newValue });
        if (typeof newValue === "string")
          this.$store.commit("ShowTable/SET_RIGHT_TAB_ACTIVE", newValue);
      },
    },
  },
  components: {
    "model-list-view": ModelListView,
    "model-view": ModelView,
    "entity-view": EntityListView,
  },
  methods: {
    handleTabRemove(componentName) {
      console.log(componentName);
      //更新rightTabs的显示和隐藏
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName,
        action: "remove",
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
