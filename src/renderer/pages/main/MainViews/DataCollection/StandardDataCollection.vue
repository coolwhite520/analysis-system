<template>
  <div>
    <el-row>
      <h3>数据导入管理</h3>
    </el-row>
    <el-divider></el-divider>
    <el-row>
      批次选择：
      <el-select v-model="value" placeholder="请选择" size="mini">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-row>
    <el-row style="margin-top:20px;text-align:center;">
      <el-col :span="3">
        <el-button size="mini">银行数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">反洗钱数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">第三方支付数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">税务数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">话单数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">社交数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">物流数据</el-button>
      </el-col>
      <el-col :span="3">
        <el-button size="mini">JASS数据</el-button>
      </el-col>
    </el-row>
    <el-button></el-button>

    <!-- <el-row>
      <el-table :data="tableData" border style="width: 100%" height="250">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="name" label="姓名" width="180"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
      </el-table>
    </el-row>-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: 0,
      options: [
        {
          value: 1,
          label: "hahah"
        }
      ]
    };
  }
};
</script>

<style scoped>
</style>