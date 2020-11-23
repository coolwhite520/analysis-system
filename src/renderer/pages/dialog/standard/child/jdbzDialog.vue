<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showJdbzDialogVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe63c;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        "收付标志设置"
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div style="font-size: 10px; color: #f29c38; margin-bottom: 20px">
      当文件中的收付标志与数据库中的收付标志（"进"，"出"）不一致的情况，需要手动输入文件中的相应匹配列下的文字内容，以便系统自动匹配录入。
    </div>
    <div>
      <span style="font-size: 10px; color: #30693d; margin-bottom: 20px"
        >提示：{{ this.formData.tips }}，如不确定输入内容，</span
      ><el-button type="text" size="mini" @click="handleClickOpenFile"
        >打开文件查看</el-button
      >
    </div>
    <el-form
      :model="formData"
      size="mini"
      label-width="80px"
      :rules="formRules"
      ref="formRule"
    >
      <el-form-item label="【进】：" prop="inFlag">
        <el-input
          v-model="formData.inFlag"
          placeholder="请输入文件中含义为【进帐】的文字内容"
        ></el-input>
      </el-form-item>
      <el-form-item label="【出】：" prop="outFlag">
        <el-input
          v-model="formData.outFlag"
          placeholder="请输入文件中含义为【出帐】的文字内容"
        ></el-input>
      </el-form-item>
    </el-form>
    <el-row style="text-align: center">
      <el-button type="primary" @click="onSubmit('formRule')" style="width: 90%"
        >保存设置</el-button
      ></el-row
    >
  </el-dialog>
</template>
<script>
import dataImport from "@/db/DataImport";
import { mapState } from "vuex";

export default {
  props: ["formData"],
  computed: {
    ...mapState("DialogPopWnd", ["showJdbzDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  data() {
    return {
      formRules: {
        inFlag: [{ required: true, message: "不能为空", trigger: "blur" }],
        outFlag: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
    };
  },
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let { id, inFlag, outFlag } = this.formData;
          this.$store.commit("DataCollection/SET_INOUT_FLAG_BY_ID", {
            id: id,
            inFlag: inFlag,
            outFlag: outFlag,
          });
          this.$store.commit("DialogPopWnd/SET_SHOWJDBZDIALOGVISIBLE", false);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async handleClickOpenFile() {
      await this.$electron.shell.openPath(this.formData.filePathName);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWJDBZDIALOGVISIBLE", false);
    },
  },
};
</script>
<style scoped>
/deep/.el-form-item__label {
  font-size: 10px;
}
</style>