<template>
  <div class="main-page" :style="{ height: mainViewHeight + 'px' }">
    <el-row>
      <tab-bar v-show="showTabBarView"></tab-bar>
    </el-row>
    <!-- <el-button type="text" @click="handleClickOpenNewWin">open new win</el-button> -->

    <el-row>
      <el-col :span="isCollapseLeftBar ? 1 : 3">
        <data-center></data-center>
      </el-col>
      <el-col
        :span="
          (currentTableData &&
          currentTableData.rightTabs &&
          currentTableData.rightTabs.length > 0
            ? 17
            : 21) + (isCollapseLeftBar ? 2 : 0)
        "
      >
        <main-center-view></main-center-view>
      </el-col>
      <el-col
        :span="
          currentTableData &&
          currentTableData.rightTabs &&
          currentTableData.rightTabs.length > 0
            ? 4
            : 0
        "
      >
        <right-slider
          v-if="
            currentTableData &&
            currentTableData.rightTabs &&
            currentTableData.rightTabs.length > 0
          "
        ></right-slider>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import TabBar from "@/pages/main/Tabs/TabBar";
import DataCenter from "@/pages/main/LeftSlider/DataCenter";
import MainCenterView from "@/pages/main/MainViews/MainCenterView";
import RightSlider from "@/pages/main/RightSlider/CapitalModelLib";
export default {
  mounted() {},
  computed: {
    ...mapState("MainPageSwitch", ["showTabBarView", "showFieldsVisible"]),
    ...mapState("AppPageSwitch", ["mainViewHeight", "isCollapseLeftBar"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  data() {
    return {
      height: 0,
      dialogVisible: false,
    };
  },

  components: {
    "tab-bar": TabBar,
    "data-center": DataCenter,
    "main-center-view": MainCenterView,
    "right-slider": RightSlider,
  },
  methods: {},
};
</script>
<style scoped>
.main-page {
  -webkit-user-select: none;
}
</style>