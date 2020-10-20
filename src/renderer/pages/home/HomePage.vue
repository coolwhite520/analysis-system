<template>
  <div style="-webkit-user-select: none; margin-top: 0px" ref="wrapper">
    <el-row>
      <el-col :span="4">
        <el-row style="text-align: center; color: #3c4e6b; margin: 10px">
          <div style="margin-top: 40px; margin-bottom: 40px">
            <h2>分析记录时间轴</h2>
          </div>
          <time-line-view></time-line-view>
        </el-row>
      </el-col>
      <el-col :span="20">
        <div
          style="margin-top: 40px; margin-bottom: 40px"
          v-show="currentViewName === 'show-exist-case-view'"
        >
          <el-row>
            <el-col :span="6"> &nbsp; </el-col>
            <el-col :span="12" style="text-align: center">
              <el-button
                style="width: 30%"
                class="iconfont"
                type="primary"
                @click="handleClickNewCase"
                round
              >
                &#xe6a3; 新增案件
                <!-- <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-nv" />
            </svg>
            新增案件-->
              </el-button>
              <el-button
                style="width: 30%"
                class="iconfont"
                type="primary"
                @click="handleClickImportCase"
                round
                >&#xe61a; 导入案件</el-button
              >
              <el-button
                style="width: 30%"
                class="iconfont"
                type="danger"
                @click="handleClickDeleteAllCase"
                round
                >&#xe652; 清空所有案件</el-button
              >
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="4">
              <el-input
                placeholder="输入案件名称进行检索"
                prefix-icon="el-icon-search"
                v-model="inputAnjianName"
              ></el-input>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
        <el-row v-if="currentViewName !== 'show-exist-case-view'">
          <el-col :span="24">
            <div style="height: 40px">&nbsp;</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="20" style="text-align: ">
            <component :is="currentViewName"></component>
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
        </el-row>
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
  },
  components: {
    "new-case-view": NewCaseView,
    "show-exist-case-view": ShowExistCaseView,
    "case-detail-view": CaseDetailView,
    "edit-case-view": EditCaseView,
    "time-line-view": AnalysisTimeLine,
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
</style>
