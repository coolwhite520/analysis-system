<template>
  <div id="app">
    <title-bar></title-bar>
    <!-- <router-view></router-view> -->
    <home-page></home-page>
  </div>
</template>

<script>
import TitleBar from "@/pages/TitleBar";
import HomePage from "@/pages/HomePage";
export default {
  name: "App",
  components: {
    "title-bar": TitleBar,
    "home-page": HomePage
  }
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
}
</style>
