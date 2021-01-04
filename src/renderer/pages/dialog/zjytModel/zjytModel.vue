<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :append-to-body="true"
      :visible="showZjytVisible"
      @close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe62b;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <div>
        <el-row>
          <el-col :span="8">
            <el-input
              v-model="filterText"
              size="mini"
              placeholder="输入关键字可快速查询"
            ></el-input>
            <div class="block">
              <el-tree
                ref="tree"
                :highlight-current="true"
                :check-strictly="true"
                show-checkbox
                @check="handleCheckChange"
                :props="defaultProps"
                :data="treeData"
                node-key="Index"
                default-expand-all
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                :default-checked-keys="defaultCheckedKeys"
                @node-click="handleNodeClick"
                style="
                  height: 350px;
                  overflow-y: auto;
                  border: 1px solid #eceef4;
                "
              >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <span>{{ node.label }}</span>
                  <span v-if="[-1, 77, 78].includes(data.Index_Parent)">
                    <span>
                      <el-button
                        class="iconfont"
                        type="text"
                        size="mini"
                        style="color: green; font-size: 10px"
                        @click="() => append(node, data)"
                      >
                        &#xe633;
                      </el-button>
                    </span>
                    <span>
                      <el-button
                        v-if="[77, 78].includes(data.Index_Parent)"
                        class="iconfont"
                        type="text"
                        size="mini"
                        style="color: red; font-size: 10px"
                        @click="() => remove(node, data)"
                      >
                        &#xe644;
                      </el-button>
                    </span>
                  </span>
                  <span v-else>
                    <el-button
                      class="iconfont"
                      type="text"
                      size="mini"
                      style="color: red; font-size: 10px"
                      @click="() => remove(node, data)"
                    >
                      &#xe644;
                    </el-button></span
                  >
                  <span
                    ><el-button
                      class="iconfont"
                      type="text"
                      size="mini"
                      style="color: #f3ac3d; font-size: 10px"
                      @click="() => rename(node, data)"
                    >
                      &#xe645;
                    </el-button></span
                  >
                </span>
              </el-tree>
              <el-button
                size="mini"
                type="primary"
                style="width: 100%; font-size: 12px"
                class="iconfont"
                @click="handleClickResetTable"
                >&#xe652;&nbsp;&nbsp;&nbsp;&nbsp;还原到初始数据</el-button
              >
            </div>
          </el-col>
          <el-col :span="16">
            <el-tree
              class="el-tree"
              :data="filterList"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :draggable="false"
              :props="defaultProps2"
            >
              <div class="custom-tree-node" slot-scope="{ node, data }">
                <!-- 判断节点类型 如果是leaf节-->
                <el-row v-if="data.DataFiltratorType === 1">
                  <el-select
                    v-model="data.ColumnName"
                    size="mini"
                    placeholder="请选择"
                    style="width: 25%"
                  >
                    <el-option
                      v-for="item of ColumnNameList"
                      :key="item.ColumnNameEN"
                      :label="item.ColumnNameCN"
                      :value="item.ColumnNameEN"
                    ></el-option>
                  </el-select>

                  <el-select
                    v-model="data.Logical"
                    size="mini"
                    placeholder="请选择"
                    style="width: 25%"
                  >
                    <el-option
                      v-for="item of LogicList"
                      :key="item.FiltrateLogicEN"
                      :label="item.FiltrateLogicCN"
                      :value="item.FiltrateLogicEN"
                    ></el-option>
                  </el-select>

                  <span>
                    <el-input
                      v-model="data.StrValue"
                      placeholder="请输入内容"
                      style="width: 25%"
                      size="mini"
                    ></el-input>
                  </span>

                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="点击删除一个筛选项目"
                    placement="top"
                  >
                    <el-button
                      type="text"
                      @click="() => leafRemove(data, node)"
                      class="iconfont mybtnAddOrRemove"
                      >&#xe616;</el-button
                    >
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="点击新增一个筛选项目"
                    placement="top"
                  >
                    <el-button
                      type="text"
                      @click="() => leafAppend(data, node)"
                      class="iconfont mybtnAddOrRemove"
                      >&#xe61f;</el-button
                    >
                  </el-tooltip>
                </el-row>
                <!-- 判断节点类型 如果是非leaf节-->
                <el-row v-else>
                  <div v-if="data.id === -1">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="
                        data.DataFiltratorModelList[0].LineCode === '且'
                          ? '当前显示文字为[且]，表示下列所有子项的关系为[并且]的关系'
                          : '当前显示文字为[或]，表示下列所有子项的关系为[或者]的关系'
                      "
                      placement="top"
                    >
                      <el-button
                        circle
                        size="mini"
                        @click="() => hanleClickRootAndOr(data, node)"
                        >{{
                          data.DataFiltratorModelList[0].LineCode
                        }}</el-button
                      >
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="点击新增一个筛选项目"
                      placement="top"
                    >
                      <el-button
                        type="text"
                        @click="() => rootAppend(data, node)"
                        class="iconfont mybtnAddOrRemove"
                        >&#xe61f;</el-button
                      >
                    </el-tooltip>
                  </div>
                  <div v-else>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="
                        data.DataFiltratorModelList[0].LineCode === '且'
                          ? '当前显示文字为[且]，表示下列所有子项的关系为[并且]的关系'
                          : '当前显示文字为[或]，表示下列所有子项的关系为[或者]的关系'
                      "
                      placement="top"
                    >
                      <el-button
                        circle
                        size="mini"
                        @click="() => hanleClickRootAndOr(data, node)"
                        >{{
                          data.DataFiltratorModelList[0].LineCode
                        }}</el-button
                      >
                    </el-tooltip>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="点击删除所有子节点"
                      placement="top"
                    >
                      <el-button
                        type="text"
                        @click="() => fatherRemove(data, node)"
                        class="iconfont mybtnAddOrRemove"
                        >&#xe616;</el-button
                      >
                    </el-tooltip>
                  </div>
                </el-row>
              </div>
            </el-tree>
          </el-col>
        </el-row>
        <div style="text-align: center">
          <el-button
            type="primary"
            size="mini"
            style="width: 25%"
            @click="handleClickSave"
            >保存</el-button
          >
          <el-button size="mini" style="width: 25%" @click="handleClose"
            >取消</el-button
          >
        </div>
      </div>
    </el-dialog>

    <div v-if="showReNameDialog">
      <el-dialog
        v-dialogDrag
        :close-on-click-modal="false"
        class="standard-data-dialog"
        :append-to-body="true"
        :visible="showReNameDialog"
        @close="showReNameDialog = false"
        :modal="true"
        width="25%"
      >
        <div slot="title" class="dialog-title">
          <i class="iconfont" style="color: white; font-size: 30px">&#xe62b;</i>
          <span class="title-text" style="color: white">{{ ChildTitle }}</span>
          <div class="button-right">
            <span class="title-close" @click="showReNameDialog = false"></span>
          </div>
        </div>
        <div style="text-align: center; font-size: 12px">
          <div v-if="operatorMode === 1">
            <div>当前节点名称：{{ currentNodeName }}</div>
            <div style="margin-top: 10px">
              <el-input
                size="mini"
                placeholder="请输入新的子节点名称"
                v-model="newName"
              ></el-input>
            </div>
          </div>
          <div v-else-if="operatorMode === 2">
            确定要删除节点 -- {{ currentNodeName }} 吗?
          </div>
          <div v-else>
            <div>当前节点名称：{{ currentNodeName }}</div>
            <div style="margin-top: 10px">
              <el-input
                size="mini"
                placeholder="请输入新的子节点名称"
                v-model="newName"
              ></el-input>
            </div>
          </div>

          <div style="margin-top: 20px">
            <el-button
              size="mini"
              style="width: 60%"
              type="primary"
              @click="handleClickSure"
              >确定</el-button
            >
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Default from "@/utils/sql/Default.js";
import Models from "@/db/Models.js";

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showZjytVisible"]),
    ChildTitle() {
      let cTitle = "";
      switch (this.operatorMode) {
        case 1:
          cTitle = "新增";
          break;
        case 2:
          cTitle = "删除";
          break;
        case 3:
          cTitle = "重命名";
          break;
      }
      return cTitle;
    },
  },
  data() {
    return {
      filterList: [],
      currentNode: null,
      currentNodeName: "",
      newName: "",
      operatorMode: 0, // 1, 2, 3 分别代表新增、删除、rename
      filterText: "",
      showReNameDialog: false,
      treeData: [],
      defaultProps: {
        children: "Items",
        label: "LABEL_NAME",
      },
      defaultProps2: {
        children: "DataFiltratorModelList",
      },
      title: "资金用途管理分类",
      defaultCheckedKeys: [],
      LogicList: [
        {
          FiltrateLogicCN: "等于",
          LogicID: Default.FiltrateLogicID.EqualTo,
          FiltrateLogicEN: "EqualTo",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "不等于",
          LogicID: Default.FiltrateLogicID.NotEqualTo,
          FiltrateLogicEN: "NotEqualTo",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "开始于",
          LogicID: Default.FiltrateLogicID.StartWith,
          FiltrateLogicEN: "StartWith",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "不开始于",
          LogicID: Default.FiltrateLogicID.NotStartWith,
          FiltrateLogicEN: "NotStartWith",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "结束于",
          LogicID: Default.FiltrateLogicID.EndWith,
          FiltrateLogicEN: "EndWith",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "不结束于",
          LogicID: Default.FiltrateLogicID.NotEndWith,
          FiltrateLogicEN: "NotEndWith",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "包含",
          LogicID: Default.FiltrateLogicID.Contains,
          FiltrateLogicEN: "Contains",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "不包含",
          LogicID: Default.FiltrateLogicID.NotContains,
          FiltrateLogicEN: "NotContains",
          HasStr: true,
        },
        {
          FiltrateLogicCN: "为空",
          LogicID: Default.FiltrateLogicID.IsEmpty,
          FiltrateLogicEN: "IsEmpty",
          HasStr: false,
        },
        {
          FiltrateLogicCN: "不为空",
          LogicID: Default.FiltrateLogicID.NotEmpty,
          FiltrateLogicEN: "NotEmpty",
          HasStr: false,
        },
      ],
      ColumnNameList: [
        { ColumnNameCN: "摘要说明", ColumnNameEN: "zysm" },
        { ColumnNameCN: "对手户名", ColumnNameEN: "jydfmc" },
        { ColumnNameCN: "备注", ColumnNameEN: "beiz" },
      ],
    };
  },
  watch: {
    filterText(newValue) {
      this.$refs.tree.filter(newValue);
    },
  },
  async mounted() {
    await this.freshTree();
  },
  methods: {
    async handleClickSave() {
      try {
        if (this.filterList.length === 0) {
          this.$message({
            message: "请选择相应的节点进行保存设置。",
          });
          return;
        }
        console.log(JSON.stringify(this.filterList[0].DataFiltratorModelList));
        await Models.SaveNewChildItemToTable(
          this.currentNode.Index,
          JSON.stringify(this.filterList[0].DataFiltratorModelList)
        );
        this.$message({
          type: "success",
          message: "保存成功",
        });
        this.handleClose();
      } catch (e) {
        this.$message.error({
          message: e.message,
        });
      }
    },
    // 叶子节点移除数据
    leafRemove(data, node) {
      // 父亲节点没有child的时候，移除父亲节点
      let parent = node.parent;
      this.$refs.tree.remove(node);
      if (parent.data.id === -1) {
        // root节点
        if (parent.data.DataFiltratorModelList.length === 0) {
          parent.data.DataFiltratorModelList.push({
            ColumnName: "zysm",
            Logical: "Contains",
            StrValue: "",
            LineCode: "且",
            DataFiltratorType: 1,
          });
        }
      } else {
        if (parent.data.DataFiltratorModelList.length === 0) {
          this.$refs.tree.remove(parent);
        }
      }
    },
    // 叶子节点添加数据
    leafAppend(data, node) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      console.log(children);
      children.DataFiltratorModelList.push({
        LineCode: data.LineCode,
        ColumnName: "zysm",
        Logical: "Contains",
        StrValue: "",
        DataFiltratorType: 1,
      });
    },
    //root添加
    rootAppend(data, node) {
      data.DataFiltratorModelList.push({
        LineCode: "且",
        DataFiltratorModelList: [
          {
            ColumnName: "zysm",
            Logical: "Contains",
            StrValue: "",
            LineCode: "且",
            DataFiltratorType: 1,
          },
        ],
        DataFiltratorType: 2,
      });
    },
    // 父亲节点移除数据
    fatherRemove(data, node) {
      this.$refs.tree.remove(node);
    },
    hanleClickRootAndOr(data, node) {
      let newValue = "";
      if (data.DataFiltratorModelList[0].LineCode === "且") {
        newValue = "或";
      } else {
        newValue = "且";
      }
      data.DataFiltratorModelList.forEach((item) => {
        item.LineCode = newValue;
      });
      console.log(this.filterList);
    },
    async handleNodeClick(data, node, value) {
      console.log("handleNodeClick", node);
      if (!node.isLeaf) {
        this.filterList = [];
        return;
      }
      this.currentNode = data;
      let ret = await Models.SelectChildTree(data.LABEL_ID);
      console.log(ret);
      if (ret === null) {
        this.filterList = [
          {
            LineCode: "且",
            DataFiltratorModelList: [
              {
                ColumnName: "zysm",
                Logical: "Contains",
                StrValue: "",
                LineCode: "且",
                DataFiltratorType: 1,
              },
            ],
            DataFiltratorType: 2,
            id: -1,
          },
        ];
      } else {
        this.filterList = [
          {
            DataFiltratorModelList: ret,
            DataFiltratorType: 2,
            id: -1,
            LineCode: ret[0].LineCode,
          },
        ];
      }
    },
    async handleClickResetTable() {
      let result = await Models.ResetDefaultYtTable();
      if (result.success) {
        await this.freshTree();
        this.filterList = [];
      }
    },
    async handleClickSure() {
      console.log(this.currentNode);
      if (this.operatorMode !== 2) {
        this.newName = this.newName.trim();
        if (this.newName.length === 0) {
          this.$message.error({
            message: "输入的字符串为空，请重新输入",
          });
          return;
        }
      }
      let result;
      switch (this.operatorMode) {
        case 1:
          result = await Models.InsertItem(
            this.currentNode,
            this.newName,
            true
          );
          break;
        case 2:
          result = await Models.DelteItem(this.currentNode);
          break;
        case 3:
          result = await Models.InsertItem(
            this.currentNode,
            this.newName,
            false
          );
          break;
      }
      if (result.success) {
        this.$message({
          type: "success",
          message: result.msg,
        });
        this.showReNameDialog = false;
      } else {
        this.$message.error({
          message: result.msg,
        });
      }
      this.filterList = [];
      await this.freshTree();
    },
    async handleCheckChange(data, obj) {
      data.IsPreview = !data.IsPreview;
      let result = await Models.SelectItemOrNotSelectItem(data);
      if (result.success === false) {
        this.$message.error({
          message: result.msg,
        });
      } else {
        await this.freshTree();
      }
    },
    // 这里每当输入的数据有变化就触发原生的过滤节点这个函数
    filterNode(value, data, node) {
      if (!value) return true;
      return data.LABEL_NAME.indexOf(value) !== -1;
    },
    append(node, data) {
      this.showReNameDialog = true;
      this.operatorMode = 1;
      this.currentNodeName = data.LABEL_NAME;
      this.newName = "";
      this.currentNode = data;
    },
    remove(node, data) {
      this.showReNameDialog = true;
      this.operatorMode = 2;
      this.currentNodeName = data.LABEL_NAME;
      this.currentNode = data;
    },
    rename(node, data) {
      this.showReNameDialog = true;
      this.operatorMode = 3;
      this.currentNodeName = data.LABEL_NAME;
      this.newName = data.LABEL_NAME;
      this.currentNode = data;
    },
    async freshTree() {
      // 获取树结构
      this.treeData = await Models.GetNavMenuData();
      let checkedArr = [];
      for (let obj of this.treeData) {
        if (obj.IsPreview) {
          checkedArr.push(obj.Index);
        }
        for (let item of obj.Items) {
          if (item.IsPreview) {
            checkedArr.push(item.Index);
          }
          for (let el of item.Items) {
            if (el.IsPreview) {
              checkedArr.push(el.Index);
            }
          }
        }
      }
      this.defaultCheckedKeys = checkedArr;
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.defaultCheckedKeys);
      });
    },

    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWZJYTVISIBLE", false);
    },
  },
};
</script>
<style scoped>
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 0px !important;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 8px;
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  /* background: #bfbebe; */
  background: rgba(0, 0, 0, 0.1);
}
::-webkit-scrollbar-thumb:hover {
  /*滚动条里面小方块*/
  border-radius: 8px;
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  background: #636363;
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2); */
  border-radius: 8px;
  background: rgba(255, 255, 255, 0);
}
:focus {
  outline: 0;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
/deep/.el-tree-node__content {
  font-size: 10px;
}
</style>
