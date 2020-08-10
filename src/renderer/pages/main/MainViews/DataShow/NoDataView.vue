<template>
  <div class="no-data-div">
    <el-row>
      <el-col :span="8">&nbsp;</el-col>
      <el-col :span="8">
        <div style="text-align:center;">
          <el-button
            class="iconfont"
            type="text"
            style="font-size:100px;"
            @click="handleClickImportData"
          >
            &#xe6a1;
            <div style="text-align:center; font-size:20px;">当前案件无数据，请进行数据采集</div>
          </el-button>
        </div>
      </el-col>
      <el-col :span="8">&nbsp;</el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  methods: {
    handleClickImportData() {
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", true);
    },
  },
};
</script>
<style>
.no-data-div {
  margin-top: 100px;
}
</style>