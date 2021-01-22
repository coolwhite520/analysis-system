<template>
  <div>
    <div
      class="entityView"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="22">
          <div>
            <span class="iconfont">&#xe752;&nbsp;&nbsp;&nbsp;链接信息</span>
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>

      <el-table
        :data="linkEntity.linkData"
        @row-contextmenu="handleRightClickRow"
        size="mini"
        style="width: 100%"
        border
      >
        <el-table-column prop="title" label="说明" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="describe" label="统计结果" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.title.indexOf('节点') >= 0">
              {{ scope.row.describe }}
            </span>
            <span v-else
              ><el-input v-model="scope.row.describe" size="mini"> </el-input>
            </span> </template
        ></el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: center">
        <el-button size="mini" type="primary" @click="handleClickModifyLink"
          >确认修改</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
const { clipboard } = require("electron");
export default {
  data() {
    return {
      iconsPath: "",
      iconList: [],
    };
  },
  mounted() {},
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
    linkEntity() {
      return this.$lodash.cloneDeep(this.currentTableData.linkEntity);
    },
  },
  methods: {
    async handleRightClickRow(row, column, event) {
      let value = row[column.property];
      console.log(row);
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "link-view",
        action: "remove",
      });
    },
    handleClickModifyLink() {
      this.$bus.$emit("linkInfoSetting", {
        graphid: this.currentTableData.graphid,
        linkEntity: this.linkEntity,
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