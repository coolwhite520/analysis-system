<template>
  <div>
    <!-- 输出表类型 1表格， 2视图，3上表下图,4上表下柱状图,5上饼图下表 -->
    <!-- <table-chart :tableData="tableData" :limitHeight="contentViewHeight-110"></table-chart> -->
    <div v-if="tableData.showType === 1">
      <table-chart :tableData="tableData" :limitHeight="contentViewHeight-80"></table-chart>
    </div>
    <div v-else-if="tableData.showType === 2">
      <div>这里是个图</div>
    </div>
    <div v-else-if="tableData.showType === 3">
      <table-chart
        v-show="!tableData.fullScrrenFlag"
        :tableData="tableData"
        :limitHeight="(contentViewHeight-126)/2"
      ></table-chart>
      <!-- <div>这里是个关系图</div> -->
      <relation-chart
        :tableData="tableData"
        :limitHeight="tableData.fullScrrenFlag?(contentViewHeight-87):(contentViewHeight-126)/2"
      ></relation-chart>
    </div>
    <div v-else-if="tableData.showType === 4">
      <table-chart :tableData="tableData" :limitHeight="(contentViewHeight-80)/2 - 47"></table-chart>
      <graphic-bar-chart :tableData="tableData" :limitHeight="(contentViewHeight-80)/2"></graphic-bar-chart>
    </div>
    <div v-else-if="tableData.showType === 5">
      <div :style="{height: 250 + 'px'}">这里是个饼状图</div>
      <table-chart :tableData="tableData" limitHeight="580"></table-chart>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TableChart from "./child/TableChart";
import GraphicBarChart from "./child/GraphicBarChart";
import RelationChart from "./child/RelationChart";
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
  },
  props: ["tableData"],
};
</script>
<style >
</style>