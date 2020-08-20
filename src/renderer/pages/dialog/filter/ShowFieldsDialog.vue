<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="showFieldsVisible"
      width="30%"
      :before-close="handleClose"
      :modal="false"
    >
      <!-- <el-tree :data="currentTableData.headers" :props="defaultProps" show-checkbox></el-tree>
      -->

      <el-checkbox-group v-model="checkList" size="mini">
        <el-checkbox
          v-for="item of currentTableData.headers"
          :label="item.fieldcname"
          :key="item.fieldename"
          v-model="checked"
          border
        ></el-checkbox>
      </el-checkbox-group>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  beforeMount() {
    this.checkList = this.currentTableData.showHeaders.map(
      (el) => el.fieldcname
    );
  },
  computed: {
    ...mapState("DialogPopWnd", ["showFieldsVisible"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  methods: {
    async handleClose() {
      await this.$store.commit(
        "DialogPopWnd/SET_SHOW_FILEDS_DIALOG_VISIBLE",
        false
      );
    },
  },
  data() {
    return {
      checkList: [],
      checked: true,
      title: "选择显示列",
      defaultProps: {
        children: "children",
        label: "fieldcname",
      },
    };
  },
};
</script>