<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible.sync="dbConfigVisible"
    width="40%"
    :before-close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe71a;</i>
      <span class="title-text" style="color: white; cursor: pointer"
        >数据库设置</span
      >
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>

    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="数据库初始化" name="first"
        ><init-view></init-view
      ></el-tab-pane>
      <el-tab-pane label="数据库连接配置" name="second">
        <config-view></config-view>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import initDatabase from "./child/newDatabaseView";
import configDataBase from "./child/configCurrentDataBase";
export default {
  components: {
    "init-view": initDatabase,
    "config-view": configDataBase,
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
