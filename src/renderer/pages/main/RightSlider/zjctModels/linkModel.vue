<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible="showLinkModelDialogVisible"
    width="35%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe7b8;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-form
      ref="linkModelForm"
      :model="form"
      label-width="140px"
      size="mini"
      :loading="loadingButn"
    >
      <el-form-item label="类型：">
        <el-radio-group v-model="form.radioLeixing" @change="handleChangeRadia">
          <el-radio label="0">交易卡号</el-radio>
          <el-radio label="2">交易名称</el-radio>
          <el-radio label="1">交易方证件号</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="起点：">
        <!-- <el-input size="mini" v-model="form.beginPoint"></el-input> -->
        <el-autocomplete
          style="width: 100%"
          v-model="form.beginPoint"
          :placeholder="placeholder"
          :fetch-suggestions="(queryString, cb) => querySearch(queryString, cb)"
          :trigger-on-focus="false"
        ></el-autocomplete>
      </el-form-item>
      <el-form-item label="方向：">
        <el-radio-group v-model="form.radioFangxiang">
          <el-radio label="sy">上游</el-radio>
          <el-radio label="xy">下游</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="维度：">
        <el-radio-group v-model="form.radioWeidu">
          <el-radio label="0">单笔</el-radio>
          <el-radio label="1">汇总</el-radio>
          <el-radio label="2">差额</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="组：">
        <el-checkbox v-model="form.checkGroup"></el-checkbox>
      </el-form-item>

      <el-form-item label="间隔(小时)：">
        <el-input size="mini" v-model.number="form.timeSpan"></el-input>
      </el-form-item>
      <el-form-item label="层数(2-20)：">
        <el-col :span="11">
          <el-input size="mini" v-model.number="form.cengShuBegin"></el-input>
        </el-col>
        <el-col class="line" :span="2" style="text-align: center">-</el-col>
        <el-col :span="11">
          <el-input size="mini" v-model.number="form.cengShuEnd"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="最小交易金额：">
        <el-input size="mini" v-model.number="form.minJe"></el-input>
      </el-form-item>
      <el-form-item label="交易时间范围：">
        <el-col :span="11">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="form.dateBegin"
            style="width: 100%"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-col>
        <el-col class="line" :span="2" style="text-align: center">-</el-col>
        <el-col :span="11">
          <el-date-picker
            placeholder="选择日期"
            v-model="form.dateEnd"
            style="width: 100%"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="上下层金额比例：">
        <el-col :span="11">
          <el-input size="mini" v-model.number="form.biLiBegin"></el-input>
        </el-col>
        <el-col class="line" :span="2" style="text-align: center">-</el-col>
        <el-col :span="11">
          <el-input size="mini" v-model.number="form.biLiEnd"></el-input>
        </el-col>
      </el-form-item>
      <el-row style="margin-top: 20px; text-align: center">
        <el-button @click="handleClose" size="small" style="width: 30%"
          >取消</el-button
        >
        <el-button
          @click="handleClickSearch('linkModelForm')"
          size="small"
          type="primary"
          style="width: 60%"
          :loading="loadingButn"
          >开始查找</el-button
        >
      </el-row>
    </el-form>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import dataShowTable from "@/db/DataShowTable.js";
import linkPathModel from "@/utils/sql/LinkPathViewModel";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showLinkModelDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("ShowTable", ["currentTableData"]),
    title() {
      return `资金链路查找`;
    },
    placeholder() {
      let str;
      switch (this.form.radioLeixing) {
        case "0":
          str = "请输入【交易卡号】作为查询起始点";
          break;
        case "2":
          str = "请输入【交易名称】作为查询起始点";
          break;
        case "1":
          str = "请输入【交易方证件号】作为查询起始点";
          break;
        default:
          break;
      }
      return str;
    },
    searchFieldName() {
      let str;
      switch (this.form.radioLeixing) {
        case "0":
          str = "cxkh";
          break;
        case "2":
          str = "jymc";
          break;
        case "1":
          str = "jyzjhm";
          break;
        default:
          break;
      }
      return str;
    },
  },
  mounted() {},
  data() {
    return {
      loadingButn: false,
      form: {
        radioFangxiang: "sy",
        radioWeidu: "0",
        radioLeixing: "0",
        checkGroup: false,
        beginPoint: "",
        endPoint: "",
        dateBegin: "", //new Date().Format("yyyy-MM-dd"),
        dateEnd: "", //new Date().Format("yyyy-MM-dd"),
        timeSpan: 2,
        cengShuBegin: 2,
        cengShuEnd: 8,
        minJe: 10000,
        biLiBegin: 0.9,
        biLiEnd: 1.1,
        minBs: 0,
      },
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWLINKMODELDIALOGVISIBLE", false);
    },
    createFilter(queryString) {
      return (item) => {
        return item.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0;
      };
    },
    handleChangeRadia() {
      this.form.beginPoint = "";
    },
    async querySearch(queryString, cb) {
      if (queryString.length > 0) {
        let ajid = this.caseBase.ajid;
        let fieldename = this.searchFieldName;
        let { tid, tableename } = this.currentTableData;
        let filter = ` and ${fieldename} like '%${queryString}%'`;
        let ret = await dataShowTable.QuerySearchLike(
          ajid,
          tid,
          tableename,
          fieldename,
          filter
        );
        cb(ret.rows);
      }
    },
    handleClickSearch(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // alert("submit!");
          this.loadingButn = true;
          let ajid = this.caseBase.ajid;
          console.log({ ajid });
          console.log(
            1,
            parseInt(this.form.radioLeixing),
            parseInt(this.form.radioWeidu),
            this.form.checkGroup,
            this.form.radioFangxiang,
            this.form.cengShuEnd,
            this.form.cengShuBegin,
            this.form.beginPoint,
            this.form.endPoint,
            this.form.dateBegin,
            this.form.dateEnd,
            this.form.minJe,
            this.form.minBs,
            this.form.timeSpan,
            this.form.biLiBegin,
            this.form.biLiEnd,
            "",
            ajid
          );
          let data = await linkPathModel.getCapitalPenetration(
            1,
            parseInt(this.form.radioLeixing),
            parseInt(this.form.radioWeidu),
            this.form.checkGroup,
            this.form.radioFangxiang,
            this.form.cengShuEnd,
            this.form.cengShuBegin,
            this.form.beginPoint,
            this.form.endPoint,
            this.form.dateBegin,
            this.form.dateEnd,
            this.form.minJe,
            this.form.minBs,
            this.form.timeSpan,
            this.form.biLiBegin,
            this.form.biLiEnd,
            "",
            ajid
          );
          this.loadingButn = false;
          console.log(data);
        } else {
          console.log("error submit!!");
          this.loadingButn = false;
          return false;
        }
      });
    },
  },
};
</script>
<style scoped>
/deep/.el-form-item {
  margin-bottom: 4px;
}
/deep/.el-form-item__label {
  font-weight: bold;
  font-size: 12px;
}
/deep/.el-radio__label {
  font-weight: normal;
  font-size: 10px;
}
</style>
