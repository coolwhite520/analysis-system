<template>
  <div>
    <el-row class="title">
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
      <el-form ref="form" :model="form" label-width="100px" label-position="right" size="mini">
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
      form: {},
      enableSaveBtn: true,
    };
  },
  methods: {
    handleClickClose() {
      this.$electron.ipcRenderer.send("hide-db-config");
    },
    async handleClickTestConn() {
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
          message: "数据库测试连接失败",
        });
      }
    },
    handleClickSave() {
      console.log(this.form);
      let { user, password, database, port, host } = this.form;
      let config = new DbConfig();
      try {
        config.writeDbConfig(user, host, database, password, port);
        this.$electron.ipcRenderer.send("hide-db-config");
        this.$electron.ipcRenderer.send("reloadApp");
      } catch (e) {
        console.log(e);
        this.$notify.error({
          title: "错误",
          message: `数据保存错误：${e.message}`,
        });
      }
    },
  },
};
</script>
<style scoped>
.title {
  height: 50px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  background-color: beige;
  color: white;
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%);
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
