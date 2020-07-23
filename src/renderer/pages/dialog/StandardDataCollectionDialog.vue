<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      title="标准数据采集"
      :visible.sync="standardDataVisible"
      width="80%"
      :before-close="handleClose"
      :modal="false"
    >
      <div v-loading="loading">
        <el-row>
          <el-button-group>
            <el-button
              size="mini"
              v-for="item of buttonGroupList"
              :key="item.id"
              @click="handleClickImportData(item.pdm)"
            >
              <span class="mybutton iconfont" v-html="item.icon"></span>
              <span>{{item.mc}}</span>
            </el-button>
          </el-button-group>
          <!-- <el-col :span="1">
          <div>
            <el-button size="mini">模版下载</el-button>
          </div>
          </el-col>-->
        </el-row>
        <!-- <div style="height: 200px;">
      <test-table></test-table>
        </div>-->
        <div style="margin-top:20px;" v-show="renderDataList.length > 0">
          <el-table
            ref="multipleTable"
            :data="renderDataList"
            height="200"
            border
            style="width: 100%"
            size="mini"
            @selection-change="handleSelectionChange"
            highlight-current-row
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="orderno" label="序号" width="60" fixed type="index"></el-table-column>
            <el-table-column prop="fileName" label="工作簿（文件名）" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sheetName" label="工作表（sheet）" show-overflow-tooltip></el-table-column>
            <el-table-column prop="match" label="匹配目标表" show-overflow-tooltip></el-table-column>
          </el-table>
        </div>
        <div style="margin-top:20px;" v-if="currentRow">
          <el-table
            :data="currentRow ? currentRow.dataList : []"
            height="200"
            border
            style="width: 100%"
            size="mini"
          >
            <el-table-column prop="id" label="序号" width="60" type="index" fixed></el-table-column>
            <el-table-column prop="field_name" label="文件字段" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ins1" label="文件表数据实例1" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ins2" label="文件表数据实例2" show-overflow-tooltip></el-table-column>
            <el-table-column prop="dbcol" label="数据库字段" show-overflow-tooltip></el-table-column>
            <el-table-column prop="operation" label="操作" show-overflow-tooltip></el-table-column>
          </el-table>
          <div style="margin-top:20px;text-align: center;">
            <el-button>数据导入</el-button>
          </div>
        </div>
      </div>
      <!-- <el-row>
        批次选择：
        <el-select v-model="value" placeholder="请选择导入批次" size="mini">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-row>-->
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import path from "path";
import { BrowserWindow } from "electron";
export default {
  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on("read-csv-file-over", (event, data) => {
      _this.$store.commit("DataCollection/ADD_CSV_DATA_TO_LIST", data);
    });
  },
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible"]),
    ...mapState("DataCollection", ["buttonGroupList", "exampleDataList"]),
    ...mapGetters("DataCollection", ["renderDataList"]),
  },
  watch: {
    renderDataList(newValue, oldValue) {
      this.loading = false;
      this.$refs.multipleTable.setCurrentRow(newValue[0]);
      // this.$refs.multipleTable.toggleRowSelection(
      //   newValue[newValue.length - 1]
      // );
      // console.log(newValue[newValue.length - 1]);
    },
  },
  data() {
    return {
      loading: false,
      value: 0,
      currentRow: null,
    };
  },
  components: {},
  methods: {
    handleClose() {
      this.currentStepIndex = 1;
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
    },
    handleSelectionChange(val) {
      console.log(val);
      this.multipleSelection = val;
    },
    handleCurrentChange(val) {
      console.log(val);
      this.currentRow = val;
    },
    async handleClickImportData(pdm) {
      console.log(pdm);
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据导入",
          buttonLabel: "打开",
          filters: [
            { name: "Files", extensions: ["txt", "csv", "xls", "xlsx"] },
          ],
          properties: ["openFile", "multiSelections"],
        }
      );
      console.log(filePathList);
      if (typeof filePathList !== "undefined") {
        this.loading = true;
        for (let filePathName of filePathList) {
          let ext = path.extname(filePathName);
          switch (ext) {
            case ".txt":
              {
              }
              break;
            case ".csv":
              {
                console.log(filePathName);
                this.$electron.ipcRenderer.send("read-csv-file", filePathName);
              }
              break;
            case ".xls":
              {
              }
              break;
            case ".xlsx":
              {
              }
              break;
          }
        }
        console.log("over");
        // this.loading = false;
      }
    },
  },
};
</script>

<style>
.standard-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
}
.standard-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
.standard-data-dialog .el-dialog__title {
  color: white;
}
</style>

