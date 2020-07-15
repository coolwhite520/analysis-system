<template>
  <div class="data-center-left" :style="{ height: mainViewHeight + 'px'}">
    <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
      <el-radio-button :label="false" type="text">展</el-radio-button>
      <el-radio-button :label="true" type="text">收</el-radio-button>
    </el-radio-group>-->
    <div class="iconfont titleBar">
      <b>&#xe612; 数据中心</b>
    </div>
    <el-menu
      :default-openeds="openeds"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
      @select="handleSelect"
    >
      <el-submenu index="1">
        <template slot="title">
          <i class="iconfont">&#xe638;</i>
          <span slot="title">主体信息</span>
        </template>

        <el-menu-item class="menu-item iconfont" index="1-1">人员基本信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="1-2">单位基本信息</el-menu-item>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">
          <i class="iconfont">&#xe61b;</i>
          <span slot="title">资金数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="2-1">开户信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="2-2">资金交易明细</el-menu-item>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">
          <i class="iconfont">&#xe70f;</i>
          <span slot="title">支付数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="3-1">支付宝登陆IP</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-2">支付宝交易记录</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-3">支付宝账户明细</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-4">支付宝基本信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-5">财付通开户信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-2">支付宝交易记录</el-menu-item>
      </el-submenu>

      <el-submenu index="4">
        <template slot="title">
          <i class="iconfont">&#xe65f;</i>
          <span slot="title">税务数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="4-1">进销税务明细</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="4-2">税务登记数据</el-menu-item>
      </el-submenu>

      <el-submenu index="5">
        <template slot="title">
          <i class="iconfont">&#xe608;</i>
          <span slot="title">通讯数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="5-1">通话记录</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="5-2">手机通讯录</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="5-3">手机短信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="5-4">即时聊天记录</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="5-5">即时通讯好友</el-menu-item>
      </el-submenu>

      <el-submenu index="6">
        <template slot="title">
          <i class="iconfont">&#xe615;</i>
          <span slot="title">物流信息</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="6-1">物流信息</el-menu-item>
      </el-submenu>

      <el-submenu index="7">
        <template slot="title">
          <span slot="title">JASS数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="7-1">JASS交易商户数据</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("AppPageSwitch", ["mainViewHeight"])
  },
  data() {
    return {
      isCollapse: false,
      openeds: ["1", "2", "3", "4", "5", "6", "7"]
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);

      if (key === "2-2") {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", true);
      } else {
        this.$store.commit("MainPageSwitch/SET_SHOWRIGHTSLIDERVIEW", false);
      }
    }
  }
};
</script>
<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  overflow-x: scroll; /*横向滚动*/
  width: 100%;
  height: 100%;
}
.menu-item {
  font-size: 12px;
}
.titleBar {
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
</style>