<template>
  <div class="titleBar" @dblclick="handleDbClick">
    <el-row>
      <el-col :span="2">
        <div class="logo iconfont">&#xe66a;</div>
      </el-col>
      <el-col class="colum" :span="18">
        <div class="titleContent">
          <b>FanFu</b>-资金流分析系统
        </div>
      </el-col>
      <el-col class="colum" :span="4">
        <span class="opterationBtn iconfont">
          <span id="goHome" @click="handleClickGotoHome" class="gohome">&#xe6fe;</span>
          <span id="goHome" @click="handleClickMin" class="min">&#xe60c;</span>
          <span id="goHome" @click="handleClickClose" class="close">&#xe634;</span>
        </span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  methods: {
    handleDbClick() {
      this.$electron.ipcRenderer.send("move-to-zero");
    },
    handleClickGotoHome() {
      console.log("click");
    },
    handleClickMin() {
      this.$electron.ipcRenderer.send("window-min");
    },
    handleClickClose() {
      this.$electron.ipcRenderer.send("window-close");
    }
  }
};
</script>

<style scoped>
.titleBar {
  color: #fff;
  height: 100px;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  -webkit-app-region: drag;
}

.logo {
  font-size: 70px;
  text-align: center;
  margin-top: 15px;
}

.titleContent {
  margin-top: 25px;
  font-size: 20px;
  text-align: left;
}
.opterationBtn {
  display: block;
  font-size: 20px;
  text-align: right;
  margin-top: 15px;
  margin-right: 10px;
  color: gray;
  -webkit-app-region: no-drag;
}
.gohome {
  font-size: 25px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}
.min {
  margin-right: 5px;
}

.gohome:hover {
  color: #fff;
}
.min:hover {
  color: #fff;
}
.close:hover {
  color: #fff;
}
</style>
