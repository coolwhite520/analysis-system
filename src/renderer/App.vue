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
  },
  mounted() {
    this.$store.dispatch("PublicList/getAJLBList");
    this.$store.dispatch("PublicList/getZCJDMClist");
    this.$store.dispatch("PublicList/getProvincelist");
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
