<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :append-to-body="true"
      :title="title"
      :visible="nodeCombineVisible"
      width="30%"
      @close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe629;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <el-table
        :data="tableData"
        max-height="250"
        border
        style="width: 100%"
        size="mini"
      >
        <el-table-column prop="kh" label="卡号" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="name" label="姓名" show-overflow-tooltip>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              @click="handleClickDeleteRow(scope.$index)"
              type="text"
              size="small"
              icon="el-icon-delete"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-row style="margin-top: 20px">
        <el-form
          ref="ruleForm"
          :rules="rules"
          :model="ruleForm"
          label-width="100px"
        >
          <el-form-item label="新组名称：" prop="comboName">
            <el-input
              v-model="ruleForm.comboName"
              size="small"
              placeholder="请填写新的分组名称"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row style="text-align: center">
        <el-button type="primary" @click="submitForm('ruleForm')" size="medium"
          >确定合并</el-button
        >
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Default from "@/utils/sql/Default.js";
export default {
  props: ["nodes"],
  mounted() {
    console.log(this.nodes);
  },
  computed: {
    ...mapState("DialogPopWnd", ["nodeCombineVisible"]),
    tableData() {
      return this.nodes.map((node) => {
        return node.get("model");
      });
    },
  },
  data() {
    return {
      title: "节点合并",
      ruleForm: {
        comboName: "",
      },
      rules: {
        comboName: [
          { required: true, message: "请填写新的分组名称", trigger: "blur" },
          {
            min: 3,
            max: 18,
            message: "长度在 3 到 18 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", false);
    },
    handleClickColorConfirm() {
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", false);
    },
    handleClickDeleteRow(index) {
      if (this.nodes.length === 2) {
        this.$message({
          message: "节点合并不能少于两个节点！",
          type: "warning",
        });
        return;
      }
      this.$emit("updateCombineNodes", index);
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("confirmCombine", { comboName: this.ruleForm.comboName });
          this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", false);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>
