<template>
  <div class="TabVisible">
    <el-row style="text-align:center">
      <el-col :span="4" style="border-right: 1px solid  #e5e7ec;">
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('random')"
            >&#xe6cd;&nbsp;随机布局</el-button>
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
            >&#xe737;&nbsp;层次布局</el-button>
          </el-col>
          <!-- <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('force')"
            >&#xe63f;&nbsp;力导向布局</el-button>
          </el-col>-->
          <!-- <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('mds')"
            >&#xe92b;&nbsp;高维数据布局</el-button>
          </el-col>-->
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('circular')"
            >&#xe609;&nbsp;环形布局</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('concentric')"
            >&#xe605;&nbsp;同心圆布局</el-button>
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('grid')"
            >&#xe667;&nbsp;网格布局</el-button>
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('radial')"
            >&#xe7bb;&nbsp;辐射状布局</el-button>
          </el-col>
          <!-- <el-col :span="6">
            <el-button size="mini" type="text">高维数据降维算法布局</el-button>
          </el-col>-->
        </el-row>
      </el-col>

      <el-col :span="3" style="border-right: 1px solid  #e5e7ec;">
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding:4px;font-size:12px;"
            >&#xe601;&nbsp;紧凑树布局</el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding:4px;font-size:12px;"
            >&#xe6b1;&nbsp;树状布局</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding:4px;font-size:12px;"
            >&#xe610;&nbsp;缩进布局</el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding:4px;font-size:12px;"
            >&#xe60a;&nbsp;脑图布局</el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row style="font-size:8px;color:gray;text-align: center;">
      <el-col :span="4" style="border-right:1px solid #e5e7ec;">
        <div>基本布局</div>
      </el-col>
      <el-col :span="3" style="text-align:center;border-right:1px solid #e5e7ec;">
        <div>树形布局</div>
      </el-col>
    </el-row>
  </div>
</template>
<script >
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
  },
  methods: {
    handleClickSwitchLayout(layoutName) {
      let layout;
      switch (layoutName) {
        case "random": // 随机
          layout = {
            type: "random", // 指定为力导向布局
            preventOverlap: true, // 防止节点重叠
            nodeSize: 30,
          };
          break;
        // case "force":
        //   layout = {
        //     // Object，可选，布局的方法及其配置项，默认为 random 布局。
        //     type: "force", // 指定为力导向布局
        //     preventOverlap: true, // 防止节点重叠
        //     nodeSize: 30, // 节点大小，用于算法中防止节点重叠时的碰撞检测。由于已经在上一节的元素配置中设置了每个节点的 size 属性，则不需要在此设置 nodeSize。
        //     linkDistance: 100, // 指定边距离为100
        //   };
        //   break;
        case "dagre": //层次
          layout = {
            type: "dagre",
            ranksep: 70,
            controlPoints: true,
            nodeSize: 30,
          };
          break;
        case "circular": // 圆形
          layout = {
            type: "circular",
          };
          break;
        case "grid": // 网格
          layout = {
            type: "grid",
            begin: [20, 20],
          };
          break;
        case "radial": // 辐射
          layout = {
            type: "radial",
            unitRadius: 50,
            preventOverlap: true,
            maxPreventOverlapIteration: 100,
          };
          break;
        case "concentric": // 同心圆
          layout = {
            type: "concentric",
            maxLevelDiff: 0.5,
            sortBy: "degree",
          };
          break;
        // case "mds":
        //   layout = {
        //     type: "mds",
        //     linkDistance: 100,
        //   };
        //   break;
      }

      this.$bus.$emit("swichLayout", {
        graphid: this.currentTableData.graphid,
        layout,
      });
    },
  },
};
</script>
<style scoped>
.TabVisible {
  -webkit-user-select: none;
}
</style>