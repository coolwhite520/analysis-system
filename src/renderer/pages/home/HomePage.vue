<template>
  <div style="-webkit-user-select: none; margin-top: 0px" ref="wrapper">
    <el-row>
      <el-col :span="3">
        <div
          style="
            margin-top: 10px;
            padding: 10px;
            text-align: center;
            color: #3c4e6b;
            box-shadow: 15px 0px 10px -15px #404e69;
          "
        >
          <div class="iconfont" style="font-size: 20px; color: white">
            &#xe60b;&nbsp;&nbsp;<b>时间轴</b>
          </div>
          <div style="font-size: 10px; margin-top: 20px">
            时间轴会在每次用户按下ctrl+s(保存的快捷键)时，记录下当前的操作数据以便后续进行下一步的分析。
          </div>
          <time-line-view></time-line-view>
        </div>
      </el-col>
      <el-col :span="21">
        <div style="margin-top: 20px">
          <div
            class="iconfont"
            style="font-size: 20px; text-align: center; color: white"
          >
            &#xe6ad;&nbsp;&nbsp;<b>案件面板</b>
          </div>
          <el-row style="margin-top: 20px">
            <el-col :span="6"> &nbsp; </el-col>
            <el-col :span="12" style="text-align: center">
              <el-button-group>
                <el-button
                  class="iconfont"
                  type="primary"
                  size="mini"
                  @click="handleClickNewCase"
                >
                  &#xe6a3; 新增案件
                </el-button>
                <el-button
                  class="iconfont"
                  type="primary"
                  size="mini"
                  @click="handleClickImportCase"
                  >&#xe61a; 导入案件</el-button
                >
                <el-button
                  class="iconfont"
                  type="danger"
                  size="mini"
                  @click="handleClickDeleteAllCase"
                  >&#xe652; 清空所有案件</el-button
                >
              </el-button-group>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="4">
              <el-input
                size="mini"
                placeholder="输入案件名称进行检索"
                prefix-icon="el-icon-search"
                v-model="inputAnjianName"
              ></el-input>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
        <div>
          <el-row>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="22">
              <div style="height: 40px">&nbsp;</div>
              <component :is="currentViewName"></component>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AnalysisTimeLine from "./child/AnalysisTimeLine";
import ShowExistCaseView from "./child/ShowExistCaseView";
import NewCaseView from "./child/NewCaseView";
import CaseDetailView from "./child/CaseDetailView";
import EditCaseView from "./child/EditCaseView";
import levelDb from "../../../level/leveldb";
const log = require("@/utils/log");
export default {
  data() {
    return {
      inputAnjianName: "",
    };
  },
  watch: {
    inputAnjianName(newValue, oldValue) {
      this.$store.commit("Cases/SET_INPUT_VALUE", newValue);
    },
  },
  computed: {
    ...mapState("HomePageSwitch", ["currentViewName"]),
    ...mapState("AppPageSwitch", ["mainViewHeight"]),
  },
  components: {
    "new-case-view": NewCaseView,
    "show-exist-case-view": ShowExistCaseView,
    "case-detail-view": CaseDetailView,
    "edit-case-view": EditCaseView,
    "time-line-view": AnalysisTimeLine,
  },
  async mounted() {
    // let prefix = this.$electron.remote.getGlobal("levelPrefix");
    // let { success, list, msg } = await levelDb.find(prefix);
  },
  methods: {
    async handleClickDeleteAllCase() {
      let parent = this.$electron.remote.getGlobal("mainWindow");
      let result = await this.$electron.remote.dialog.showMessageBox(parent, {
        type: "warning",
        title: "关闭",
        message: `真的这么确定要删除所有案件？你将丢失所有数据，请慎重！`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        this.loading = true;
        await this.$store.dispatch("Cases/deleteAllCase");
        await this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
        await this.$store.dispatch("Cases/getExistCaseAsync");
      } else {
        this.$message({
          type: "info",
          message: "已取消删除",
        });
      }
    },

    handleClickNewCase() {
      //this.currentViewName = "new-case-view";
      if (!global.pool) {
        this.$electron.ipcRenderer.send("show-db-config");
      } else {
        this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "new-case-view");
      }
    },
    handleClickImportCase() {
      if (!global.pool) {
        this.$electron.ipcRenderer.send("show-db-config");
        return;
      }
      this.$electron.remote.dialog
        .showOpenDialog({
          title: "请选择数据文件",
          buttonLabel: "确定",
          filters: [
            {
              name: "Custom File Type",
              extensions: ["cvs", "txt", "xls", "xlsx"],
            },
          ],
        })
        .then((result) => {
          log.info(result.filePaths);
        })
        .catch((err) => {
          log.error(err);
        });
    },
  },
};
</script>

<style scoped>
.sysBtnStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
.timeLineContainer {
  text-align: center;
  color: #3c4e6b;
  border-right: 1px solid #dddfe5;
}
</style>
