<template>
  <div class="TabVisible">
    <el-row style="text-align:center">
      <el-col :span="5" style="border-right: 1px solid  #e5e7ec;">
        <el-row>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('random')"
            >&#xe6cd;&nbsp;随机布局</el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('force')"
            >&#xe63f;&nbsp;力导向布局</el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('mds')"
            >&#xe92b;&nbsp;高维数据布局</el-button>
          </el-col>
          <el-col :span="6">
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
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
            >&#xe737;&nbsp;层次布局</el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('concentric')"
            >&#xe605;&nbsp;同心圆布局</el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('grid')"
            >&#xe667;&nbsp;网格布局</el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('dendrogram')"
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
      <el-col :span="5" style="border-right:1px solid #e5e7ec;">
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
  methods: {
    handleClickSwitchLayout(layout) {},
  },
};
</script>
<style scoped>
.TabVisible {
  -webkit-user-select: none;
}
</style>