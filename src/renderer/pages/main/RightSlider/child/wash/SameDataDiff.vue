<template>
  <div>
    <div
      class="searchReplace"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="2" style="text-align: center">
          <el-tooltip
            class="item"
            effect="dark"
            content="点击收缩右边栏"
            placement="top"
          >
            <span @click="handleClickShowRightSlider" class="close iconfont">{{
              currentTableData.isShowRightSlider ? "&#xe626;" : "&#xe668;"
            }}</span></el-tooltip
          >
        </el-col>
        <el-col :span="20">
          <div>
            <span class="iconfont">&#xea30;&nbsp;&nbsp;&nbsp;同笔交易去重</span>
            <span v-if="sameCount > 0" style="font-size: 10px; color: red"
              ><b>{{ sameCount }}</b></span
            >
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>
      <div
        class="content"
        :style="{ height: contentViewHeight - 130 - 15 + 'px' }"
      >
        <el-row
          v-for="(row, index) of currentTableData.sameDataDiff.ruleRows"
          :key="index"
          style="font-size: 10px; margin: 10px; color: #606266"
        >
          <div v-if="row.tid === 500" style="font-size: 12px">
            {{ row.rule_name }} 去重规则：
          </div>
          <div v-else style="margin-left: 20px">
            <span>{{ index + "、" + row.rule_name }}</span>
            <el-input
              v-model="timeSpan"
              v-if="row.tid === 504"
              size="mini"
              style="width: 30%"
              placeholder="秒"
            ></el-input>
          </div>
        </el-row>
      </div>

      <div style="border-top: 1px solid #dddfe5">
        <el-row style="text-align: center; margin-top: 10px">
          <el-button
            size="mini"
            type="primary"
            @click="handleClickCheck"
            :disabled="disabled"
            :loading="loading"
            >开始检测</el-button
          >

          <el-button
            :disabled="sameCount <= 0"
            size="mini"
            type="primary"
            @click="handleClickResolve"
            :loading="loading"
            >数据处理</el-button
          >
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import DataCleanDb from "../../../../../db/DataClean";
import aes from "@/utils/aes";
import baseDb from "../../../../../db/Base";

const log = require("electron-log");

export default {
  components: {},
  data() {
    return {
      loading: false,
      sameCount: 0,
      disabled: false,
      timeSpan: 0,
      waitDelList: [],
    };
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "currentTableData"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  methods: {
    handleClickShowRightSlider() {
      this.$store.commit("ShowTable/SWITCH_ISSHOWRIGHTSLIDER");
    },
    async handleClickCheck() {
      this.loading = true;
      try {
        await this.freshSameCount();
        this.$message({
          message: `存在${this.sameCount}条重复数据`,
          type: "success",
        });
      } catch (e) {
        this.$message.error({
          title: "失败",
          message: `数据检测失败：` + e.message,
        });
        log.info(e.message);
      }
      this.loading = false;
    },
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
    async handleClickResolve() {
      if (this.waitDelList.length === 0) {
        this.$message({
          message: "没有检测到重复数据.",
        });
        return;
      }
      try {
        let sql = `DELETE FROM  ff_bank_records where ajid = ${this.caseBase.ajid}  AND shard_id in(${this.waitDelList})`;
        console.log(sql);
        await baseDb.QueryCustom(sql, this.caseBase.ajid);
        this.sameCount = 0;
        this.waitDelList = [];
        this.$message({
          type: "success",
          message: "重复数据已经删除成功。",
        });
        this.freshNowUI();
      } catch (e) {
        this.$message({
          type: "error",
          message: "重复数据已经删除失败。" + e.message,
        });
      }
    },
    async freshSameCount() {
      try {
        let decode = aes.decrypt(
          this.currentTableData.sameDataDiff.gpsqltemplate_select
        );
        let sql = decode
          .replace(/\$MODEL_FILTER\$/g, this.currentTableData.modelFilterStr)
          .replace(/\$AJID\$/g, this.caseBase.ajid);
        console.log(sql);
        let { success, rows } = await baseDb.QueryCustom(
          sql,
          this.caseBase.ajid
        );
        if (success) {
          let list = this.GetTBRepeatDataIDList(this.timeSpan, rows);
          this.waitDelList = list.map((item) => parseInt(item));
          this.sameCount = list.length;
          return this.sameCount;
        } else {
          return 0;
        }
      } catch (e) {
        this.$message.error({
          message: e.message,
        });
      }
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "same-data-diff-view",
        action: "remove",
      });
    },

    //string转时间
    stringToTime(string) {
      var f = string.split(" ", 2);
      var d = (f[0] ? f[0] : "").split("-", 3);
      var t = (f[1] ? f[1] : "").split(":", 3);
      return new Date(
        parseInt(d[0], 10) || null,
        (parseInt(d[1], 10) || 1) - 1,
        parseInt(d[2], 10) || null,
        parseInt(t[0], 10) || null,
        parseInt(t[1], 10) || null,
        parseInt(t[2], 10) || null
      ).getTime();
    },
    //计算时间差 （秒）
    dateDiff(date1, date2) {
      var type1 = typeof date1,
        type2 = typeof date2;
      if (type1 == "string") date1 = this.stringToTime(date1);
      else if (date1 instanceof Date) date1 = date1.getTime();

      if (type2 == "string") date2 = this.stringToTime(date2);
      else if (date2 instanceof Date) date2 = date2.getTime();
      return (date1 - date2) / 1000; //结果是秒
    },
    //找出重复同笔交易的shard_id,SecondInterval为设置的交易时间偏差
    GetTBRepeatDataIDList(SecondInterval, rows) {
      let shard_idlist = [];
      let list = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].tmp == "1") {
          let child_listid = this.findTBData(SecondInterval, list);
          if (
            child_listid != null &&
            child_listid != undefined &&
            child_listid.length > 0
          ) {
            for (let i = 0; i < child_listid.length; i++) {
              if (shard_idlist.indexOf(child_listid[i]) == -1) {
                shard_idlist.push(child_listid[i]);
              }
            }
          }
          list = [];
        }
        list.push(rows[i]);
      }
      let child_listid = this.findTBData(SecondInterval, list);
      if (
        child_listid != null &&
        child_listid != undefined &&
        child_listid.length > 0
      ) {
        for (let i = 0; i < child_listid.length; i++) {
          if (shard_idlist.indexOf(child_listid[i]) == -1) {
            shard_idlist.push(child_listid[i]);
          }
        }
      }
      return shard_idlist;
    },
    findTBData(SecondInterval, list) {
      if (list == null || list == undefined || list.length <= 0) {
        return null;
      }
      let list_in = [];
      let list_out = [];
      let list_id = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].jdbz == "进") {
          list_in.push(list[i]);
        } else if (list[i].jdbz == "出") {
          list_out.push(list[i]);
        }
      }
      if (list_in.length <= 0 || list_out.length <= 0) {
        return null;
      }
      for (let i = 0; i < list_out.length; i++) {
        for (let j = 0; j < list_in.length; j++) {
          let diff = this.dateDiff(list_out[i].jysj, list_in[j].jysj);
          if (diff <= SecondInterval && diff >= SecondInterval * -1) {
            list_id.push(list_in[j].shard_id);
          }
        }
      }
      return list_id;
    },
  },
};
</script>
<style  scoped>
.searchReplace {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  -webkit-user-select: none;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.foot {
  height: 40px;
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
</style>