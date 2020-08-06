<template>
  <div
    class="childModel"
    :style="{zIndex: 9999, 
    position:'absolute', 
    top: 0+'px', 
    left: position.left+'px', 
    height: position.height + 'px', 
    width: position.width+'px'}"
  >
    <el-row class="title">
      <el-col :span="22">
        <div>
          <span class="iconfont">&#xe60f;模型参数</span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <el-row>
      <div class="modelTitle">模型名称：</div>
      <div class="modelDescribe">{{model.modelname}}</div>
    </el-row>
    <el-row>
      <div class="modelTitle">模型用途：</div>
      <div class="modelDescribe">{{model.describe}}</div>
    </el-row>

    <el-row>
      <div class="modelTitle">参数设置：</div>
      <div class="modelDescribe">{{model.describe}}</div>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ["position", "model"],
  mounted() {},
  methods: {
    handleClickClose() {
      this.$store.commit("MainPageSwitch/HIDE_CHILD_MODEL");
      console.log(this.model);
    },
  },
};
</script>
<style scoped>
.childModel {
  background-color: white;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.modelTitle {
  margin-top: 30px;
  margin-left: 10px;
  font-size: 13px;
}
.modelDescribe {
  margin-top: 10px;
  margin-left: 20px;
  font-size: 11px;
  color: gray;
}
</style>