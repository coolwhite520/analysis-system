<template>
  <div class="TabData">
    <el-row>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-dropdown trigger="click" @command="handleCommandDataCollection">
          <span class="el-dropdown-link">
            <span class="iconfont selfIcont" style="color:#0d233e">&#xe6a1;</span>
            <br />
            <span class="title-content" style="color:#0d233e">数据采集</span>
            <br />
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a" class="title-content">智能采集</el-dropdown-item>
            <el-dropdown-item command="b" class="title-content">标准采集</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe815;</span>
          <br />
          <span class="title-content">筛选</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe606;</span>
          <br />
          <span class="title-content">清除筛选</span>
          <br />
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe600;</span>
          <br />
          <span class="title-content">选择显示列</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe677;</span>
          <br />
          <span class="title-content">隐藏空列</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe89a;</span>
          <br />
          <span class="title-content">查找替换</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe669;</span>
          <br />
          <span class="title-content">特殊字符</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe61d;</span>
          <br />
          <span class="title-content">无效数据</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe6ff;</span>
          <br />
          <span class="title-content">数据去重</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe62c;</span>
          <br />
          <span class="title-content">同交易去重</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe602;</span>
          <br />
          <span class="title-content">数据补全</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe652;</span>
          <br />
          <span class="title-content">数据重置</span>
        </el-button>
      </el-col>

      <el-col :span="1">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe629;</span>
          <br />
          <span class="title-content">分组</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe60f;</span>
          <br />
          <span class="title-content">模型库</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe66b;</span>
          <br />
          <span class="title-content">模型参数</span>
        </el-button>
      </el-col>
      <el-col :span="1" style="border-right:1px solid #e5e7ec;">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe607;</span>
          <br />
          <span class="title-content">可视化</span>
        </el-button>
      </el-col>
      <el-col :span="1">
        <el-button type="text" class="ctrl-button">
          <span class="iconfont selfIcont">&#xe637;</span>
          <br />
          <span class="title-content">导出数据</span>
        </el-button>
      </el-col>
    </el-row>
    <!-- 智能采集 -->
    <auto-dialog></auto-dialog>
    <!-- 标准采集 -->
    <standard-dialog></standard-dialog>
  </div>
</template>
<script >
import StandardDataCollectionDialog from "@/pages/dialog/StandardDataCollectionDialog";
import AutoDataCollectionDialog from "@/pages/dialog/AutoDataCollectionDialog";
import { mapState } from "vuex";
export default {
  components: {
    "standard-dialog": StandardDataCollectionDialog,
    "auto-dialog": AutoDataCollectionDialog,
  },
  computed: {
    ...mapState("CaseDetail", ["caseDetail"]),
  },
  methods: {
    async handleCommandDataCollection(command) {
      await this.$store.dispatch(
        "CaseDetail/queryBatchCount",
        this.caseDetail.ajid
      );
      await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");
      if (command === "a") {
        console.log(command);
        this.$store.commit("DialogPopWnd/SET_AUTODATAVISIBAL", true);
      } else if (command === "b") {
        this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", true);
      }
    },
  },
};
</script>
<style scoped>
.TabData {
  -webkit-user-select: none;
}
.el-dropdown-link {
  cursor: pointer;
}
.el-col {
  text-align: center;
}
.selfIcont {
  font-size: 30px;
}
.title-content {
  font-size: 10px;
}
.ctrl-button {
  padding-top: 4px;
}
</style>