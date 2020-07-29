<template>
  <div class="titleBar" @dblclick="handleDbClick">
    <el-row>
      <el-col :span="2">
        <div class="logo iconfont">&#xe66a;</div>
      </el-col>
      <el-col class="colum" :span="18">
        <div class="titleContent">
          <b>FanFu</b>-资金流分析系统
        </div>
      </el-col>
      <el-col class="colum" :span="4">
        <div>
          <span class="opterationBtn iconfont">
            <span @click="handleClickGotoHome" class="gohome">&#xe6fe;</span>
            <span @click="handleClickMin" class="min">&#xe60c;</span>
            <span @click="handleClickClose" class="close">&#xe634;</span>
          </span>
        </div>
        <div
          style="float:right;margin-top:20px;font-size:10px;margin-right:10px;"
        >当前版本号：{{softVersion}}</div>
        <div style="clear:both;"></div>
        <div v-show="currentViewName==='main-page'" style="float:right;margin-right:10px;">
          <el-button
            style="color:white;padding:0;"
            type="text"
            @click="handleClickShowTabBar"
            class="iconfont"
          >{{showTabBarView?"&#xe6da;":'&#xe6dd;'}}</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      softVersion: this.$electron.remote.getGlobal("softVersion"),
    };
  },
  mounted() {
    // let bounds = this.$electron.remote.getGlobal("bounds");
    // console.log(bounds);
    // let height = bounds.height - 100 - 143 - 20 - 25; // titelbar tabbar footbar lineheight
    // this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", height);
  },
  computed: {
    ...mapState("MainPageSwitch", ["showTabBarView"]),
    ...mapState("AppPageSwitch", ["currentViewName", "contentViewHeight"]),
  },
  methods: {
    handleClickShowTabBar() {
      if (this.showTabBarView) {
        let newContentViewHeight = this.contentViewHeight + 143; // titelbar tabbar footbar lineheight
        this.$store.commit(
          "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
          newContentViewHeight
        );
        this.$store.commit("MainPageSwitch/SET_SHOWTABBARVIEW", false);
      } else {
        let newContentViewHeight = this.contentViewHeight - 143;
        this.$store.commit(
          "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
          newContentViewHeight
        );
        this.$store.commit("MainPageSwitch/SET_SHOWTABBARVIEW", true);
      }
    },
    handleDbClick() {
      this.$electron.ipcRenderer.send("move-to-zero");
    },
    handleClickGotoHome() {
      console.log("click");
      this.$store.commit(
        "HomePageSwitch/SET_VIEW_NAME",
        "show-exist-case-view"
      );
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "home-page");
    },
    handleClickMin() {
      this.$electron.ipcRenderer.send("window-min");
    },
    handleClickClose() {
      this.$electron.ipcRenderer.send("window-close");
    },
  },
};
</script>

<style scoped>
.titleBar {
  color: #fff;
  height: 100px;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  -webkit-app-region: drag;
  -webkit-user-select: none;
  position: fixed;
  z-index: 999;
  width: 100%;
  left: 0px;
  top: 0px;
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
}

.logo {
  font-size: 70px;
  text-align: center;
  margin-top: 15px;
}

.titleContent {
  margin-top: 25px;
  font-size: 20px;
  text-align: left;
}
.opterationBtn {
  display: block;
  font-size: 15px;
  text-align: right;
  margin-top: 10px;
  margin-right: 10px;
  color: white;
  -webkit-app-region: no-drag;
}
.gohome {
  font-size: 25px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}
.min {
  margin-right: 5px;
}

.gohome:hover {
  cursor: pointer;
}
.min:hover {
  color: green;
  cursor: pointer;
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
