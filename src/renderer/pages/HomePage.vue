<template>
  <div style="-webkit-user-select: none;margin-top:140px;">
    <div
      style="margin-top: 40px; margin-bottom: 40px;"
      v-show="currentViewName === 'show-exist-case-view'"
    >
      <el-row>
        <el-col :span="6">&nbsp;</el-col>
        <el-col :span="12" style="text-align: center;">
          <el-button
            style="width:30%; background-color: #1b2735;color: white;"
            class="iconfont sysBtnStyle"
            @click="handleClickNewCase"
            round
          >&#xe6a3; 新增案件</el-button>
          <el-button
            class="iconfont sysBtnStyle"
            style="width:30%;background-color: #1b2735;color: white;"
            @click="handleClickImportCase"
            round
          >&#xe61a; 导入案件</el-button>
        </el-col>
        <el-col :span="1">&nbsp;</el-col>
        <el-col :span="4">
          <el-input placeholder="输入案件名称进行检索" prefix-icon="el-icon-search" v-model="inputAnjianName"></el-input>
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
      <el-col :span="4">&nbsp;</el-col>
      <el-col :span="16" style="text-align:">
        <!-- <new-case-view></new-case-view> -->
        <!-- <show-exist-case-view></show-exist-case-view> -->
        <!-- <transition
          name="custom-classes-transition"
          enter-active-class="animated fadenLeft"
          leave-active-class="animated fadeOutRight"
        >-->
        <component :is="currentViewName"></component>
        <!-- </transition> -->
      </el-col>
      <el-col :span="4">&nbsp;</el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ShowExistCaseView from "@/pages/home/ShowExistCaseView";
import NewCaseView from "@/pages/home/NewCaseView";
import CaseDetailView from "@/pages/home/CaseDetailView";
import EditCaseView from "@/pages/home/EditCaseView";

export default {
  data() {
    return {
      inputAnjianName: ""
    };
  },
  computed: {
    ...mapState("HomePageSwitch", ["currentViewName"])
  },
  components: {
    "new-case-view": NewCaseView,
    "show-exist-case-view": ShowExistCaseView,
    "case-detail-view": CaseDetailView,
    "edit-case-view": EditCaseView
  },
  methods: {
    handleClickNewCase() {
      //this.currentViewName = "new-case-view";
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "new-case-view");
    },
    handleClickImportCase() {
      this.$electron.remote.dialog
        .showOpenDialog({
          title: "请选择数据文件",
          buttonLabel: "确定",
          filters: [
            {
              name: "Custom File Type",
              extensions: ["cvs", "txt", "xls", "xlsx"]
            }
          ]
        })
        .then(result => {
          console.log(result.canceled);
          console.log(result.filePaths);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style scoped>
.sysBtnStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
</style>
