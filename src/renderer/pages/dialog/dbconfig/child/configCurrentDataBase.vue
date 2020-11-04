<template>
  <el-row style="margin-top: 10px">
    <el-form
      ref="ruleForm"
      :model="form"
      label-width="150px"
      label-position="right"
      size="small"
      :rules="rules"
    >
      <el-form-item label="数据库名称：" prop="database">
        <el-input v-model="form.database" placeholder="数据库名称"></el-input>
      </el-form-item>
      <el-form-item label="ip地址：" prop="host">
        <el-input v-model="form.host" placeholder="ip地址"></el-input>
      </el-form-item>

      <el-form-item label="端口号：" prop="port">
        <el-input v-model="form.port" placeholder="端口号"></el-input>
      </el-form-item>

      <el-form-item label="数据库管理员名称：" prop="user">
        <el-input v-model="form.user" placeholder="默认为postgres"></el-input>
      </el-form-item>

      <el-form-item label="数据库管理密码：" prop="password">
        <el-input
          v-model="form.password"
          show-password
          placeholder="输入数据库管理密码"
        ></el-input>
      </el-form-item>

      <el-row style="text-align: center">
        <el-button @click="handleClickTestConn('ruleForm')">
          测试连接数据库</el-button
        >
        <el-button
          @click="handleClickSave('ruleForm')"
          type="primary"
          :disabled="!testSuccess"
        >
          设置为默认数据库</el-button
        >
      </el-row>
    </el-form>
  </el-row>
</template>

<script>
const log = require("electron-log");

import { Pool } from "pg";
const shell = require("shelljs");
import { DbConfig } from "@/utils/config";
export default {
  mounted() {
    shell.config.execPath = shell.which("node").toString();
    let config = new DbConfig();
    this.form = config.readDbConfig();
  },
  methods: {
    handleClickTestConn(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            await this.testConn();
            this.$message({
              type: "success",
              message: "连接成功",
            });
            this.testSuccess = true;
          } catch (e) {
            this.$message.error({
              message: e.message,
            });
            this.testSuccess = false;
          }
        }
      });
    },
    listAllDataBase() {},
    async handleClickSave(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let result = await this.$electron.remote.dialog.showMessageBox(null, {
            type: "warning",
            title: "关闭",
            message: `保存数据并重新加载需要重新启动应用程序，确定吗？`,
            buttons: ["确定", "取消"],
            defaultId: 0,
          });
          if (result.response === 0) {
            try {
              let { user, password, database, port, host } = this.form;
              let config = new DbConfig();
              config.writeDbConfig({ user, host, database, password, port });
              this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", false);
              this.activeStep = 0;
              this.$electron.ipcRenderer.send("reloadApp");
            } catch (e) {
              log.error(e);
              this.$message.error({
                title: "错误",
                message: `数据保存错误：${e.message}`,
              });
            }
          }
        }
      });
    },
    async testConn() {
      return new Promise((resolve, reject) => {
        let pool = new Pool(this.form);
        pool.connect((err, client) => {
          if (err) {
            log.info(err);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    },
  },
  data() {
    return {
      testSuccess: false,
      btnLoading: false,
      percentage: 0,
      form: {},
      rules: {
        database: [
          { required: true, message: "请输入数据库名称", trigger: "blur" },
          {
            min: 3,
            max: 16,
            message: "长度在 3 到 16 个字符",
            trigger: "blur",
          },
        ],
        host: [{ required: true, message: "请输入ip地址", trigger: "blur" }],
        user: [
          {
            required: true,
            message: "请输入管理员名称，默认为postgres",
            trigger: "blur",
          },
        ],
        // password: [
        //   {
        //     required: true,
        //     message: "请输入管理员密码",
        //     trigger: "blur",
        //   },
        // ],
        port: [
          {
            required: true,
            message: "请输入端口号，默认为5432",
            trigger: "blur",
          },
        ],
      },
    };
  },
};
</script>