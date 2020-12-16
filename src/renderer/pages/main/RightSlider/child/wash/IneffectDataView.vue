<template>
  <div>
    <div
      class="searchReplace"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="22">
          <div>
            <span class="iconfont">&#xe660;&nbsp;&nbsp;&nbsp;无效数据</span>
            <span v-if="errorCount > 0" style="font-size: 10px; color: red"
              ><b>{{ errorCount }}</b></span
            >
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>
      <div
        class="container"
        :style="{
          height: contentViewHeight - 40 - 15 - 80 + 'px',
          overflow: 'auto',
        }"
      >
        <div style="font-size: 12px; color: #737478">检测🌲：</div>
        <el-tree
          ref="tree"
          @node-click="handleNodeClick"
          @check-change="handleChangeCheckNode"
          :data="myTreeList.renderTree"
          :props="defaultProps"
          :show-checkbox="true"
          default-expand-all
          :default-checked-keys="myTreeList.checkedKeys"
          empty-text="当前表没有无效数据，不具备筛选清洗功能。"
          node-key="tid"
        >
          <span class="custom-tree-node" slot-scope="{ node }">
            <span style="font-size: 10px">{{ node.label }}</span>
          </span>
        </el-tree>
        <div style="margin: 20px; font-size: 10px; color: #737478">
          当前检测条件为：{{ checkParamStr }}
        </div>
      </div>

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
            size="mini"
            type="primary"
            @click="handleClickResolve"
            :disabled="errorCount <= 0"
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
  props: ["renderData"],
  components: {
    "error-row-view": errorDataTableView,
  },
  mounted() {
    this.isMounted = true;
  },
  data() {
    return {
      loading: false,
      errorCount: 0,
      renderErrorData: {},
      disabled: false,
      keys: [],
      isMounted: false,
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
      return JSON.parse(JSON.stringify(this.currentTableData.ineffectData));
    },
    checkParamStr() {
      if (this.isMounted) {
        let allCheckedNodes = this.$refs.tree.getCheckedNodes();
        console.log(allCheckedNodes);
        let labels = allCheckedNodes.map((node) => `(${node.describe})`);
        return labels.join(" 并且 ");
      }
    },
  },
  methods: {
    async handleClickCheck() {
      this.loading = true;
      try {
        this.errorCount = await this.freshTreeErrorCount();
        this.$message({
          message: `存在${this.errorCount}条无效数据`,
          type: "success",
        });
      } catch (e) {
        this.$message.error({
          message: `数据检测失败:` + e.message,
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
    async handleClickResolve() {
      try {
        this.loading = true;
        let allCheckedNodes = this.$refs.tree.getCheckedNodes();
        if (allCheckedNodes.length === 0) return;

        let paramStr = "";
        for (let nodeData of allCheckedNodes) {
          if (nodeData.children.length === 0 && nodeData.gpsqltemplate_update) {
            let decode = aes.decrypt(nodeData.gpsqltemplate_update);
            paramStr += " " + decode;
          }
        }
        let sql = `DELETE FROM ${this.currentTableData.tableename} WHERE ajid=${this.caseBase.ajid}  ${paramStr} `;

        await baseDb.QueryCustom(sql, this.caseBase.ajid);
        // 再次检测一下
        this.errorCount = await this.freshTreeErrorCount();
        //
        await this.freshNowUI();
        this.$message({
          title: "成功",
          message: `数据处理完毕`,
          type: "success",
        });
        this.loading = false;
      } catch (e) {
        this.$message.error({
          message: `数据处理失败`,
        });
        log.info(e.message);
        this.loading = false;
      }
    },
    async freshTreeErrorCount() {
      let allCheckedNodes = this.$refs.tree.getCheckedNodes();
      if (allCheckedNodes.length === 0) return;
      let paramStr = "";
      for (let nodeData of allCheckedNodes) {
        if (nodeData.gpsqltemplate_select) {
          let decode = aes.decrypt(nodeData.gpsqltemplate_select);
          console.log(decode);
          paramStr += " " + decode;
        }
      }
      let sql = `select count(*)::int count from ${this.currentTableData.tableename} where ajid=${this.caseBase.ajid} ${paramStr}`;
      console.log(sql);
      let { success, rows } = await baseDb.QueryCustom(sql, this.caseBase.ajid);
      if (success) {
        return rows[0].count;
      }
      return 0;
    },
    async handleNodeClick(nodeData, node) {
      if (nodeData.errorCount > 0) {
        let decode = aes.decrypt(nodeData.gpsqltemplate_select);
        let sql = `select * from ${this.currentTableData.tableename} where ajid=${this.caseBase.ajid} ${decode}`;
        let updateSql = `DELETE FROM ${this.currentTableData.tableename} WHERE ajid=${this.caseBase.ajid}  ${decode} `;

        let resHeaders = await dataShowDb.QueryTableShowCFields(
          this.currentTableData.tid
        );
        if (!resHeaders.success) {
          this.$message.error({
            title: "错误",
            message: "查询数据失败1。",
          });
          return;
        }
        let resTableList = await baseDb.QueryCustom(
          sql + " LIMIT 30 OFFSET 0",
          this.caseBase.ajid
        );
        if (!resTableList.success) {
          this.$message.error({
            title: "错误",
            message: "查询数据失败2。",
          });
          return;
        }
        let renderErrorData = {
          title: nodeData.rule_name,
          updateSql,
          ruleField: nodeData.rule_value ? nodeData.rule_value : " ",
          tableList: resTableList.rows,
          tableHeaders: resHeaders.rows,
        };
        console.log(nodeData);
        this.$store.commit("ShowTable/SET_RENDERERRORDATA", renderErrorData);
        this.$store.commit("DialogPopWnd/SET_SHOWERRORROWRECORDVISIBLE", true);
      }
    },
    handleChangeCheckNode(node, checked, childchecked) {
      let { checkedKeys, renderTree } = this.myTreeList;
      let allCheckedNodes = this.$refs.tree.getCheckedNodes();
      let newCheckedKeys = allCheckedNodes.map((n) => n.tid);
      this.$store.commit("ShowTable/SET_INEFFECTDATA_TREE_DATA", {
        checkedKeys: newCheckedKeys,
        renderTree,
      });
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "ineffect-data-view",
        action: "remove",
      });
      this.$store.commit("ShowTable/SET_INEFFECTDATA_TREE_DATA", null);
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