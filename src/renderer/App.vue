<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: "App",
  async mounted() {
    await this.$store.dispatch("PublicList/getAJLBList");
    await this.$store.dispatch("PublicList/getZCJDMClist");
    await this.$store.dispatch("PublicList/getProvincelist");
    // 设置主区域的height
    let height = this.$electron.remote.getGlobal("height");
    let MainViewHeight = height - 100 - 20; // titelbar footbar
    let ContentViewHeight = MainViewHeight - 120; // 减去 tabbars的高度
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", MainViewHeight);
    this.$store.commit(
      "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
      ContentViewHeight
    );
    console.log({ height });
  },
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
:focus {
  outline: 0;
}
</style>
