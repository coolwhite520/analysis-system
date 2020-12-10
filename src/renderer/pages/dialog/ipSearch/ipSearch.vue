<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showIpDialogVisible"
    width="25%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe651;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-row
      style="margin-left: 20px; margin-bottom: 10px text-align: center"
      v-if="result"
    >
      <!-- <div><h3>查询结果</h3></div> -->
      <div style="font-size: 12px; color: green">IP地址：{{ result.ip }}</div>
      <div style="font-size: 12px; color: green">
        归属地：{{ result.Country }}
      </div>
      <div style="font-size: 12px; color: green">
        所在区域：{{ result.Area }}
      </div>
    </el-row>
    <el-row style="text-align: center">
      <el-input
        size="mini"
        v-model="ip"
        style="width: 90%"
        placeholder="请输入待查IP"
      ></el-input>
    </el-row>

    <el-row style="text-align: center; margin-top: 20px">
      <el-button
        size="small"
        style="width: 90%"
        type="primary"
        @click="handleClickSearch"
        >查询</el-button
      >
    </el-row>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
const fs = require("fs");
const path = require("path");

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showIpDialogVisible"]),
  },
  data() {
    return {
      title: "IP归属地查询",
      ip: "",
      result: null,
    };
  },
  mounted() {},
  methods: {
    isValidIP(ip) {
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      return reg.test(ip);
    },
    handleClickSearch() {
      if (this.ip === "") {
        this.$message({
          message: "ip输入框为空，请输入内容",
        });
        return;
      }
      if (!this.isValidIP(this.ip)) {
        this.$message({
          message: "您输入的ip地址格式错误。例如：0.0.0.0",
        });
        return;
      }
      this.result = this.$qqwry.searchIP(this.ip);
      console.log(this.result);
      var reg = /.+?(省|市|自治区|自治州|县|区)/g;
      let Country = this.result.Country;
      let res = Country.match(reg);
      if (res.length > 1) {
        this.result.Country = "";
        for (let item of res) {
          this.result.Country += item + ",";
        }
        this.result.Country = this.result.Country.slice(
          0,
          this.result.Country.length - 1
        );
      }
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWIPDIALOGVISIBLE", false);
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