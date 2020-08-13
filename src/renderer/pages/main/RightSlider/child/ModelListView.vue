<template >
  <div class="all-slider" :style="{ height: contentViewHeight + 'px'}">
    <el-row class="title">
      <el-col :span="22">
        <div>
          <span class="iconfont">&#xe60f;</span>
          <span>模型库</span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <div class="capital-right-slider" :style="{height: (contentViewHeight - 40*2) + 'px'}">
      <el-menu class="el-menu-vertical-demo" @select="handleSelect" :default-openeds="openeds">
        <el-submenu
          v-for="father of currentTableData.modelTreeList"
          :key="father.mid"
          :index="String(father.mid)"
        >
          <template slot="title">
            <i class="iconfont">&#xe61c;</i>
            <span slot="title">{{father.modelname}}</span>
          </template>

          <el-menu-item
            v-for="child of father.childrenList"
            :key="child.mid"
            :index="String(child.mid)"
            class="menu-item iconfont"
          >
            <el-tooltip
              :disabled="child.describe===null"
              class="item"
              effect="dark"
              :content="child.describe"
              placement="top"
              :enterable="false"
              :open-delay="1000"
              :hide-after="10000"
            >
              <div>{{child.modelname}}</div>
            </el-tooltip>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <el-row class="foot">
      <el-col :span="24">
        <div>
          <span class="iconfont">&nbsp;</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";

export default {
  mounted() {
    this.selectCondition.SelectThType = {
      Index: 1,
      ThId: "JYMCGROUP",
      ThName: "按主体名称划分",
      DsThId: "JYDFMCGROUP",
      ThMemberCntId: "JYMCGROUPMEMBERCOUNT",
      DsThMemberCntId: "JYDFMCGROUPMEMBERCOUNT",
    };
    this.selectCondition.SelectDataTableColumn = [
      {
        CFIELD: "CXZH",
        CNAME: "交易账号",
        DATA_TYPE: 0, //VARCHAR
        SHOWABLE: "Y",
        COLUMN_TYPE: 0, //NONE
      },
      {
        CFIELD: "JYDFZKH",
        CNAME: "对手账号",
        DATA_TYPE: 0,
        SHOWABLE: "Y",
        COLUMN_TYPE: 0,
      },
      {
        CFIELD: "JDBZ",
        CNAME: "借贷标志",
        DATA_TYPE: 0,
        SHOWABLE: "Y",
        COLUMN_TYPE: 0,
      },
    ];
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList", "currentTableData"]),
  },
  data() {
    return {
      openeds: ["1"],
      selectCondition: {
        JYZE_MINValue: 10000.0,
        JYZEValue: 1000000.0,
        JYZECondition: "大于等于",
        JYZEConditionAccord: ">=",
        JYCSConditionAccord: ">=",
        XSMZ: "JYJE",
        JYCSCondition: "大于等于",
        JYCSValue: 10,
        XSGS: 10,
        GLDDZHS: 1,
        HLJE: 20000,
        JCB_MAX: 1.0,
        JCB_MIN: 1.0,
        JC_SJJG: 48,
        KEY_PERSIONS_DFMC: "",
        KEY_PERSIONS_JYMC: "",
        SJD: "YYYY-MM",
        SJD_CN: "月，YYYY-MM",
        XSMZPro: "",
        SFJEZB: 0.2,
        ZCDDGLGSSL: 2,
        BSRGLGSSL: 2,
        CWFZRGLGSSL: 2,
        XXSJEHJ: 50000.0,
        XFSHSL: 2,
        GFSHSL: 2,
        MINH: "00",
        MINM: "00",
        MINS: "00",
        MAXH: "23",
        MAXM: "59",
        MAXS: "59",
        MoneyIntervalStr: "1,2,5,10,20,50,100,1000,10000,10000",
        MinDate: "2010-01-01",
        MaxDate: this.getNowFormatDate(0),
        String_1: "CXZH,JYDFZKH,JDBZ",
        String_0: "交易账号,对手账号,借贷标志",
        JYSJ_START: "1970-01-01 00:00:00",
        JYSJ_END: this.getNowFormatDate(1),
        KEY_PERSIONS_JYZKH: "",
        KEY_PERSIONS_JYDFZKH: "",
        KEY_PERSIONS_JYZJHM: "",
        KEY_PERSIONS_JYDFZJHM: "",
        FILTER: "",
        RYGLFS: "",
        ZXKPSJ: 3,
        SelectThTypeIndex: 0, //团伙
        SelectThType: "", //this.thType[0],
        KYZT: "",
        JCZCSB_MIN: 0.1,
        JCZCSB_MAX: 10.0,
        SFJEB_MIN: 0.1,
        SFJEB_MAX: 10.0,
        SelectedSaveCondition: "",
        NodeNum: "0",
        LineNum: "0",
        SaveTime: "1970-01-01 00:00:00",
        SelectDataTableColumn: [], //this.defaultSelectDataTable,
        FiledsIsNullCondition:
          " AND CXZH IS NOT NULL AND LENGTH( COALESCE(CXZH, '0'))>0 AND JYDFZKH IS NOT NULL AND LENGTH( COALESCE(JYDFZKH, '0'))>0 AND JDBZ IS NOT NULL AND LENGTH( COALESCE(JDBZ, '0'))>0 ",
        FiledsEmptyToNullCondition:
          " CASE WHEN CXZH='' THEN NULL ELSE CXZH END AS CXZH,CASE WHEN JYDFZKH='' THEN NULL ELSE JYDFZKH END AS JYDFZKH,CASE WHEN JDBZ='' THEN NULL ELSE JDBZ END AS JDBZ ",
      },
    };
  },
  methods: {
    async handleSelect(key, keyPath) {
      let tid = keyPath[1];
      let pgsqlTemplate = "";
      let model = {};
      for (let item of this.currentTableData.modelTreeList) {
        for (let childitem of item.childrenList) {
          if (tid === String(childitem.mid)) {
            pgsqlTemplate = childitem.gpsqltemplate;
            model = childitem;
            break;
          }
        }
      }
      if (pgsqlTemplate === null) {
        this.$notify.error({
          title: "错误",
          message: `没有基础模版哦`,
        });
        return;
      }
      // 判断是否已经展示了这个页面，如果已经展示了，那么需要进行active
      for (let tableData of this.tableDataList) {
        if (tableData.tid === tid) {
          this.$store.commit("ShowTable/SET_ACTIVEINDEX", tid);
          return;
        }
      }
      // 执行默认参数进行查询
      let { ajid } = this.caseBase;
      let title = model.modelname;
      let orderby = model.orderby ? model.orderby : "";
      let showType = model.out_type ? parseInt(model.out_type) : 1;
      let mpids = model.mpids ? model.mpids.split(",") : [];
      let describe = model.describe;

      await this.$store.dispatch("ShowTable/showModelTable", {
        ajid,
        tid,
        title,
        pgsqlTemplate,
        orderby,
        filter: "",
        mpids,
        selectCondition: this.selectCondition,
        describe,
        showType,
        offset: 0,
        count: 30,
      });
    },
    handleClickClose() {
      this.$store.commit("ShowTable/HIDE_CURRENT_TABLE_RIGHT_VIEW");
    },
    getNowFormatDate(type = 0) {
      let date = new Date();
      let seperator1 = "-";
      let seperator2 = ":";
      let month = date.getMonth() + 1;
      let strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      if (type == 1) {
        return (
          date.getFullYear() +
          seperator1 +
          month +
          seperator1 +
          strDate +
          " " +
          date.getHours() +
          seperator2 +
          date.getMinutes() +
          seperator2 +
          date.getSeconds()
        );
      }
      return date.getFullYear() + seperator1 + month + seperator1 + strDate;
    },
  },
};
</script>

<style scoped>
.all-slider {
  /* position: relative; */
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
  -webkit-user-select: none;
}
.capital-right-slider {
  width: 100%;
  overflow-x: scroll; /*横向滚动*/
  height: 100%;
}
.title {
  height: 40px;
  text-align: center;
  /* background-color: #384e6e; */
  background: radial-gradient(ellipse at bottom, #384e6e 0%, #1b2735 100%);
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.foot {
  height: 40px;
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.menu-item {
  font-size: 12px;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
</style>
