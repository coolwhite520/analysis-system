<template >
  <div class="all-slider">
    <el-row class="title">
      <el-col :span="22">
        <div>
          <span class="iconfont" v-html="renderData.title"></span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <div class="capital-right-slider" :style="{ height: (contentViewHeight - 40*2 -15) + 'px'}">
      <el-menu
        @select="handleSelect"
        :default-openeds="openeds"
        :style="{ height: (contentViewHeight - 200) + 'px'}"
      >
        <el-submenu
          v-for="father of renderData.modelTreeList"
          :key="father.mid"
          :index="String(father.mid)"
        >
          <template slot="title">
            <i class="iconfont">&#xe61c;</i>
            <span slot="title">{{father.modelname}}</span>
          </template>

          <el-menu-item
            v-for="child of father.childrenList"
            :key="child.mid"
            :index="String(child.mid)"
            class="menu-item iconfont"
          >
            <el-tooltip
              :disabled="child.describe===null"
              class="item"
              effect="dark"
              :content="child.describe"
              placement="top"
              :enterable="false"
              :open-delay="1000"
              :hide-after="10000"
            >
              <div>{{child.modelname}}</div>
            </el-tooltip>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
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

export default {
  props: ["renderData"],
  mounted() {},
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "currentTableData"]),
  },
  data() {
    return {
      openeds: ["1"],
      selectCondition: this.$defaultSelection,
    };
  },
  methods: {
    async handleSelect(key, keyPath) {
      let tid = keyPath[1];
      let pgsqlTemplate = "";
      let model = {};
      for (let item of this.renderData.modelTreeList) {
        for (let childitem of item.childrenList) {
          if (tid === String(childitem.mid)) {
            pgsqlTemplate = childitem.gpsqltemplate;
            model = childitem;
            break;
          }
        }
      }
      if (pgsqlTemplate === null) {
        this.$notify.error({
          title: "错误",
          message: `没有基础模版哦`,
        });
        return;
      }
      // 判断是否已经展示了这个页面，如果已经展示了，那么需要进行active
      // for (let tableData of this.tableDataList) {
      //   if (tableData.tid === tid) {
      //     this.$store.commit("ShowTable/SET_ACTIVEINDEX", tid);
      //     return;
      //   }
      // }
      // 执行默认参数进行查询
      let { ajid } = this.caseBase;
      let title = model.modelname;
      let orderby = model.orderby ? model.orderby : "";
      let showType = model.out_type ? parseInt(model.out_type) : 1;
      let mpids = model.mpids ? model.mpids.split(",") : [];
      let describe = model.describe;
      let filter = this.currentTableData.filter;
      await this.$store.dispatch("ShowTable/showModelTable", {
        ajid,
        tid,
        title,
        pgsqlTemplate,
        orderby,
        filter,
        mpids,
        selectCondition: this.selectCondition,
        describe,
        showType,
        offset: 0,
        count: 30,
      });
    },
    handleClickClose() {
      this.$store.commit("ShowTable/SET_RIGHT_TAB_VISIBLE", {
        pageIndex: this.currentTableData.pageIndex,
        tabIndex: this.renderData.tabIndex,
        visible: false,
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
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
</style>
