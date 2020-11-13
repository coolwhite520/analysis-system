<template >
  <div class="all-slider">
    <el-row class="title">
      <el-col :span="22">
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
      <el-menu
        :default-openeds="openeds"
        @close="handleClose"
        @open="handleOpen"
        @select="handleSelect"
        :style="{ height: contentViewHeight - 200 + 'px' }"
      >
        <el-submenu
          v-for="father of currentTableData.modelTree.treeList"
          :key="father.mid"
          :index="String(father.mid)"
        >
          <template slot="title">
            <i class="iconfont" style="font-size: 20px">&#xe628;</i>
            <span slot="title">{{ father.modelname }}</span>
          </template>

          <el-menu-item
            v-for="child of father.childrenList"
            :key="child.mid"
            :index="String(child.mid)"
            class="menu-item iconfont"
          >
            <el-tooltip
              :disabled="child.describe === null"
              class="item"
              effect="dark"
              :content="child.describe"
              placement="top"
              :enterable="false"
              :open-delay="1000"
              :hide-after="10000"
            >
              <div>&#xe61c;&nbsp;&nbsp;{{ child.modelname }}</div>
            </el-tooltip>
          </el-menu-item>
        </el-submenu>
      </el-menu>
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
    openeds() {
      return JSON.parse(
        JSON.stringify(this.currentTableData.modelTree.openeds)
      );
    },
  },
  data() {
    return {};
  },
  methods: {
    async handleSelect(key, keyPath) {
      let tid = keyPath[1];
      console.log({ tid });
      if (tid === "401") {
        this.$store.commit("DialogPopWnd/SET_SHOWLINKMODELDIALOGVISIBLE", true);
      } else if (tid == "402") {
        this.$store.commit(
          "DialogPopWnd/SET_SHOWCIRCLEMODELDIALOGVISIBLE",
          true
        );
      } else if (tid == "403") {
        this.$store.commit("DialogPopWnd/SET_SHOWTWOENDSDIALOGVISIBLE", true);
      } else if (tid == "901") {
        // 资金用途模型
      } else {
        let pgsqlTemplate = "";
        let model = {};
        for (let item of this.currentTableData.modelTree.treeList) {
          for (let childitem of item.childrenList) {
            if (tid === String(childitem.mid)) {
              pgsqlTemplate = childitem.gpsqltemplate;
              model = childitem;
              break;
            }
          }
        }
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
          parseInt(tid),
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
    handleOpen(openIndex) {
      let bFindSame = false;
      for (let index = 0; index < this.openeds.length; index++) {
        let value = this.openeds[index];
        if (value === openIndex) {
          bFindSame = true;
          break;
        }
      }
      if (!bFindSame) this.openeds.push(openIndex);
      console.log(this.openeds);
      this.$store.commit(
        "ShowTable/SET_MODELTREE_OPENEDS",
        JSON.parse(JSON.stringify(this.openeds))
      );
    },
    handleClose(closeIndex) {
      for (let index = 0; index < this.openeds.length; index++) {
        let value = this.openeds[index];
        if (value === closeIndex) {
          this.openeds.splice(index, 1);
          break;
        }
      }
      console.log(this.openeds);
      this.$store.commit(
        "ShowTable/SET_MODELTREE_OPENEDS",
        JSON.parse(JSON.stringify(this.openeds))
      );
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
