<template>
  <div>
    <el-row :gutter="40">
      <el-col
        :span="24/columCount"
        v-for="(caseItem) in existCaseList"
        :key="caseItem.id"
        style="margin-bottom:20px;"
      >
        <div class="iconfont" style="color: #606266;font-size:30px;margin-bottom:-30px;">&#xe65e;</div>
        <el-card class="cardStyle">
          <div @click="handleClickCasr(caseItem.id)">
            <div>
              <div>
                <b>编号：{{caseItem.id}}</b>
              </div>
              <span class="time">{{caseItem.dateTime}}</span>
              <span class="location">{{"北京市西城区"}}</span>
            </div>
            <h2 class="caseName">{{ caseItem.name }}</h2>
            <div>
              <div
                class="state"
                :style="{ color: caseItem.state === 'new' ? 'green' : '#CDAD00' }"
              >状态：{{caseItem.state === 'new'? "新建": "已完结"}}</div>
            </div>
          </div>
          <el-button type="text" class="button" @click="handleClickAnalysis">分析</el-button>
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
      columCount: 4 //每行显示几个
    };
  },
  computed: {
    ...mapState("cases", ["existCaseList"])
  },
  methods: {
    handleClickCasr(caseID) {
      console.log(caseID);
    },
    handleClickAnalysis() {
      console.log("clickAnalysis");
    }
  }
};
</script>

<style scoped>
.cardStyle {
  border: 2px solid #dddfe5;
  border-radius: 15px;
  color: #606266;
  /* background: radial-gradient(ellipse at bottom, #1b2735 0%, #9fb6cd 100%); */
  /* background-color: #9fb6cd; */
  /* color: white; */
}
.cardStyle:hover {
  border: 2px solid #1b2735;
  box-shadow: #1b2735 10px 10px 30px 5px;
}
.time {
  font-size: 13px;
}
.location {
  float: right;
}
.caseName {
  color: #1b2735;
  text-align: center;
  margin: 10px;
}
.state {
  margin-top: 10px;
  font-size: 13px;
}
.button {
  float: right;
}
</style>
