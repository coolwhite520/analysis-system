<template>
  <div>
    <el-row :gutter="40">
      <el-col
        :span="24/columCount"
        v-for="(caseItem) in existCaseList"
        :key="caseItem.id"
        style="margin-bottom:20px;"
      >
        <div class="iconfont" style="color: #ddd;font-size:30px;margin-bottom:-30px;">&#xe65e;</div>
        <el-card @click.native="handleClickCase(caseItem.id)" class="cardStyle">
          <el-row>
            <b>编号：{{caseItem.id}}</b>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="time">{{caseItem.dateTime}}</div>
            </el-col>
            <el-col :span="12">
              <div class="location">{{"北京市西城区"}}</div>
            </el-col>
          </el-row>
          <el-row>
            <h2 class="caseName">{{ caseItem.name }}</h2>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div
                class="state"
                :style="{ color: caseItem.state === 'new' ? 'green' : '#CDAD00' }"
              >状态：{{caseItem.state === 'new'? "新建": "已完结"}}</div>
            </el-col>
            <el-col :span="12">
              <div>
                <el-button
                  class="button"
                  icon="el-icon-search"
                  type="text"
                  @click="handleClickAnalysis()"
                >分析</el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      currentDate: new Date(),
      columCount: 3 //每行显示几个
    };
  },
  computed: {
    ...mapState("ExistCases", ["existCaseList"])
  },
  methods: {
    handleClickCase(caseID) {
      console.log(caseID);
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "case-detail-view");
    },
    handleClickAnalysis(event) {
      window.event.stopPropagation();
      console.log("clickAnalysis");
    }
  }
};
</script>

<style scoped>
.cardStyle {
  border: 2px solid #1b2735;
  border-radius: 15px;
  /* color: #606266; */
  /* background: radial-gradient(ellipse at bottom, #1b2735 0%, #9fb6cd 100%); */
  /* background-color: #9fb6cd; */
  /* color: white; */
}
.cardStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
.time {
  font-size: 13px;
}
.location {
  font-size: 12px;
  float: right;
}
.caseName {
  color: #1b2735;
  text-align: center;
  margin: 10px;
}
.state {
  font-size: 12px;
  margin-top: 12px;
}
.button {
  float: right;
}
</style>
