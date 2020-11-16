<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showAwaitTaskDialogVisible"
    width="60%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe748;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        title
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-row>
      <el-col :span="12" style="text-align: left">
        <el-button-group>
          <el-button
            type="primary"
            size="mini"
            round
            @click="handleClickBtn('1')"
            >人（{{ 0 }}）</el-button
          >
          <el-button
            type="primary"
            size="mini"
            round
            @click="handleClickBtn('2')"
            >单位（{{ 0 }}）</el-button
          >
          <el-button
            type="primary"
            size="mini"
            round
            @click="handleClickBtn('3')"
            >账（卡）号（{{ 0 }}）</el-button
          >
        </el-button-group>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button-group>
          <el-button type="primary" size="mini" icon="el-icon-folder-add" round
            >新增</el-button
          >
          <el-button type="primary" size="mini" icon="el-icon-edit" round
            >编辑</el-button
          >
          <el-button type="primary" size="mini" icon="el-icon-delete" round
            >删除</el-button
          >
          <el-button type="primary" size="mini" icon="el-icon-upload2" round
            >导出</el-button
          >
        </el-button-group>
      </el-col>
    </el-row>

    <div v-if="showItem === '1'">1</div>
    <div v-else-if="showItem === '2'">2</div>
    <div v-else-if="showItem === '3'">3</div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import baseDb from "@/db/Base";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showAwaitTaskDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  data() {
    return {
      title: "待调单任务",
      showItem: "1",
    };
  },
  async mounted() {},
  methods: {
    handleClickBtn(val) {
      this.showItem = val;
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWAWAITTASKDIALOGVISIBLE", false);
    },
  },
};
</script>
