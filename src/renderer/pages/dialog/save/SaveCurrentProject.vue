<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible.sync="showSaveProjectVisible"
    width="25%"
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
      <el-form-item label="预览:" size="mini">
        <el-row style="text-align: center; margin-bottom: 20px">
          <el-popover trigger="click" placement="top">
            <img
              :height="popOverPicHeigth"
              :width="popOverPicWidth"
              :src="base64src"
            />

            <img
              class="screenShotImage"
              slot="reference"
              :src="base64src"
              :height="PicHeigth"
              :width="PicWidth"
              style="border-radius: 5px; box-shadow: 0 0 10px #000"
            />
          </el-popover>
        </el-row>
      </el-form-item>
      <el-form-item label="名称:" size="mini" prop="name">
        <el-input
          v-model="formLabelAlign.name"
          placeholder="请输入名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="简要说明:" size="mini">
        <el-input
          type="textarea"
          v-model="formLabelAlign.des"
          placeholder="请输入简要说明"
        ></el-input>
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
const fs = require("fs");
const path = require("path");
export default {
  props: ["screenShotTmpFilePathName"],
  async mounted() {
    let widthDivHeight = this.$electron.remote.getGlobal("widthDivHeight");
    this.popOverPicWidth = parseInt(widthDivHeight * this.popOverPicHeigth);
    this.PicWidth = parseInt(widthDivHeight * this.PicHeigth);
    this.base64src = await this.convertToBase64Image(
      this.screenShotTmpFilePathName
    );
  },
  computed: {
    ...mapState("DialogPopWnd", ["showSaveProjectVisible"]),
  },
  data() {
    return {
      popOverPicHeigth: 500,
      popOverPicWidth: 0,
      PicHeigth: 120,
      PicWidth: 0,
      base64src: "",
      labelPosition: "top",
      title: "保存当前分析记录",
      formLabelAlign: {
        name: "",
        des: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          {
            min: 3,
            max: 16,
            message: "长度在 3 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    async convertToBase64Image(fileUrl) {
      const imageData = fs.readFileSync(fileUrl);
      const imageBase64 = imageData.toString("base64");
      const imagePrefix = "data:image/png;base64,";
      return imagePrefix + imageBase64;
    },
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
      this.$emit("confirmSaveProject", {
        confirm: false,
        title: "",
        des: "",
      });
      this.$store.commit("DialogPopWnd/SET_SHOWSAVEPROJECTVISIBLE", false);
    },
  },
};
</script>
<style  scoped>
.screenShotImage:hover {
  cursor: pointer;
}
</style>