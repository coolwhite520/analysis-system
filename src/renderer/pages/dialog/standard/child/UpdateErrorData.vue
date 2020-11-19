<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showUpdateErrorDialogVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe660;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        errorData.title
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-row
      v-loading="isUpdateDataLoading"
      :element-loading-text="updateloadingText"
    >
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="22">
        <div v-if="errorData.filterName === 'exceedLen'">
          <div>
            <div style="margin-bottom: 10px">长度超过了限制长度`</div>
            <div style="font-size: 10px; margin-bottom: 5px">
              请输入新的数据进行批量覆盖：
            </div>
            <el-input
              size="mini"
              v-model="input"
              placeholder="请输入内容"
            ></el-input>
          </div>
        </div>
        <div v-else-if="errorData.filterName === 'notNum'">
          <div>
            <div style="margin-bottom: 10px">当前列的数据不是数字类型</div>
            <div style="font-size: 10px; margin-bottom: 5px">
              请输入新的数据进行批量覆盖：
            </div>
            <el-input
              size="mini"
              type="number"
              v-model="input"
              placeholder="请输入数字"
            ></el-input>
          </div>
        </div>
        <div v-else-if="errorData.filterName === 'notDate'">
          <div>
            <div style="margin-bottom: 10px">当前列的数据不是日期类型</div>
            <div style="font-size: 10px; margin-bottom: 5px">
              请输入新的数据进行批量覆盖：
            </div>
            <!-- <el-input size="mini" type="datetime" v-model="input" placeholder="请输入内容"></el-input>
                -->
            <el-date-picker
              :editable="false"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="date"
              placeholder="选择立案日期"
              v-model="input"
              style="width: 100%"
            ></el-date-picker>
          </div>
        </div>

        <el-row style="margin-top: 20px; text-align: center">
          <el-button type="primary" @click="handleClickSubmitModify"
            >提交修改</el-button
          >
        </el-row>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import dataImport from "@/db/DataImport";
import { mapState } from "vuex";

export default {
  props: ["errorData"],
  computed: {
    ...mapState("DialogPopWnd", ["showUpdateErrorDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  data() {
    return {
      filterList: ["exceedLen", "notNum", "notDate"],
      input: "",
      innerDlgTitle: "",
      isUpdateDataLoading: false,
      updateloadingText: "正在进行数据更新，请稍后...",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWUPDATEERRORDIALOGVISIBLE",
        false
      );
    },
    async handleClickSubmitModify() {
      if (this.input.length > 0) {
        try {
          this.isUpdateDataLoading = true;
          const { ajid } = this.caseBase;
          for (let item of this.errorData.errorList) {
            let { sheetItem, errorFieldObj } = item;
            const { headers, tableName, id } = sheetItem;
            let result = await dataImport.updateErrorRows(
              ajid,
              tableName,
              errorFieldObj.fieldename,
              this.input,
              errorFieldObj.rownums
            );
            await this.$store.dispatch("DataCollection/QueryErrorData", {
              id,
              ajid,
              tableName,
              matchedFields: sheetItem.matchedFields,
              index: 0,
              filterList: this.filterList,
              limit: 1,
              headers,
            });
          }
          this.$message({
            title: "成功",
            message: `数据更新成功！`,
            type: "success",
          });
          this.isUpdateDataLoading = false;
          this.$store.commit(
            "DialogPopWnd/SET_SHOWUPDATEERRORDIALOGVISIBLE",
            false
          );
        } catch (e) {
          this.$message.error({
            title: "错误",
            message: `数据更新错误,` + e.message,
          });
          this.isUpdateDataLoading = false;
          this.$store.commit(
            "DialogPopWnd/SET_SHOWUPDATEERRORDIALOGVISIBLE",
            false
          );
        }
      } else {
        this.$message.error({
          title: "错误",
          message: `输入框为空，请输入。`,
        });
      }
    },
  },
};
</script>