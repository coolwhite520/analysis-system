<template>
  <div>
    <el-row class="dbConfigtitle">
      <el-col :span="23">
        <div class="iconfont" style="font-size:30px;margin:10px;float:left;">&#xe71a;</div>
        <div style="margin:15px;">数据库连接设置</div>
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
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        label-width="100px"
        label-position="right"
        size="mini"
      >
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item label="数据库名称：">
              <el-input v-model="form.database"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item label="ip地址：">
              <el-input v-model="form.host"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item label="端口号：">
              <el-input v-model="form.port"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item label="用户名：">
              <el-input v-model="form.user"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item label="密码：">
              <el-input v-model="form.password" show-password></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="14">
            <el-form-item size="mini">
              <el-button @click="handleClickTestConn">测试连接</el-button>
              <el-button type="primary" @click="handleClickSave" :disabled="!enableSaveBtn">保存设置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <!-- <el-progress :percentage="100" status="success"></el-progress> -->
        </el-row>
      </el-form>
    </el-row>
  </div>
</template>
<script>
const log = require("@/utils/log");
import { Pool } from "pg";
import { DbConfig } from "@/utils/config";
export default {
  beforeMount() {
    let config = new DbConfig();
    let dbCon = config.readDbConfig();
    this.form = dbCon;
  },
  data() {
    return {
      loading: false,
      form: {},
      enableSaveBtn: true,
    };
  },
  methods: {
    handleClickClose() {
      this.$electron.ipcRenderer.send("hide-db-config");
    },
    async handleClickTestConn() {
      this.loading = true;
      let db = new Pool(this.form);
      try {
        await db.query("SET search_path TO icap_base");
        await db.query(
          "SELECT ID::int, PARENT_ID::int,NAME FROM st_location WHERE PARENT_ID = 0;"
        );
        // this.enableSaveBtn = true;
        this.$notify({
          title: "成功",
          message: "数据库测试连接成功",
          type: "success",
        });
      } catch (e) {
        // this.enableSaveBtn = false;
        this.$notify.error({
          title: "错误",
          message: "数据库测试连接失败," + e.message,
          showClose: false,
        });
      }
      this.loading = false;
    },
    async handleClickSave() {
      let wnd = this.$electron.remote.getGlobal("dbConfigWindow");
      let result = await this.$electron.remote.dialog.showMessageBox(wnd, {
        type: "warning",
        title: "提示",
        message: `保存设置将会重新启动应用程序，您确定这样做吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        let { user, password, database, port, host } = this.form;
        let config = new DbConfig();
        try {
          config.writeDbConfig(user, host, database, password, port);
          this.$electron.ipcRenderer.send("hide-db-config");
          this.$electron.ipcRenderer.send("reloadApp");
        } catch (e) {
          log.error(e);
          this.$notify.error({
            title: "错误",
            message: `数据保存错误：${e.message}`,
          });
        }
      }
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
