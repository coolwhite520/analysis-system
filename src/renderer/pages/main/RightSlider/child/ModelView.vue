<template>
  <div>
    <el-row class="title">
      <el-col :span="22">
        <div>
          <span class="iconfont">&#xe60f;模型参数</span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <el-row>
      <div class="modelTitle">模型名称：</div>
      <div class="modelDescribe">{{model.modelname}}</div>
    </el-row>
    <el-row>
      <div class="modelTitle">模型用途：</div>
      <div class="modelDescribe">{{model.describe}}</div>
    </el-row>
    <el-row>
      <div class="modelTitle">模型数据：</div>
      <div class="modelDescribe">{{model.describe}}</div>
    </el-row>

    <el-row>
      <div v-show="mpids.length>0" class="modelTitle">参数设置：</div>
      <div class="modelDescribe">
        <div v-show="mpids.includes('1')">
          <div class="childTitle">交易账卡号：</div>
          <div>
            <el-input
              placeholder="请输入交易账卡号"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_JYZKH"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('2')">
          <div class="childTitle">交易对手账卡号：</div>
          <div>
            <el-input
              placeholder="请输入对方交易账卡号"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_JYDFZKH"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('3')">
          <div class="childTitle">关键人员：</div>
          <div>
            <el-input
              placeholder="请输入交易名称"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_JYMC"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('4')">
          <div class="childTitle">对手关键人员：</div>
          <div>
            <el-input
              placeholder="请输入对方交易名称"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_DFMC"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('5')">
          <div class="childTitle">交易证照号码：</div>
          <div>
            <el-input
              placeholder="请输入交易证照号码"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_JYZJHM"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('6')">
          <div class="childTitle">交易对手证照号码：</div>
          <div>
            <el-input
              placeholder="请输入交易对手证照号码"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.KEY_PERSIONS_JYDFZJHM"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('7')">
          <div class="childTitle">获利金额：</div>
          <div>
            <el-input
              placeholder="请输入获利金额"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.HLJE"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('8')">
          <div class="childTitle">关联账户数阀值：</div>
          <div>
            <el-input
              placeholder="请输入关联账户数阀值"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.GLDDZHS"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('9')">
          <div class="childTitle">最小交易额 大于等于：</div>
          <div>
            <el-input
              placeholder="请输入最小交易额"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.JYZE_MINValue"
            ></el-input>
            <span>多个请用逗号隔</span>
          </div>
        </div>
        <div v-show="mpids.includes('10')">
          <div class="childTitle">交易金额：</div>
          <div class="childSelection">
            <el-select
              size="mini"
              v-model="SelectCondition.JYZEConditionAccord"
              placeholder="请选择"
              @visible-change="visibleChange"
              style="width:40%;"
            >
              <el-option
                v-for="item in listst_jyje"
                :key="item.JYZEConditionAccord"
                :label="item.JYZECondition"
                :value="item.JYZEConditionAccord"
              ></el-option>
            </el-select>
            <el-input
              size="mini"
              style="width:40%;"
              placeholder="请输入交易金额"
              v-model="SelectCondition.JYZEValue"
            ></el-input>
            <span>元</span>
          </div>
        </div>
        <div v-show="mpids.includes('11')" class="selectionItem">
          <div class="childTitle">交易总额：</div>
          <div class="childSelection">
            <el-select
              size="mini"
              v-model="SelectCondition.JYZEConditionAccord"
              placeholder="请选择"
              @visible-change="visibleChange"
              style="width:40%;"
            >
              <el-option
                v-for="item in listst_jyje"
                :key="item.JYZEConditionAccord"
                :label="item.JYZECondition"
                :value="item.JYZEConditionAccord"
              ></el-option>
            </el-select>
            <el-input
              size="mini"
              style="width:40%;"
              placeholder="请输入交易总额"
              v-model="SelectCondition.JYZEValue"
            ></el-input>
            <span>元</span>
          </div>
        </div>
        <div v-show="mpids.includes('12')" class="selectionItem">
          <div class="childTitle">交易笔数：</div>
          <div class="childSelection">
            <el-select
              size="mini"
              style="width:40%;"
              v-model="SelectCondition.JYCSConditionAccord"
              placeholder="请选择"
            >
              <el-option
                v-for="item in listst_jycs"
                :key="item.JYZEConditionAccord"
                :label="item.JYZECondition"
                :value="item.JYZEConditionAccord"
              ></el-option>
            </el-select>
            <el-input
              size="mini"
              style="width:40%;"
              placeholder="请输入交易笔数"
              v-model="SelectCondition.JYCSValue"
            ></el-input>
            <span>笔</span>
          </div>
        </div>
        <div v-show="mpids.includes('13')" class="selectionItem">
          <div class="childTitle">时间间隔：</div>
          <div>
            <el-input
              placeholder="请输入时间间隔"
              style="width:40%;"
              size="mini"
              v-model="SelectCondition.JC_SJJG"
            ></el-input>
            <span>小时</span>
          </div>
        </div>
        <div v-show="mpids.includes('14')" class="selectionItem">
          <div class="childTitle">时间段：</div>
          <div class="childSelection">
            <el-select
              size="mini"
              v-model="SelectCondition.SJD"
              placeholder="请选择"
              @visible-change="visibleChange"
              style="width:40%;"
            >
              <el-option
                v-for="item in list_sjds"
                :key="item.SJD"
                :label="item.SJD_CN"
                :value="item.SJD"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div style="margin-top:40px;text-align:center;">
          <el-button size="mini" @click="handleClickSaveCondition">保存条件</el-button>
          <el-button size="mini" type="primary" @click="handleClickExecCondition">执行条件</el-button>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import aes from "@/utils/aes";
import { mapState } from "vuex";

export default {
  props: ["position", "model", "ajid"],
  data() {
    return {
      mpids: [],
      list_condition: [
        {
          JYZECondition: "大于",
          JYZEConditionAccord: ">",
        },
        {
          JYZECondition: "小于",
          JYZEConditionAccord: "<",
        },
        {
          JYZECondition: "等于",
          JYZEConditionAccord: "=",
        },
        {
          JYZECondition: "不等于",
          JYZEConditionAccord: "!=",
        },
        {
          JYZECondition: "大于等于",
          JYZEConditionAccord: ">=",
        },
        {
          JYZECondition: "小于等于",
          JYZEConditionAccord: "<=",
        },
      ],
      list_sjds: [
        {
          SJD_CN: "年，YYYY",
          SJD: "YYYY",
        },
        {
          SJD_CN: "月，YYYY-MM",
          SJD: "YYYY-MM",
        },
        {
          SJD_CN: "日，YYYY-MM-DD",
          SJD: "YYYY-MM-DD",
        },
        {
          SJD_CN: "时，YYYY-MM-DD HH ",
          SJD: "YYYY-MM-DD HH",
        },
        {
          SJD_CN: "分，YYYY-MM-DD HH:MM",
          SJD: "YYYY-MM-DD HH:MM",
        },
        {
          SJD_CN: "秒，YYYY-MM-DD HH:MM:SS",
          SJD: "YYYY-MM-DD HH:MM:SS",
        },
      ],
      list_listjyjes: [
        {
          XSMZPro: "交易金额",
          XSMZ: "JYJE",
        },
        ,
        {
          XSMZPro: "交易总次数",
          XSMZ: "ALLCOUNT",
        },
        {
          XSMZPro: "进账次数",
          XSMZ: "INCOUNT",
        },
        {
          XSMZPro: "进账金额",
          XSMZ: "INJE",
        },
        {
          XSMZPro: "出账次数",
          XSMZ: "OUTCOUNT",
        },
        {
          XSMZPro: "出账金额",
          XSMZ: "OUTJE",
        },
      ],
      listst_jyje: [],
      listst_jycs: [],
      // 团体类型数组
      thType: [
        {
          Index: 1,
          ThId: "JYMCGROUP",
          ThName: "按主体名称划分",
          DsThId: "JYDFMCGROUP",
          ThMemberCntId: "JYMCGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFMCGROUPMEMBERCOUNT",
        },
        {
          Index: 2,
          ThId: "JYZJHMGROUP",
          ThName: "按证照号码划分",
          DsThId: "JYDFZJHMGROUP",
          ThMemberCntId: "JYZJHMGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFZJHMGROUPMEMBERCOUNT",
        },
        {
          Index: 3,
          ThId: "CXKHGROUP",
          ThName: "按账卡号划分",
          DsThId: "JYDFZKHGROUP",
          ThMemberCntId: "CXKHGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFZKHGROUPMEMBERCOUNT",
        },
      ],
      //设置默认统计维度
      defaultSelectDataTable: [
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
      ],
      //团伙选项 //界面显示ThName，其余选项用于替换模板参数
      SelectCondition: {
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
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
  },
  async mounted() {
    console.log("childModel mouted.........");
    this.listst_jyje = JSON.parse(JSON.stringify(this.list_condition));
    console.log(this.listst_jyje);
    this.listst_jycs = JSON.parse(JSON.stringify(this.list_condition));
    this.SelectCondition.SelectThType = this.thType[0];
    this.SelectCondition.SelectDataTableColumn = this.defaultSelectDataTable;
    let { ajid } = this.caseBase;
    let tid = String(this.model.mid);
    let modelname = this.model.modelname;
    let pgsqlTemplate = this.model.gpsqltemplate;
    let orderby = this.model.orderby ? this.model.orderby : "";
    let showType =
      this.model.out_type.length > 0 ? parseInt(this.model.out_type) : 1;
    let pgsql = aes.decrypt(pgsqlTemplate);
    let mpids = this.model.mpids ? this.model.mpids.split(",") : [];
    console.log(mpids);
    this.mpids = mpids;
    await this.$store.dispatch("ShowTable/showModelTable", {
      ajid,
      offset: 0,
      tid,
      pgsql,
      orderby,
      showType,
      mpids,
      params: this.SelectCondition,
      tablecname: modelname,
      count: 30,
    });
  },
  methods: {
    //
    visibleChange(value) {
      console.log(value);
    },
    handleClickExecCondition() {},
    handleClickSaveCondition() {},
    handleClickClose() {
      this.$store.commit("MainPageSwitch/HIDE_CHILD_MODEL");
      console.log(this.model);
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

//  class="childModel"
//   :style="{zIndex: 9999,
//   position:'absolute',
//   top: 0+'px',
//   left: position.left+'px',
//   height: position.height + 'px',
//   width: position.width+'px'}"
</script>
<style scoped>
.childModel {
  background-color: white;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.modelTitle {
  margin-top: 30px;
  margin-left: 10px;
  font-size: 13px;
}
.modelDescribe {
  margin-top: 10px;
  margin-left: 20px;
  font-size: 11px;
  color: gray;
}
.selectionItem {
  margin-top: 10px;
  margin-bottom: 10px;
}
.childSelection {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>