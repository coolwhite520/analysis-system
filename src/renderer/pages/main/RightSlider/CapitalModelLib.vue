<template >
  <div class="all-slider" :style="{ height: contentViewHeight + 'px'}">
    <el-row class="title">
      <el-col :span="22">
        <div>
          <span class="iconfont">&#xe60f;</span> 模型库
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <div class="capital-right-slider" :style="{height: (contentViewHeight - 40*2) + 'px'}">
      <el-menu class="el-menu-vertical-demo" @select="handleSelect" :default-openeds="openeds">
        <el-submenu
          v-for="father of renderModelsTreeList"
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
    <el-row class="foot">
      <el-col :span="24">
        <div>
          <span class="iconfont">&nbsp;</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
export default {
  computed: {
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapState("MainPageSwitch", ["showRightSliderView"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapGetters("Models", ["renderModelsTreeList"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  data() {
    return {
      openeds: ["1"],
    };
  },
  methods: {
    async handleSelect(key, keyPath) {
      console.log(key, keyPath);
      let { ajid } = this.caseDetail;
      let tid = keyPath[1];
      let modelname = "";
      for (let item of this.renderModelsTreeList) {
        for (let childitem of item.childrenList) {
          if (tid === String(childitem.mid)) {
            modelname = childitem.modelname;
            break;
          }
        }
      }
      // 判断是否已经展示了这个页面，如果已经展示了，那么需要进行active
      for (let tableData of this.tableDataList) {
        if (tableData.tid === tid) {
          this.$store.commit("ShowTable/SET_ACTIVEINDEX", tid);
          return;
        }
      }
      await this.$store.dispatch("ShowTable/showModelTable", {
        ajid,
        offset: 0,
        tid,
        tablecname: modelname,
        count: 30,
      });
    },
    handleClickClose() {
      this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", false);
    },
  },
};
</script>

<style scoped>
.all-slider {
  /* position: relative; */
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
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
  background-color: #1a222e;
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
