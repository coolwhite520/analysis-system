<template>
  <div id="app">
    <title-bar></title-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import TitleBar from "@/pages/TitleBar";
export default {
  name: "App",
  components: {
    "title-bar": TitleBar
  }
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
}
#app {
  /* background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%); */
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
</style>
