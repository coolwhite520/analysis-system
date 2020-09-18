<template>
  <div>
    <el-row class="dbConfigtitle">
      <el-col :span="23">
        <div class="iconfont" style="font-size:30px;margin:10px;float:left;">&#xe71a;</div>
        <div style="margin:15px;">数据库初始化设置</div>
      </el-col>
      <el-col :span="1">
        <div style="float:right;margin:15px;">
          <span
            @click="handleClickClose"
            class="iconfont close"
            style="-webkit-app-region: no-drag;font-size:12px;"
          >&#xe634;</span>
        </div>
      </el-col>
    </el-row>

    <el-row style="margin-top:30px;">
      <el-col :span="4">&nbsp;</el-col>
      <el-col :span="16">
        <el-input size="mini" placeholder="请选择sql文件" v-model="sqlFilePath">
          <template slot="append">
            <el-button size="mini" type="primary" @click="handleClickOpenPath">打开文件</el-button>
          </template>
        </el-input>
      </el-col>

      <el-col :span="4">&nbsp;</el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      sqlFilePath: "",
    };
  },
  methods: {
    async handleClickOpenPath() {
      alert("hahah");
    },
    handleClickClose() {
      this.$electron.ipcRenderer.send("hide-db-init");
    },
  },
};
</script>

<style scoped>
.dbConfigtitle {
  height: 50px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  background-color: beige;
  color: white;
  background: radial-gradient(
    ellipse at bottom,
    #384e6e 0%,
    hsl(231, 26%, 29%) 100%
  );
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
