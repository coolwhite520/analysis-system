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
      <div style="height: 400px">
        <el-row>
          <el-col :span="8">
            <el-input
              v-model="filterText"
              size="mini"
              placeholder="输入可过滤"
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
                type="success"
                style="width: 100%; font-size: 12px"
                class="iconfont"
                @click="handleClickResetTable"
                >&#xe652;还原到初始数据</el-button
              >
            </div>
          </el-col>
          <el-col :span="16"></el-col>
        </el-row>
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
      title: "资金用途管理分类",
      defaultCheckedKeys: [],
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
    async handleNodeClick(data, node, value) {
      console.log(data);
      let ret = await Models.SelectChildTree(data.LABEL_ID);
      console.log(ret);
    },
    async handleClickResetTable() {
      let result = await Models.ResetDefaultYtTable();
      if (result.success) {
        await this.freshTree();
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