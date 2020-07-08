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
</style>
