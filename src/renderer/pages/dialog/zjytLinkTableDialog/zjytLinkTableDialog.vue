<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :append-to-body="true"
      :visible="showZjytLinkVisible"
      @close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe62b;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <table-chart
        :tableData="tableData"
        :limitHeight="contentViewHeight - 80"
      ></table-chart>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TableChart from "@/pages/main/MainViews/DataShow/child/TableChart.vue";
export default {
  props: ["title"],
  computed: {
    ...mapState("DialogPopWnd", ["showZjytLinkVisible"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  data() {
    return {
      showChat: false,
    };
  },
  components: {
    "table-chart": TableChart,
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWZJYTLINKVISIBLE", false);
    },
  },
};
</script>