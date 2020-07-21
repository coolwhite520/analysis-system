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
    ...mapGetters("CaseDetail", ["renderTreeControlList", "openeds"])
  },
  data() {
    return {
      iconsList: [
        {
          tid: "-100",
          icon: "&#xe638;"
        },
        {
          tid: "0",
          icon: "&#xe61b;"
        },
        {
          tid: "5",
          icon: "&#xe70f;"
        },
        {
          tid: "13",
          icon: "&#xe65f;"
        },
        {
          tid: "17",
          icon: "&#xe608;"
        },
        {
          tid: "25",
          icon: "&#xe615;"
        },
        {
          tid: "50",
          icon: "&#xe602;"
        }
      ]
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    async handleSelect(parentid, tid) {
      console.log(parentid, tid);
      await this.$store.dispatch("Models/getExistModelsList", tid[1]);
      if (this.existModelsDetailList.length > 0) {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", true);
      } else {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", false);
      }
    },
    handleClickOpenCollapse() {
      if (this.isCollapseLeftBar) {
        this.$store.commit("AppPageSwitch/SET_ISCOLLAPSELEFTBAR", false);
      } else {
        this.$store.commit("AppPageSwitch/SET_ISCOLLAPSELEFTBAR", true);
      }
    }
  }
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