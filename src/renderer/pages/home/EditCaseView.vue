<template>
  <div class="newcaseForm" v-loading="loading">
    <div style="text-align:center;margin-bottom:20px;">
      <h2>编辑案件</h2>
    </div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-row>
        <el-col :span="10">
          <el-form-item label="案件类型" prop="ajlbArr">
            <el-cascader
              @change="handleChangeAjlb(ruleForm.ajlbArr)"
              style="width: 100%;"
              filterable
              :show-all-levels="false"
              v-model="ruleForm.ajlbArr"
              :options="ajlbListWrapper"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="案件编号" prop="ajbh">
            <el-input v-model="ruleForm.ajbh"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="案件名称" prop="ajmc">
            <el-input v-model="ruleForm.ajmc"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item label="发生日期" required>
            <el-form-item prop="jjsj">
              <el-date-picker
                :editable="false"
                type="date"
                placeholder="选择案件发生的时间日期"
                value-format="yyyy-MM-dd"
                v-model="ruleForm.jjsj"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="立案日期" required>
            <el-form-item prop="cjsj">
              <el-date-picker
                :editable="false"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="选择立案日期"
                v-model="ruleForm.cjsj"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="案件状态" prop="zcjddm">
        <el-select v-model="ruleForm.zcjddm" placeholder="请选择案件状态" @change="handleChangeState">
          <el-option
            v-for="item of zcjdmc_list"
            :key="item.id"
            :label="item.item_name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属地区" prop="asjfsddxzqhdm">
        <el-col :span="5">
          <el-select
            v-model="ruleForm.province"
            placeholder="请选择省份"
            @change="handleChangeProvince(ruleForm.province)"
          >
            <el-option
              v-for="province of province_list"
              :key="province.id"
              :label="province.name"
              :value="province.id"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="ruleForm.city"
            placeholder="请选择城市"
            @change="handleChangeCity(ruleForm.city)"
          >
            <el-option v-for="city of city_list" :key="city.id" :label="city.name" :value="city.id"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="ruleForm.asjfsddxzqhdm"
            placeholder="请选择区、镇"
            @change="handleChangeTown(ruleForm.asjfsddxzqhdm)"
          >
            <el-option v-for="town of town_list" :key="town.id" :label="town.name" :value="town.id"></el-option>
          </el-select>
        </el-col>
      </el-form-item>

      <el-form-item label="简述案情" prop="jyaq">
        <el-input type="textarea" v-model="ruleForm.jyaq"></el-input>
      </el-form-item>

      <el-form-item label="综述案情" prop="zhaq">
        <el-input type="textarea" v-model="ruleForm.zhaq"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          class="cardStyle"
          type="primary"
          round
          style="background-color: #1b2735;color: white;"
          @click="submitForm('ruleForm')"
        >保存</el-button>
        <el-button @click="resetForm('ruleForm')" round>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  computed: {
    ...mapState("PublicList", ["ajlb_list", "zcjdmc_list", "province_list"]),
    ...mapGetters("PublicList", ["ajlbListWrapper"]),
    ...mapState("EditCase", [
      "city_list",
      "town_list",
      "parent_ajid",
      "saveState"
    ]),
    ...mapState("CaseDetail", ["caseDetail"])
  },
  async mounted() {
    await this.$store.dispatch(
      "EditCase/getParentAjidByAjid",
      this.caseDetail.ajlb
    );
    this.ruleForm.ajlbArr = [];
    if (this.parent_ajid !== 0) {
      this.ruleForm.ajlbArr.push(this.parent_ajid);
    }
    this.ruleForm.ajlbArr.push(parseInt(this.caseDetail.ajlb));
    this.ruleForm.ajbh = this.caseDetail.ajbh;
    this.ruleForm.ajmc = this.caseDetail.ajmc;
    this.ruleForm.jjsj = this.caseDetail.jjsj;
    this.ruleForm.cjsj = this.caseDetail.cjsj;

    this.ruleForm.zcjddm = parseInt(this.caseDetail.zcjddm);
    let townInt = parseInt(this.caseDetail.asjfsddxzqhdm);
    let cityInt = parseInt(townInt / 100) * 100;
    let provinceInt = parseInt(cityInt / 10000) * 10000;
    this.ruleForm.province = provinceInt;
    await this.$store.dispatch("EditCase/getCitylist", provinceInt);
    this.ruleForm.city = cityInt;
    await this.$store.dispatch("EditCase/getTownlist", cityInt);
    this.ruleForm.asjfsddxzqhdm = townInt;

    this.ruleForm.jyaq = this.caseDetail.jyaq;
    this.ruleForm.zhaq = this.caseDetail.zhaq;
    this.asjfsddxzqmc = this.caseDetail.asjfsddxzqmc;
    this.ajlb = parseInt(this.caseDetail.ajlb);
    this.ajlbmc = this.caseDetail.ajlbmc;
    this.zcjdmc = this.caseDetail.zcjdmc;
  },
  data() {
    return {
      ajlb: 0,
      loading: false,
      ajlbmc: "",
      zcjdmc: "",
      asjfsddxzqmc: "",
      ruleForm: {
        ajlbArr: [], // element 返回的是一个数组类型
        ajbh: "",
        ajmc: "",
        cjsj: "",
        jjsj: "",
        zcjddm: "",
        jyaq: "",
        zhaq: "",
        province: 0,
        city: 0,
        asjfsddxzqhdm: 0
      },
      rules: {
        ajlbArr: [
          { required: true, message: "请选择案件类别", trigger: "change" }
        ],
        asjfsddxzqhdm: [
          { required: true, message: "请选择地理位置", trigger: "change" }
        ],
        ajbh: [
          { required: true, message: "请输入案件编号", trigger: "blur" },
          { min: 6, max: 12, message: "长度在 6 到 12 个字符", trigger: "blur" }
        ],
        ajmc: [
          { required: true, message: "请输入案件名称", trigger: "blur" },
          { min: 2, max: 12, message: "长度在 2 到 12 个字符", trigger: "blur" }
        ],
        jjsj: [
          {
            type: "string",
            required: true,
            message: "请选择案件发生日期",
            trigger: "change"
          }
        ],
        cjsj: [
          {
            type: "string",
            required: true,
            message: "选择立案日期",
            trigger: "change"
          }
        ],
        zcjddm: [
          { required: true, message: "请选择案件状态", trigger: "change" }
        ],

        jyaq: [
          { required: true, message: "请填写案情简要说明", trigger: "blur" }
        ],
        zhaq: [{ required: true, message: "请填写综述案情", trigger: "blur" }]
      }
    };
  },
  watch: {
    saveState(newState, oldState) {
      console.log(newState, oldState);
      if (newState === "success") {
        this.loading = false;
        this.$store.commit(
          "HomePageSwitch/SET_VIEW_NAME",
          "show-exist-case-view"
        );
        this.$store.commit("EditCase/SET_SAVE_STATE", "failed");
        this.$notify({
          title: "成功",
          message: `编辑案件[${this.caseDetail.ajmc}]并保存成功!`,
          type: "success"
        });
      } else if (newState === "failed") {
        this.loading = false;
        this.$notify.error({
          title: "错误",
          message: `编辑案件[${this.caseDetail.ajmc}]失败!`
        });
      }
    }
  },
  methods: {
    handleChangeProvince(province_id) {
      this.$store.dispatch("EditCase/getCitylist", province_id);
      this.ruleForm.city = "";
      this.ruleForm.asjfsddxzqhdm = "";
      console.log(this.ruleForm.province);
    },
    handleChangeCity(city_id) {
      this.$store.dispatch("EditCase/getTownlist", city_id);
      this.ruleForm.asjfsddxzqhdm = "";
      console.log(this.ruleForm.city);
    },
    handleChangeTown(asjfsddxzqhdm) {
      console.log(asjfsddxzqhdm);
      for (let item of this.town_list) {
        if (asjfsddxzqhdm === item.id) {
          this.asjfsddxzqmc = item.name;
          break;
        }
      }
    },
    handleChangeAjlb(ajlbArr) {
      this.ajlb = ajlbArr[ajlbArr.length - 1];
      for (let item of this.ajlb_list) {
        if (item.chargeid === this.ajlb) {
          this.ajlbmc = item.chargename;
          break;
        }
      }
      console.log(ajlbArr);
      console.log(this.ajlb, this.ajlbmc);
    },
    handleChangeState() {
      for (let item of this.zcjdmc_list) {
        if (item.id === this.ruleForm.zcjddm) {
          this.zcjdmc = item.item_name;
          break;
        }
      }
      console.log(this.ruleForm.zcjddm, this.zcjdmc);
    },
    submitForm(formName) {
      let _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          let obj = {
            ajid: parseInt(_this.caseDetail.ajid),
            ajbh: _this.ruleForm.ajbh,
            ajmc: _this.ruleForm.ajmc,
            ajlb: _this.ajlb,
            ajlbmc: _this.ajlbmc,
            zcjddm: _this.ruleForm.zcjddm,
            zcjdmc: _this.zcjdmc,
            cjsj: _this.ruleForm.cjsj,
            jjsj: _this.ruleForm.jjsj,
            xgsj: new Date().Format("yyyy-MM-dd"),
            asjfsddxzqhdm: _this.ruleForm.asjfsddxzqhdm,
            asjfsddxzqmc: _this.asjfsddxzqmc,
            jyaq: _this.ruleForm.jyaq,
            zhaq: _this.ruleForm.zhaq,
            cjr: "00000000",
            sfsc: 0,
            sfbdwkj: 1,
            sjl: 1
          };
          _this.loading = true;
          console.log(obj);
          _this.$store.dispatch("EditCase/saveCase", obj);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.$store.commit(
        "HomePageSwitch/SET_VIEW_NAME",
        "show-exist-case-view"
      );
    }
  }
};
</script>

<style scoped>
.newcaseForm {
  border: 2px solid #dddfe5;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 5px 5px 10px 5px gray, -5px 5px 5px 5px rgba(255, 255, 255, 0.5);
}
.cardStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
</style>