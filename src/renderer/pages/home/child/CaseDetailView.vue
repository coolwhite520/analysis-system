<template>
  <div
    class="detailInfo"
    v-loading.fullscreen.lock="loading"
    :element-loading-text="loadingText"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="baseInfo">
      <div class="title">
        <h2 style="float: left">基本信息</h2>
        <el-button-group style="float: right">
          <el-button
            round
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="handleClickEdit"
            >编辑</el-button
          >
          <el-button
            round
            type="primary"
            icon="el-icon-share"
            size="mini"
            @click="handleClickExportScheme"
            >导出</el-button
          >
          <el-button
            round
            type="primary"
            icon="el-icon-delete"
            size="mini"
            @click="handleClickDelCase"
            >删除</el-button
          >
        </el-button-group>
      </div>
      <div style="clear: both"></div>
      <div
        style="
          border-top: 1px solid #404e69;
          margin-top: 10px;
          margin-bottom: 10px;
        "
      >
        &nbsp;
      </div>
      <el-row>
        <el-col :span="12">
          <p>
            案件名称：
            <span class="caseContent">{{ caseBase.ajmc }}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            案件编号：
            <span class="caseContent">{{ caseBase.ajbh }}</span>
          </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <p>
            案件类型：
            <span class="caseContent">{{ caseBase.ajlbmc }}</span>
          </p>
        </el-col>
        <el-col :span="12">&nbsp;</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>
            发生时间：
            <span class="caseContent">{{ caseBase.jjsj }}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            所属地区：
            <span class="caseContent">{{ caseBase.asjfsddxzqmc }}</span>
          </p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>
            立案时间：
            <span class="caseContent">{{ caseBase.cjsj }}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            案件状态：
            <span class="caseContent">{{ caseBase.zcjdmc }}</span>
          </p>
        </el-col>
      </el-row>

      <p>
        简要案情：
        <span class="caseContent">{{ caseBase.jyaq }}</span>
      </p>
      <p>
        综述案情：
        <span class="caseContent">{{ caseBase.zhaq }}</span>
      </p>
    </div>
    <!-- <el-divider></el-divider> -->
    <div class="dataInfo">
      <div class="title">
        <h2 style="float: left">案件数据</h2>
        <el-button-group style="float: right">
          <el-button
            v-for="item in renderButtonGroupList"
            :key="item.tid"
            round
            type="primary"
            size="mini"
            @click="handleClickBtnGroup(item)"
            >{{ item.title }}</el-button
          >
        </el-button-group>
      </div>
      <div style="clear: both"></div>
      <!-- <el-divider></el-divider> -->
      <div
        style="
          border-top: 1px solid #404e69;
          margin-top: 10px;
          margin-bottom: 10px;
        "
      >
        &nbsp;
      </div>
      <div>
        <span>案件数据：</span>
        <span class="caseContent">共采集&nbsp;{{ batchCount }}&nbsp;批次</span>
        <span>
          <el-button
            type="text"
            size="mini"
            @click="handleClickCollectionRecord"
            >采集记录</el-button
          >
        </span>
      </div>
      <p>
        <span>数据总量：</span>
        <span class="caseContent">共&nbsp;{{ dataSum }}&nbsp;条</span>
        <span>
          <el-button type="text" size="mini" @click="handleClickDataCollection"
            >数据采集</el-button
          >
        </span>
      </p>
      <p>
        待调单任务：
        <span class="caseContent">{{ awaitTaskCount }} 个</span>
        <span>
          <el-button type="text" size="mini">查看待调单任务</el-button>
        </span>
      </p>
      <p>
        实体数量：
        <span class="caseContent">{{ entityCount }} 个</span>
      </p>
      <!-- <el-divider></el-divider> -->
      <el-row>
        <el-col :span="8">&nbsp;</el-col>
        <el-col :span="8">
          <div>
            <div style="text-align: center">
              <el-button
                class="button"
                type="primary"
                @click="handleClickBeginAnalysis"
                round
                >开始分析</el-button
              >
              <el-button
                round
                class="button"
                type="primary"
                @click="handleClickBeginAnalysisReport"
                >分析报告</el-button
              >
            </div>
          </div>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-button type="text" @click="handleClickGoHome">返回首页</el-button>
        </el-col>
      </el-row>
    </div>
    <collection-record v-if="showCollectionRecordVisible"></collection-record>
  </div>
</template>

<script>
const shell = require("shelljs");
import CollectionRecordDialog from "@/pages/dialog/record/CollectionRecordDialog";
import { mapState, mapGetters } from "vuex";
import cases from "@/db/Cases";
import base from "@/db/Base";
import log from "electron-log";
const fs = require("fs");
const path = require("path");
export default {
  async beforeMount() {
    shell.config.execPath = shell.which("node").toString();
    await this.$store.dispatch(
      "CaseDetail/queryEntityCount",
      this.caseBase.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryBatchCount",
      this.caseBase.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryAwaitTaskCount",
      this.caseBase.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryCaseDataCenter",
      this.caseBase.ajid
    );
  },
  data() {
    return {
      loadingText: "",
      loading: false,
    };
  },
  components: {
    "collection-record": CollectionRecordDialog,
  },
  computed: {
    ...mapState("CaseDetail", [
      "caseBase",
      "deleteState",
      "entityCount",
      "batchCount",
      "dataSum",
      "awaitTaskCount",
      "dataCenterList",
    ]),
    ...mapGetters("CaseDetail", ["renderButtonGroupList"]),
    ...mapState("DialogPopWnd", ["showCollectionRecordVisible"]),
  },
  watch: {
    deleteState(newValue, oldValue) {
      if (newValue === "success") {
        this.loading = false;
        this.$store.commit(
          "HomePageSwitch/SET_VIEW_NAME",
          "show-exist-case-view"
        );
        this.$store.commit("CaseDetail/SET_DELETE_STATE", "failed");
        this.$message({
          title: "成功",
          message: `删除案件成功!`,
          type: "success",
        });
      } else if (newValue === "failed") {
        this.loading = false;
        this.$message.error({
          title: "错误",
          message: `删除案件失败!`,
        });
      }
    },
  },
  methods: {
    // 采集记录
    async handleClickCollectionRecord() {
      try {
        let {
          success,
          rows,
          headers,
          rowCount,
        } = await cases.QueryCollectionRecords(this.caseBase.ajid, 0, 30);
        if (success) {
          this.$store.commit("CaseDetail/SET_COLLECTIONRECORDS", {
            rows,
            headers,
            rowCount,
          });
          this.$store.commit(
            "DialogPopWnd/SET_SHOWCOLLECTIONRECORDVISIBLE",
            true
          );
        }
      } catch (e) {
        this.$message.error({
          message: "出错了：" + e.message,
        });
      }
    },
    // 数据采集
    async handleClickDataCollection() {
      this.loading = true;
      this.loadingText = "页面跳转中...";
      await this.$electron.ipcRenderer.send("data-collection-open");
      this.$electron.ipcRenderer.on(
        "data-collection-open-complete",
        async () => {
          await this.$store.dispatch(
            "CaseDetail/queryBatchCount",
            this.caseBase.ajid
          );
          await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDVIEW",
            "begin-import"
          );
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDDATAVISIBLE",
            true
          );
          this.$electron.ipcRenderer.removeAllListeners(
            "data-collection-open-complete"
          );
          this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
          await this.$store.dispatch("ShowTable/showNoDataPage", {
            title: "数据采集",
          });
          this.loading = false;
        }
      );
      // await this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", true);
    },
    // 分析报告
    async handleClickBeginAnalysisReport() {
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseBase.ajid
      );
      await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");

      if (this.dataSum === 0) {
        await this.$store.dispatch("ShowTable/showNoDataPage", {
          title: "数据采集",
        });
      } else {
        // 查找第一个数据中心中的数据不为零的tid
        let tid = "";
        for (let item of this.dataCenterList) {
          for (let child of item.childrenArr) {
            if (child.count > 0) {
              tid = child.tid;
              break;
            }
          }
        }
        await this.$store.dispatch("ShowTable/showBaseTable", {
          tid,
          offset: 0,
          count: 30,
        });
        await this.$store.commit(
          "MainPageSwitch/SET_TABBARACTIVENAME",
          "third"
        );
        await this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", true);
      }
    },
    // 开始分析
    async handleClickBeginAnalysis() {
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseBase.ajid
      );
      if (this.dataSum === 0) {
        await this.$store.dispatch("ShowTable/showNoDataPage", {
          title: "数据采集",
        });
      } else {
        // 查找第一个数据中心中的数据不为零的tid
        let tid = "";
        let maxCount = 0;
        for (let item of this.dataCenterList) {
          for (let child of item.childrenArr) {
            if (child.count > maxCount) {
              tid = child.tid;
              maxCount = child.count;
            }
          }
        }
        await this.$store.dispatch("ShowTable/showBaseTable", {
          tid,
          offset: 0,
          count: 30,
        });
      }
    },
    handleClickEdit() {
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "edit-case-view");
    },
    async handleClickBtnGroup(item) {
      // 获取右侧的模型数据
      let tid = item.tid;
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseBase.ajid
      );
      await this.$store.dispatch("ShowTable/showBaseTable", {
        tid: String(tid),
        offset: 0,
        count: 30,
      });
    },
    async handleClickDelCase() {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `是否要删除当前案件[${this.caseBase.ajmc}]？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        this.loading = true;
        await this.$store.dispatch(
          "CaseDetail/deleteCase",
          parseInt(this.caseBase.ajid)
        );
        await this.$store.commit("CaseDetail/RESET_ALL_DATA");
        await this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
        await this.$store.dispatch("Cases/getExistCaseAsync");
      } else {
        this.$message({
          type: "info",
          message: "已取消删除",
        });
      }
    },

    async handleClickExportScheme() {
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath:
          `案件${this.caseBase.ajmc}-` + new Date().Format("yyyyMMddhhmmss"),
        filters: [{ name: "数据", extensions: ["dat"] }],
      });
      if (!result.canceled) {
        this.loading = true;
        this.loadingText = "数据导出中...";
        let dumpFilePath = "";
        let vendorPath = this.$electron.remote.getGlobal("vendorPath");
        let {
          user,
          database,
          password,
          port,
        } = this.$electron.remote.getGlobal("dbCon");
        const uuid = require("uuid");
        let tempPath = this.$electron.remote.app.getPath("temp");
        let tempPathFile = path.join(tempPath, uuid.v1());
        let fileName = "pg_dump";
        let envParam = "";
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
        }
        // 判断文件是否存在
        if (process.platform !== "linux") {
          if (!fs.existsSync(dumpFilePath)) {
            this.$message({
              message: "执行文件不存在",
            });
            return;
          }
        }
        let cmd =
          password.trim().length > 0
            ? `${envParam}&&"${dumpFilePath}" -n icap_${this.caseBase.ajid} -T icap_${this.caseBase.ajid}.*_temp -O -f "${tempPathFile}" -U ${user} -p ${port} ${database}`
            : `"${dumpFilePath}" -n icap_${this.caseBase.ajid} -T icap_${this.caseBase.ajid}.*_temp -O -f "${tempPathFile}" -U ${user} -p ${port} ${database}`;

        if (process.platform === "win32") {
          let batFilePath = path.join(tempPath, uuid.v1() + ".bat");
          cmd = cmd.replace("&&", "\r\n");
          fs.writeFileSync(batFilePath, cmd);
          cmd = batFilePath;
        }
        try {
          shell.exec(
            cmd,
            { silent: true, async: true },
            async (code, stdout, stderr) => {
              if (stderr) {
                this.$message.error({
                  message: stderr,
                });
                this.loading = false;
                return;
              } else {
                if (process.platform === "win32") {
                  fs.unlinkSync(cmd);
                }
                const crypto = require("crypto"); //用来加密
                const zlib = require("zlib"); //用来压缩
                const passwordEn = new Buffer(process.env.PASS || "password");
                const encryptStream = crypto.createCipher(
                  "aes-256-cbc",
                  passwordEn
                );
                // 1.st_case 2.st_data_source
                let { sqlStr, err } = await this.makeExternal_St_caseSql(
                  this.caseBase.ajid
                );
                if (sqlStr === "") {
                  this.$message({
                    type: "error",
                    message: "数据导出失败" + err.message,
                  });
                  this.loading = false;
                  return;
                }
                // await this.makeExternal_St_data_source_Sql 这个地方比较麻烦，先不弄了，不是主要的业务
                fs.appendFileSync(tempPathFile, sqlStr);
                const gzip = zlib.createGzip();
                const readStream = fs.createReadStream(tempPathFile);
                const writeStream = fs.createWriteStream(result.filePath);
                readStream //读取
                  .pipe(encryptStream) //加密
                  .on("error", (err) => {
                    console.log(err);
                    this.$message({
                      message: "载入失败:" + err.message,
                      type: "error",
                    });
                    this.loading = false;
                  })
                  .pipe(gzip) //压缩
                  .on("error", (err) => {
                    console.log(err);
                    this.$message({
                      message: "载入失败:" + err.message,
                      type: "error",
                    });
                    this.loading = false;
                  })
                  .pipe(writeStream) //写入
                  .on("finish", () => {
                    //写入结束的回调
                    console.log("done");
                    this.$message({
                      type: "success",
                      message: "数据导出成功",
                    });
                    fs.unlinkSync(tempPathFile);
                    this.loading = false;
                  })
                  .on("error", (err) => {
                    this.$message({
                      type: "error",
                      message: "数据导出失败" + err.message,
                    });
                    this.loading = false;
                  });
              }
            }
          );
        } catch (e) {
          this.$message.error({
            message: stderr,
          });
          this.loading = false;
        }
      }
    },
    async makeExternal_St_caseSql(ajid) {
      let client = await global.pool.connect();
      try {
        await cases.SwitchDefaultCase(client);
        let sql = `select * from icap_base.st_case where ajid = ${ajid}`;
        let { rows } = await client.query(sql);
        let returnSql = "";
        for (let row of rows) {
          let keys = [];
          let values = [];
          for (let k in row) {
            if (k === "shard_id") continue;
            let value = row[`${k}`];
            if (value) {
              keys.push(k);
              if (k === "ajid") {
                values.push(value);
              } else {
                values.push(`'${value}'`);
              }
            }
          }
          console.log(keys, values);
          // st_case
          let insertSql = `\r\n\r\n-- Append data to st_case by panda`;
          insertSql += `\r\n\r\ninsert into icap_base.st_case (${keys}) values(${values})`;
          returnSql += insertSql;
        }
        console.log(returnSql);
        return { sqlStr: returnSql };
      } catch (e) {
        return { sqlStr: "", err: e };
      } finally {
        client.release();
      }
    },
    async makeExternal_St_data_source_Sql(ajid) {
      let client = await global.pool.connect();
      try {
        await cases.SwitchDefaultCase(client);
        let sql = `select * from icap_base.st_data_source where ajid = ${ajid}`;
        let { rows } = await client.query(sql);
        let returnSql = "";
        for (let row of rows) {
          let keys = [];
          let values = [];
          for (let k in row) {
            if (k === "shard_id") continue;
            let value = row[`${k}`];
            if (value) {
              keys.push(k);
              if (k === "ajid") {
                values.push(`$AJID_REPLACE$`);
              } else {
                values.push(`'${value}'`);
              }
            }
          }
          console.log(keys, values);
          let insertSql = `\r\n\r\n-- Append data to st_data_source by panda`;
          insertSql += `\r\n\r\ninsert into icap_base.st_data_source (${keys}) values(${values})`;
          returnSql += insertSql;
        }
        return { sqlStr: returnSql };
      } catch (e) {
        return { sqlStr: "", err: e };
      } finally {
        client.release();
      }
    },
    handleClickGoHome() {
      this.$store.commit(
        "HomePageSwitch/SET_VIEW_NAME",
        "show-exist-case-view"
      );
    },
  },
};
</script>

<style scoped>
.detailInfo {
  font-size: 15px;
  /* border: 2px solid #dddfe5; */
  border-radius: 15px;
  padding: 20px;
  color: white;
  /* box-shadow: 5px 5px 10px 5px gray, -5px 5px 5px 5px rgba(255, 255, 255, 0.5);
   */
  border: 1px solid #404e69;
}
.baseInfo {
  color: white;
  margin-bottom: 60px;
}

.caseContent {
  color: white;
  font-size: 13px;
}
</style>