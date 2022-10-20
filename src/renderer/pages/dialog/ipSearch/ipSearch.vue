<template>
  <el-dialog v-dialogDrag :close-on-click-modal="false" class="standard-data-dialog" :append-to-body="true"
    :visible="showIpDialogVisible" width="30%" @close="handleClose" :modal="true">
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe651;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="IP归属地查询与解析" name="first">
        <el-row style="margin-left: 20px; margin-bottom: 10px text-align: center" v-if="result">
          <!-- <div><h3>查询结果</h3></div> -->
          <div style="font-size: 12px">
            IP地址：<span style="color: green">{{ result.ip }}</span>
          </div>
          <div style="font-size: 12px">
            国家：<span style="color: green">{{ result.Country }}</span>
          </div>
          <div style="font-size: 12px">
            省份：<span style="color: green">{{ result.Province }}</span>
          </div>
          <div style="font-size: 12px">
            城市：<span style="color: green">{{ result.City }}</span>
          </div>
          <div style="font-size: 12px">
            区、县、地级市：<span style="color: green">{{
            result.Region
            }}</span>
          </div>
        </el-row>
        <el-row style="text-align: center">
          <el-input size="mini" v-model="ip" style="width: 90%" placeholder="请输入待查IP"></el-input>
        </el-row>

        <el-row style="text-align: center; margin-top: 20px">
          <el-button size="small" style="width: 90%" type="primary" @click="handleClickSearch">查询</el-button>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="IP批量解析回写" name="second">
        <div style="font-size: 12px">
          <b>批量解析会解析资金明细中已存在的IP地址，并将解析结果重新入库。</b>
        </div>
        <div style="font-size: 10px">
          当前资金明细表中存在有效IP的条目数量为：<span style="color: #efb041">{{ countIP }}
          </span>
          (个)
        </div>
        <div style="font-size: 10px">解析所有IP会覆盖已有地区信息条目。</div>
        <div style="font-size: 10px">
          当前资金明细表中未解析的有效IP的条目数量为：<span style="color: #efb041">{{ countIPNoAnalysis }}
          </span>
          (个)
        </div>
        <div style="font-size: 10px">解析部分IP仅更新地区信息为空的条目。</div>
        <el-progress style="margin-top: 10px" v-if="percentage > 0" :percentage="percentage" color="#85df70">
        </el-progress>
        <el-row style="text-align: center; margin-top: 10px">
          <el-button size="mini" type="primary" style="width: 40%" @click="handleClickAnalysis" :loading="loading"
            :disabled="countIPNoAnalysis === 0">解析部分IP（{{ countIPNoAnalysis }}）个</el-button>
          <el-button size="mini" type="primary" style="width: 40%" @click="handleClickAnalysisAll" :loading="loading">
            解析所有IP（{{ countIP }}）个</el-button>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import Base from "@/db/Base";
const fs = require("fs");
const path = require("path");
import IpDataBase from "@/utils/ip/ipp";

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showIpDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  data() {
    return {
      title: "IP归属地查询",
      ip: "119.15.84.78",
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
    if (!this.$ipsearch) {
      try {
        // 初始化ip解析库
        let baseDbFilePath = path.join(global.vendorPath, "base", "ips.dat");
        if (process.env.NODE_ENV !== "production") {
          baseDbFilePath = "/Users/baiyang/Desktop/ips.dat";
        }
        await IpDataBase.initIPDataBase(baseDbFilePath);
        this.$ipsearch = IpDataBase;
      } catch (e) {
        this.$message.error({
          message: "ip解析库初始化失败，请查看ip库是否存在." + e.message,
        });
      }
    }
    await this.fresh();
  },
  methods: {
    async freshNowUI() {
      // 更新采集批次等一批数据
      await this.$store.dispatch(
        "CaseDetail/queryEntityCount",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryAwaitTaskCount",
        this.caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        this.caseBase.ajid
      );
      //
      // 更新当前的展示列表中的数据;
      for (let tableData of this.tableDataList) {
        console.log(tableData);
        // 根据tableName获取表的数据
        if (tableData.componentName !== "no-data-view") {
          this.$store.dispatch(tableData.dispatchName, {
            ...tableData,
            offset: 0,
            count: 30,
          });
        }
      }
    },
    async fresh() {
      try {
        let sql = `select shard_id,ip from mz_bank_records where length(ip)>0 order by shard_id`;
        let res = await Base.QueryCustom(sql, this.caseBase.ajid);
        this.existIpRows = res.rows.filter((row) => this.isValidIP(row.ip));
        this.countIP = this.existIpRows.length;

        let sql2 = `select shard_id,ip from mz_bank_records where length(ip)>0 and length(ipgj)=0 order by shard_id`;
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
            let strLocation = this.$ipsearch.FindLocationByIp(ip);
            if (strLocation.length > 0) {
              // 亚洲|中国|北京|北京|丰台||110106|China|CN|116.28625|39.8585
              let arr = strLocation.split("|");
              let result = {
                ip,
                Continent: arr[0], // 大洲
                Country: arr[1], // 国家
                Province: arr[2], // 省份直辖市
                City: arr[3], // 城市
                Region: arr[4], // 区
                X: arr[5], // 运营商
                PostNo: arr[6],
                EnName: arr[7], //英文名
                EnJianCheng: arr[8], // 简称
                Longitude: arr[9], // 经度
                Latitude: arr[10], // 纬度
              };
              let updateSql = `update mz_bank_records set ipgj='${result.Country}', 
              ipsf='${result.Province}', 
              ipcs='${result.City}', 
              ipdq='${result.Region}',
              iplong=${result.Longitude},
              iplati=${result.Latitude}
               where shard_id=${item.shard_id};`;
              await Base.QueryCustom(updateSql, this.caseBase.ajid);
              index++;
              this.percentage = parseInt(
                (index / this.countIPNoAnalysis) * 100
              );
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
      this.percentage = 0;
      this.loading = false;
      await this.fresh();
      this.freshNowUI();
    },
    async handleClickAnalysis() {
      try {
        let index = 0;
        this.loading = true;
        for (let item of this.notAnalysisIpRows) {
          if (!this.showIpDialogVisible) return;
          let ip = item.ip.replace(/^\s+|\s+$/g, "");
          if (this.isValidIP(ip)) {
            let strLocation = this.$ipsearch.FindLocationByIp(ip);
            if (strLocation.length > 0) {
              // 亚洲|中国|北京|北京|丰台||110106|China|CN|116.28625|39.8585
              let arr = strLocation.split("|");
              let result = {
                ip,
                Continent: arr[0], // 大洲
                Country: arr[1], // 国家
                Province: arr[2], // 省份直辖市
                City: arr[3], // 城市
                Region: arr[4], // 区
                X: arr[5], // 运营商
                PostNo: arr[6],
                EnName: arr[7], //英文名
                EnJianCheng: arr[8], // 简称
                Longitude: arr[9], // 经度
                Latitude: arr[10], // 纬度
              };
              let updateSql = `update mz_bank_records set ipgj='${result.Country}', 
              ipsf='${result.Province}', 
              ipcs='${result.City}', 
              ipdq='${result.Region}',
              iplong=${result.Longitude},
              iplati=${result.Latitude}
               where shard_id=${item.shard_id};`;
              await Base.QueryCustom(updateSql, this.caseBase.ajid);
              index++;
              this.percentage = parseInt(
                (index / this.countIPNoAnalysis) * 100
              );
            }
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
      this.freshNowUI();
    },
    isValidIP(ip) {
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      return reg.test(ip);
    },
    handleClickSearch() {
      let ip = this.ip;
      if (ip === "") {
        this.$message({
          message: "ip输入框为空，请输入内容",
        });
        return;
      }
      if (!this.isValidIP(ip)) {
        this.$message({
          message: "您输入的ip地址格式错误。例如：0.0.0.0",
        });
        return;
      }
      let strLocation = this.$ipsearch.FindLocationByIp(ip);
      if (strLocation.length > 0) {
        console.log(strLocation);
        // 亚洲|中国|北京|北京|丰台||110106|China|CN|116.28625|39.8585
        let arr = strLocation.split("|");
        this.result = {
          ip,
          Continent: arr[0], // 大洲
          Country: arr[1], // 国家
          Province: arr[2], // 省份直辖市
          City: arr[3], // 城市
          Region: arr[4], // 区
          X: arr[5], // 运营商
          PostNo: arr[6],
          EnName: arr[7], //英文名
          EnJianCheng: arr[8], // 简称
          Longitude: arr[9], // 经度
          Latitude: arr[10], // 纬度
        };
        console.log(this.result);
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