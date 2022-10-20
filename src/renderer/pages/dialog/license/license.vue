<template>
  <el-dialog v-dialogDrag :close-on-click-modal="false" class="standard-data-dialog" :append-to-body="true"
    :visible="showLicenseDialogVisible" width="30%" @close="handleClose" :modal="true">
    <div slot="title" class="dialog-title">
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div class="body">
      <div class="sys-machine-id">
        <div><b>本机序列号：</b></div>
        <div style="font-size:12px">
          {{sn}}
          <el-tooltip content="点击复制机器码">
            <span class="iconfont copy-area" @click="clickCopyMachineID">
              &#xea30;
            </span>
          </el-tooltip>
        </div>
      </div>
      <div v-if="licenseInfo" class="activation-info">
        <div><b>授权详情：</b></div>
        <div class="activation-info-content">
          <div>被授权方：{{licenseInfo.user}}</div>
          <div>授权有效期：三个月</div>
          <div>激活日期：{{licenseInfo.activateTime}}</div>
          <div>授权版本：{{licenseInfo.version}}</div>
        </div>

      </div>
      <div>
        <div class="file-area">
          <div><b>导入激活文件：</b></div>
          <div class="file-row">
            <el-input placeholder="激活文件路径" size="small" v-model="inputLicensePath" :disabled="true"></el-input>
            &nbsp;
            <el-button type="primary" size="small" @click="clickOpenPath">浏览</el-button>
          </div>

        </div>
        <div class="activate-area">
          <el-button style="width: 100%;" type="primary" size="medium" @click="clickActivate">激活</el-button>
          <el-button style="width: 100%;" size="medium" @click="clickTestMake">test make</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import license from "@/utils/license"
const { clipboard } = require("electron");

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showLicenseDialogVisible"]),
  },
  data() {
    return {
      title: "License",
      result: null,
      loading: false,
      licenseInfo: null,
      inputLicensePath: "",
      sn: "",
    };
  },
  async mounted() {
    this.sn = await license.getLocalMachineSn()
    let ret = await license.parseLicense()
    if (ret.success) {
      this.licenseInfo = ret.data
    }
  },
  methods: {
    clickCopyMachineID() {
      let value = this.localMachineId;
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    async handleClose() {
      let ret = await license.parseLicense()
      if (!ret.success) {
        this.$message.error(ret.data);
        return;
      }
      this.$store.commit("DialogPopWnd/SET_SHOWLICENSEDIALOGVISIBLE", false);
    },
    async clickTestMake() {
      let obj = {
        user: "panda",
        sn: this.sn,
        expireTime: new Date().getTime() + 1000 * 1000
      }
      let lic = await license.generateLicense(obj)
      console.log(lic)
      const fs = require("fs")
      fs.writeFileSync(this.inputLicensePath + ".test.txt", lic)
    },
    async clickActivate() {
      if (this.inputLicensePath == "") {
        this.$message({
          type: "warning",
          message: "请选择授权文件，然后点击激活按钮!"
        })
        return
      }
      let ret = await license.parseLicenseByPath(this.inputLicensePath)
      if (!ret.success) {
        this.$message({
          type: "warning",
          message: ret.data,
        })
        return;
      } else {
        this.$message({
          type: "success",
          message: "激活成功"
        })
        console.log(ret.data)
        this.licenseInfo = ret.data
      }

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
  margin-top: 10px;
}

.activation-info-content {
  font-size: 10px;
}



.activate-area {
  margin-top: 20px;
  text-align: center;
}


.copy-area {
  cursor: pointer;
}
</style>