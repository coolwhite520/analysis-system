<template>
  <div>
    <error-row-view
      v-if="showErrorRowRecordVisible"
      v-on:refreshErrorCharTree="refreshErrorCharTree"
    ></error-row-view>
    <div
      class="searchReplace"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="22">
          <div>
            <span class="iconfont">&#xe660;&nbsp;&nbsp;&nbsp;无效数据</span>
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
            size="mini"
            type="primary"
            @click="handleClickResolve"
            :disabled="errorCount <= 0"
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
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", ["showErrorRowRecordVisible"]),
    myTreeList() {
      return JSON.parse(JSON.stringify(this.currentTableData.ineffectData));
    },
  },
  methods: {
    async refreshErrorCharTree() {
      await this.freshTreeErrorCount();
    },
    async handleClickCheck() {
      this.loading = true;
      try {
        let arr = await this.freshTreeErrorCount();
        console.log(arr);
        let sumErrCount = this.$lodash.sum(arr);
        this.errorCount = sumErrCount;
        this.$message({
          message: `存在${sumErrCount}条无效数据`,
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
    async handleClickResolve() {
      try {
        let allCheckedNodes = this.$refs.tree.getCheckedNodes();
        if (allCheckedNodes.length === 0) return;

        let arrayPromise = [];
        let _this = this;
        for (let nodeData of allCheckedNodes) {
          if (nodeData.children.length === 0 && nodeData.gpsqltemplate_update) {
            let decode = aes.decrypt(nodeData.gpsqltemplate_update);
            let sql = `DELETE FROM ${this.currentTableData.tableename} WHERE ajid=${this.caseBase.ajid}  ${decode} `;
            arrayPromise.push(
              (async function () {
                await baseDb.QueryCustom(sql, _this.caseBase.ajid);
              })()
            );
          }
        }
        await Promise.all(arrayPromise);
        // 再次检测一下
        let arrCount = await this.freshTreeErrorCount();
        //
        this.$message({
          title: "成功",
          message: `数据处理完毕`,
          type: "success",
        });
      } catch (e) {
        this.$message.error({
          message: `数据处理失败`,
        });
        log.info(e.message);
      }
    },
    async freshTreeErrorCount() {
      let allCheckedNodes = this.$refs.tree.getCheckedNodes();
      if (allCheckedNodes.length === 0) return;
      let arrayPromise = [];
      let _this = this;
      for (let nodeData of allCheckedNodes) {
        if (nodeData.gpsqltemplate_select) {
          let decode = aes.decrypt(nodeData.gpsqltemplate_select);
          console.log(decode);
          let sql = `select count(*) from ${this.currentTableData.tableename} where ajid=${this.caseBase.ajid} ${decode}`;
          arrayPromise.push(
            (async function () {
              let { success, rows } = await baseDb.QueryCustom(
                sql,
                _this.caseBase.ajid
              );
              if (success) {
                nodeData.errorCount = rows[0].count;
                return parseInt(nodeData.errorCount);
              }
              return 0;
            })()
          );
        }
      }
      let arrCount = await Promise.all(arrayPromise);
      this.$store.commit(
        "ShowTable/SET_INEFFECTDATA_TREE_DATA",
        this.myTreeList
      );
      return arrCount;
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