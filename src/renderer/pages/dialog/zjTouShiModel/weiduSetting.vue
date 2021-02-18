<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showWeiSettingVisible"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe607;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>

    <el-transfer
      filterable
      :filter-method="filterMethod"
      filter-placeholder="输入可快速查找"
      v-model="rightExistList"
      :data="data"
      @right-check-change="handelRightChange"
      :titles="['分类维度待选框', '分类维度选中框']"
      target-order="push"
    >
      <div slot="left-footer">
        <el-checkbox
          v-model="checkedHiddenNull"
          style="margin-top: 10px"
          @change="handleChangeChecked"
          >隐藏空字段</el-checkbox
        >
      </div>
      <div slot="right-footer" style="text-align: center">
        <el-button-group style="width: 100%; margin-top: 5px">
          <el-button
            size="small"
            style="width: 50%; border-right: 1px solid #eceef4"
            type="text"
            @click="handleClickMoveUp"
            >上移</el-button
          >
          <el-button
            size="small"
            style="width: 50%"
            type="text"
            @click="handleClickMoveDown"
            >下移</el-button
          >
        </el-button-group>
      </div>
    </el-transfer>
    <el-row
      style="
        text-align: center;
        font-size: 10px;
        margin-top: 15px;
        color: #f29c38;
      "
      >当前分类维度：{{ currentWeiDuTips }}</el-row
    >
    <el-row style="text-align: center; margin-top: 20px">
      <el-button size="medium" @click="handleClose" style="width: 30%"
        >取消</el-button
      >
      <el-button
        size="medium"
        @click="handleClickSure"
        type="primary"
        style="width: 30%"
        >确定</el-button
      >
    </el-row>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
import showTableDb from "@/db/DataShowTable";
import Default from "@/utils/sql/Default";
import Base from "@/db/Base";

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showWeiSettingVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("CaseDetail", ["caseBase"]),
    currentWeiDuTips() {
      let arr = [];
      for (let key of this.rightExistList) {
        let obj = this.data.find((item) => item.key === key);
        if (obj) {
          arr.push(obj.label);
        }
      }
      return arr.join(",");
    },
  },
  async beforeMount() {
    this.selectCondition = this.$lodash.cloneDeep(
      this.currentTableData.selectCondition
    );
    let ret = await showTableDb.QueryTableShowCFields(4);
    let headers = ret.rows;
    this.data = headers.map((item) => {
      return {
        label: item.fieldcname,
        key: item.fieldename.toUpperCase(),
      };
    });
    this.rightExistList = this.selectCondition.String_1.split(",");
    // this.currentWeiDuTips = this.currentTableData.selectCondition.String_0;
  },
  data() {
    return {
      selectCondition: null,
      checkedHiddenNull: false,
      title: "设置分类维度",
      data: [],
      rightSelectedKeys: [],
      rightExistList: [],
      filterMethod(query, item) {
        return item.label.indexOf(query) > -1;
      },
    };
  },
  methods: {
    async handleChangeChecked(val) {
      if (val) {
        for (let index = this.data.length - 1; index >= 0; index--) {
          let sql = `select count(*)::int count from ff_bank_records where ${this.data[index].key} is not null`;
          let res = await Base.QueryCustom(sql, this.caseBase.ajid);
          console.log(res);
          if (res.success && res.rows[0].count === 0) {
            this.data.splice(index, 1);
          }
        }
      } else {
        let ret = await showTableDb.QueryTableShowCFields(4);
        let headers = ret.rows;
        this.data = headers.map((item) => {
          return {
            label: item.fieldcname,
            key: item.fieldename.toUpperCase(),
          };
        });
      }
    },
    handleClickMoveUp() {
      if (this.rightSelectedKeys.length > 0) {
        let firstIndex = this.rightExistList.findIndex(
          (item) => item === this.rightSelectedKeys[0]
        );
        if (firstIndex > 0) {
          for (let key of this.rightSelectedKeys) {
            let index = this.rightExistList.findIndex((item) => item === key);
            this.rightExistList.splice(index, 1);
            this.rightExistList.splice(index - 1, 0, key);
          }
          let tempList = this.$lodash.cloneDeep(this.rightExistList);
          this.rightExistList = [];
          for (let item of tempList) {
            this.rightExistList.push(item);
          }
        }
      }
    },
    handleClickMoveDown() {
      if (this.rightExistList.length > 0) {
        let lastIndex = this.rightExistList.findIndex(
          (item) =>
            item === this.rightSelectedKeys[this.rightSelectedKeys.length - 1]
        );
        if (lastIndex < this.rightExistList.length - 1) {
          let reverseArr = this.$lodash.cloneDeep(this.rightSelectedKeys);
          for (let key of reverseArr.reverse()) {
            let index = this.rightExistList.findIndex((item) => item === key);
            this.rightExistList.splice(index, 1);
            this.rightExistList.splice(index + 1, 0, key);
          }
          let tempList = this.$lodash.cloneDeep(this.rightExistList);
          this.rightExistList = [];
          for (let item of tempList) {
            this.rightExistList.push(item);
          }
        }
      }
    },
    handleClickSure() {
      console.log(this.rightExistList);
      if (this.rightExistList.length === 0) {
        this.$message({
          message: "请至少选择一个维度进行分析!",
        });
        return;
      }
      let list = this.rightExistList.map((key) => {
        let obj = this.data.find((item) => item.key === key);
        return {
          FiledENStr: obj.key,
          FiltrateFieldCN: obj.label,
        };
      });
      let obj = Default.set421param(list);
      console.log(obj);
      this.selectCondition.String_0 = obj.FiledCNStr;
      this.selectCondition.String_1 = obj.FiledENStr;
      this.selectCondition.FiledsEmptyToNullCondition =
        obj.FiledsEmptyToNullCondition;
      this.selectCondition.FiledsIsNullCondition = obj.FiledsIsNullCondition;
      this.$store.commit("ShowTable/UPDATE_MODEL_SELECTION", {
        pageIndex: this.currentTableData.pageIndex,
        selectCondition: this.selectCondition,
      });
      this.handleClose();
      this.$store.dispatch(this.currentTableData.dispatchName, {
        ...this.currentTableData,
        offset: 0,
        count: 30,
      });
    },
    handelRightChange(keys) {
      this.rightSelectedKeys = [];
      for (let item of this.rightExistList) {
        if (keys.includes(item)) {
          this.rightSelectedKeys.push(item);
        }
      }
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWWEISETTINGVISIBLE", false);
    },
  },
};
</script>

<style scoped>
/deep/.el-dialog {
  width: 700px;
}
/deep/.el-transfer {
  width: 640px;
  margin: 0 auto;
  margin-left: 40px;
}
/deep/.el-transfer-panel {
  height: 400px;
}
/deep/.el-transfer-panel__list {
  height: 250px;
}
/deep/.el-checkbox__label {
  color: #3c4e6b;
}
</style>