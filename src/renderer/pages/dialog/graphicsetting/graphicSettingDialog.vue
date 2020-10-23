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
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe815;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
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
              <div style="margin-top: 3px">{{ item.id }}级</div>
            </el-col>
            <el-col :span="2">
              <el-color-picker
                v-model="item.color"
                size="mini"
              ></el-color-picker>
            </el-col>
            <template v-if="item.id === '1'">
              <el-col :span="7">
                <el-input-number
                  size="mini"
                  v-model="item.value"
                  type="number"
                  :min="1"
                  :max="myGraphicMoneySectionList[index + 1].value - 1"
                ></el-input-number>
              </el-col>
            </template>
            <template v-else-if="item.id === '2'">
              <el-col :span="5">
                <el-input
                  size="mini"
                  v-model="myGraphicMoneySectionList[index - 1].value"
                  disabled
                ></el-input>
              </el-col>
              <el-col :span="2">
                <div style="margin-top: 3px">&nbsp;&nbsp;至&nbsp;&nbsp;</div>
              </el-col>
              <el-col :span="7">
                <el-input-number
                  size="mini"
                  v-model="item.value"
                  :min="myGraphicMoneySectionList[index - 1].value + 1"
                  :max="myGraphicMoneySectionList[index + 1].value - 1"
                ></el-input-number>
              </el-col>
            </template>
            <template v-else-if="item.id === '3'">
              <el-col :span="5">
                <el-input
                  size="mini"
                  v-model="myGraphicMoneySectionList[index - 1].value"
                  disabled
                  type="number"
                ></el-input>
              </el-col>
              <el-col :span="2">
                <div style="margin-top: 3px">&nbsp;&nbsp;至&nbsp;&nbsp;</div>
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
                  v-model="myGraphicMoneySectionList[index - 1].value"
                  disabled
                  type="number"
                ></el-input>
              </el-col>
            </template>
            <el-col :span="6">
              <div style="margin-top: 3px">&nbsp;&nbsp;{{ item.label }}</div>
            </el-col>
          </el-row>
          <el-row>
            <el-button
              type="text"
              size="mini"
              @click="handleClickSET_NEW_MONEY_SPAN_COLOR"
              >恢复默认值</el-button
            >
          </el-row>
          <el-row style="margin-top: 20px" v-show="true">
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="16" style="text-align: center">
              <el-button
                type="primary"
                size="medium"
                @click="handleClickColorConfirm"
                >确定</el-button
              >
              <el-button size="medium" @click="handleClose">取消</el-button>
            </el-col>
            <el-col :span="4">&nbsp;</el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="交易线宽" name="second">
          <el-row
            ><span style="font-size: 12px">线宽设置开关：</span
            ><el-switch
              v-model="bOpen"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch
          ></el-row>
          <el-row style="margin-top: 20px; text-align: center">
            <span>划分标准：</span>
            <el-radio v-model="radioCatgray" label="je">按交易金额</el-radio>
            <el-radio v-model="radioCatgray" label="bs">按交易笔数</el-radio>
          </el-row>

          <el-row style="margin-top: 20px; text-align: center">
            <span> 线宽种类： </span>
            <el-radio v-model="radioCeng" label="1">3种</el-radio>
            <el-radio v-model="radioCeng" label="2">6种</el-radio>
            <el-radio v-model="radioCeng" label="3">9种</el-radio>
          </el-row>

          <el-row style="margin-top: 20px" v-show="true">
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="16" style="text-align: center">
              <el-button
                type="primary"
                size="medium"
                @click="handleClickColorConfirmXianKuan"
                >确定</el-button
              >
              <el-button size="medium" @click="handleClose">取消</el-button>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Default from "@/utils/sql/Default.js";
export default {
  mounted() {
    this.myGraphicMoneySectionList = JSON.parse(
      JSON.stringify(this.currentTableData.graphicMoneySectionList)
    );
    this.xianKuanSetting = JSON.parse(
      JSON.stringify(this.currentTableData.xianKuanSetting)
    );
    this.radioCatgray = this.xianKuanSetting.category;
    this.radioCeng = parseInt(this.xianKuanSetting.levelNum / 3) + "";
    this.bOpen = this.xianKuanSetting.open;
  },
  computed: {
    ...mapState("DialogPopWnd", ["graphicSettingVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  // watch: {
  //   myGraphicMoneySectionList: {
  //     handler(newValue, oldValue) {
  //       if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;
  //       console.log("myGraphicMoneySectionList", newValue, oldValue);
  //       // 因为第四个的值依赖第三个
  //       let item3;
  //       for (let item of newValue) {
  //         if (item.id === "3") {
  //           item3 = JSON.parse(JSON.stringify(item));
  //         }
  //         if (item.id === "4") {
  //           item.value = item3.value;
  //         }
  //       }
  //       this.$store.commit(
  //         "ShowTable/MOIDFY_GRAPHICMONEYSECTIONLIST",
  //         JSON.parse(JSON.stringify(newValue))
  //       );
  //     },
  //     deep: true,
  //   },
  // },
  data() {
    return {
      bOpen: false,
      radioCatgray: "",
      radioCeng: "",
      myGraphicMoneySectionList: null,
      activeName: "first",
      title: "连接线设置",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", false);
    },
    handleClickColorConfirm() {
      this.$store.commit(
        "ShowTable/SET_NEW_MONEY_SPAN_COLOR",
        JSON.parse(JSON.stringify(this.myGraphicMoneySectionList))
      );
      this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", false);
    },
    handleClickColorConfirmXianKuan() {
      let xianKuanSetting = {
        open: this.bOpen,
        category: this.radioCatgray,
        levelNum: parseInt(this.radioCeng) * 3,
      };
      if (
        JSON.stringify(xianKuanSetting) !== JSON.stringify(this.xianKuanSetting)
      ) {
        this.$store.commit(
          "ShowTable/SET_NEW_XIAN_KUAN",
          JSON.parse(JSON.stringify(xianKuanSetting))
        );
      }
      this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", false);
    },
    handleClickSET_NEW_MONEY_SPAN_COLOR() {
      this.myGraphicMoneySectionList = JSON.parse(
        JSON.stringify(Default.graphicMoneySectionList)
      );
      this.$store.commit(
        "ShowTable/SET_NEW_MONEY_SPAN_COLOR",
        this.myGraphicMoneySectionList
      );
    },
  },
};
</script>
