<template>
  <div class="detailInfo" v-loading="loading">
    <div class="baseInfo">
      <div class="title">
        <h2 style="float: left;">基本信息</h2>
        <el-button-group style="float: right; ">
          <el-button
            round
            type="primary"
            icon="el-icon-edit"
            size="mini"
            style="background-color: #1b2735;color: white;"
            @click="handleClickEdit"
          >编辑</el-button>
          <el-button
            round
            type="primary"
            icon="el-icon-share"
            size="mini"
            style="background-color: #1b2735;color: white;"
          >导出</el-button>
          <el-button
            round
            type="primary"
            icon="el-icon-delete"
            size="mini"
            style="background-color: #1b2735;color: white;"
            @click="handleClickDelCase"
          >删除</el-button>
        </el-button-group>
      </div>
      <div style="clear:both;"></div>
      <el-divider></el-divider>
      <el-row>
        <el-col :span="12">
          <p>
            案件名称：
            <span class="caseContent">{{caseDetail.ajmc}}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            案件编号：
            <span class="caseContent">{{caseDetail.ajbh}}</span>
          </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <p>
            案件类型：
            <span class="caseContent">{{caseDetail.ajlbmc}}</span>
          </p>
        </el-col>
        <el-col :span="12">&nbsp;</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>
            发生时间：
            <span class="caseContent">{{caseDetail.jjsj}}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            所属地区：
            <span class="caseContent">{{caseDetail.asjfsddxzqmc}}</span>
          </p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>
            立案时间：
            <span class="caseContent">{{caseDetail.cjsj}}</span>
          </p>
        </el-col>
        <el-col :span="12">
          <p>
            案件状态：
            <span class="caseContent">{{caseDetail.zcjdmc}}</span>
          </p>
        </el-col>
      </el-row>

      <p>
        简要案情：
        <span class="caseContent">{{caseDetail.jyaq}}</span>
      </p>
      <p>
        综述案情：
        <span class="caseContent">{{caseDetail.zhaq}}</span>
      </p>
    </div>
    <el-divider></el-divider>
    <div class="dataInfo">
      <div class="title">
        <h2 style="float: left;">案件数据</h2>
        <el-button-group style="float: right; ">
          <el-button
            v-for="item in renderButtonGroupList"
            :key="item.tid"
            round
            type="primary"
            size="mini"
            style="background-color: #1b2735;color: white;"
            @click="handleClickBtnGroup(item.tablename)"
          >{{item.title}}</el-button>
        </el-button-group>
      </div>
      <div style="clear:both;"></div>
      <el-divider></el-divider>
      <div>
        <span>案件数据：</span>
        <span>共采集{{"0"}}次</span>
        <span>
          <el-button type="text" size="mini" @click="handleClickCollection">采集记录</el-button>
        </span>
      </div>
      <p>
        数据总量：
        <span>
          <el-button type="text" size="mini">离线采集</el-button>
        </span>
      </p>
      <p>
        待调单任务：{{awaitTaskCount}} 个
        <span>
          <el-button type="text" size="mini">查看待调单任务</el-button>
        </span>
      </p>
      <p>实体数量：{{entityCount}} 个</p>
      <el-divider></el-divider>
      <el-row>
        <el-col :span="8">&nbsp;</el-col>
        <el-col :span="8">
          <div>
            <div style="text-align:center;">
              <el-button
                class="button"
                type="primary"
                style="background-color: #1b2735;color: white;"
                round
              >开始分析</el-button>
              <el-button
                round
                class="button"
                type="primary"
                style="background-color: #1b2735;color: white;"
              >分析报告</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="8" style="text-align: right;">
          <el-button type="text" @click="handleClickGoHome">返回首页</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  async mounted() {
    console.log(this.caseDetail);
    await this.$store.dispatch(
      "CaseDetail/queryEntityCount",
      this.caseDetail.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryBatchCount",
      this.caseDetail.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryAwaitTaskCount",
      this.caseDetail.ajid
    );
    await this.$store.dispatch(
      "CaseDetail/queryCaseDataCenter",
      this.caseDetail.ajid
    );
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapState("CaseDetail", [
      "caseDetail",
      "deleteState",
      "entityCount",
      "batchCount",
      "awaitTaskCount",
    ]),
    ...mapGetters("CaseDetail", ["renderButtonGroupList"]),
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
        this.$notify({
          title: "成功",
          message: `删除案件[${this.caseDetail.ajmc}]成功!`,
          type: "success",
        });
      } else if (newValue === "failed") {
        this.loading = false;
        this.$notify.error({
          title: "错误",
          message: `删除案件[${this.caseDetail.ajmc}]失败!`,
        });
      }
    },
  },
  methods: {
    handleClickCollection() {},
    handleClickEdit() {
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "edit-case-view");
    },
    async handleClickDelCase() {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `是否要删除当前案件[${this.caseDetail.ajmc}]？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      console.log(result);
      if (result.response === 0) {
        this.loading = true;
        this.$store.dispatch(
          "CaseDetail/deleteCase",
          parseInt(this.caseDetail.ajid)
        );
        this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
      } else {
        this.$message({
          type: "info",
          message: "已取消删除",
        });
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
  border: 2px solid #dddfe5;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 5px 5px 10px 5px gray, -5px 5px 5px 5px rgba(255, 255, 255, 0.5);
}
.baseInfo {
  margin-bottom: 60px;
}
.button:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
.caseContent {
  color: gray;
}
</style>