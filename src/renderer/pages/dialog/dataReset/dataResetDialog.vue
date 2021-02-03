<template>
  <!-- top="30vh" -->
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showDataResetVisible"
    width="40%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe64b;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        title
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <div v-if="activities.length > 0">
        <el-row>
          <el-col :span="4">&nbsp;</el-col>
          <el-col :span="16">
            <div class="block">
              <div class="radio">
                <el-radio-group v-model="reverse">
                  <el-radio :label="true">倒序</el-radio>
                  <el-radio :label="false">正序</el-radio>
                </el-radio-group>
              </div>
              <el-checkbox
                :indeterminate="isIndeterminate"
                v-model="checkedAll"
                @change="handleChangeCheckAll"
                >全选</el-checkbox
              >
              <div style="height: 300px">
                <div class="importTimeLine">
                  <el-timeline :reverse="reverse">
                    <el-timeline-item
                      v-for="(activity, index) in activities"
                      :key="index"
                      :timestamp="activity.timestamp"
                      placement="top"
                    >
                      <el-card>
                        <el-checkbox
                          v-model="activity.checked"
                          @change="handleChangeBatch"
                          >批次编号：{{ activity.batch }}</el-checkbox
                        >
                        <div style="margin-top: 10px">
                          <span style="color: #3e4d6b"
                            ><b>本次明细文件：</b></span
                          ><span style="font-size: 10px; color: gray">{{
                            activity.files.join(",")
                          }}</span>
                        </div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="4">&nbsp;</el-col>
        </el-row>
        <el-row style="text-align: center">
          <el-button
            style="width: 50%"
            type="primary"
            @click="handleClickResetData"
            >确定恢复</el-button
          >
        </el-row>
      </div>
      <div v-else style="text-align: center">
        当前无记录，请先进行数据采集。
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import cases from "@/db/Cases";
import Base from "@/db/Base";
import dataImport from "@/db/DataImport";
const uuid = require("uuid");
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showDataResetVisible"]),
    ...mapState("CaseDetail", ["CollectionRecords", "caseBase"]),
  },

  async mounted() {
    console.log("Mounted");
    try {
      this.loading = true;
      let sjlyidsSource = await this.getBakSourceSjlyids();
      console.log(sjlyidsSource);
      let {
        success,
        rows,
        headers,
        rowCount,
      } = await cases.QueryCollectionRecords(this.caseBase.ajid, 0, 100000);
      if (success) {
        console.log(success, rows, headers, rowCount);
        rows.forEach((row) => {
          if (!sjlyidsSource.includes(row.sjlyid)) {
            return;
          }
          let obj = this.activities.find((item) => item.batch === row.batch);
          if (obj) {
            if (row.mbmc === "通用模板") {
              obj.files.push(row.filename);
              obj.sjlyids.push(row.sjlyid);
            }
          } else {
            if (row.mbmc === "通用模板") {
              this.activities.push({
                batch: row.batch,
                timestamp: row.drrq.Format("yyyy-MM-dd hh:mm:ss"),
                files: [row.filename],
                sjlyids: [row.sjlyid],
                checked: this.checkedAll,
              });
            }
          }
        });
        if (this.activities.length > 0) {
          this.activities = this.activities.sort((a, b) => {
            return a.batch - b.batch;
          });
        }
        this.loading = false;
      }
    } catch (e) {
      this.$message.error({
        message: "出错了：" + e.message,
      });
      this.loading = false;
    }
  },
  data() {
    return {
      loading: false,
      title: "数据恢复",
      reverse: true,
      activities: [],
      checkedAll: true,
      isIndeterminate: false,
    };
  },
  methods: {
    async getBakSourceSjlyids() {
      try {
        let sql = `SELECT DISTINCT sjlyid from gas_bank_records_source;`;
        let ret = await Base.QueryCustom(sql, this.caseBase.ajid);
        return ret.rows.map((row) => row.sjlyid);
      } catch (e) {
        return [];
      }
    },
    handleChangeBatch(val) {
      let checkCount = 0;
      this.activities.forEach((item) => {
        if (item.checked) checkCount++;
      });
      if (checkCount === 0) {
        this.checkedAll = false;
        this.isIndeterminate = false;
      } else {
        if (checkCount === this.activities.length) {
          this.isIndeterminate = false;
          this.checkedAll = true;
        } else {
          this.isIndeterminate = true;
        }
      }
    },
    handleChangeCheckAll(val) {
      this.activities.forEach((item) => {
        item.checked = val;
      });
      this.isIndeterminate = false;
    },
    async freshUI() {
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
    async handleClickResetData() {
      let sjlyids = [];
      let sjlyidsAll = [];
      this.activities.forEach((item) => {
        if (item.checked) sjlyids.push(...item.sjlyids);
        sjlyidsAll.push(...item.sjlyids);
      });
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message:
          sjlyids.length === 0
            ? `当前没有任何选择恢复条目，是要清空当前明细表吗？`
            : `数据重置将会清空当前明细记录、同时恢复到您所选的记录，您确定这样做吗？`,
        buttons: sjlyids.length === 0 ? ["是", "取消"] : ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        try {
          this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
          this.loading = true;
          // 清理抽取的数据
          if (sjlyids.length === 0) {
            // 清理抽取的数据
            for (let sjlyid of sjlyidsAll) {
              await cases.DeleteCollectionRecords(this.caseBase.ajid, sjlyid, [
                "gas_bank_records",
                "gas_bank_records_source",
                "st_data_source",
              ]);
            }
            // 清理抽取的数据
            for (let sjlyid of sjlyidsAll) {
              await cases.DeleteCollectionRecords(this.caseBase.ajid, sjlyid, [
                "gas_bank_records",
                "gas_bank_records_source",
                "st_data_source",
              ]);
            }
            // 清理gas_bank_records，并导入备份数据
            let sql = `DELETE from gas_bank_records;`;
            await Base.QueryCustom(sql, this.caseBase.ajid);
          } else {
            for (let sjlyid of sjlyidsAll) {
              await cases.DeleteCollectionRecords(this.caseBase.ajid, sjlyid, [
                "gas_bank_records",
                "gas_bank_records_source",
                "st_data_source",
              ]);
            }
            // 清理gas_bank_records，并导入备份数据
            let sql = `DELETE from gas_bank_records;
                INSERT into gas_bank_records SELECT * from gas_bank_records_source 
                WHERE sjlyid in (${sjlyids});`;
            await Base.QueryCustom(sql, this.caseBase.ajid);
            // 从导入的表格中抽取数据
            sql = await dataImport.getDataResetExtractSqlByGasbankrecords(
              "gas_bank_records",
              uuid.v1(),
              sjlyids
            );
            await Base.QueryCustom(sql, this.caseBase.ajid);
          }
          this.loading = false;
          await this.freshUI();
          this.handleClose();
        } catch (e) {
          this.loading = false;
          this.$message.error({
            message: e.message,
          });
        }
      }
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWDATARESETVISIBLE", false);
    },
  },
};
</script>
<style scoped>
.radio {
  margin-bottom: 20px;
  text-align: center;
}
.importTimeLine {
  padding: 5px;
  height: 300px;
  overflow: auto;
}
</style>