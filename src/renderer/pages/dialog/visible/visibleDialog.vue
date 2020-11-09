<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible="showDataVisibilityDialogVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe607;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="推荐" name="first" style="text-align: center">
        <div
          class="myRadio"
          @click="handleClickSelect('1')"
          type="text"
          :style="{ color: selected === '1' ? '#1e1e1e' : 'gray' }"
        >
          <span class="iconfont">
            {{ selected === "1" ? "&#xe627;" : "&#xe611;" }}
          </span>
          <span>&nbsp;&nbsp;汇总&nbsp;&nbsp;</span>
          <img
            src="/static/images/icons/银行卡.png"
            width="50"
            height="50"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/row/row2.png"
            width="160"
            height="40"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/icons/银行卡.png"
            width="50"
            height="50"
            style="vertical-align: middle"
          />
        </div>
        <div
          class="myRadio"
          @click="handleClickSelect('2')"
          type="text"
          :style="{ color: selected === '2' ? '#1e1e1e' : 'gray' }"
        >
          <span class="iconfont">
            {{ selected === "2" ? "&#xe627;" : "&#xe611;" }}
          </span>
          <span>&nbsp;&nbsp;差额&nbsp;&nbsp;</span>
          <img
            src="/static/images/icons/银行卡.png"
            width="50"
            height="50"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/row/row1.png"
            width="160"
            height="28"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/icons/银行卡.png"
            width="50"
            height="50"
            style="vertical-align: middle"
          />
        </div>

        <el-row style="margin-top: 20px">
          <el-col :span="6">最小交易次数:</el-col>
          <el-col :span="14"> <el-input size="mini"></el-input></el-col>
          <el-col :span="4">&nbsp;</el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="6">最小交易金额:</el-col>
          <el-col :span="14"> <el-input size="mini"></el-input></el-col>
          <el-col :span="4">&nbsp;</el-col>
        </el-row>
        <el-row style="margin-top: 30px">
          <el-button size="small" type="primary" style="width: 50%"
            >确定</el-button
          >
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="自定义" name="second">自定义</el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showDataVisibilityDialogVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
    title() {
      return `数据可视化-${this.currentTableData.title}`;
    },
  },
  mounted() {
    // var canvas = document.getElementById("canvas1");
  },
  data() {
    return {
      activeName: "first",
      selected: "1",
    };
  },
  methods: {
    handleClickSelect(value) {
      if (this.selected !== value) this.selected = value;
    },
    handleClose() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWDATAVISIBILITYDIALOGVISIBLE",
        false
      );
    },
  },
};
</script>
<style scoped>
.myRadio {
  margin: 20px;
}
.myRadio:hover {
  border: 1px solid #dddfe5;
  border-radius: 5px;
  box-shadow: 1px 1px 10px 5px #ccdaee;
}
</style>
