<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      title="标准数据采集"
      :visible.sync="standardDataVisible"
      width="80%"
      :before-close="handleClose"
    >
      <el-row>
        <el-col :span="21">
          <h3>数据导入管理</h3>
        </el-col>
        <el-col :span="1" style="float: right; margin-right:20px;">
          <div>
            <el-button type="text">模版下载</el-button>
          </div>
        </el-col>
      </el-row>

      <el-row>
        批次选择：
        <el-select v-model="value" placeholder="请选择导入批次" size="mini">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-row>
      <el-row style="margin-top:20px;">
        <el-button-group>
          <el-button size="mini">
            <span class="mybutton iconfont">&#xe618;</span> 银行数据
          </el-button>
          <el-button size="mini">
            <span class="mybutton iconfont">&#xe613;</span> 反洗钱数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe70f;</span> 第三方支付数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe65f;</span>税务数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe608;</span> 话单数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe61e;</span> 社交数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe615;</span> 物流数据
          </el-button>

          <el-button size="mini">
            <span class="mybutton iconfont">&#xe602;</span> JASS数据
          </el-button>
        </el-button-group>
      </el-row>
      <!-- <div style="height: 200px;">
      <test-table></test-table>
      </div>-->
      <div style="margin-top:20px;">
        <el-table :data="tableData" height="200" border style="width: 100%" size="mini">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="orderno" label="序号" width="60" fixed></el-table-column>
          <el-table-column prop="excel" label="工作簿（文件名）" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sheet" label="工作表（sheet）" show-overflow-tooltip></el-table-column>
          <el-table-column prop="match" label="匹配目标表" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>
      <div style="margin-top:20px;">
        <el-table :data="tableData" height="200" border style="width: 100%" size="mini">
          <el-table-column prop="orderno" label="序号" width="60" fixed></el-table-column>
          <el-table-column prop="filecol" label="文件字段" show-overflow-tooltip></el-table-column>
          <el-table-column prop="instance1" label="文件表数据实例1" show-overflow-tooltip></el-table-column>
          <el-table-column prop="instance2" label="文件表数据实例2" show-overflow-tooltip></el-table-column>
          <el-table-column prop="dbcol" label="数据库字段" show-overflow-tooltip></el-table-column>
          <el-table-column prop="operation" label="操作" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>
      <div style="margin-top:20px;text-align: center;">
        <el-button>数据导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible"])
  },
  data() {
    return {
      value: 0,
      options: [],
      tableData: []
    };
  },
  components: {},
  methods: {
    handleClose() {
      this.currentStepIndex = 1;
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
    }
  }
};
</script>

<style>
.standard-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
}
.standard-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
.standard-data-dialog .el-dialog__title {
  color: white;
}
</style>

