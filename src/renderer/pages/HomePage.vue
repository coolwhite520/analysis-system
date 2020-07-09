<template>
  <div style="height:500px;  -webkit-user-select: none;">
    <el-row style="margin-top: 40px;margin-bottom: 40px;">
      <el-col :span="6">&nbsp;</el-col>
      <el-col :span="12" style="text-align: center;">
        <el-button class="iconfont" style="width:30%" @click="handleClickNewCase">&#xe6a3; 新增案件</el-button>
        <el-button class="iconfont" style="width:30%">&#xe61a; 导入案件</el-button>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="4">
        <el-input
          v-show="currentViewName !== 'new-case-view'"
          placeholder="输入案件名称进行检索"
          prefix-icon="el-icon-search"
          v-model="inputAnjianName"
        ></el-input>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
    </el-row>

    <el-row>
      <el-col :span="4">&nbsp;</el-col>
      <el-col :span="16" style="text-align:">
        <!-- <new-case-view></new-case-view> -->
        <!-- <show-exist-case-view></show-exist-case-view> -->
        <component :is="currentViewName"></component>
      </el-col>
      <el-col :span="4">&nbsp;</el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ShowExistCaseView from "@/pages/home/ShowExistCaseView";
import NewCaseView from "@/pages/home/NewCaseView";

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
    "show-exist-case-view": ShowExistCaseView
  },
  methods: {
    handleClickNewCase() {
      //this.currentViewName = "new-case-view";
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "new-case-view");
    }
  }
};
</script>

<style scoped>
</style>
