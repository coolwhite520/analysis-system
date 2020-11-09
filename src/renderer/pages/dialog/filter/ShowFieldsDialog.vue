<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :visible="showFieldsVisible"
      width="30%"
      @close="handleClose"
      :modal="true"
    >
      <!-- <el-tree :data="currentTableData.headers" :props="defaultProps" show-checkbox></el-tree>
      -->
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe600;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <el-row style="margin-top: 10px">
        <el-checkbox-group
          v-model="checkList"
          size="mini"
          @change="handleChangeSelect"
        >
          <el-checkbox-button
            v-for="item of currentTableData.headers"
            :label="item.fieldcname"
            :key="item.fieldename"
            v-model="checked"
            border
          ></el-checkbox-button>
        </el-checkbox-group>
      </el-row>
      <el-divider></el-divider>
      <el-row style="text-align: center">
        <el-button size="medium" @click="handleClickSelectAll">全选</el-button>
        <el-button size="medium" @click="handleClickNotSelectAll"
          >全不选</el-button
        >
      </el-row>
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
    async handleClickSelectAll() {
      let _this = this;
      this.checked = true;
      this.checkList = this.currentTableData.headers.map((el) => el.fieldcname);
      await this.$store.commit(
        "ShowTable/SET_SHOWHAEDERS",
        this.currentTableData.headers
      );
    },
    async handleClickNotSelectAll() {
      let _this = this;
      this.checked = false;
      this.checkList = [];
      await this.$store.commit("ShowTable/SET_SHOWHAEDERS", []);
    },
    async handleChangeSelect(val) {
      let _this = this;
      let newShowHeaders = [];
      for (let header of this.currentTableData.headers) {
        if (val.includes(header.fieldcname)) {
          newShowHeaders.push(header);
        }
      }
      await this.$store.commit("ShowTable/SET_SHOWHAEDERS", newShowHeaders);
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