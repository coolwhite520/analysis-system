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
      <el-tree
        style="border-bottom: 1px solid #e4e7ec"
        :default-expand-all="true"
        :data="renderData.comboentityList"
        :props="defaultProps"
        @node-click="handleNodeClick"
      >
        <span class="iconfont custom-tree-node" slot-scope="{ node, data }">
          <span v-if="node.isLeaf">
            <!-- <el-tooltip
              class="item"
              effect="dark"
              :content="makeTips(data)"
              placement="top-start"
            > -->
            <span class="tree-item-title"
              >&#xe75f;&nbsp;&nbsp;{{ node.label }}</span
            >
            <!-- </el-tooltip -->
            >
          </span>

          <span v-else>
            <span class="tree-item-title"
              >&#xe639;&nbsp;&nbsp;{{ node.label }}</span
            >
            <span> </span>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  props: ["renderData"],
  mounted() {
    console.log(this.renderData.comboentityList);
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
    // makeTips(data) {
    //   const { kh, czje, czbs, jzje, jzbs, jyzje, jyzbs } = data.itemData;
    //   return `卡号：${kh}\n
    //   出账金额：${czje}, 出账笔数：${czbs}\n
    //   进账金额：${jzje}， 进账笔数：${jzbs}\n
    //   交易总金额：${jyzje}，交易总笔数：${jyzbs}`;
    // },
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