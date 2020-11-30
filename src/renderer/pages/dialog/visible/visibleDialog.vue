<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showDataVisibilityDialogVisible"
    width="35%"
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
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="推荐设定" name="first" style="text-align: center">
        <el-row>
          <el-col :span="8">
            <div
              class="myRadioDataType"
              @click="
                handleClickDataType('1', '/static/images/icons/银行卡.png')
              "
              :style="{
                backgroundColor:
                  selectDataTypeValue === '1' ? '#f0fefe' : 'white',
              }"
            >
              <img
                src="/static/images/icons/银行卡.png"
                width="40"
                height="40"
                style="vertical-align: middle"
              />
              <div>账户</div>
              <div class="iconfont">
                {{ selectDataTypeValue === "1" ? "&#xe627;" : "&#xe611;" }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="myRadioDataType"
              @click="handleClickDataType('3', '/static/images/icons/主体.png')"
              :style="{
                backgroundColor:
                  selectDataTypeValue === '3' ? '#f0fefe' : 'white',
              }"
            >
              <img
                src="/static/images/icons/主体.png"
                width="40"
                height="40"
                style="vertical-align: middle"
              />
              <div>主体名称</div>
              <div class="iconfont">
                {{ selectDataTypeValue === "3" ? "&#xe627;" : "&#xe611;" }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div
              class="myRadioDataType"
              @click="handleClickDataType('2', '/static/images/icons/证件.png')"
              :style="{
                backgroundColor:
                  selectDataTypeValue === '2' ? '#f0fefe' : 'white',
              }"
            >
              <img
                src="/static/images/icons/证件.png"
                width="40"
                height="40"
                style="vertical-align: middle"
              />
              <div>证件号码</div>
              <div class="iconfont">
                {{ selectDataTypeValue === "2" ? "&#xe627;" : "&#xe611;" }}
              </div>
            </div>
          </el-col>
        </el-row>

        <div
          class="myRadio"
          @click="handleClickSelect('1')"
          type="text"
          :style="{
            color: selectShowTypeValue === '1' ? '#1e1e1e' : 'gray',
            backgroundColor: selectShowTypeValue === '1' ? '#f0fefe' : 'white',
          }"
        >
          <span class="iconfont">
            {{ selectShowTypeValue === "1" ? "&#xe627;" : "&#xe611;" }}
          </span>
          <span>&nbsp;&nbsp;汇总&nbsp;&nbsp;</span>
          <img
            :src="imgSrc"
            width="40"
            height="40"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/row/row2.png"
            width="160"
            height="40"
            style="vertical-align: middle"
          />
          <img
            :src="imgSrc"
            width="40"
            height="40"
            style="vertical-align: middle"
          />
        </div>
        <div
          class="myRadio"
          @click="handleClickSelect('2')"
          type="text"
          :style="{
            color: selectShowTypeValue === '2' ? '#1e1e1e' : 'gray',
            backgroundColor: selectShowTypeValue === '2' ? '#f0fefe' : 'white',
          }"
        >
          <span class="iconfont">
            {{ selectShowTypeValue === "2" ? "&#xe627;" : "&#xe611;" }}
          </span>
          <span>&nbsp;&nbsp;差额&nbsp;&nbsp;</span>
          <img
            :src="imgSrc"
            width="40"
            height="40"
            style="vertical-align: middle"
          />
          <img
            src="/static/images/row/row1.png"
            width="160"
            height="28"
            style="vertical-align: middle"
          />
          <img
            :src="imgSrc"
            width="40"
            height="40"
            style="vertical-align: middle"
          />
        </div>

        <el-row style="margin-top: 20px">
          <el-col :span="6">最小交易次数:</el-col>
          <el-col :span="16">
            <el-input size="small" v-model="minJybs"></el-input
          ></el-col>
          <el-col :span="2">&nbsp;</el-col>
        </el-row>
        <el-row style="margin-top: 10px; text-align: center">
          <el-col :span="6">最小交易金额:</el-col>
          <el-col :span="16">
            <el-input size="small" v-model="minJyje"></el-input
          ></el-col>
          <el-col :span="2">&nbsp;</el-col>
        </el-row>
        <el-row style="margin-top: 30px">
          <el-button
            type="primary"
            style="width: 50%"
            @click="handleClickSubmit"
            :loading="loading"
            >确定</el-button
          >
        </el-row>
      </el-tab-pane>
      <!-- <el-tab-pane label="自定义" name="second">自定义</el-tab-pane> -->
    </el-tabs>
  </el-dialog>
</template>
<script>
import { log } from "electron-log";
import { mapState } from "vuex";
import convertSql from "@/utils/sql/DataFiltrator.js";

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showDataVisibilityDialogVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
    title() {
      return `数据可视化-${this.currentTableData.title}`;
    },
  },
  mounted() {},
  data() {
    return {
      selectDataTypeValue: "1",
      selectShowTypeValue: "1",
      activeName: "first",
      minJybs: 100,
      minJyje: 100000,
      imgSrc: "/static/images/icons/银行卡.png",
      loading: false,
    };
  },
  methods: {
    handleClickDataType(value, imageSrc) {
      this.selectDataTypeValue = value;
      this.imgSrc = imageSrc;
    },
    handleClickSelect(value) {
      this.selectShowTypeValue = value;
    },
    handleClose() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWDATAVISIBILITYDIALOGVISIBLE",
        false
      );
    },
    async handleClickSubmit() {
      try {
        this.loading = true;
        let tid, title;
        switch (this.selectDataTypeValue) {
          case "1":
            {
              tid = 202;
              title =
                "资金交易-账户-" +
                (this.selectShowTypeValue === "1"
                  ? "汇总可视化"
                  : "差额可视化");
            }
            break;
          case "2":
            {
              tid = 204;
              title =
                "资金交易-证件号码-" +
                (this.selectShowTypeValue === "1"
                  ? "汇总可视化"
                  : "差额可视化");
            }
            break;
          case "3":
            {
              tid = 203;
              title =
                "资金交易-主体名称-" +
                (this.selectShowTypeValue === "1"
                  ? "汇总可视化"
                  : "差额可视化");
            }
            break;
        }
        await this.getVisibleInfoByTid(tid, title);
        this.handleClose();
        this.loading = false;
      } catch (e) {
        this.$message.error({
          message: e.message,
        });
        this.loading = false;
      }
    },
    async getVisibleInfoByTid(tid, title) {
      let selectShowTypeValue = this.selectShowTypeValue;
      let selectDataTypeValue = this.selectDataTypeValue;
      let imgSrc = this.imgSrc;
      let {
        count,
        offset,
        selectCondition,
        modelFilterStr,
        modelFilterChildList,
      } = this.currentTableData;
      selectCondition = JSON.parse(JSON.stringify(selectCondition));
      selectCondition.JYZEValue = parseInt(this.minJyje); // 交易总额
      selectCondition.JYCSValue = parseInt(this.minJybs); // 交易笔数

      let filterChildStr = convertSql.convertDataFilterToSqlStr(
        parseInt(tid),
        this.currentTableData.modelFilterChildList
      );
      await this.$store.dispatch("ShowTable/showDataVisibleTable", {
        title,
        tid,
        count,
        offset,
        selectCondition,
        modelFilterStr: filterChildStr,
        modelFilterChildList: [],
        selectShowTypeValue,
        selectDataTypeValue,
        imgSrc,
        offset: 0,
        count: 30,
      });
    },
  },
};
</script>
<style scoped>
.myRadio {
  border: 1px solid #dddfe5;
  border-radius: 5px;
  padding: 10px;
  margin: 20px;
}
.myRadio:hover {
  border-color: #273144;
  cursor: pointer;
}
.myRadioDataType {
  border: 1px solid #dddfe5;
  border-radius: 5px;
  padding: 10px;
  margin: 20px;
}
.myRadioDataType:hover {
  border-color: #273144;
  cursor: pointer;
}
</style>
