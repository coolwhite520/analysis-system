<template>
  <div id="app" :style="{ height: height + 'px' }">
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
      height: 0,
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
  async mounted() {
    this.height = this.$electron.remote.getGlobal("height");
  },
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
/* 去掉tree控件中的横向滚动条 */
.el-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}

#app {
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 0px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 8px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 8px;
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  /* background: #bfbebe; */
  background: rgba(0, 0, 0, 0.1);
}
::-webkit-scrollbar-thumb:hover {
  /*滚动条里面小方块*/
  border-radius: 8px;
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  background: #636363;
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  border-radius: 8px;
  background: rgba(255, 255, 255, 0);
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
