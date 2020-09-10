<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="graphicSettingVisible"
      width="30%"
      :before-close="handleClose"
      :modal="false"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white;font-size:30px;">&#xe815;</i>
        <span class="title-text" style="color: white;">{{title}}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="交易金额颜色" name="first">
          <el-row
            v-for="(item, index) in myGraphicMoneySectionList"
            :key="item.id"
            justify="center"
          >
            <el-col :span="2">
              <div style="margin-top:3px;">{{item.id}}级</div>
            </el-col>
            <el-col :span="2">
              <el-color-picker v-model="item.color" size="mini"></el-color-picker>
            </el-col>
            <template v-if="item.id === '1'">
              <el-col :span="7">
                <el-input-number
                  size="mini"
                  v-model="item.value"
                  type="number"
                  :min="1"
                  :max="myGraphicMoneySectionList[index+1].value-1"
                ></el-input-number>
              </el-col>
            </template>
            <template v-else-if="item.id === '2'">
              <el-col :span="5">
                <el-input size="mini" v-model="myGraphicMoneySectionList[index-1].value" disabled></el-input>
              </el-col>
              <el-col :span="2">
                <div style="margin-top:3px;">&nbsp;&nbsp;至&nbsp;&nbsp;</div>
              </el-col>
              <el-col :span="7">
                <el-input-number
                  size="mini"
                  v-model="item.value"
                  :min="myGraphicMoneySectionList[index - 1].value + 1"
                  :max="myGraphicMoneySectionList[index+1].value - 1"
                ></el-input-number>
              </el-col>
            </template>
            <template v-else-if="item.id === '3'">
              <el-col :span="5">
                <el-input
                  size="mini"
                  v-model="myGraphicMoneySectionList[index-1].value"
                  disabled
                  type="number"
                ></el-input>
              </el-col>
              <el-col :span="2">
                <div style="margin-top:3px;">&nbsp;&nbsp;至&nbsp;&nbsp;</div>
              </el-col>
              <el-col :span="7">
                <el-input-number
                  size="mini"
                  v-model="item.value"
                  :min="myGraphicMoneySectionList[index - 1].value + 1"
                ></el-input-number>
              </el-col>
            </template>
            <template v-else-if="item.id === '4'">
              <el-col :span="5">
                <el-input
                  size="mini"
                  v-model="myGraphicMoneySectionList[index-1].value"
                  disabled
                  type="number"
                ></el-input>
              </el-col>
            </template>
            <el-col :span="6">
              <div style="margin-top:3px;">&nbsp;&nbsp;{{item.label}}</div>
            </el-col>
          </el-row>
          <el-row style="margin-top:30px;">
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="16" style="text-align:center">
              <el-button type="primary" size="medium" @click="handleClickColorTab">确定</el-button>
              <el-button size="medium" @click="handleClose">取消</el-button>
            </el-col>
            <el-col :span="4">&nbsp;</el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="交易线宽" name="second">配置管理</el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  beforeMount() {
    this.myGraphicMoneySectionList = JSON.parse(
      JSON.stringify(this.currentTableData.graphicMoneySectionList)
    );
  },
  computed: {
    ...mapState("DialogPopWnd", ["graphicSettingVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  watch: {
    myGraphicMoneySectionList: {
      handler(newValue, oldValue) {
        // 因为第四个的值依赖第三个
        let item3;
        for (let item of newValue) {
          if (item.id === "3") {
            item3 = JSON.parse(JSON.stringify(item));
          }
          if (item.id === "4") {
            item.value = item3.value;
          }
        }
        this.$store.commit(
          "ShowTable/MOIDFY_GRAPHICMONEYSECTIONLIST",
          JSON.parse(JSON.stringify(newValue))
        );
      },
      deep: true,
    },
  },
  data() {
    return {
      myGraphicMoneySectionList: null,
      activeName: "first",
      title: "连接线设置",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", false);
    },
    handleClickColorTab() {},
  },
};
</script>
