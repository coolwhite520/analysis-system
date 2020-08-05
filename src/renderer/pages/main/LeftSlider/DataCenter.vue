<template>
  <div class="data-center-left" :style="{ height: contentViewHeight + 'px'}">
    <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
      <el-radio-button :label="false" type="text">展</el-radio-button>
      <el-radio-button :label="true" type="text">收</el-radio-button>
    </el-radio-group>-->
    <div class="titleBar">
      <b>
        <span class="iconfont" style="font-size:20px;">&#xe612;</span>
        <span v-show="!isCollapseLeftBar">数据中心</span>
      </b>
    </div>
    <el-menu
      :style="{height: (contentViewHeight - 80) + 'px'}"
      :default-openeds="openeds"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapseLeftBar"
      @select="handleSelect"
    >
      <el-submenu
        v-for="(item,i) in renderTreeControlList"
        :index="item.tid"
        :key="item.tid"
        :currentTid="item.tid"
      >
        <template slot="title">
          <i class="iconfont" v-html="iconsList[i].icon"></i>
          <span slot="title">{{item.title}}</span>
        </template>
        <el-menu-item
          v-for="child in item.childrenArr"
          :key="child.tid"
          class="menu-item"
          :index="child.tid"
        >
          {{child.title}}
          <span style="color: gray;">&nbsp;{{child.count}}条</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <div class="footbar">
      <div :style="{float:'right', marginRight:'20px'}">
        <el-button
          class="iconfont"
          @click="handleClickOpenCollapse"
          size="medium"
          type="text"
          style="color:#1a222e;"
        >{{ isCollapseLeftBar ? '&#xe626;':'&#xe668;'}}</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
export default {
  mounted() {
    console.log(this.openeds);
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight", "isCollapseLeftBar"]),
    ...mapState("Models", ["existModelsDetailList"]),
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapGetters("CaseDetail", ["renderTreeControlList", "openeds"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  data() {
    return {
      iconsList: [
        {
          tid: "-100",
          icon: "&#xe638;",
        },
        {
          tid: "0",
          icon: "&#xe61b;",
        },
        {
          tid: "5",
          icon: "&#xe70f;",
        },
        {
          tid: "13",
          icon: "&#xe65f;",
        },
        {
          tid: "17",
          icon: "&#xe608;",
        },
        {
          tid: "25",
          icon: "&#xe615;",
        },
        {
          tid: "50",
          icon: "&#xe602;",
        },
      ],
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    async handleSelect(parentid, tableTid) {
      console.log(parentid, tableTid);
      // 获取右侧的模型数据
      let tid = tableTid[1];
      await this.$store.dispatch("Models/getExistModelsList", tid);
      if (this.existModelsDetailList.length > 0) {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", true);
      } else {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", false);
      }
      // 获取表结构数据
      // 根据tid获取表名称
      let tablecname = "";
      let tableename = "";
      for (let item of this.renderTreeControlList) {
        for (let childItem of item.childrenArr) {
          if (childItem.tid === tid) {
            tablecname = childItem.title;
            tableename = childItem.tablename;
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
      let { ajid } = this.caseDetail;
      // 根据tableName获取表的数据
      switch (tid) {
        case "1": //个人
          await this.$store.dispatch("ShowTable/showPersonTable", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
        case "2": // 单位
          await this.$store.dispatch("ShowTable/showPerson2Table", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
        case "3":
          await this.$store.dispatch("ShowTable/showAccountTable", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
        case "4":
          await this.$store.dispatch("ShowTable/showBankTable", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
        case "14":
          await this.$store.dispatch("ShowTable/showTaxTable", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
        default:
          await this.$store.dispatch("ShowTable/showOtherTable", {
            ajid,
            tid,
            tablecname,
            tableename,
            offset: 0,
            count: 30,
          });
          break;
      }
    },
    handleClickOpenCollapse() {
      if (this.isCollapseLeftBar) {
        this.$store.commit("AppPageSwitch/SET_ISCOLLAPSELEFTBAR", false);
      } else {
        this.$store.commit("AppPageSwitch/SET_ISCOLLAPSELEFTBAR", true);
      }
    },
  },
};
</script>
<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  overflow-x: scroll; /*横向滚动*/
  width: 100%;
}
.el-menu--collapse {
  width: 100%;
}
.menu-item {
  font-size: 12px;
  text-align: left;
}
.titleBar {
  height: 40px;
  text-align: center;
  background-color: #1a222e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.footbar {
  height: 40px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e5e7ec;
}
.iconfont {
  font-size: 20px;
}
</style>