<template>
  <div>
    <div
      class="searchReplace"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="2" style="text-align: center">
          <el-tooltip
            class="item"
            effect="dark"
            content="点击收缩右边栏"
            placement="top"
          >
            <span @click="handleClickShowRightSlider" class="close iconfont">{{
              currentTableData.isShowRightSlider ? "&#xe626;" : "&#xe668;"
            }}</span></el-tooltip
          >
        </el-col>
        <el-col :span="20">
          <div>
            <span class="iconfont">&#xe624;&nbsp;&nbsp;&nbsp;数据去重</span>
            <span v-if="errorCount > 0" style="font-size: 10px; color: red"
              ><b>{{ errorCount }}</b></span
            >
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>
      <el-tree
        :style="{
          height: contentViewHeight - 40 - 15 - 80 + 'px',
          overflow: 'auto',
        }"
        ref="tree"
        @check-change="handleChangeCheckNode"
        :data="myTreeList.renderTree"
        :props="defaultProps"
        :show-checkbox="true"
        default-expand-all
        :default-checked-keys="myTreeList.checkedKeys"
        empty-text="当前表没有特殊字符，不具备筛选清洗功能。"
        node-key="tid"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span style="font-size: 10px">{{ node.label }}</span>
          <span
            v-if="data.errorCount > 0"
            style="color: #e93d20; font-size: 10px"
            ><b>&nbsp;&nbsp;{{ data.errorCount }}</b></span
          >
        </span>
      </el-tree>
      <div style="border-top: 1px solid #dddfe5">
        <el-row style="text-align: center; margin-top: 10px">
          <el-button
            size="mini"
            type="primary"
            @click="handleClickCheck"
            :disabled="disabled"
            :loading="loading"
            >开始检测</el-button
          >

          <el-button
            :disabled="errorCount <= 0"
            size="mini"
            type="primary"
            @click="handleClickResolve"
            :loading="loading"
            >数据处理</el-button
          >
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import DataCleanDb from "../../../../../db/DataClean";
import aes from "@/utils/aes";
import baseDb from "../../../../../db/Base";
import dataShowDb from "../../../../../db/DataShowTable";
import errorDataTableView from "@/pages/dialog/filter/ErrowRowReview.vue";
const log = require("electron-log");
export default {
  components: {
    "error-row-view": errorDataTableView,
  },
  data() {
    return {
      loading: false,
      errorCount: 0,
      renderErrorData: {},
      disabled: false,
      keys: [],
      renderTree: [],
      defaultProps: {
        children: "children",
        label: function (a, b) {
          return a.describe;
        },
      },
    };
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "currentTableData"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", ["showErrorRowRecordVisible"]),
    myTreeList() {
      return JSON.parse(JSON.stringify(this.currentTableData.diffData));
    },
  },
  methods: {
    async handleClickCheck() {
      this.loading = true;
      try {
        let sumErrCount = await this.freshTreeErrorCount();
        this.$message({
          message: `存在${sumErrCount}条重复数据`,
          type: "success",
        });
      } catch (e) {
        this.$message.error({
          title: "失败",
          message: `数据检测失败：` + e.message,
        });
        log.info(e.message);
      }
      this.loading = false;
    },
    async freshNowUI() {
      // 更新采集批次等一批数据
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
      //
      // 更新当前的展示列表中的数据;
      for (let tableData of this.tableDataList) {
        // 根据tableName获取表的数据
        if (tableData.componentName !== "no-data-view") {
          this.$store.dispatch(tableData.dispatchName, {
            ...tableData,
            offset: 0,
            count: 30,
          });
        }
      }
    },
    handleClickShowRightSlider() {
      this.$store.commit("ShowTable/SWITCH_ISSHOWRIGHTSLIDER");
    },
    async handleClickResolve() {
      try {
        this.loading = true;
        let allCheckedNodes = this.$refs.tree.getCheckedNodes();
        if (allCheckedNodes.length === 0) return;
        let _this = this;
        let filterArr = [];
        let emptyArr = [];
        let template = "";
        for (let nodeData of allCheckedNodes) {
          filterArr.push(nodeData.tid);
          template = nodeData.gpsqltemplate_update;
        }
        for (let nodeData of this.myTreeList.renderTree) {
          console.log({ nodeData });
          if (!filterArr.includes(nodeData.tid)) {
            emptyArr.push(nodeData.tid);
          }
        }
        if (template) {
          let decode = aes.decrypt(template);
          let sql = decode
            .replace(/\$EMPTYFILTER\$/g, emptyArr.length > 0 ? emptyArr : 0)
            .replace(/\$MODEL_FILTER\$/g, this.currentTableData.modelFilterStr)
            .replace(/\$FILTER\$/g, filterArr)
            .replace(/\$AJID\$/g, this.caseBase.ajid);
          console.log(sql);
          let { success, rows } = await baseDb.QueryCustom(
            sql,
            _this.caseBase.ajid
          );
          if (success) {
            await this.freshNowUI();
            this.$message({
              title: "成功",
              message: `数据处理完毕`,
              type: "success",
            });
            this.loading = false;
            this.errorCount = 0;
          }
          this.loading = false;
        }
        this.loading = false;
        //
      } catch (e) {
        this.$message.error({
          title: "失败",
          message: `数据处理失败：` + e.message,
        });
        log.info(e.message);
        this.loading = false;
      }
    },
    async freshTreeErrorCount() {
      let allCheckedNodes = this.$refs.tree.getCheckedNodes();
      if (allCheckedNodes.length === 0) return;
      let _this = this;
      let filterArr = [];
      let template = "";
      for (let nodeData of allCheckedNodes) {
        filterArr.push(nodeData.tid);
        template = nodeData.gpsqltemplate_select;
      }
      if (template) {
        let decode = aes.decrypt(template);
        let sql = decode
          .replace(/\$MODEL_FILTER\$/g, this.currentTableData.modelFilterStr)
          .replace(/\$FILTER\$/g, filterArr)
          .replace(/\$AJID\$/g, this.caseBase.ajid);
        console.log(sql);
        console.log(this.currentTableData);

        let { success, rows } = await baseDb.QueryCustom(
          sql,
          _this.caseBase.ajid
        );
        if (success) {
          this.errorCount = rows[0].count;
          return this.errorCount;
        } else {
          return 0;
        }
      }
    },

    handleChangeCheckNode(node, checked, childchecked) {
      let { checkedKeys, renderTree } = this.myTreeList;
      let allCheckedNodes = this.$refs.tree.getCheckedNodes();
      let newCheckedKeys = allCheckedNodes.map((n) => n.tid);
      this.$store.commit("ShowTable/SET_DIFFDATA_TREE_DATA", {
        checkedKeys: newCheckedKeys,
        renderTree,
      });
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "data-diff-view",
        action: "remove",
      });
      this.$store.commit("ShowTable/SET_DIFFDATA_TREE_DATA", null);
    },
  },
};
</script>
<style  scoped>
.searchReplace {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  -webkit-user-select: none;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.foot {
  height: 40px;
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
</style>