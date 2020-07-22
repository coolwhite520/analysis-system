<template>
  <div>
    <el-dialog
      v-dialogDrag
      class="auto-data-dialog"
      :close-on-click-modal="false"
      title="智能数据采集"
      :visible.sync="autoDataVisible"
      width="60%"
      :before-close="handleClose"
      :modal="false"
    >
      <div>
        <el-steps :active="currentStepIndex" finish-status="success">
          <el-step title="选择文件"></el-step>
          <el-step title="解析并校对文件内容"></el-step>
          <el-step title="导入文件"></el-step>
        </el-steps>
      </div>
      <el-row style="text-align:center;margin-top:20px;">
        <el-col :span="8">
          <div style="float:left;">
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex!==1"
              @click="handleClickSelectFile"
            >选择文件</el-button>
            <span style="font-size:10px;">支持格式：txt、csv、xls、xlsx</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div>
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex!==2"
              @click="handleClickAnalysis"
            >解析文件</el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div style="float:right;">
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex!==3"
              @click="handleClickImportFile"
            >导入文件</el-button>
          </div>
        </el-col>
      </el-row>

      <el-table
        :data="tableData"
        height="100%"
        border
        style="width: 100%;margin-top: 20px;"
        size="mini"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="序号" width="60"></el-table-column>
        <el-table-column prop="name" label="文件来源"></el-table-column>
        <el-table-column prop="address" label="文件名称"></el-table-column>
        <el-table-column prop="address" label="文件类型"></el-table-column>
        <el-table-column prop="address" label="状态"></el-table-column>
      </el-table>

      <el-progress :text-inside="true" :stroke-width="26" :percentage="70"></el-progress>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["autoDataVisible"])
  },
  data() {
    return {
      currentStepIndex: 1,
      value: 0,
      options: [],
      tableData: []
    };
  },
  components: {},
  methods: {
    handleClose() {
      this.currentStepIndex = 1;
      this.$store.commit("DialogPopWnd/SET_AUTODATAVISIBAL", false);
    },
    handleClickSelectFile() {
      this.currentStepIndex++;
    },
    handleClickAnalysis() {
      this.currentStepIndex++;
    },
    handleClickImportFile() {
      this.currentStepIndex = 1;
    }
  }
};
</script>

<style>
.auto-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
}
.auto-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
.auto-data-dialog .el-dialog__title {
  color: white;
}
</style>

