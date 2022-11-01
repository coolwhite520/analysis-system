<template>
  <div class="license-container">
    <div class="title-bar">
      <div class="title-logo iconfont" style="font-size: 40px;margin-right: 10px;">&#xe66a;</div>
      <div class="title-detail">公安部第一研究所专版</div>
      <div class="title-close">
        <i class="iconfont" @click="clickCloseApp">&#xe634;</i>
      </div>
    </div>
    <div class="body" id="license-id">
      <div class="sys-machine-id">
        <div><b>本机序列号：</b></div>
        <div style="font-size:14px">
          {{sn}}
          <el-tooltip content="点击复制机器码">
            <span class="iconfont copy-area" @click="clickCopyMachineID">
              &#xea30;
            </span>
          </el-tooltip>
        </div>
      </div>
      <div class="activation-info">
        <template  v-if="licenseFormatInfo">
          <div><b>授权详情：</b></div>
          <div class="activation-info-content">
            <div><span class="info-title">授权版本：</span>{{licenseFormatInfo.version}}</div>
            <div><span class="info-title">被授权方：</span>{{licenseFormatInfo.user_name}}</div>
            <div><span class="info-title">授权发放日期：</span>{{licenseFormatInfo.created_at}}</div>
            <div><span class="info-title">激活日期：</span>{{licenseFormatInfo.activate_at}}</div>
            <div><span class="info-title">授权截止日期：</span>{{licenseFormatInfo.expired_at}}</div>
            <div><span class="info-title">授权有效期：</span>{{licenseFormatInfo.use_time_span}}</div>
          </div>
        </template>
        <template v-else>
          <div class="activation-not">未激活</div>
        </template>
      </div>
      <div>
        <div class="file-area">
          <div><b>导入激活文件：</b></div>
          <div class="file-row">
            <el-input placeholder="激活文件路径" v-model="inputLicensePath" :disabled="true"></el-input>
            &nbsp;
            <el-button type="primary"  @click="clickOpenPath">浏览</el-button>
          </div>

        </div>
        <div class="activate-area">
          <el-button style="width: 49%"   :type="btnType" @click="clickTryUse" :loading="loadingBtn" :disabled="isBtnDisabled">{{ btnContent }}</el-button>
          <el-button  style="width: 49%"  type="primary"  @click="clickActivate" :loading="loading">激活</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import license from "@/utils/license"
const { clipboard } = require("electron");
const moment= require("moment");
const elementResizeDetectorMaker = require("element-resize-detector");
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showLicenseDialogVisible"]),
    isBtnDisabled() {
      return !!(this.licenseInfo && license.isExpiredLicense(this.licenseInfo));
    },
    btnType() {
      if (this.licenseInfo === null) {
        return "default"
      } else {
        if (!license.isExpiredLicense(this.licenseInfo)) {
          if (license.isTryUseVersion(this.licenseInfo)) {
            return "warning"
          } else  {
            return "success"
          }
        } else {
          return "info"
        }

      }
    },
    btnContent() {
      if (this.licenseInfo === null) {
        return "开始试用"
      } else {
        if (!license.isExpiredLicense(this.licenseInfo)) {
          if (license.isTryUseVersion(this.licenseInfo)) {
            return "继续试用"
          } else  {
            return "开始使用"
          }
        } else {
          return "授权到期"
        }

      }
    },
    licenseFormatInfo() {
      if (!this.licenseInfo) return null;
      const { use_time_span, user_name, created_at, mark, sn, activate_at } = this.licenseInfo;
      let data = {}
      data.user_name = user_name
      data.mark = mark
      data.sn = sn
      let month = moment.duration(parseInt(use_time_span), "seconds").asMonths().toFixed()
      if (!license.isTryUseVersion(this.licenseInfo)) {
        data.version = '正式版'
      } else {
        data.version = '测试版'
      }
      data.use_time_span = month > 240 ? `永久` : `${month} 个月`
      data.created_at = moment(created_at * 1000).format("YYYY-MM-DD HH:mm:ss")
      data.activate_at = moment(activate_at * 1000).format("YYYY-MM-DD HH:mm:ss")
      data.expired_at = moment((created_at + use_time_span) * 1000).format("YYYY-MM-DD HH:mm:ss")
      return data;
    },
  },
  data() {
    return {
      moment,
      title: "License",
      result: null,
      loadingBtn: false,
      loading: false,
      licenseInfo: null,
      inputLicensePath: "",
      sn: "",
    };
  },
  async mounted() {
    this.sn = await license.getLocalMachineSn()
    let ret = await license.getRegLicense()
    console.log(ret)
    if (ret.success) {
      this.licenseInfo = ret.data;
    } else {
      this.$message({
        type: "warning",
        message: ret.data,
      })
    }
  },
  methods: {
    clickCopyMachineID() {
      let value = this.sn;
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },

    async clickTryUse() {
      // 写入试用授权
      // 1. 判断是否存授权
      try {
        this.loadingBtn = true;
        if (this.licenseInfo === null) {
          let obj = {
            use_time_span: moment.duration(3, "months").asSeconds(),
            user_name: "试用用户",
            created_at: new Date().getTime() / 1000,
            mark: "试用",
            sn: this.sn,
          }
          let ret = await license.writeLicenseToReg(obj)
          if (!ret.success) {
            this.$message({
              type: "warning",
              message: ret.data,
            })
          } else {
            this.licenseInfo = ret.data
            // 试用版本进入
            setTimeout(()=> {
              this.$electron.ipcRenderer.send("show-main-window")
            }, 1000 * 2)
          }
        } else {
          if (license.isExpiredLicense(this.licenseInfo)) {
            this.$message({
              type: "warning",
              message: "授权已经过期",
            })
            this.loadingBtn = false;
            return;
          }
          this.$electron.ipcRenderer.send("show-main-window")
        }
        this.loadingBtn = false;
      }catch (e) {
        this.$message({
          type: "warning",
          message: e,
        })
        this.loadingBtn = false;
      }
    },
    async clickActivate() {
      if (this.inputLicensePath === "") {
        this.$message({
          type: "warning",
          message: "请选择授权文件，然后点击激活按钮!"
        })
        return
      }
      this.loading = true;
      try {
        let ret = await license.parseLicenseByPath(this.inputLicensePath)
        if (!ret.success) {
          this.$message({
            type: "warning",
            message: ret.data,
          })
          this.loading = false;
        } else {
          ret = await license.writeLicenseToReg(ret.data)
          if (!ret.success) {
            this.$message({
              type: "warning",
              message: ret.data,
            })
            this.loading = false;
          } else {
            this.licenseInfo = ret.data;
            this.$message({
              type: "success",
              message: "激活成功"
            })
            this.loading = false;
          }
        }
      } catch (e) {
        this.$message({
          type: "warning",
          message: e.message
        })
        this.loading = false;
      }



    },
    clickMainPage() {
      this.$electron.ipcRenderer.send("show-main-window")
    },
    clickCloseApp() {
      this.$electron.remote.app.exit(0);
    },
    async clickOpenPath() {
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "授权文件导入",
          buttonLabel: "打开",
          filters: [
            {
              name: "Support Files",
              extensions: ["txt"],
            },
          ],
        }
      );
      if (typeof filePathList !== "undefined") {
        this.inputLicensePath = filePathList[0]
      }
    }
  },
};
</script>

<style scoped>

.license-container {
  background-color: white;
  height: 500px;
  overflow: hidden;
}
.title-bar {
  height: 80px;
  background-color: #243144;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  color: white;
}
.title-logo {
  margin-left: 20px;
}

.title-detail {
  flex: 1;
}

.title-close {
  padding-right: 20px;
  margin-right: 0;
  -webkit-app-region: no-drag;
}

.title-close:hover {
  color: red;
  cursor: pointer;
}

.body {
  padding: 20px;
}

.logo {
  font-size: 100px;
  text-align: center;
  color: #313f57;
}

.file-area {
  margin-top: 10px;
}

.file-row {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

.activation-info {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.activation-not {
  font-size: 30px;
  text-align: center;
  color: red;
}
.activation-info-content {
  font-size: 14px;
}

.info-title {
  width: 120px;
  display: inline-block;
}

.activate-area {
  margin-top: 20px;
  text-align: center;
  display: flex;
}


.copy-area {
  cursor: pointer;
}
</style>
