<template>
  <el-dialog v-dialogDrag :close-on-click-modal="false" class="standard-data-dialog" :append-to-body="true"
    :visible="dbConfigVisible" width="40%" @close="handleClose" :modal="true">
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe64f;</i>
      <span class="title-text" style="color: white; cursor: pointer">数据库设置</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>

    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="数据库初始化" name="first">
        <init-view></init-view>
      </el-tab-pane>
      <el-tab-pane label="数据库连接配置" name="second">
        <config-view></config-view>
      </el-tab-pane>
      <el-tab-pane label="扩展" name="third">
        <install-view></install-view>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import initDatabase from "./child/newDatabaseView";
import configDataBase from "./child/configCurrentDataBase";
import installPostgres from "./child/installPostgresView";
import checkPgInstall from "@/utils/checker/checkPgInstall";
export default {
  async mounted() {
    if (process.platform === "win32") {
      let installed = await checkPgInstall.existServiceBinFile();
      if (!installed) {
        this.$message({
          message: "检测到您还没有安装数据库服务，请先进行安装。",
        });
        this.activeName = "third";
      }
    }
  },
  components: {
    "init-view": initDatabase,
    "config-view": configDataBase,
    "install-view": installPostgres,
  },
  computed: {
    ...mapState("DialogPopWnd", ["dbConfigVisible"]),
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", false);
    },
  },
  data() {
    return {
      activeName: "first",
    };
  },
};
</script>
<style scoped>

</style>
