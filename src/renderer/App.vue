<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style scoped>
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
