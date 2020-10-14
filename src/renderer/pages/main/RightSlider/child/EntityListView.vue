<template>
  <div>
    <div
      class="entityView"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="22">
          <div>
            <span class="iconfont" v-html="renderData.title"></span>
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>
      <el-table
        size="mini"
        :data="renderData.entityList"
        style="width: 100%"
        :height="contentViewHeight - 40 - 40 - 5"
        @row-click="handleClickRow"
        @cell-mouse-enter="handleMouseEnter"
        @cell-mouse-leave="handleMouseLeave"
      >
        <el-table-column label="序号" fixed type="index"></el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="kh"
          label="卡号"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="relationCount"
          label="关联数量"
          show-overflow-tooltip
          fixed="right"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: ["renderData"],
  data() {
    return { currentFocusRow: null };
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  methods: {
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-list-view",
        action: "remove",
      });
    },
    handleMouseEnter(row, column, cell, event) {
      this.currentFocusRow = row;
      this.$bus.$emit("updateNodeState", {
        graphid: this.currentTableData.graphid,
        nodeid: row.id,
        state: "selected",
      });
    },
    handleMouseLeave(row, column, cell, event) {
      this.$bus.$emit("updateNodeState", {
        graphid: this.currentTableData.graphid,
        nodeid: row.id,
        state: "clear",
      });
    },
    handleClickRow(row, column, event) {
      // console.log(row, column, event);
      let entity = {
        ...row,
      };
      this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-view",
        action: "add",
      });
    },
  },
};
</script>
<style  scoped>
.entityView {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  -webkit-user-select: none;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.foot {
  height: 40px;
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
</style>