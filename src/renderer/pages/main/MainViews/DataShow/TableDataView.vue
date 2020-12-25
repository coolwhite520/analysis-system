<template>
  <div>
    <!-- 输出表类型 1表格， 2视图，3上表下图,4上表下柱状图,5上饼图下表 -->
    <!-- <table-chart :tableData="tableData" :limitHeight="contentViewHeight-110"></table-chart> -->
    <div v-if="tableData.showType === 1">
      <table-chart
        :tableData="tableData"
        :limitHeight="contentViewHeight - 80"
      ></table-chart>
      <!-- <test-go-view v-if="tableData.showType === 1"></test-go-view> -->
    </div>
    <div v-else-if="tableData.showType === 2">
      <template v-if="tableData.tableType === 'graph'">
        <link-relation-chart
          :tableData="tableData"
          :limitHeight="contentViewHeight - 87"
        ></link-relation-chart>
      </template>
      <template v-else>
        <relation-chart-visible
          :tableData="tableData"
          :limitHeight="contentViewHeight - 87"
        ></relation-chart-visible>
      </template>
    </div>
    <div v-else-if="tableData.showType === 3">
      <table-chart
        v-show="!tableData.fullScrrenFlag"
        :tableData="tableData"
        :limitHeight="(contentViewHeight - 126) / 2"
      ></table-chart>
      <!-- <div>这里是个关系图</div> -->
      <relation-chart
        :tableData="tableData"
        :limitHeight="
          tableData.fullScrrenFlag
            ? contentViewHeight - 87
            : (contentViewHeight - 126) / 2
        "
      ></relation-chart>
    </div>
    <div v-else-if="tableData.showType === 4">
      <table-chart
        :tableData="tableData"
        :limitHeight="(contentViewHeight - 80) / 2 - 47"
      ></table-chart>
      <graphic-bar-chart
        :tableData="tableData"
        :limitHeight="(contentViewHeight - 80) / 2"
      ></graphic-bar-chart>
    </div>
    <div v-else-if="tableData.showType === 5">
      <!-- 两个饼图 -->
      <el-row v-if="tableData.selectCondition.fundUsePicType === 'pie'">
        <el-col
          :gutter="20"
          :span="12"
          v-for="(item, index) of tableData.dataList"
          :key="index"
        >
          <zjyt-pie-chart
            :pie="item.pie"
            :rows="item.rows"
            :limitHeight="(contentViewHeight - 126) / 2 + 70"
          ></zjyt-pie-chart>
        </el-col>
      </el-row>
      <!-- 桑基图 -->
      <el-row v-else>
        <zjyt-sankey-chart
          :dataList="tableData.dataList"
          :limitHeight="(contentViewHeight - 126) / 2 + 70"
        ></zjyt-sankey-chart>
      </el-row>
      <el-row>
        <el-col
          :gutter="20"
          :span="12"
          v-for="(item, index) of tableData.dataList"
          :key="index"
        >
          <table-chart
            :tableData="{
              tid: tableData.tid,
              pageIndex: tableData.pageIndex,
              rows: item.rows,
              showHeaders: item.showHeaders,
              sum: item.rows.length,
            }"
            :limitHeight="(contentViewHeight - 80) / 2 - 47"
          ></table-chart>
        </el-col>
      </el-row>
    </div>
    <!-- 两个table -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import TableChart from "./child/TableChart";
import GraphicBarChart from "./child/GraphicBarChart";
import RelationChart from "./child/RelationChart";
import RelationChartVisible from "./child/RelationChartVisible";
import linkRelationChart from "./child/ZjctRelationChart";
import ZjytPieChart from "./child/ZjytPieChart";
import ZjytSankeyChart from "./child/ZjytSankeyChart";
import TestGoView from "./child/TestGojs";
export default {
  mounted() {
    console.log(this.tableData);
  },
  data() {
    return {};
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  components: {
    "graphic-bar-chart": GraphicBarChart,
    "table-chart": TableChart,
    "relation-chart": RelationChart,
    "link-relation-chart": linkRelationChart,
    "relation-chart-visible": RelationChartVisible,
    "zjyt-pie-chart": ZjytPieChart,
    "zjyt-sankey-chart": ZjytSankeyChart,
    "test-go-view": TestGoView,
  },
  props: ["tableData"],
};
</script>
<style >
</style>