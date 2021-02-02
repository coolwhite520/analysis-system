<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showDataComplementVisible"
    width="50%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe645;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div v-loading="loading" :element-loading-text="loadingText">
      <el-row>
        <el-col :span="12" style="text-align: left; font-size: 10px">
          可补数据：<span style="color: #d15e27"
            ><b>{{ num }}</b>
          </span>
          &nbsp; &nbsp; &nbsp; &nbsp;待补空数据：<span style="color: green"
            ><b>{{ count }}</b></span
          >
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-switch
            style="display: block"
            v-model="switchValue"
            active-color="#13ce66"
            inactive-color="#ff4949"
            inactive-text="按已调单补全"
            active-text="全部补全"
            @change="handleChangeSwitch"
          >
          </el-switch>
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px">
        <el-table
          ref="multipleTable"
          style="width: 100%"
          :data="dataShowRows"
          size="mini"
          :max-height="300"
          :height="300"
          stripe
          border
        >
          <el-table-column
            fixed
            type="index"
            label="编号"
            header-align="center"
            align="center"
          ></el-table-column>
          <el-table-column
            header-align="center"
            align="center"
            label="卡号（主账号）"
            prop="Zh"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="户名"
            show-overflow-tooltip
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.ZhmcIsenable">
                <el-select
                  :value="scope.row.Zhmc"
                  placeholder="请选择"
                  size="mini"
                  @change="
                    (val) => {
                      handleChangeDataZhmc(val, scope.$index);
                    }
                  "
                >
                  <el-option
                    v-for="(item, index) in scope.row.ZhmcList"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
              <div v-else style="color: gray">
                {{ scope.row.Zhmc }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="开户银行"
            show-overflow-tooltip
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.KhyhIsenable">
                <el-select
                  :value="scope.row.Khyh"
                  placeholder="请选择"
                  size="mini"
                  @change="
                    (val) => {
                      handleChangeDataKhyh(val, scope.$index);
                    }
                  "
                >
                  <el-option
                    v-for="(item, index) in scope.row.KhyhList"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
              <div v-else style="color: gray">
                {{ scope.row.Khyh }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="证件号码"
            show-overflow-tooltip
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.ZzhmIsenable">
                <el-select
                  :value="scope.row.Zzhm"
                  placeholder="请选择"
                  size="mini"
                  @change="
                    (val) => {
                      handleChangeDataZzhm(val, scope.$index);
                    }
                  "
                >
                  <el-option
                    v-for="(item, index) in scope.row.ZzhmList"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
              <div v-else style="color: gray">
                {{ scope.row.Zzhm }}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px; text-align: right">
          <el-pagination
            small
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage4"
            :page-sizes="[50, 100, 150, 200, 300]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.dataRows.length"
          >
          </el-pagination>
        </div>
      </el-row>
      <el-row style="text-align: center; margin-top: 20px">
        <el-button @click="handleClose" style="width: 35%" size="medium"
          >取消</el-button
        >
        <el-button
          @click="handleClickSure"
          :disabled="count === 0"
          type="primary"
          style="width: 35%"
          size="medium"
          >确定补全</el-button
        >
      </el-row>
    </div>
    <el-progress v-if="percentage > 0" :percentage="percentage"></el-progress>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", ["showDataComplementVisible"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  async mounted() {
    this.loading = true;
    this.$electron.ipcRenderer.on("data-completion-ready", (e, data) => {
      console.log("data-completion-ready.....");
      this.isDataCompletionReady = true;
    });
    this.$electron.ipcRenderer.on("data-completion-end", (e, args) => {
      let { success, type, msg, data } = args;
      this.loading = false;
      if (success) {
        if (type === "select") {
          let { dataRows, num, count } = data;
          this.dataRows = dataRows;
          this.dataShowRows = this.dataRows.slice(0, this.pageSize);
          this.num = num;
          this.count = count;
        } else if (type === "progress") {
          this.loading = true;
          this.percentage = data.percentage;
        } else {
          this.$message({
            message: "补全数据成功！",
            type: "success",
          });
          // this.handleClose();
          // 更新当前的展示列表中的数据;
          for (let tableData of this.tableDataList) {
            // 根据tableName获取表的数据
            if (tableData.tableType === "base") {
              this.$store.dispatch(tableData.dispatchName, {
                ...tableData,
                offset: 0,
                count: 30,
              });
            }
          }
        }
      } else {
        this.$message({
          message: msg,
        });
      }
    });
    this.$electron.ipcRenderer.send("data-completion-open");
    console.log("is not ok....");
    await this.waitForProcessReady();
    console.log("is ok....");
    await this.sleep(1000 * 2);
    this.$electron.ipcRenderer.send("data-completion-begin", {
      ajid: this.caseBase.ajid,
      type: "select",
      val: false,
    });
  },
  destroyed() {
    this.$electron.ipcRenderer.removeAllListeners("data-completion-end");
    this.$electron.ipcRenderer.removeAllListeners("data-completion-ready");
  },
  data() {
    return {
      isDataCompletionReady: false,
      loadingText: "查询数据较多，正在拼命计算中...",
      num: 0,
      count: 0,
      percentage: 0,
      switchValue: false,
      currentPage4: 1,
      pageSize: 50,
      title: "数据补全",
      dataRows: [],
      dataShowRows: [],
      loading: false,
      dataSupplementInstance: null,
    };
  },
  methods: {
    async sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("done");
        }, ms);
      });
    },
    async waitForProcessReady() {
      while (true) {
        if (this.isDataCompletionReady) {
          break;
        }
        await this.sleep(200);
      }
    },
    async handleChangeSwitch(val) {
      this.loading = true;
      this.loadingText = "查询数据较多，正在拼命计算中...";
      this.$electron.ipcRenderer.send("data-completion-begin", {
        ajid: this.caseBase.ajid,
        type: "select",
        val,
      });
    },
    async handleClickSure() {
      this.loading = true;
      this.percentage = 0;
      this.loadingText = "执行更新任务量较大，请耐心等待...";
      this.$electron.ipcRenderer.send("data-completion-begin", {
        ajid: this.caseBase.ajid,
        type: "update",
        data: { dataRows: this.dataRows },
      });
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.dataShowRows = this.dataRows.slice(0, val);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.dataShowRows = this.dataRows.slice(
        this.pageSize * (val - 1),
        this.pageSize * val
      );
    },
    handleChangeDataZhmc(val, index) {
      this.dataShowRows[index].Zhmc = val;
      this.dataRows[this.pageSize * (this.currentPage4 - 1) + index].Zhmc = val;
    },
    handleChangeDataKhyh(val, index) {
      this.dataShowRows[index].Khyh = val;
      this.dataRows[this.pageSize * (this.currentPage4 - 1) + index].Khyh = val;
    },
    handleChangeDataZzhm(val, index) {
      this.dataShowRows[index].Zzhm = val;
      this.dataRows[this.pageSize * (this.currentPage4 - 1) + index].Zzhm = val;
    },
    handleClose() {
      this.$electron.ipcRenderer.send("data-completion-close");
      this.$store.commit("DialogPopWnd/SET_SHOWDATACOMPLEMENTVISIBLE", false);
    },
  },
};
</script>

<style scoped>
.logo {
  font-size: 100px;
  text-align: center;
  color: #313f57;
}
</style>