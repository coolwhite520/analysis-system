<template>
  <div class="data-center-left">
    <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
      <el-radio-button :label="false" type="text">展</el-radio-button>
      <el-radio-button :label="true" type="text">收</el-radio-button>
    </el-radio-group>-->
    <el-menu
      :default-openeds="openeds"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
      @select="handleSelect"
    >
      <div
        style="text-align:center;
        background-color: #f5f7fa;
        padding-top:10px;
        padding-bottom:10px;
        font-size:15px;
        border-bottom:1px solid #e5e7ec;"
      >
        <p>数据中心</p>
      </div>
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-user-solid"></i>
          <span slot="title">主体信息</span>
        </template>

        <el-menu-item class="menu-item iconfont" index="1-1">人员基本信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="1-2">单位基本信息</el-menu-item>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">
          <i class="iconfont" style="margin-left:4px;margin-right:6px;">&#xe66a;</i>
          <span slot="title">资金数据</span>
        </template>
        <el-menu-item class="menu-item iconfont" index="2-1">开户信息</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="2-2">资金交易明细</el-menu-item>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span slot="title">第三方支付数据</span>
        </template>

        <el-menu-item class="menu-item iconfont" index="3-1">支付宝登陆IP</el-menu-item>
        <el-menu-item class="menu-item iconfont" index="3-2">支付宝交易记录</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {},
  data() {
    return {
      isCollapse: false,
      openeds: ["1", "2", "3"]
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
  width: 100%;
  min-height: 400px;
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
}
.data-center-left {
  height: 600px;
}
.menu-item {
  font-size: 12px;
}
</style>