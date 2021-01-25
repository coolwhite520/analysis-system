<template >
  <div class="all-slider">
    <el-row class="title">
      <el-col :span="2" style="text-align: center">
        <span @click="handleClickShowRightSlider" class="close iconfont">{{
          currentTableData.isShowRightSlider ? "&#xe626;" : "&#xe668;"
        }}</span>
      </el-col>
      <el-col :span="20">
        <div>
          <span class="iconfont">&#xe60f;&nbsp;&nbsp;&nbsp;模型库</span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <div
      class="capital-right-slider"
      :style="{ height: contentViewHeight - 40 * 2 - 15 + 'px' }"
    >
      <el-tree
        :data="currentTableData.modelTree.treeList"
        :props="defaultProps"
        @node-click="handleSelect"
        :default-expand-all="true"
        :highlight-current="true"
        :indent="5"
      >
        <template slot-scope="{ node, data }">
          <div
            v-if="data.hasOwnProperty('children')"
            style="font-size: 14px; color: #303133"
            class="iconfont"
          >
            <i class="iconfont">&#xe640;</i>
            {{ data.modelname }}
          </div>
          <div v-else style="font-size: 12px; color: #3c4e6b" class="iconfont">
            <el-tooltip
              :disabled="data.describe === null"
              class="item"
              effect="dark"
              :content="data.describe"
              placement="top"
              :enterable="false"
              :open-delay="1000"
              :hide-after="10000"
              ><div>&#xe61c;&nbsp;&nbsp;{{ data.modelname }}</div></el-tooltip
            >
          </div>
        </template>
      </el-tree>
    </div>
    <link-model v-if="showLinkModelDialogVisible"></link-model>
    <cricle-model v-if="showCircleModelDialogVisible"></cricle-model>
    <twoends-model v-if="showTwoEndsDialogVisible"></twoends-model>
    <!-- <el-row class="foot">
      <el-col :span="24">
        <div>
          <span class="iconfont">&nbsp;</span>
        </div>
      </el-col>
    </el-row>-->
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import convertSql from "@/utils/sql/DataFiltrator.js";
import linkModel from "@/pages/main/RightSlider/zjctModels/linkModel";
import cricleModel from "@/pages/main/RightSlider/zjctModels/circleModel";
import twoEndsModel from "@/pages/main/RightSlider/zjctModels/twoEndsModel";
export default {
  components: {
    "link-model": linkModel,
    "cricle-model": cricleModel,
    "twoends-model": twoEndsModel,
  },
  mounted() {},
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "currentTableData"]),
    ...mapState("DialogPopWnd", [
      "showLinkModelDialogVisible",
      "showCircleModelDialogVisible",
      "showTwoEndsDialogVisible",
    ]),
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "modelname",
      },
    };
  },
  methods: {
    handleClickShowRightSlider() {
      this.$store.commit("ShowTable/SWITCH_ISSHOWRIGHTSLIDER");
    },
    async handleSelect(data) {
      if (data.hasOwnProperty("children")) return;
      let { mid: tid, pgsqlTemplate } = data;
      console.log({ tid });
      if (tid === 401) {
        this.$store.commit("DialogPopWnd/SET_SHOWLINKMODELDIALOGVISIBLE", true);
      } else if (tid == 402) {
        this.$store.commit(
          "DialogPopWnd/SET_SHOWCIRCLEMODELDIALOGVISIBLE",
          true
        );
      } else if (tid == 403) {
        this.$store.commit("DialogPopWnd/SET_SHOWTWOENDSDIALOGVISIBLE", true);
      } else if (tid == 901) {
        // 资金用途模型
        let { modelFilterChildList } = this.currentTableData;
        let filterChildStr = convertSql.convertDataFilterToSqlStr(
          tid,
          this.currentTableData.modelFilterChildList
        );
        console.log(modelFilterChildList, filterChildStr);
        await this.$store.dispatch("ShowTable/showZjYtPieTable", {
          ajid: this.caseBase.ajid,
          modelFilterStr: filterChildStr,
          modelFilterChildList,
          tid,
        });
      } else {
        if (pgsqlTemplate === null) {
          this.$message.error({
            title: "错误",
            message: `功能暂未开放，敬请期待！`,
          });
          return;
        }
        let {
          count,
          offset,
          selectCondition,
          modelFilterStr,
          modelFilterChildList,
        } = this.currentTableData;

        let filterChildStr = convertSql.convertDataFilterToSqlStr(
          tid,
          this.currentTableData.modelFilterChildList
        );
        await this.$store.dispatch("ShowTable/showModelTable", {
          tid,
          count,
          offset,
          selectCondition,
          modelFilterStr: filterChildStr,
          modelFilterChildList: [],
          offset: 0,
          count: 30,
        });
      }
    },

    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "model-list-view",
        action: "remove",
      });
    },
  },
};
</script>

<style scoped>
/deep/.el-tree-node__content {
  height: 40px;
}
.all-slider {
  -webkit-user-select: none;
}
.capital-right-slider {
  width: 100%;
  overflow-x: scroll; /*横向滚动*/
  height: 100%;
}
.title {
  height: 40px;
  text-align: center;
  /* background-color: #384e6e; */
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #1b2735 100%);
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
.menu-item {
  font-size: 12px;
  color: #3c4e6b;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
</style>
