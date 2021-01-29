<template>
  <div
    style="-webkit-user-select: none; margin-top: 0px"
    ref="wrapper"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row>
      <el-col :span="isCollapseTimeLine ? 0 : 3">
        <div
          style="
            margin-top: 10px;
            padding: 10px;
            text-align: center;
            color: #3c4e6b;
            box-shadow: 15px 0px 10px -15px #404e69;
          "
        >
          <el-row>
            <el-col :span="21">
              <div class="iconfont" style="font-size: 20px; color: white">
                &#xe60b;&nbsp;&nbsp;<b>时间轴</b>
              </div>
            </el-col>
            <el-col :span="1">
              <el-tooltip
                class="item"
                effect="dark"
                content="点击收缩时间轴"
                placement="top"
              >
                <div class="CollapseTimeLineNormal" @click="handleClickHide">
                  <span class="iconfont">
                    {{ isCollapseTimeLine ? "&#xe626;" : "&#xe668;" }}</span
                  >
                </div>
              </el-tooltip>
            </el-col>
          </el-row>
          <div style="font-size: 10px; margin-top: 20px; text-align: left">
            时间轴会在每次用户按下ctrl+s(保存的快捷键)时，记录下当前的操作数据以便后续继续分析。
          </div>
          <time-line-view></time-line-view>
        </div>
      </el-col>
      <el-col :span="isCollapseTimeLine ? 24 : 21">
        <div>
          <control-bar-view
            v-show="currentViewName === 'show-exist-case-view'"
          ></control-bar-view>
          <carousel-case-list
            v-if="currentViewName !== 'show-exist-case-view'"
          ></carousel-case-list>
        </div>
        <div>
          <el-row>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="22">
              <component :is="currentViewName"></component>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <div v-if="isCollapseTimeLine">
      <el-tooltip
        class="item"
        effect="dark"
        content="点击展开时间轴"
        placement="right"
        ><div class="CollapseTimeLine" @click="handleClickShowTimeLine">
          <span class="iconfont" style="font-size: 20px">
            {{ isCollapseTimeLine ? "&#xe626;" : "&#xe668;" }}</span
          >
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
import { mapState } from "vuex";
import AnalysisTimeLine from "./child/AnalysisTimeLine";
import ShowExistCaseView from "./child/ShowExistCaseView";
import NewCaseView from "./child/NewCaseView";
import CaseDetailView from "./child/CaseDetailView";
import EditCaseView from "./child/EditCaseView";
import ControlBar from "./child/ControlBar";
import carouselCaseList from "./child/CarouselCaseList";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState("HomePageSwitch", ["currentViewName"]),
    ...mapState("AppPageSwitch", ["mainViewHeight", "isCollapseTimeLine"]),
  },
  components: {
    "new-case-view": NewCaseView,
    "show-exist-case-view": ShowExistCaseView,
    "case-detail-view": CaseDetailView,
    "edit-case-view": EditCaseView,
    "time-line-view": AnalysisTimeLine,
    "control-bar-view": ControlBar,
    "carousel-case-list": carouselCaseList,
  },
  async mounted() {},
  methods: {
    handleClickHide() {
      this.$store.commit("AppPageSwitch/SWITCH_ISCOLLAPSETIMELINE");
    },
    handleClickShowTimeLine() {
      this.$store.commit("AppPageSwitch/SWITCH_ISCOLLAPSETIMELINE");
    },
  },
};
</script>
<style scoped>
.CollapseTimeLineNormal {
  font-size: 20px;
  color: white;
}
.CollapseTimeLine {
  position: absolute;
  width: 10px;
  height: 40px;
  top: 0px;
  left: 0px;
  /* background-color: #3c4e6b; */
  z-index: 99900;
  color: white;
  font-size: 10px;
}
.CollapseTimeLineNormal:hover {
  color: gray;
}
.CollapseTimeLine:hover {
  color: gray;
  /* cursor: pointer; */
  /* background-color: #0a6e55; */
}
</style>


