<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible.sync="showSaveProjectVisible"
    width="20%"
    :before-close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe815;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-form
      :label-position="labelPosition"
      label-width="80px"
      :model="formLabelAlign"
      :rules="rules"
      ref="ruleForm"
    >
      <el-form-item label="名称:" size="mini" prop="name">
        <el-input v-model="formLabelAlign.name"></el-input>
      </el-form-item>
      <el-form-item label="简要说明" size="mini">
        <el-input type="textarea" v-model="formLabelAlign.des"></el-input>
      </el-form-item>
    </el-form>
    <el-row style="text-align: center">
      <el-button
        size="mini"
        @click="handleClickConfirm('ruleForm')"
        type="primary"
        >保存</el-button
      >
      <el-button size="mini" @click="handleClose">取消</el-button>
    </el-row>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showSaveProjectVisible"]),
  },
  data() {
    return {
      labelPosition: "left",
      title: "保存当前分析记录",
      formLabelAlign: {
        name: "",
        des: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    handleClickConfirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("confirmSaveProject", {
            confirm: true,
            title: this.formLabelAlign.name,
            des: this.formLabelAlign.des,
          });
          this.$store.commit("DialogPopWnd/SET_SHOWSAVEPROJECTVISIBLE", false);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWSAVEPROJECTVISIBLE", false);
    },
  },
};
</script>
