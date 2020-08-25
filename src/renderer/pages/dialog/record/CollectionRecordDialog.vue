<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="showCollectionRecordVisible"
      width="30%"
      :before-close="handleClose"
      :modal="false"
    ></el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showCollectionRecordVisible"]),
  },
  data() {
    return {
      title: "数据采集记录",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWCOLLECTIONRECORDVISIBLE", false);
    },
  },
};
</script>
