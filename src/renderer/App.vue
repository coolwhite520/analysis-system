<template>
  <div id="app">
    <title-bar></title-bar>
    <div style="margin-top:100px;"></div>
    <!-- <router-view></router-view> -->
    <!-- <home-page></home-page> -->
    <!-- <main-page></main-page> -->
    <keep-alive>
      <component :is="currentViewName"></component>
    </keep-alive>
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

    let bounds = this.$electron.remote.getGlobal("bounds");
    console.log(bounds);
    let height = bounds.height - 100 - 143 - 20 - 25; // titelbar tabbar footbar lineheight
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", height);
  }
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
}
::-webkit-scrollbar {
  display: none;
}
</style>
