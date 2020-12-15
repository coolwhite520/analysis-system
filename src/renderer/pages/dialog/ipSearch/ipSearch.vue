<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showIpDialogVisible"
    width="30%"
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
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="IP归属地查询与解析" name="first"
        ><el-row
          style="margin-left: 20px; margin-bottom: 10px text-align: center"
          v-if="result"
        >
          <!-- <div><h3>查询结果</h3></div> -->
          <div style="font-size: 12px; color: green">
            IP地址：{{ result.ip }}
          </div>
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
        </el-row></el-tab-pane
      >
      <el-tab-pane label="IP批量解析回写" name="second">
        <div style="font-size: 12px">
          <b>批量解析会解析资金明细中已存在的IP地址，并将解析结果重新入库。</b>
        </div>
        <div style="font-size: 10px">
          当前资金明细表中存在有效IP的条目数量为：<span style="color: #efb041"
            >{{ countIP }}
          </span>
          (个)
        </div>
        <div style="font-size: 10px">解析所有IP会覆盖已有地区信息条目。</div>
        <div style="font-size: 10px">
          当前资金明细表中未解析的有效IP的条目数量为：<span
            style="color: #efb041"
            >{{ countIPNoAnalysis }}
          </span>
          (个)
        </div>
        <div style="font-size: 10px">解析部分IP仅更新地区信息为空的条目。</div>
        <el-progress
          style="margin-top: 10px"
          v-if="percentage > 0"
          :percentage="percentage"
          color="#85df70"
        ></el-progress>
        <el-row style="text-align: center; margin-top: 10px">
          <el-button
            size="mini"
            type="primary"
            style="width: 40%"
            @click="handleClickAnalysis"
            :loading="loading"
            :disabled="countIPNoAnalysis === 0"
            >解析部分IP（{{ countIPNoAnalysis }}）个</el-button
          ><el-button
            size="mini"
            type="primary"
            style="width: 40%"
            @click="handleClickAnalysisAll"
            :loading="loading"
            >解析所有IP（{{ countIP }}）个</el-button
          ></el-row
        >
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import Base from "@/db/Base";
const fs = require("fs");
const path = require("path");
let citys = "北京市，天津市，上海市，重庆市，香港特别行政区，澳门特别行政区".split(
  "，"
);
let provinces = "河北省，山西省，辽宁省，吉林省，黑龙江省，江苏省，浙江省，安徽省，福建省，江西省，山东省，河南省，湖北省，湖南省，广东省，海南省，四川省，贵州省，云南省，陕西省，甘肃省，青海省，台湾省".split(
  "，"
);
let zzq = "内蒙古自治区，广西壮族自治区，西藏自治区，宁夏回族自治区，新疆维吾尔自治区".split(
  "，"
);
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showIpDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  data() {
    return {
      title: "IP归属地查询",
      ip: "",
      result: null,
      activeName: "first",
      countIP: 0,
      countIPNoAnalysis: 0,
      existIpRows: [],
      notAnalysisIpRows: [],
      percentage: 0,
      loading: false,
    };
  },
  async mounted() {
    await this.fresh();
  },
  methods: {
    async fresh() {
      try {
        let sql = `select shard_id,ip from gas_bank_records where length(ip)>0 order by shard_id`;
        let res = await Base.QueryCustom(sql, this.caseBase.ajid);
        this.existIpRows = res.rows.filter((row) => this.isValidIP(row.ip));
        this.countIP = this.existIpRows.length;

        let sql2 = `select shard_id,ip from gas_bank_records where length(ip)>0 and length(jyfsd)=0 order by shard_id`;
        res = await Base.QueryCustom(sql2, this.caseBase.ajid);
        this.notAnalysisIpRows = res.rows.filter((row) =>
          this.isValidIP(row.ip)
        );
        this.countIPNoAnalysis = this.notAnalysisIpRows.length;
      } catch (e) {
        console.log(e);
      }
    },
    async handleClickAnalysisAll() {
      try {
        this.loading = true;
        let index = 0;
        for (let item of this.existIpRows) {
          if (!this.showIpDialogVisible) return;
          let ip = item.ip.replace(/^\s+|\s+$/g, "");
          if (this.isValidIP(ip)) {
            let result = this.$qqwry.searchIP(ip);
            let Country = result ? result.Country : "";
            let allArea = citys.concat(provinces).concat(zzq);
            let findCountry = allArea.find((value) => value.includes(Country));
            if (findCountry) {
              Country = findCountry;
            }
            let updateSql = `update gas_bank_records set jyfsd='${Country}' where shard_id=${item.shard_id};`;
            await Base.QueryCustom(updateSql, this.caseBase.ajid);
            console.log(index);
            index++;
            this.percentage = parseInt((index / this.countIP) * 100);
          }
        }
      } catch (e) {
        console.log(e);
      }
      this.percentage = 0;
      this.loading = false;
      await this.fresh();
    },
    async handleClickAnalysis() {
      try {
        let index = 0;
        this.loading = true;
        for (let item of this.notAnalysisIpRows) {
          if (!this.showIpDialogVisible) return;
          let ip = item.ip.replace(/^\s+|\s+$/g, "");
          if (this.isValidIP(ip)) {
            let result = this.$qqwry.searchIP(ip);
            let Country = result ? result.Country : "";
            let allArea = citys.concat(provinces).concat(zzq);
            let findCountry = allArea.find((value) => value.includes(Country));
            if (findCountry) {
              Country = findCountry;
            }
            let updateSql = `update gas_bank_records set jyfsd='${Country}' where shard_id=${item.shard_id};`;
            await Base.QueryCustom(updateSql, this.caseBase.ajid);
            console.log(index);
            index++;
            this.percentage = parseInt((index / this.countIPNoAnalysis) * 100);
          } else {
            console.log(ip);
          }
        }
      } catch (e) {
        console.log(e);
      }
      this.percentage = 0;
      this.loading = false;
      await this.fresh();
    },
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