<template >
  <div class="all-slider">
    <div
      style="text-align:center;
        background-color: #f5f7fa;
        padding-top:10px;
        padding-bottom:10px;
        font-size:15px;
        border-bottom:1px solid #e5e7ec;"
    >
      <span class="iconfont" style="font-size:20px;">&#xe60f;</span> 资金交易明细模型库
    </div>
    <div class="capital-right-slider">
      <el-menu default-active="1-1" class="el-menu-vertical-demo" @select="handleSelect">
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span slot="title">异常交易行为发现模型</span>
          </template>

          <el-menu-item class="menu-item iconfont" index="1-1">大额交易行为账户发现</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="1-2">过度账户发现</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="1-3">重点对手账户发现</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="1-4">重点对手户名发现</el-menu-item>
        </el-submenu>

        <el-submenu index="2">
          <template slot="title">
            <i class="iconfont" style="margin-left:4px;margin-right:6px;">&#xe66a;</i>
            <span slot="title">团伙交易行为发现模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="2-1">大额交易团伙账户发现</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="2-2">过渡团伙账户发现</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="2-3">重点交易对手团伙发现</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">待调单账户分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="3-1">主要人员未掉单对手账户</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="3-2">大额交易对手未调单账户</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="3-3">大额获利对手未调单账户</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="3-4">主要关联对手未调单账户</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="3-5">即出即进对手未调单账户</el-menu-item>
        </el-submenu>

        <el-submenu index="4">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">关联交易分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="4-1">交易账户关联对手账户人数</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="4-2">交易户名关联对手账户人数</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="4-3">对手账户关联对手账户人数</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="4-4">对手户名关联对手账户人数</el-menu-item>
        </el-submenu>

        <el-submenu index="5">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">交易行为特征分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="5-1">交易地区分布</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-2">交易金额特征</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-3">交易金额区间规律</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-4">交易方式规律</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-5">交易时段分析</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-6">交易时间规律</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-7">交易日期规律</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="5-7">调集人员交易进出情况</el-menu-item>
        </el-submenu>

        <el-submenu index="6">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">资金穿透模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="6-1">资金链路查找</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="6-2">资金环路查找</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="6-3">两端路径查找</el-menu-item>
        </el-submenu>

        <el-submenu index="7">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">基于IP团伙分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="7-1">IP关联账户数统计</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="7-2">IP关联账户详情分析</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="7-3">同IP关联账户分析</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="7-4">账户关联IP数统计</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="7-5">账户关联IP详情分析</el-menu-item>
        </el-submenu>

        <el-submenu index="8">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">基于MAC团伙分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="8-1">MAC关联账户数统计</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="8-2">MAC关联账户详情分析</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="8-3">同MAC关联账户分析</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="8-4">账户关联MAC数统计</el-menu-item>
          <el-menu-item class="menu-item iconfont" index="8-5">账户关联MAC详情分析</el-menu-item>
        </el-submenu>

        <el-submenu index="9">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">亲密度分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="9-1">亲密度分析</el-menu-item>
        </el-submenu>

        <el-submenu index="10">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">资金用途分析模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="10-1">资金用途分析</el-menu-item>
        </el-submenu>

        <el-submenu index="11">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">统计查询模型</span>
          </template>
          <el-menu-item class="menu-item iconfont" index="10-1">资金透视分析</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script >
import { mapState } from "vuex";
export default {
  // directives: {
  //   drag(el, bindings) {
  //     el.onmousedown = function(e) {
  //       var disx = e.pageX - el.offsetLeft;
  //       var disy = e.pageY - el.offsetTop;
  //       document.onmousemove = function(e) {
  //         el.style.left = e.pageX - disx + "px";
  //         el.style.top = e.pageY - disx + "px";
  //       };
  //       document.onmouseup = function() {
  //         document.onmousemove = document.onmouseup = null;
  //       };
  //     };
  //   }
  // },
  computed: {
    ...mapState("MainPageSwitch", ["showRightSliderView"])
  },
  data() {
    return {};
  },
  methods: {
    handleSelect(key, keyPath) {}
  }
};
</script>

<style scoped>
.all-slider {
  /* position: relative; */
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
}
.capital-right-slider {
  width: 100%;
  overflow-x: scroll; /*横向滚动*/
  height: 600px;
}
.menu-item {
  font-size: 12px;
}
</style>
