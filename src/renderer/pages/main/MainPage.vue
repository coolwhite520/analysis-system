<template>
  <div
    class="main-page"
    :style="{ height: mainViewHeight + 'px' }"
    ref="MainPage"
  >
    <el-row>
      <tab-bar v-show="showTabBarView"></tab-bar>
    </el-row>
    <el-row>
      <el-col :span="isCollapseLeftBar ? 1 : 3">
        <data-center></data-center>
      </el-col>
      <el-col
        :span="
          (currentTableData &&
          currentTableData.isShowRightSlider &&
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
          currentTableData.isShowRightSlider &&
          currentTableData.rightTabs &&
          currentTableData.rightTabs.length > 0
            ? 4
            : 0
        "
      >
        <right-slider
          v-if="
            currentTableData &&
            currentTableData.isShowRightSlider &&
            currentTableData.rightTabs &&
            currentTableData.rightTabs.length > 0
          "
        ></right-slider>
      </el-col>

      <template
        v-if="
          currentTableData &&
          !currentTableData.isShowRightSlider &&
          currentTableData.rightTabs &&
          currentTableData.rightTabs.length > 0
        "
      >
        <el-tooltip
          class="item"
          effect="dark"
          content="点击展开右边栏"
          placement="left"
          ><div class="CollapseRightBar" @click="handleClickShowRightBar"></div>
        </el-tooltip>
      </template>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import TabBar from "@/pages/main/Tabs/TabBar";
import DataCenter from "@/pages/main/LeftSlider/DataCenter";
import MainCenterView from "@/pages/main/MainViews/MainCenterView";
import RightSlider from "@/pages/main/RightSlider/RightSliderContainerView";
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
  methods: {
    handleClickShowRightBar() {
      this.$store.commit("ShowTable/SHOWRIGHTSLIDER");
    },
  },
};
</script>
<style scoped>
.main-page {
  -webkit-user-select: none;
}
.CollapseRightBar {
  position: absolute;
  width: 10px;
  height: 40px;
  top: 0px;
  right: 0px;
  background-color: #3c4e6b;
  z-index: 99900;
  color: white;
  font-size: 10px;
}

.CollapseRightBar:hover {
  color: gray;
  cursor: pointer;
  background-color: #0a6e55;
}
</style>