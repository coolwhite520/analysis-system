<template>
  <div class="newcaseForm">
    <div style="text-align:center;margin-bottom:20px;">
      <h2>新增案件</h2>
    </div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="案件类型" prop="region">
        <el-select v-model="ruleForm.region" placeholder="请选择案件类型">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="11">
          <el-form-item label="案件编号" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="案件名称" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item label="发生日期" required>
            <el-form-item prop="date1">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="ruleForm.date1"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="立案日期" required>
            <el-form-item prop="date2">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="ruleForm.date2"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="案件状态" prop="region">
        <el-select v-model="ruleForm.region" placeholder="请选择案件类型">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属地区" prop="region">
        <el-col :span="8">
          <el-select v-model="ruleForm.region" placeholder="请选择案件类型">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="ruleForm.region" placeholder="请选择案件类型">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="ruleForm.region" placeholder="请选择案件类型">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-col>
      </el-form-item>

      <el-form-item label="简述案情" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
      </el-form-item>

      <el-form-item label="综述案情" prop="desc">
        <el-input type="textarea" v-model="ruleForm.desc"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          class="cardStyle"
          type="primary"
          round
          style="background-color: #1b2735;color: white;"
          @click="submitForm('ruleForm')"
        >立即创建</el-button>
        <el-button @click="resetForm('ruleForm')" round>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleForm: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      rules: {
        name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        region: [
          { required: true, message: "请选择活动区域", trigger: "change" }
        ],
        date1: [
          {
            type: "date",
            required: true,
            message: "请选择日期",
            trigger: "change"
          }
        ],
        date2: [
          {
            type: "date",
            required: true,
            message: "请选择时间",
            trigger: "change"
          }
        ],
        type: [
          {
            type: "array",
            required: true,
            message: "请至少选择一个活动性质",
            trigger: "change"
          }
        ],
        resource: [
          { required: true, message: "请选择活动资源", trigger: "change" }
        ],
        desc: [{ required: true, message: "请填写活动形式", trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert("submit!");
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