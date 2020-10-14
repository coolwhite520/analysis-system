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
      <el-row
        style="
          background-color: #f5f7fa;
          height: 31px;
          font-weight: 700;
          color: rgb(56, 78, 110);
          font-size: 12px;
          border-bottom: 1px solid #ebeef4;
        "
      >
        <div style="margin-left: 10px; margin-top: 5px">
          分组名称：{{ renderData.comboInfo.comboName }}
        </div>
      </el-row>
      <el-tree
        style="border-bottom: 1px solid #e4e7ec; height: 300px"
        :default-expand-all="true"
        :data="renderData.comboInfo.comboentityList"
        :props="defaultProps"
        @node-click="handleNodeClick"
      >
        <span class="iconfont custom-tree-node" slot-scope="{ node, data }">
          <span v-if="node.isLeaf">
            <el-tooltip
              class="item"
              effect="dark"
              :content="makeTips(data)"
              placement="top-start"
            >
              <span>
                <img
                  :src="data.itemData.icon.img"
                  width="16"
                  height="16"
                  style="vertical-align: middle"
                />
                <span class="tree-item-title" style="vertical-align: middle"
                  >&nbsp;&nbsp;{{ node.label }}</span
                >
              </span>
            </el-tooltip>
          </span>

          <span v-else>
            <span class="tree-item-title" style="vertical-align: middle"
              >&nbsp;&nbsp;{{ node.label }}</span
            >
          </span>
        </span>
      </el-tree>
      <el-table
        height="300"
        :data="renderData.comboInfo.comboTableData"
        size="mini"
        style="width: 100%"
        border
      >
        <el-table-column prop="title" label="说明" show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="describe"
          label="统计结果"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
      <!-- <el-row style="text-align: center; margin-top: 10px">
        <el-button type="primary" size="small" @click="handleClickUnCombo">
          解体当前分组
        </el-button>
      </el-row> -->
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: ["renderData"],
  mounted() {
    console.log(this.renderData.comboInfo);
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label",
        isLeaf: "isLeaf",
      },
    };
  },
  methods: {
    makeTips(data) {
      const { label } = data.itemData;
      return label;
    },
    handleClickUnCombo() {},
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "combo-entity-list-view",
        action: "remove",
      });
    },
    handleNodeClick(data) {
      console.log(data);
      if (data.type === "node") {
        let entity = {
          ...data.itemData,
        };
        this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
        this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
          componentName: "entity-view",
          action: "add",
        });
      }
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
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  padding-right: 8px;
}
.tree-item-title {
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /*加宽度width属来兼容部分浏览*/
}
</style>