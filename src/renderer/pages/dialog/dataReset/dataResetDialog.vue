<template>
  <!-- top="30vh" -->
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showDataResetVisible"
    width="40%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe652;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        title
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-row>
      <el-col :span="4">&nbsp;</el-col>
      <el-col :span="16">
        <div class="block">
          <div class="radio">
            排序：
            <el-radio-group v-model="reverse">
              <el-radio :label="true">倒序</el-radio>
              <el-radio :label="false">正序</el-radio>
            </el-radio-group>
          </div>
          <div style="height: 300px">
            <div class="importTimeLine">
              <el-timeline :reverse="reverse">
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :timestamp="activity.timestamp"
                  placement="top"
                >
                  <el-card>
                    <el-radio v-model="radio" :label="activity.timestamp">{{
                      activity.content
                    }}</el-radio>

                    <p>王小虎 提交于 2018/4/12 20:46</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">&nbsp;</el-col>
    </el-row>
    <el-row style="text-align: center">
      <el-button style="width: 50%" type="primary" @click="handleClickResetData"
        >确定重置</el-button
      >
    </el-row>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import cases from "@/db/Cases";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showDataResetVisible"]),
    ...mapState("CaseDetail", ["CollectionRecords", "caseBase"]),
  },
  async mounted() {
    console.log("Mounted");
    try {
      let {
        success,
        rows,
        headers,
        rowCount,
      } = await cases.QueryCollectionRecords(this.caseBase.ajid, 0, 100000);
      if (success) {
        console.log(success, rows, headers, rowCount);
        this.$store.commit("CaseDetail/SET_COLLECTIONRECORDS", {
          rows,
          headers,
          rowCount,
        });
      }
    } catch (e) {
      this.$message.error({
        message: "出错了：" + e.message,
      });
    }
  },
  data() {
    return {
      loading: false,
      title: "数据重置",
      reverse: true,
      radio: "2018-04-15",
      activities: [
        {
          content: "活动按期开始",
          timestamp: "2018-04-15",
          selected: true,
        },
        {
          content: "通过审核",
          timestamp: "2018-04-13",
          selected: false,
        },
        {
          content: "创建成功",
          timestamp: "2018-04-11",
          selected: false,
        },
      ],
    };
  },
  methods: {
    handleClickResetData() {
      console.log(this.CollectionRecords);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWDATARESETVISIBLE", false);
    },
  },
};
</script>
<style scoped>
.radio {
  margin-bottom: 20px;
  text-align: center;
}
.importTimeLine {
  padding: 5px;
  height: 300px;
  overflow: auto;
}
</style>