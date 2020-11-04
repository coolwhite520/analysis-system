<template>
  <div
    :style="{ height: mainViewHeight - 120 + 'px', overflow: 'auto' }"
    class="timeLine"
  >
    <div style="margin: 10px" v-if="renderList.length > 0">
      <el-button
        class="iconfont"
        style="font-size: 12px"
        type="danger"
        size="mini"
        @click="handleClickDeleteAllTimeLineData"
        >&#xe652; 清空所有时间轴数据</el-button
      >
    </div>

    <el-collapse
      v-model="activeNames"
      @change="handleChange"
      class="myCollapse"
    >
      <div v-if="renderList.length == 0">
        <div style="font-size: 10px; color: gray">当前无分析记录</div>
      </div>
      <el-collapse-item
        :name="item.time"
        v-for="item of renderList"
        :key="item.key"
      >
        <template slot="title">
          <el-tooltip
            class="item"
            effect="dark"
            :content="'名称:' + item.title + '  保存时间：' + item.datetime"
            placement="right"
          >
            <div
              style="
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              "
            >
              <span class="iconfont" style="font-size: 10px"
                >&nbsp;&nbsp;&#xe63d;&nbsp;&nbsp;{{ item.title }}</span
              >
              <span style="font-size: 10px"
                >&nbsp;&nbsp;{{ item.datetime }}</span
              >
            </div>
          </el-tooltip>
        </template>
        <div>
          <el-popover trigger="click" placement="right">
            <img
              :height="popOverPicHeigth"
              :width="popOverPicWidth"
              :src="item.src"
            />
            <img
              class="screenShotImage"
              slot="reference"
              :src="item.src"
              :height="PicHeigth"
              :width="PicWidth"
              style="border-radius: 5px; border: 1px solid gray"
            />
          </el-popover>
        </div>
        <div class="item-tip"><b>名称：</b>{{ item.title }}</div>
        <div class="item-tip">
          <b>简要说明：</b>{{ item.des.length > 0 ? item.des : "无" }}
        </div>
        <div class="item-tip"><b>保存时间：</b>{{ item.datetime }}</div>
        <el-row style="text-align: center; margin-top: 10px">
          <el-button
            size="mini"
            type="primary"
            @click="handleClickRestore(item)"
          >
            加载记录</el-button
          >
          <el-button size="mini" @click="handleClickDelete(item)">
            删除记录</el-button
          >
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapState } from "vuex";
import levelDb from "../../../../level/leveldb";
const fs = require("fs");
const path = require("path");
export default {
  computed: {
    ...mapState("AppPageSwitch", ["mainViewHeight"]),
  },
  data() {
    return {
      widthDivHeight: 0,
      activeNames: [],
      renderList: [],
      popOverPicHeigth: 500,
      popOverPicWidth: 0,
      PicHeigth: 100,
      PicWidth: 0,
    };
  },

  async mounted() {
    this.$bus.$on("FreshTimeLineView", this.freshList);
    let loop = setInterval(() => {
      let dbCon = this.$electron.remote.getGlobal("dbCon");
      if (dbCon) {
        clearInterval(loop);
        let widthDivHeight = this.$electron.remote.getGlobal("widthDivHeight");
        this.popOverPicWidth = parseInt(widthDivHeight * this.popOverPicHeigth);
        this.PicWidth = parseInt(widthDivHeight * this.PicHeigth);
        this.freshList();
      }
    }, 100);
  },
  methods: {
    delDir(path) {
      let files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            delDir(curPath); //递归删除文件夹
          } else {
            fs.unlinkSync(curPath); //删除文件
          }
        });
        fs.rmdirSync(path); // 删除文件夹自身
      }
    },

    async handleClickDelete(item) {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `您确定要删除当前记录吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        for (let index = 0; index < this.renderList.length; index++) {
          if (this.renderList[index].key === item.key) {
            this.renderList.splice(index, 1);
            break;
          }
        }
        this.delDir(item.dbPath);
        await levelDb.del(item.key);
      } else {
        return;
      }
    },
    async copyFile(filePathSrc, filePathDes) {
      return new Promise((resolve, reject) => {
        let file = fs.createReadStream(filePathSrc);
        let out = fs.createWriteStream(filePathDes);
        file
          .pipe(out)
          .on("finish", () => {
            resolve("done");
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    },
    async handleClickDeleteAllTimeLineData() {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `您确定要删除所有时间轴记录吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        for (let index = this.renderList.length - 1; index >= 0; index--) {
          let item = this.renderList[index];
          this.delDir(item.dbPath);
          await levelDb.del(item.key);
          this.renderList.splice(index, 1);
        }
      } else {
        return;
      }
    },
    async handleClickRestore(item) {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `重新加载数据会清空您的当前操作，并重新启动应用程序，要这样做吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        let rootDbPath = this.$electron.remote.getGlobal("resoreDbPath");
        let rootDbPathFile = path.join(rootDbPath, "restore.db");
        fs.unlinkSync(rootDbPathFile);
        await this.copyFile(item.dbPathFile, rootDbPathFile);
        this.$electron.ipcRenderer.send("reloadApp");
      }
    },
    async convertToBase64Image(fileUrl) {
      const imageData = fs.readFileSync(fileUrl); // 例：xxx/xx/xx.png
      const imageBase64 = imageData.toString("base64");
      const imagePrefix = "data:image/png;base64,";
      return imagePrefix + imageBase64;
    },
    async freshList() {
      let prefix = this.$electron.remote.getGlobal("levelPrefix");
      let dbCon = this.$electron.remote.getGlobal("dbCon");
      prefix = prefix + dbCon.database + ".";
      console.log(prefix);
      let { success, list, msg } = await levelDb.find({ prefix });
      if (success) {
        let ret = [];
        for (let item of list) {
          let obj = {
            key: item.key,
            title: item.value.title,
            datetime: item.value.time,
            timestamp: item.value.timestamp,
            des: item.value.des,
            dbPath: item.value.dbPath,
            dbPathFile: item.value.dbPathFile,
          };
          if (
            fs.existsSync(item.value.screenShotPath) &&
            fs.existsSync(item.value.dbPathFile)
          ) {
            obj.src = await this.convertToBase64Image(
              item.value.screenShotPath
            );
            ret.push(obj);
          } else {
            this.delDir(obj.dbPath);
            await levelDb.del(obj.key);
          }
        }
        ret = this.$lodash.sortBy(ret, function (item) {
          return -item.timestamp;
        });
        this.renderList = ret;
      } else {
        console.log(msg);
      }
    },
    handleChange(val) {
      console.log(val);
    },
  },
};
</script>
<style >
.el-popover {
  box-shadow: #384e6e 10px 10px 20px 5px;
}
.myCollapse .el-collapse-item__header {
  background-color: #1e2534;
  color: white;
}
</style>
<style scoped>
.timeLine {
}
.item-tip {
  font-size: 10px;
  color: #384e6e;
}
.screenShotImage:hover {
  cursor: pointer;
}
</style>