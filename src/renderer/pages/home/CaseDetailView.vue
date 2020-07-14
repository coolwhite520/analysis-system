<template>
  <div class="detailInfo">
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
          >删除</el-button>
        </el-button-group>
      </div>
      <div style="clear:both;"></div>
      <el-divider></el-divider>
      <el-row>
        <el-col :span="12">
          <p>案件名称：{{caseDetail.ajmc}}</p>
        </el-col>
        <el-col :span="12">
          <p>案件编号：{{caseDetail.ajbh}}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <p>案件类型：{{caseDetail.ajlbmc}}</p>
        </el-col>
        <el-col :span="12">&nbsp;</el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>发生时间：{{caseDetail.jjsj}}</p>
        </el-col>
        <el-col :span="12">
          <p>所属地区：{{caseDetail.asjfsddxzqmc}}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <p>立案时间：{{caseDetail.cjsj}}</p>
        </el-col>
        <el-col :span="12">
          <p>案件状态：{{caseDetail.zcjdmc}}</p>
        </el-col>
      </el-row>

      <p>简要案情：{{caseDetail.jyaq}}</p>
      <p>综述案情：{{caseDetail.zhaq}}</p>
    </div>
    <el-divider></el-divider>
    <div class="dataInfo">
      <div class="title">
        <h2 style="float: left;">案件数据</h2>
        <el-button-group style="float: right; ">
          <el-button
            round
            type="primary"
            size="mini"
            style="background-color: #1b2735;color: white;"
          >人员基本信息</el-button>
          <el-button
            round
            type="primary"
            size="mini"
            style="background-color: #1b2735;color: white;"
          >单位基本信息</el-button>
          <el-button
            round
            type="primary"
            size="mini"
            style="background-color: #1b2735;color: white;"
          >开户信息</el-button>
        </el-button-group>
      </div>
      <div style="clear:both;"></div>
      <el-divider></el-divider>
      <div>
        <span>案件数据：</span>
        <span>共采集{{"0"}}次</span>
        <span>
          <el-button type="text" size="mini">采集记录</el-button>
        </span>
      </div>
      <p>
        数据总量：
        <span>
          <el-button type="text" size="mini">离线采集</el-button>
        </span>
      </p>
      <p>
        待调单任务：
        <span>
          <el-button type="text" size="mini">查看待调单任务</el-button>
        </span>
      </p>
      <p>实体数量：</p>
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
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("CaseDetail", ["caseDetail"])
  },
  methods: {
    handleClickEdit() {
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "edit-case-view");
    },
    handleClickGoHome() {
      this.$store.commit(
        "HomePageSwitch/SET_VIEW_NAME",
        "show-exist-case-view"
      );
    }
  }
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
</style>