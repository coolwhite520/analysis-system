<template>
  <div class="main">
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="1.数据库创建" icon="el-icon-edit"></el-step>
      <el-step title="2.基础数据导入" icon="el-icon-upload"></el-step>
      <el-step title="3.配置保存" icon="el-icon-success"></el-step>
    </el-steps>
    <div v-if="activeStep === 0">
      <el-row style="margin-top: 10px">
        <el-form
          style="margin-top: 20px"
          ref="ruleForm"
          :model="form"
          label-width="150px"
          label-position="right"
          size="small"
          :rules="rules"
        >
          <el-form-item label="数据库名称：" prop="database">
            <el-input
              v-model="form.database"
              placeholder="数据库名称(最好不要使用中文)"
            ></el-input>
          </el-form-item>
          <el-form-item label="ip地址：" prop="host">
            <el-input
              v-model="form.host"
              placeholder="默认为127.0.0.1"
            ></el-input>
          </el-form-item>

          <el-form-item label="端口号：" prop="port">
            <el-input v-model="form.port" placeholder="默认为5432"></el-input>
          </el-form-item>

          <el-form-item label="数据库管理员名称：" prop="user">
            <el-input
              v-model="form.user"
              placeholder="默认为postgres"
            ></el-input>
          </el-form-item>

          <el-form-item label="数据库管理密码：" prop="password">
            <el-input
              v-model="form.password"
              show-password
              placeholder="输入数据库管理密码"
            ></el-input>
          </el-form-item>

          <el-row style="text-align: center">
            <el-button
              @click="handleClickNewDatabase('ruleForm')"
              type="primary"
            >
              创建数据库</el-button
            >
          </el-row>
        </el-form>
      </el-row>
    </div>
    <div v-else-if="activeStep === 1">
      <el-row style="text-align: center; margin-top: 40px">
        <div>
          <el-progress
            type="circle"
            :percentage="percentage"
            color="green"
          ></el-progress>
        </div>
        <div style="margin-top: 40px">
          <el-button
            type="primary"
            @click="handleClickInitDb"
            :loading="btnLoading"
            >初始化基库</el-button
          >
        </div>
      </el-row>
    </div>
    <div v-else-if="activeStep === 2">
      <el-row style="margin-top: 10px">
        <el-form
          style="margin-top: 20px"
          ref="ruleForm"
          :model="form"
          label-width="150px"
          label-position="right"
          size="small"
          :rules="rules"
        >
          <el-form-item label="数据库名称：" prop="database">
            <el-input
              :disabled="true"
              v-model="form.database"
              placeholder="数据库名称任意（最好不要使用中文）"
            ></el-input>
          </el-form-item>
          <el-form-item label="ip地址：" prop="host">
            <el-input
              v-model="form.host"
              placeholder="ip地址默认127.0.0.1"
              :disabled="true"
            ></el-input>
          </el-form-item>

          <el-form-item label="端口" prop="port">
            <el-input
              v-model="form.port"
              placeholder="端口号默认5432"
              :disabled="true"
            ></el-input>
          </el-form-item>

          <el-form-item label="数据库管理员名称：" prop="user">
            <el-input
              v-model="form.user"
              placeholder="默认为postgres"
              :disabled="true"
            ></el-input>
          </el-form-item>

          <el-form-item label="数据库管理密码：" prop="password">
            <el-input
              v-model="form.password"
              show-password
              placeholder="输入数据库管理密码"
              :disabled="true"
            ></el-input>
          </el-form-item>

          <el-row style="text-align: center">
            <el-button @click="handleClickSave('ruleForm')" type="primary">
              设置为默认数据库</el-button
            >
          </el-row>
        </el-form>
      </el-row>
    </div>
  </div>
</template>

<script>
const log = require("electron-log");
import { Pool } from "pg";
import { DbConfig } from "@/utils/config";
import { mapState } from "vuex";
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const crypto = require("crypto"); //用来加密
const zlib = require("zlib"); //用来压缩
const shell = require("shelljs");
export default {
  mounted() {
    shell.config.execPath = shell.which("node").toString();
    let configPath = global.configPath;
    let config = new DbConfig(configPath);
    this.form = config.readDbConfig();
    this.form.database = "";
  },
  computed: {
    ...mapState("DialogPopWnd", ["dbConfigVisible"]),
  },
  data() {
    return {
      activeStep: 0,
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
  methods: {
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
              let configPath = global.configPath;
              let config = new DbConfig(configPath);
              config.writeDbConfig({
                user,
                host,
                database,
                password,
                port,
              });
              this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", false);
              this.activeStep = 0;
              this.$electron.ipcRenderer.send("reloadApp", {
                deleteLocalDb: true,
              });
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
    async handleClickInitDb() {
      this.btnLoading = true;
      let loopSpan = 100;
      let loop = setInterval((loopSpan) => {
        this.percentage++;
        if (this.percentage === 99) {
          clearInterval(loop);
        }
      }, loopSpan);
      let vendorPath = this.$electron.remote.getGlobal("vendorPath");
      let tempPath = this.$electron.remote.app.getPath("temp");
      let baseDbFilePath = path.join(vendorPath, "base", "base.dat");
      let tempPathFile = path.join(tempPath, uuid.v1());
      if (!fs.existsSync(baseDbFilePath)) {
        clearInterval(loop);
        this.btnLoading = false;
        this.$message({
          message: `基本库文件-${baseDbFilePath}不存在！`,
        });
        return;
      }
      try {
        // 揭秘并释放文件
        await this.doDecryptFile(baseDbFilePath, tempPathFile);
        console.log(tempPathFile);
        // 执行导入操作
        await this.execImportInitDb(tempPathFile);
        // 清理现场
        fs.unlinkSync(tempPathFile);
        clearInterval(loop);
        this.percentage = 100;
        this.btnLoading = false;
        this.$message({
          type: "success",
          message: "基库初始化成功",
        });
        this.btnLoading = false;
        this.activeStep++;
      } catch (e) {
        this.$message({
          message: "发生错误",
        });
        clearInterval(loop);
        this.btnLoading = false;
        log.info(e);
      }
    },
    async handleClickNewDatabase(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            console.log(this.form);
            await this.createDataBase();
            this.$message({
              type: "success",
              message: `数据库'${this.form.database}'创建成功。`,
            });
            this.activeStep++;
          } catch (e) {
            this.$message.error({
              message: e.message,
            });
            return;
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    async execImportInitDb(tempPathFile) {
      return new Promise((resolve, reject) => {
        let tempPath = this.$electron.remote.app.getPath("temp");
        let vendorPath = this.$electron.remote.getGlobal("vendorPath");
        let dumpFilePath = "";
        let fileName = "psql";
        let envParam;
        let { user, password, port, database } = this.form;
        if (process.platform === "win32") {
          fileName += ".exe";
          envParam = `set PGPASSWORD=${password}`;
          dumpFilePath = path.join(vendorPath, process.platform, fileName);
        } else if (process.platform === "darwin") {
          dumpFilePath = path.join(
            vendorPath,
            process.platform,
            "bin",
            fileName
          );
          envParam = `export PGPASSWORD='${password}'`;
        } else if (process.platform === "linux") {
          dumpFilePath = fileName;
          envParam = `set PGPASSWORD=${password}`;
        }
        // 判断文件是否存在
        if (process.platform !== "linux") {
          if (!fs.existsSync(dumpFilePath)) {
            reject(new Error(`${dumpFilePath} not exist`));
            return;
          }
        }
        let cmd =
          password.trim().length > 0
            ? `${envParam}&&"${dumpFilePath}" -d ${database} -U ${user} -p ${port} -f "${tempPathFile}"`
            : `"${dumpFilePath}" -d ${database} -U ${user} -p ${port} -f "${tempPathFile}"`;
        if (process.platform === "win32") {
          let batFilePath = path.join(tempPath, uuid.v1() + ".bat");
          cmd = cmd.replace("&&", "\r\n");
          fs.writeFileSync(batFilePath, cmd);
          cmd = batFilePath;
        }
        shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
          if (stderr) {
            reject(new Error(stderr));
          } else {
            if (process.platform === "win32") {
              fs.unlinkSync(cmd);
            }
            resolve(code);
          }
        });
      });
    },
    async doDecryptFile(srcFilePath, desFilePath) {
      return new Promise((resolve, reject) => {
        let writeableStream = fs.createWriteStream(desFilePath);
        let passwordEn = new Buffer(process.env.PASS || "password");
        let decryptStream = crypto.createDecipher("aes-256-cbc", passwordEn);
        let gzip = zlib.createGunzip(); //解压
        let readStream = fs.createReadStream(srcFilePath);
        readStream //读取
          .pipe(gzip) //解压
          .on("error", (err) => {
            reject(err);
          })
          .pipe(decryptStream) //解密
          .on("error", (err) => {
            reject(err);
          })
          .pipe(writeableStream)
          .on("finish", () => {
            //解压后的回调
            resolve({ success: true });
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    },
    async createDataBase() {
      let { user, password, port, host, database } = this.form;
      return new Promise((resolve, reject) => {
        let tempPath = this.$electron.remote.app.getPath("temp");
        let vendorPath = this.$electron.remote.getGlobal("vendorPath");
        let dumpFilePath = "";
        let fileName = "createdb";
        let envParam;
        if (process.platform === "win32") {
          fileName += ".exe";
          envParam = `set PGPASSWORD=${password}`;
          dumpFilePath = path.join(vendorPath, process.platform, fileName);
        } else if (process.platform === "darwin") {
          dumpFilePath = path.join(
            vendorPath,
            process.platform,
            "bin",
            fileName
          );
          envParam = `export PGPASSWORD=${password}`;
        } else if (process.platform === "linux") {
          dumpFilePath = fileName;
          envParam = `export PGPASSWORD=${password}`;
        }
        // 判断文件是否存在
        if (process.platform !== "linux") {
          if (!fs.existsSync(dumpFilePath)) {
            reject(new Error(`${dumpFilePath} not exist`));
            return;
          }
        }
        let cmd =
          password.trim().length > 0
            ? `${envParam}&&"${dumpFilePath}" -h ${host} -U ${user} -p ${port} ${database}`
            : `"${dumpFilePath}" -h ${host} -U ${user} -p ${port} ${database}`;
        // win下执行bat
        if (process.platform === "win32") {
          let batFilePath = path.join(tempPath, uuid.v1() + ".bat");
          cmd = cmd.replace("&&", "\r\n");
          fs.writeFileSync(batFilePath, cmd);
          cmd = batFilePath;
        }
        shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
          if (stderr) {
            reject(new Error(stderr));
          } else {
            if (process.platform === "win32") {
              fs.unlinkSync(cmd);
            }
            resolve(code);
          }
        });
      });
    },
    // 点击导入基础库
  },
};
</script>
<style scoped>
.main {
  background-color: white;
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
