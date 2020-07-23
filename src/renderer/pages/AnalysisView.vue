<template>
  <div>
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
import TitleBar from "@/pages/title/TitleBar";
import HomePage from "@/pages/home/HomePage";
import MainPage from "@/pages/main/MainPage";
export default {
  name: "App",
  components: {
    "title-bar": TitleBar,
    "home-page": HomePage,
    "main-page": MainPage
  },
  computed: {
    ...mapState("AppPageSwitch", ["currentViewName"])
  }
};
</script>

<style>
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
