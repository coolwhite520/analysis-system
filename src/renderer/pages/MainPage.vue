<template>
  <div class="main-page">
    <el-row>
      <tab-bar v-show="showTabBarView"></tab-bar>
    </el-row>
    <!-- <el-button type="text" @click="handleClickOpenNewWin">open new win</el-button> -->
    <el-row>
      <el-col :span="3">
        <data-center></data-center>
      </el-col>
      <el-col :span="showRightSliderView ? 17:21">
        <main-center-view></main-center-view>
      </el-col>
      <el-col :span="showRightSliderView ? 4:0">
        <transition
          name="custom-classes-transition"
          enter-active-class="animated slideInRight"
          leave-active-class="animated slideOutRight"
        >
          <right-slider v-if="showRightSliderView"></right-slider>
        </transition>
      </el-col>
    </el-row>
    <el-row>
      <div class="state-bar">&nbsp;</div>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TabBar from "@/pages/main/TabBar";
import DataCenter from "@/pages/main/LeftSlider/DataCenter";
import MainCenterView from "@/pages/main/MainViews/MainCenterView";
import RightSlider from "@/pages/main/RightSlider/CapitalModelLib";
export default {
  mounted() {},
  computed: {
    ...mapState("MainPageSwitch", ["showRightSliderView", "showTabBarView"]),
    ...mapState("AppPageSwitch", ["mainViewHeight"])
  },
  data() {
    return {
      height: 0,
      dialogVisible: false
    };
  },

  components: {
    "tab-bar": TabBar,
    "data-center": DataCenter,
    "main-center-view": MainCenterView,
    "right-slider": RightSlider
  },
  methods: {
    createMiniWindow() {
      const miniWinURL =
        process.env.NODE_ENV === "development"
          ? `http://localhost:9080/#/mini`
          : `file://${__dirname}/index.html/#/mini`;
      let obj = {
        height: 200,
        width: 800,
        show: false,
        backgroundColor: "#2e2c29", // 初始化一个背景色
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          webSecurity: false
        }
      };
      let miniWindow = new this.$electron.remote.BrowserWindow(obj);
      miniWindow.loadURL(miniWinURL);
      miniWindow.on("closed", () => {
        miniWindow = null;
      });
      return miniWindow;
    },
    handleClickOpenNewWin() {
      let miniWin = this.createMiniWindow();
      miniWin.show();
    }
  }
};
</script>
<style scoped>
.main-page {
  -webkit-user-select: none;
}
.state-bar {
  height: 20px;
  background: #1b2735;
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  position: fixed;
  z-index: 999;
  width: 100%;
  left: 0px;
  bottom: 0px;
}
</style>