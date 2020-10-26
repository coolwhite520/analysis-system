<template>
  <div class="detailInfo" v-loading="loading">
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
          <el-button round type="primary" icon="el-icon-share" size="mini"
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
        <!-- <span>
          <el-button type="text" size="mini" @click="handleClickDataCollection"
            >数据采集</el-button
          >
        </span> -->
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
import CollectionRecordDialog from "@/pages/dialog/record/CollectionRecordDialog";
import { mapState, mapGetters } from "vuex";
import cases from "@/db/Cases";
export default {
  async beforeMount() {
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
        await this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", true);
      }
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