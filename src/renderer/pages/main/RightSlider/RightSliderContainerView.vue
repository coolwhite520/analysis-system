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
        <component :is="item.componentName"></component>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import ModelView from "./child/ModelView";
import ModelListView from "./child/ModelListView";
import EntityListView from "./child/EntityListView";
import EntityView from "./child/EntityView";
import LinkView from "./child/LinkView";
import ComboEntityListView from "./child/ComboEntityListView";
import SearchReplaceView from "./child/wash/SearchReplaceView";
import SpecialCharView from "./child/wash/SpecialCharView";
import IneffectDataView from "./child/wash/IneffectDataView";
import DataDiffView from "./child/wash/DataDiffView";
import SameDataDiffView from "./child/wash/SameDataDiff";
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
        this.$store.commit("ShowTable/SET_RIGHT_TAB_ACTIVE", newValue);
      },
    },
  },
  components: {
    "model-list-view": ModelListView,
    "model-view": ModelView,
    "entity-list-view": EntityListView,
    "entity-view": EntityView,
    "link-view": LinkView,
    "combo-entity-list-view": ComboEntityListView,
    "search-replace-view": SearchReplaceView,
    "special-char-view": SpecialCharView,
    "ineffect-data-view": IneffectDataView,
    "data-diff-view": DataDiffView,
    "same-data-diff-view": SameDataDiffView,
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
