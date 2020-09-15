<template>
  <div class="TabData">
    <el-row>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button type="text" class="ctrl-button" @click="handleClickDataCollection">
          <span class="iconfont selfIcont">&#xe6a1;</span>
          <br />
          <span class="title-content">数据采集</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
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
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' && currentTableData.modelFilterChildList.length>0)"
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
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe600;</span>
          <br />
          <span class="title-content">选择显示列</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickHideEmptyField"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe677;</span>
          <br />
          <span
            class="title-content"
          >{{ (currentTableData && currentTableData.hideEmptyField) ? "显示空列" : "隐藏空列" }}</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
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
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe669;</span>
          <br />
          <span class="title-content">特殊字符</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe61d;</span>
          <br />
          <span class="title-content">无效数据</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickDataDiff"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe6ff;</span>
          <br />
          <span class="title-content">数据去重</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe62c;</span>
          <br />
          <span class="title-content">同交易去重</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe602;</span>
          <br />
          <span class="title-content">数据补全</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe652;</span>
          <br />
          <span class="title-content">数据重置</span>
        </el-button>
      </el-col>

      <el-col :span="1">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe629;</span>
          <br />
          <span class="title-content">分组</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  
          currentTableData.componentName !== 'no-data-view' )"
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
          :disabled="!(currentTableData &&  
          currentTableData.componentName !== 'no-data-view' )"
          @click="handleClickShowModel"
        >
          >
          <span class="iconfont selfIcont">&#xe66b;</span>
          <br />
          <span class="title-content">模型参数</span>
        </el-button>
      </el-col>
      <el-col :span="1" style="border-right:1px solid #e5e7ec;">
        <el-button
          type="text"
          class="ctrl-button"
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
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
          :disabled="!(currentTableData &&  currentTableData.componentName !== 'no-data-view' )"
        >
          <span class="iconfont selfIcont">&#xe637;</span>
          <br />
          <span class="title-content">导出数据</span>
        </el-button>
      </el-col>
    </el-row>

    <el-row style="font-size:8px;color:gray;">
      <el-col :span="1" style="border-right:1px solid #e5e7ec;">
        <div>采集</div>
      </el-col>
      <el-col :span="4" style="text-align:center;border-right:1px solid #e5e7ec;">
        <div>显示</div>
      </el-col>
      <el-col :span="4" style="text-align:center;border-right:1px solid #e5e7ec;">
        <div>清洗</div>
      </el-col>
      <el-col :span="7" style="text-align:center;border-right:1px solid #e5e7ec;">
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
  </div>
</template>
<script >
import StandardDataCollectionDialog from "@/pages/dialog/StandardDataCollectionDialog";
import AutoDataCollectionDialog from "@/pages/dialog/AutoDataCollectionDialog";
import FilterDialog from "@/pages/dialog/filter/FilterDIalog";
import ShowFieldsDialog from "@/pages/dialog/filter/ShowFieldsDialog";
import { mapState } from "vuex";
import path, { extname } from "path";
export default {
  data() {
    return {
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
    "auto-dialog": AutoDataCollectionDialog,
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", [
      "standardDataVisible",
      "filterVisible",
      "showFieldsVisible",
    ]),
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("MainPageSwitch", ["exportProcessVisible"]),
  },
  methods: {
    async handleClickShowModelLib() {
      this.$store.commit("ShowTable/SHOW_MODEL_LIB_VIEW");
    },
    async handleClickShowModel() {
      this.$store.commit("ShowTable/SHOW_MODEL_VIEW");
    },
    async handleClickDataCollection() {
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseBase.ajid
      );
      await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");
      await this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "begin-import");
      await this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", true);
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
    async handleClickDataDiff() {},
    async handleClickExportData() {
      if (this.exportProcessVisible) {
        this.$notify({
          title: "警告",
          message: "当前存在导出操作，请稍后...",
          type: "warning",
        });
        return;
      }
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath: `案件（${this.caseBase.ajmc}-${this.currentTableData.title}`,
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
        };
        this.$electron.ipcRenderer.send("export-one-file-begin", args);
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