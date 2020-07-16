<template>
  <div id="app">
    <title-bar></title-bar>
    <div style="height:100px;"></div>
    <keep-alive>
      <component :is="currentViewName"></component>
    </keep-alive>
    <div style="height:20px;"></div>
    <div class="state-bar">&nbsp;</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TitleBar from "@/pages/TitleBar";
import HomePage from "@/pages/HomePage";
import MainPage from "@/pages/MainPage";
export default {
  name: "App",
  components: {
    "title-bar": TitleBar,
    "home-page": HomePage,
    "main-page": MainPage
  },
  computed: {
    ...mapState("AppPageSwitch", ["currentViewName"])
  },
  mounted() {
    this.$store.dispatch("PublicList/getAJLBList");
    this.$store.dispatch("PublicList/getZCJDMClist");
    this.$store.dispatch("PublicList/getProvincelist");
    // 设置主区域的height
    let height = this.$electron.remote.getGlobal("height");
    let MainViewHeight = height - 100 - 20; // titelbar footbar
    let ContentViewHeight = MainViewHeight - 143; // 减去 tabbars的高度
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", MainViewHeight);
    this.$store.commit(
      "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
      ContentViewHeight
    );
    console.log({ height });
  }
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
::-webkit-scrollbar {
  display: none;
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
