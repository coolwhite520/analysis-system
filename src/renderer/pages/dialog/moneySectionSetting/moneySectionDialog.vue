<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :append-to-body="true"
      :title="title"
      :visible="showMoneySectionDialog"
      width="30%"
      @close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe61b;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>

      <div v-for="(item, index) of renderMoneyList" :key="index">
        <span> {{ index }}.&nbsp;&nbsp;&nbsp;&nbsp;</span>

        <el-input-number
          v-if="item.begin !== null"
          v-model="item.begin"
          :disabled="true"
          label="begin"
          size="mini"
        ></el-input-number>

        <span v-if="item.begin !== null && item.end !== null"
          >&nbsp;&nbsp;-&nbsp;&nbsp;</span
        >

        <el-input-number
          v-if="item.end !== null"
          v-model="item.end"
          :min="item.begin !== null ? item.begin + 1 : 1"
          label="end"
          size="mini"
          @change="(v1, v2) => handleChangeValue(index, v1, v2)"
        ></el-input-number>

        <span>{{ item.des }}</span>

        <template v-if="index === 0"></template>
        <template v-else-if="index === renderMoneyList.length - 1">
          <el-button
            size="mini"
            class="iconfont"
            type="text"
            @click="handleClickAdd(index)"
            >&#xe61f;</el-button
          >
        </template>
        <template v-else>
          <el-button
            size="mini"
            class="iconfont"
            type="text"
            @click="handleClickRemove(index)"
            >&#xe616;</el-button
          ></template
        >
      </div>
      <el-row style="margin-top: 20px; text-align: center">
        <el-button
          size="small"
          @click="makeSection('1,2,5,10,20,50,100,1000,10000,10000')"
          >恢复默认参数</el-button
        >
        <el-button size="small" type="primary" @click="handleClickExec"
          >执行当前设置</el-button
        >
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Default from "@/utils/sql/Default.js";
export default {
  mounted() {
    this.makeSection(this.currentTableData.selectCondition.MoneyIntervalStr);
  },
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("DialogPopWnd", ["showMoneySectionDialog"]),
  },

  data() {
    return {
      title: "金额区间设置",
      renderMoneyList: [],
    };
  },
  methods: {
    // "1,2,5,10,20,50,100,1000,10000,10000"
    makeSection(sectionStr) {
      this.renderMoneyList = [];
      let arrMoneyInterval = sectionStr.split(",");
      for (let i = 0; i < arrMoneyInterval.length; i++) {
        if (i === 0) {
          this.renderMoneyList.push({
            begin: null,
            end: parseInt(arrMoneyInterval[i]),
            des: "万以下",
          });
        } else if (i === arrMoneyInterval.length - 1) {
          this.renderMoneyList.push({
            begin: parseInt(arrMoneyInterval[i - 1]),
            end: null,
            des: "万以上",
          });
        } else {
          this.renderMoneyList.push({
            begin: parseInt(arrMoneyInterval[i - 1]),
            end: parseInt(arrMoneyInterval[i]),
            des: "万元",
          });
        }
      }
    },
    handleClickRemove(index) {
      let preItem = this.renderMoneyList[index - 1];
      let nextItem = this.renderMoneyList[index + 1];
      nextItem.begin = preItem.end;
      this.renderMoneyList.splice(index, 1);
    },
    handleClickAdd(index) {
      let preItem = this.renderMoneyList[index - 1];
      let newItem = {
        begin: preItem.end,
        end: preItem.end + 1,
        des: "万元",
      };
      let lastItem = this.renderMoneyList[index];
      lastItem.begin = newItem.end;
      this.renderMoneyList.splice(index, 0, newItem);
    },
    handleChangeValue(index, currentValue, oldValue) {
      console.log(index, currentValue, oldValue);
      this.renderMoneyList.forEach((item, i) => {
        if (i > index) {
          let spanValue = currentValue - oldValue;
          item.begin !== null && (item.begin += spanValue);
          item.end !== null && (item.end += spanValue);
        }
      });
    },
    async handleClickExec() {
      let valuesArr = this.renderMoneyList.map((item) => {
        let arr = [];
        item.begin && arr.push(item.begin);
        item.end && arr.push(item.end);
        return arr;
      });
      console.log(valuesArr);
      valuesArr = this.$lodash.union(...valuesArr);
      valuesArr.push(valuesArr[valuesArr.length - 1]);
      let moneyStr =
        valuesArr.length === 1 ? `${valuesArr[0]}` : valuesArr.join(",");
      console.log(moneyStr);
      let selectCondition = this.$lodash.cloneDeep(
        this.currentTableData.selectCondition
      );
      selectCondition.MoneyIntervalStr = moneyStr;
      // 先更新currentTable的过滤条件
      await this.$store.commit("ShowTable/UPDATE_MODEL_SELECTION", {
        pageIndex: this.currentTableData.pageIndex,
        selectCondition: selectCondition,
      });
      await this.$store.dispatch(this.currentTableData.dispatchName, {
        ...this.currentTableData,
        offset: 0,
        count: 30,
      });
      this.$store.commit("DialogPopWnd/SET_SHOWMONEYSECTIONDIALOG", false);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWMONEYSECTIONDIALOG", false);
    },
  },
};
</script>
