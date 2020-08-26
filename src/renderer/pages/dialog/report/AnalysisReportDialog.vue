<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="showReportVisible"
      width="50%"
      :before-close="handleClose"
      :modal="false"
    >
      <el-collapse v-model="activeNames" @change="handleChange" accordion>
        <el-collapse-item name="1">
          <template slot="title">
            <el-checkbox v-model="checkedHuoLiDuiShou">主要获利对手分析</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">
              <span>最小获利金额：</span>
            </el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template slot="title">
            <el-checkbox v-model="checkedMiQieLianXi">密切联系对手分析</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">最小关联人数：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="3">
          <template slot="title">
            <el-checkbox v-model="checkedZhuYaoZhuanChu">主要资金去向账号分析（主要转出对手）</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="2">
              <span>排序方式：</span>
            </el-col>
            <el-col :span="4">
              <el-select v-model="value" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="2">
              <span>排序前几:</span>
            </el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="4">
          <template slot="title">
            <el-checkbox v-model="checkedZhuYaoZhuanRu">主要资金来源账号分析（主要转入对手）</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="2">
              <span>排序方式：</span>
            </el-col>
            <el-col :span="4">
              <el-select v-model="value" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="2">
              <span>排序前几:</span>
            </el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="5">
          <template slot="title">
            <el-checkbox v-model="checkedJiJinJiChu">即进即出可以账户分析（按小时）</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">交易时间区间：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
            <el-col :span="1">&nbsp;小时</el-col>
            <el-col :span="3">&nbsp;</el-col>
            <el-col :span="3">交易最小金额：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
            <el-col :span="1">&nbsp;元</el-col>
          </el-row>
          <el-row style="margin-top:5px;">
            <el-col :span="3">出进比最小值：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="3">出进比最大值：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="6">
          <template slot="title">
            <el-checkbox v-model="checkedJiaoYiFangshi">交易方式统计</el-checkbox>
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="4">交易方式前几条：</el-col>
            <el-col :span="4">
              <el-input size="mini"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
      <el-row style="text-align:center;margin-top:20px;">
        <div>
          <el-button type="primary">生成报告</el-button>
        </div>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showReportVisible"]),
  },
  data() {
    return {
      title: "分析报告参数设定",
      activeNames: ["1"],
      checkedHuoLiDuiShou: true,
      checkedMiQieLianXi: true,
      checkedZhuYaoZhuanChu: true,
      checkedZhuYaoZhuanRu: true,
      checkedJiJinJiChu: true,
      checkedJiaoYiFangshi: true,
    };
  },
  methods: {
    handleChange(val) {
      console.log(val);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", false);
    },
  },
};
</script>
