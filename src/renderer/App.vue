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
  data() {
    return {
      update: true,
    };
  },
  methods: {
    reload() {
      // 移除组件
      this.update = false;
      this.$nextTick(() => {
        this.update = true;
      });
    },
  },
  async mounted() {},
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-user-select: none;
}
#app {
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}
::-webkit-scrollbar {
  display: none;
}
:focus {
  outline: 0;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
