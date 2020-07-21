<template>
  <div class="view-style" :style="{ height: contentViewHeight + 'px'}">
    <el-tabs
      class="el-tabs"
      v-model="editableTabsValue"
      type="border-card"
      editable
      @edit="handleTabsEdit"
    >
      <el-tab-pane
        :key="item.name"
        v-for="(item) in editableTabs"
        :label="item.title"
        :name="item.name"
      >
        <keep-alive>
          <component :is="item.componentName"></component>
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import NoDataView from "./DataCollection/NoDataView";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"])
  },
  components: {
    "no-data-view": NoDataView
  },
  data() {
    return {
      editableTabsValue: "1",
      editableTabs: [
        {
          title: "标准采集",
          name: "1",
          componentName: "no-data-view"
        }
      ],
      tabIndex: 3
    };
  },
  methods: {
    handleTabsEdit(targetName, action) {
      if (action === "add") {
        let newTabName = ++this.tabIndex + "";
        this.editableTabs.push({
          title: "New Tab",
          name: newTabName,
          componentName: "no-data-view"
        });
        this.editableTabsValue = newTabName;
      }
      if (action === "remove") {
        let tabs = this.editableTabs;
        let activeName = this.editableTabsValue;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }
        this.editableTabsValue = activeName;
        this.editableTabs = tabs.filter(tab => tab.name !== targetName);
      }
    }
  }
};
</script>
<style scoped>
.el-tabs {
  overflow-x: scroll; /*横向滚动*/
  width: 100%;
  height: 100%;
}
</style>