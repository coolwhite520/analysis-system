<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="nodeCombineVisible"
      width="30%"
      :before-close="handleClose"
      :modal="false"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe629;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <el-table :data="tableData" border style="width: 100%" size="mini">
        <el-table-column prop="kh" label="卡号" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="name" label="姓名" show-overflow-tooltip>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Default from "@/utils/sql/Default.js";
export default {
  props: ["nodes"],
  mounted() {
    console.log(this.nodes);
  },
  computed: {
    ...mapState("DialogPopWnd", ["nodeCombineVisible"]),
    tableData() {
      return this.nodes.map((node) => {
        return node.get("model");
      });
    },
  },
  data() {
    return {
      title: "节点合并",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", false);
    },
    handleClickColorConfirm() {
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", false);
    },
  },
};
</script>
