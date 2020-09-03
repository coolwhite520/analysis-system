<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :visible.sync="filterVisible"
      width="50%"
      :before-close="handleClose"
      :modal="false"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white;font-size:30px;">&#xe815;</i>
        <span class="title-text" style="color: white;">{{title}}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <div class="block">
        <el-tree
          class="el-tree"
          :data="filterList"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          :draggable="false"
        >
          <div class="custom-tree-node" slot-scope="{ node, data }">
            <!-- 判断节点类型 如果是leaf节-->
            <el-row v-if="data.ConditionNodeType === DefaultData.NodeType.NodeType_Condition">
              <el-select
                v-model="data.FiltrateFieldEN"
                size="mini"
                placeholder="请选择"
                @change="((val)=>{handleChangeSelectionField(val, data)})"
              >
                <el-option
                  v-for="item of currentTableData.headers"
                  :key="item.fieldename.toUpperCase()"
                  :label="item.fieldcname"
                  :value="item.fieldename.toUpperCase()"
                ></el-option>
              </el-select>

              <el-select
                v-if="data.FiltrateFieldType === DefaultData.DataType.DECIMAL || 
                data.FiltrateFieldType === DefaultData.DataType.DOUBLE"
                v-model="data.condtion"
                size="mini"
                placeholder="请选择"
              >
                <el-option
                  v-for="item of DefaultData.FiltrateLogic.List_num"
                  :key="item.LogicID"
                  :label="item.FiltrateLogicCN"
                  :value="item.LogicID"
                ></el-option>
              </el-select>
              <el-select
                v-else-if="data.FiltrateFieldType === DefaultData.DataType.DATATIME_1"
                v-model="data.condtion"
                size="mini"
                placeholder="请选择"
              >
                <el-option
                  v-for="item of DefaultData.FiltrateLogic.List_datetime"
                  :key="item.LogicID"
                  :label="item.FiltrateLogicCN"
                  :value="item.LogicID"
                ></el-option>
              </el-select>
              <el-select v-else v-model="data.condtion" size="mini" placeholder="请选择">
                <el-option
                  v-for="item of DefaultData.FiltrateLogic.List_else"
                  :key="item.LogicID"
                  :label="item.FiltrateLogicCN"
                  :value="item.LogicID"
                ></el-option>
              </el-select>

              <el-input
                v-model="data.FiltrateValue"
                placeholder="请输入内容"
                style="width:50%"
                size="mini"
              ></el-input>
              <el-tooltip class="item" effect="dark" content="点击以删除一个筛选项目" placement="top">
                <el-button
                  type="text"
                  @click="() => leafRemove(data, node)"
                  class="iconfont mybtnAddOrRemove"
                >&#xe616;</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="点击以新增一个筛选项目" placement="top">
                <el-button
                  type="text"
                  @click="() => leafAppend(data, node)"
                  class="iconfont mybtnAddOrRemove"
                >&#xe61f;</el-button>
              </el-tooltip>
            </el-row>
            <!-- 判断节点类型 如果是非leaf节-->
            <el-row v-else>
              <div v-if="data.id === rootNodeId">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="data.DisplayRelation==='AND'? '当前显示文字为{且}，表示下列所有子项的关系为并且的关系': '当前显示文字为{或}，表示下列所有子项的关系为或者的关系'"
                  placement="top"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="()=>hanleClickRootAndOr(data, node)"
                  >{{ data.DisplayRelation==='AND'? '且': '或'}}</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="点击以新增一个筛选项目" placement="top">
                  <el-button
                    type="text"
                    @click="() => rootAppend(data, node)"
                    class="iconfont mybtnAddOrRemove"
                  >&#xe61f;</el-button>
                </el-tooltip>
              </div>
              <div v-else>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="data.DisplayRelation==='AND'? '当前显示文字为{且}，表示下列所有子项的关系为并且的关系': '当前显示文字为{或}，表示下列所有子项的关系为或者的关系'"
                  placement="top"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="()=>hanleClickRootAndOr(data, node)"
                  >{{ data.DisplayRelation==='AND'? '且': '或'}}</el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="点击以删除所有子节点" placement="top">
                  <el-button
                    type="text"
                    @click="() => fatherRemove(data, node)"
                    class="iconfont mybtnAddOrRemove"
                  >&#xe616;</el-button>
                </el-tooltip>
              </div>
            </el-row>
          </div>
        </el-tree>
      </div>

      <el-row style="text-align:center;">
        <el-button size="medium" @click="handleClickSaveFilter">保存条件</el-button>
        <el-button size="medium" @click="handleClickInvokeFilter" type="primary">立即执行</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";

const UUID = require("uuid");
export default {
  mounted() {
    let headerFirst = this.currentTableData.headers[0];
    if (this.currentTableData.modelFilterChildList.length === 0) {
      this.filterList.push({
        id: UUID.v1(),
        DisplayRelation: "AND",
        ConditionNodeType: this.DefaultData.NodeType.NodeType_ConditionList,
        children: [
          {
            id: UUID.v1(),
            DisplayRelation: "OR",
            ConditionNodeType: this.DefaultData.NodeType.NodeType_Condition,
            FiltrateValue: "",
            FiltrateFieldType: this.convertDataTypeStrToNum(
              headerFirst.data_type
            ),
            FiltrateFieldEN: headerFirst.fieldename.toUpperCase(), //字段名
            condtion: 0,
          },
        ],
      });
    } else {
      this.filterList = JSON.parse(
        JSON.stringify(this.currentTableData.modelFilterChildList)
      );
    }
    this.filterList[0].id = this.rootNodeId; // 先规定root
  },
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("DialogPopWnd", ["filterVisible"]),
  },
  data() {
    return {
      rootNodeId: UUID.v1(),
      DefaultData: require("@/utils/sql/Default"),
      filterList: [],
      title: "数据筛选",
    };
  },
  methods: {
    // 执行筛选
    async handleClickInvokeFilter() {
      await this.$store.commit("ShowTable/UPDATE_TABLE_FILTER", {
        pageIndex: this.currentTableData.pageIndex,
        modelFilterChildList: this.filterList,
      });
      await this.$store.commit("DialogPopWnd/SET_FILTER_DIALOG_VISIBLE", false);
      await this.$store.dispatch(this.currentTableData.dispatchName, {
        ...this.currentTableData,
        offset: 0,
        count: 30,
      });
    },
    async handleClickSaveFilter() {
      await this.$store.commit("ShowTable/UPDATE_TABLE_FILTER", {
        pageIndex: this.currentTableData.pageIndex,
        modelFilterChildList: this.filterList,
      });
    },
    async handleChangeSelectionField(currentValue, data) {
      let header = this.currentTableData.headers.find((item) => {
        return item.fieldename.toUpperCase() === currentValue.toUpperCase();
      });
      data.FiltrateFieldType = this.convertDataTypeStrToNum(header.data_type);
      data.condtion = 0;
    },
    async handleClose() {
      await this.$store.commit("DialogPopWnd/SET_FILTER_DIALOG_VISIBLE", false);
    },
    hanleClickRootAndOr(data, node) {
      console.log(data, node);
      if (data.DisplayRelation === "AND") {
        data.DisplayRelation = "OR";
      } else {
        data.DisplayRelation = "AND";
      }
    },
    //root添加
    rootAppend(data, node) {
      const children = node.data.children;
      console.log(children);
      let headerFirst = this.currentTableData.headers[0];
      let newItem = {
        id: UUID.v1(),
        DisplayRelation: "AND",
        FiltrateValue: "",
        FiltrateFieldType: "",
        FiltrateFieldEN: "", //字段名
        ConditionNodeType: this.DefaultData.NodeType.NodeType_ConditionList,
        condtion: "",
        children: [
          {
            id: UUID.v1(),
            DisplayRelation: "AND",
            ConditionNodeType: this.DefaultData.NodeType.NodeType_Condition,
            FiltrateValue: "",
            FiltrateFieldType: 2,
            FiltrateFieldEN: headerFirst.fieldename.toUpperCase(), //字段名
            condtion: 2,
          },
        ],
      };
      children.push(newItem);
    },
    // 类型转换
    convertDataTypeStrToNum(data_type) {
      let FiltrateFieldType = 0;
      if (data_type === null) {
        FiltrateFieldType = this.DefaultData.DataType.STR;
      } else if (data_type.includes("int") || data_type.includes("money")) {
        FiltrateFieldType = this.DefaultData.DataType.DECIMAL;
      } else if (data_type.includes("float")) {
        FiltrateFieldType = this.DefaultData.DataType.DOUBLE;
      } //判断日期
      return FiltrateFieldType;
    },
    // 父亲节点移除数据
    fatherRemove(data, node) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      if (children.length === 1 && parent.data.id === this.rootNodeId) {
        return;
      }
      children.splice(index, 1);
    },
    // 叶子节点移除数据
    leafRemove(data, node) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      if (children.length === 1 && parent.data.id === this.rootNodeId) {
        return;
      }
      children.splice(index, 1);
      if (children.length === 0) {
        let root = parent.parent;
        let rootChildren = root.data.children || root.data;
        const index = rootChildren.findIndex((d) => d.id === parent.data.id);
        rootChildren.splice(index, 1);
      }
    },
    // 叶子节点添加数据
    leafAppend(data, node) {
      let headerFirst = this.currentTableData.headers[0];
      console.log(data, node);
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      children.push({
        id: UUID.v1(),
        DisplayRelation: "AND",
        ConditionNodeType: this.DefaultData.NodeType.NodeType_Condition,
        FiltrateValue: "",
        FiltrateFieldType: 2,
        FiltrateFieldEN: headerFirst.fieldename.toUpperCase(), //字段名
        condtion: 2,
      });
    },
  },
};
</script>

<style>
.block {
  height: 400px;
}
.el-tree .el-tree-node__children {
  margin: 2px;
  max-height: 300px;
  overflow: auto !important;
}
</style>
