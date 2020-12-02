<template>
  <div class="TabData">
    <el-row>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickDataCollection"
          :loading="loading"
        >
          <span class="iconfont selfIcont">&#xe6a1;</span>
          <br />
          <span class="title-content">数据采集</span>
        </el-button>
      </el-col>

      <el-col :span="1" class="el-col" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickCollectionRecord"
        >
          <span class="iconfont selfIcont">&#xe614;</span>
          <br />
          <span class="title-content">采集记录</span>
        </el-button>
      </el-col>

      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!isNotNoDataPage"
          @click="handleClickFilter"
        >
          <span class="iconfont selfIcont">&#xe815;</span>
          <br />
          <span class="title-content">筛选</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickClearFilter"
          :disabled="
            !(
              isNotNoDataPage &&
              currentTableData.modelFilterChildList.length > 0
            )
          "
        >
          <span class="iconfont selfIcont">&#xe606;</span>
          <br />
          <span class="title-content">清除筛选</span>
          <br />
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickShowField"
          :disabled="!isNotNoDataPage"
        >
          <span class="iconfont selfIcont">&#xe600;</span>
          <br />
          <span class="title-content">选择显示列</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickHideEmptyField"
          :disabled="!isNotNoDataPage"
        >
          <span class="iconfont selfIcont">&#xe677;</span>
          <br />
          <span class="title-content">{{
            currentTableData && currentTableData.hideEmptyField
              ? "显示空列"
              : "隐藏空列"
          }}</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="disabledWashingButtons"
          @click="handleClickWashingButton('search-replace')"
        >
          <span class="iconfont selfIcont">&#xe89a;</span>
          <br />
          <span class="title-content">查找替换</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="disabledWashingButtons"
          @click="handleClickWashingButton('special-char')"
        >
          <span class="iconfont selfIcont">&#xe66c;</span>
          <br />
          <span class="title-content">特殊字符</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="disabledWashingButtons"
          @click="handleClickWashingButton('ineffect-data')"
        >
          <span class="iconfont selfIcont">&#xe660;</span>
          <br />
          <span class="title-content">无效数据</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="disabledWashingButtons"
          @click="handleClickWashingButton('data-diff')"
        >
          <span class="iconfont selfIcont">&#xe624;</span>
          <br />
          <span class="title-content">数据去重</span>
        </el-button>
      </el-col>
      <!-- <el-col :span="1" class="el-col" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="disabledWashingButtons"
        >
          <span class="iconfont selfIcont">&#xe602;</span>
          <br />
          <span class="title-content">数据补全</span>
        </el-button>
      </el-col> -->
      <el-col :span="1">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!isModelLibVisible"
          @click="handleClickShowModelLib"
        >
          <span class="iconfont selfIcont">&#xe60f;</span>
          <br />
          <span class="title-content">模型库</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!isModelVisible"
          @click="handleClickShowModel"
        >
          <span class="iconfont selfIcont">&#xe66b;</span>
          <br />
          <span class="title-content">模型参数</span>
        </el-button>
      </el-col>
      <el-col :span="1" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickDataVisibleView"
          :disabled="
            !(currentTableData && currentTableData.title === '资金交易明细')
          "
        >
          <span class="iconfont selfIcont">&#xe607;</span>
          <br />
          <span class="title-content">可视化</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickExportData"
          :disabled="
            !(
              currentTableData &&
              currentTableData.componentName !== 'no-data-view'
            )
          "
        >
          <span class="iconfont selfIcont">&#xe637;</span>
          <br />
          <span class="title-content">导出数据</span>
        </el-button>
      </el-col>
    </el-row>

    <el-row style="font-size: 8px; color: gray">
      <el-col :span="2" style="border-right: 1px solid #e5e7ec">
        <div>采集</div>
      </el-col>
      <el-col
        :span="4"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>显示</div>
      </el-col>
      <el-col
        :span="4"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>清洗</div>
      </el-col>
      <el-col
        :span="3"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>分析</div>
      </el-col>
      <el-col :span="1">
        <div>导出</div>
      </el-col>
    </el-row>
    <!-- 智能采集 -->
    <!-- <auto-dialog></auto-dialog> -->
    <!-- 标准采集 -->

    <div v-if="standardDataVisible">
      <standard-dialog></standard-dialog>
    </div>
    <div v-if="filterVisible">
      <filter-dialog></filter-dialog>
    </div>
    <div v-if="showFieldsVisible">
      <show-fields-dialog></show-fields-dialog>
    </div>
    <div v-if="showDataVisibilityDialogVisible">
      <show-visible-dialog></show-visible-dialog>
    </div>
    <collection-record v-if="showCollectionRecordVisible"></collection-record>
  </div>
</template>
<script >
import StandardDataCollectionDialog from "@/pages/dialog/standard/StandardDataCollectionDialog";
import FilterDialog from "@/pages/dialog/filter/FilterDIalog";
import ShowFieldsDialog from "@/pages/dialog/filter/ShowFieldsDialog";
import ShowDataVisibleView from "@/pages/dialog/visible/visibleDialog";
import CollectionRecord from "@/pages/dialog/record/CollectionRecordDialog";
import { mapState } from "vuex";
import path, { extname } from "path";
import DataCleanDb from "@/db/DataClean.js";
import cases from "@/db/Cases.js";
import aes from "@/utils/aes";

export default {
  data() {
    return {
      loading: false,
      defaultProps: {
        children: "children",
        label: "fieldcname",
      },
    };
  },
  components: {
    "standard-dialog": StandardDataCollectionDialog,
    "filter-dialog": FilterDialog,
    "show-fields-dialog": ShowFieldsDialog,
    "show-visible-dialog": ShowDataVisibleView,
    "collection-record": CollectionRecord,
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", [
      "standardDataVisible",
      "filterVisible",
      "showFieldsVisible",
      "showDataVisibilityDialogVisible",
      "showCollectionRecordVisible",
    ]),
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("MainPageSwitch", ["exportProcessVisible"]),
    isNotNoDataPage() {
      return (
        this.currentTableData &&
        this.currentTableData.componentName !== "no-data-view"
      );
    },
    disabledWashingButtons() {
      return !(
        this.currentTableData && this.currentTableData.tableType === "base"
      );
    },
    isModelLibVisible() {
      return (
        this.currentTableData &&
        this.currentTableData.hasOwnProperty("modelTree")
      );
    },
    isModelVisible() {
      return (
        this.currentTableData && this.currentTableData.hasOwnProperty("mpids")
      );
    },
  },
  methods: {
    async handleClickDataVisibleView() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWDATAVISIBILITYDIALOGVISIBLE",
        true
      );
    },
    async handleClickShowModelLib() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "model-list-view",
        action: "add",
      });
    },
    async handleClickShowModel() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "model-view",
        action: "add",
      });
    },
    async handleClickDataCollection() {
      this.loading = true;
      await this.$electron.ipcRenderer.send("data-collection-open");
      this.$electron.ipcRenderer.on(
        "data-collection-open-complete",
        async () => {
          await this.$store.dispatch(
            "CaseDetail/queryBatchCount",
            this.caseBase.ajid
          );
          await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDVIEW",
            "begin-import"
          );
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDDATAVISIBLE",
            true
          );
          this.$electron.ipcRenderer.removeAllListeners(
            "data-collection-open-complete"
          );
          this.loading = false;
        }
      );
    },
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
    async handleClickHideEmptyField() {
      // 计算空
      if (!this.currentTableData.hideEmptyField) {
        await this.$store.commit("ShowTable/SET_HIDEEMPTYFIELD", {
          hideEmptyField: true,
        });
      } else {
        await this.$store.commit("ShowTable/SET_HIDEEMPTYFIELD", {
          hideEmptyField: false,
        });
      }
    },
    async handleClickFilter() {
      await this.$store.commit("DialogPopWnd/SET_FILTER_DIALOG_VISIBLE", true);
    },
    // 清除筛选
    async handleClickClearFilter() {
      await this.$store.commit("ShowTable/UPDATE_TABLE_FILTER", {
        pageIndex: this.currentTableData.pageIndex,
        modelFilterChildList: [],
      });
      await this.$store.dispatch(this.currentTableData.dispatchName, {
        ...this.currentTableData,
        offset: 0,
        count: 30,
      });
    },
    async handleClickShowField() {
      await this.$store.commit(
        "DialogPopWnd/SET_SHOW_FILEDS_DIALOG_VISIBLE",
        true
      );
    },
    async handleClickExportData() {
      if (this.exportProcessVisible) {
        this.$message({
          title: "警告",
          message: "当前存在导出操作，请稍后...",
          type: "warning",
        });
        return;
      }
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath: `案件${this.caseBase.ajmc}-${this.currentTableData.title}`,
        filters: [
          { name: "excel", extensions: ["xls", "xlsx"] },
          { name: "txt", extensions: ["txt"] },
          { name: "csv", extensions: ["csv"] },
        ],
      });
      if (!result.canceled) {
        let exportSql = this.currentTableData.exportSql;
        let args = {
          ajid: this.caseBase.ajid,
          exportSql,
          filePath: result.filePath,
          headers: this.currentTableData.headers,
          sumRowCount: this.currentTableData.sum,
        };
        console.log(exportSql);
        this.$electron.ipcRenderer.send("export-one-file-begin", args);
      }
    },
    findRoot(rows) {
      let obj = rows.find((row) => row.parentid === -1);
      return JSON.parse(JSON.stringify(obj));
    },
    makeTreeByTableHeaders(gpsqltemplate_select, gpsqltemplate_update) {
      let headers = this.currentTableData.headers;
      let keys = [];
      let tree = headers.map((header) => {
        keys.push(header.fieldename);
        return {
          describe: header.fieldcname,
          children: [],
          errorCount: 0,
          tid: header.fieldename,
          gpsqltemplate_select,
          gpsqltemplate_update,
        };
      });
      return {
        keys,
        tree,
      };
    },
    makeTreeByList(list, rootid) {
      let len = list.length;
      function loop(rootid) {
        let res = [];
        for (let i = 0; i < len; i++) {
          let item = list[i];
          if (item.parentid === rootid) {
            item.children = loop(item.tid);
            item.errorCount = 0;
            res.push(item);
          }
        }
        return res;
      }
      return loop(rootid);
    },
    async handleClickWashingButton(opt) {
      console.log(opt);
      try {
        let componentObj = {};
        switch (opt) {
          case "search-replace":
            componentObj = {
              componentName: "search-replace-view",
              action: "add",
            };
            break;
          case "special-char":
            {
              let { success, rows } = await DataCleanDb.queryRulesFromTable(
                this.currentTableData.tableename,
                "0"
              );
              if (success && rows.length > 0) {
                let keys = rows.map((row) => row.tid);
                let rootNode = this.findRoot(rows);
                let renderTree = this.makeTreeByList(rows, rootNode.tid);
                this.$store.commit("ShowTable/SET_SPECIALCHAR_TREE_DATA", {
                  checkedKeys: JSON.parse(JSON.stringify(keys)),
                  renderTree,
                });
              } else {
                this.$message({
                  message: "没有匹配的数据项",
                });
                return;
              }
              componentObj = {
                componentName: "special-char-view",
                action: "add",
              };
            }

            break;
          case "ineffect-data":
            {
              let { success, rows } = await DataCleanDb.queryRulesFromTable(
                this.currentTableData.tableename,
                "1"
              );
              if (success && rows.length > 0) {
                let keys = rows.map((row) => row.tid);
                let rootNode = this.findRoot(rows);
                let renderTree = this.makeTreeByList(rows, rootNode.tid);
                this.$store.commit("ShowTable/SET_INEFFECTDATA_TREE_DATA", {
                  checkedKeys: JSON.parse(JSON.stringify(keys)),
                  renderTree,
                });
              } else {
                this.$message({
                  message: "没有匹配的数据规则项",
                });
                return;
              }
              componentObj = {
                componentName: "ineffect-data-view",
                action: "add",
              };
            }

            break;
          case "data-diff":
            {
              let { success, rows } = await DataCleanDb.queryRulesFromTable(
                this.currentTableData.tableename,
                "2"
              );
              console.log(rows);
              if (success && rows.length > 0) {
                let { gpsqltemplate_select, gpsqltemplate_update } = rows[0];
                let { keys, tree } = this.makeTreeByTableHeaders(
                  gpsqltemplate_select,
                  gpsqltemplate_update
                );
                this.$store.commit("ShowTable/SET_DIFFDATA_TREE_DATA", {
                  checkedKeys: keys,
                  renderTree: tree,
                });
              } else {
                this.$message({
                  message: "没有匹配的数据规则项",
                });
                return;
              }
              componentObj = {
                componentName: "data-diff-view",
                action: "add",
              };
            }

            break;
        }
        this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", componentObj);
      } catch (e) {
        this.$message.error({
          message: e.message,
        });
        return;
      }
    },
  },
};
</script>
<style scoped>
.TabData {
  -webkit-user-select: none;
}
.el-dropdown-link {
  cursor: pointer;
}
.el-col {
  text-align: center;
}
.selfIcont {
  font-size: 18px;
  color: rgb(24, 84, 95);
}
.title-content {
  font-size: 10px;
}
.ctrl-button {
  padding-top: 4px;
}
</style>