<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible="showCircleModelDialogVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe63a;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showCircleModelDialogVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
    title() {
      return `资金环路查找`;
    },
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {
    handleClose() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWCIRCLEMODELDIALOGVISIBLE",
        false
      );
    },
  },
};
</script>
<style scoped>
</style>
