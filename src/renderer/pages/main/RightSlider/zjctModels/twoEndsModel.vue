<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :visible="showTwoEndsDialogVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe63b;</i>
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
    ...mapState("DialogPopWnd", ["showTwoEndsDialogVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
    title() {
      return `两端路径查找`;
    },
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWTWOENDSDIALOGVISIBLE", false);
    },
  },
};
</script>
<style scoped>
</style>
