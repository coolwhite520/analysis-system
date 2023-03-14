<template >
  <div class="view-style" :style="{ height: contentViewHeight + 8 + 'px' }" v-loading="loadingShowData"
    element-loading-text="数据加载中..." element-loading-background="rgba(0, 0, 0, 0)">
    <ul v-if="contextMenuVisible" :style="{ position: 'fixed', left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li class="menu__item" @click="closeCurrentTab">关闭当前</li>
      <li class="menu__item" @click="closeAllTabs">关闭所有</li>
      <li class="menu__item" @click="closeOtherTabs('left')" v-if="!isDisabledCloseLeftBtnFlag">
        关闭左边
      </li>
      <li class="menu__item" @click="closeOtherTabs('right')" v-if="!isDisabledCloseRightBtnFlag">
        关闭右边
      </li>
      <li class="menu__item" @click="closeOtherTabs('other')" v-if="!isDisabledCloseOtherBtnFlag">
        关闭其他
      </li>
      <li class="menu__item" @click="rename()" v-if="!isDisabledCloseOtherBtnFlag">
        重命名标题
      </li>
    </ul>

    <!-- 当节点过多的时候，询问时在本程序展示，还是在附属程序展示 -->
    <WhichUiShow v-if="showWhichUiDialogVisible"></WhichUiShow>

    <el-tabs class="el-tabs" v-model="activeIndex" type="border-card" closable @tab-remove="removeTab"
      @contextmenu.prevent.native="openContextMenu($event)">
      <el-tab-pane :key="item.pageIndex" v-for="item in tableDataList" :label="item.title" :name="item.pageIndex">
        <component :is="item.componentName" :tableData="item"></component>
      </el-tab-pane>
    </el-tabs>


    <zjyt-link-dialog v-if="showZjytLinkVisible"></zjyt-link-dialog>
    <div v-if="showRename">
      <el-dialog v-dialogDrag :close-on-click-modal="false" class="standard-data-dialog" :append-to-body="true"
        :visible="showRename" width="25%" @close="handleClose" :modal="true">
        <div slot="title" class="dialog-title">
          <i class="iconfont" style="color: white; font-size: 30px">&#xe645;</i>
          <span class="title-text" style="color: white">{{
            "标题重命名"
          }}</span>
          <div class="button-right">
            <span class="title-close" @click="handleClose"></span>
          </div>
        </div>
        <el-input ref="inputName" size="mini" v-model="inputNewTitle" placeholder="请输入新的名称"></el-input>
        <el-row style="margin-top: 20px; text-align: center">
          <el-button @click="handleClose" size="mini" style="width: 30%">取消</el-button>
          <el-button @click="handleClickSureName" size="mini" style="width: 30%" type="primary">确定</el-button>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import ZjytLinkTable from "@/pages/dialog/zjytLinkTableDialog/zjytLinkTableDialog.vue";
import NoDataView from "./DataShow/NoDataView";
import TableDataView from "./DataShow/TableDataView";
import { mapState } from "vuex";
import WhichUiShow from "../../dialog/whichUiShow/whichUiShow.vue";
export default {
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("DialogPopWnd", ["showZjytLinkVisible"]),
    ...mapState("ShowTable", [
      "currentTableData",
      "tableDataList",
      "activeIndex",
      "loadingShowData",
      "showWhichUiDialogVisible"
    ]),
    activeIndex: {
      get: function () {
        return this.$store.state.ShowTable.activeIndex;
      },
      set: function (newValue) {
        this.$store.commit("ShowTable/SET_ACTIVEINDEX", newValue);
      },
    },
  },
  components: {
    "no-data-view": NoDataView,
    "table-data-view": TableDataView,
    "zjyt-link-dialog": ZjytLinkTable,
    WhichUiShow
  },
  watch: {
    contextMenuVisible(value) {
      if (this.contextMenuVisible) {
        document.body.addEventListener("click", this.closeContextMenu);
      } else {
        document.body.removeEventListener("click", this.closeContextMenu);
      }
    },
  },
  mounted() {
    // 为了在通过restore加载的时候重新给currentTableData赋值，因为currentTableData是一个指针
    // restore的时候指向肯定是不存在的
    this.$store.commit(
      "ShowTable/SET_ACTIVEINDEX",
      this.$store.state.ShowTable.activeIndex
    );
  },
  data() {
    return {
      inputNewTitle: "",
      showRename: false,
      left: 0,
      top: 0,
      isDisabledCloseLeftBtnFlag: false,
      isDisabledCloseRightBtnFlag: false,
      isDisabledCloseOtherBtnFlag: false,
      closeLeftPageIndexs: [],
      closeRightPageIndexs: [],
      contextMenuVisible: false,
    };
  },
  methods: {
    handleClose() {
      this.showRename = false;
    },
    async openContextMenu(e) {
      e.preventDefault();
      if (e.srcElement.id) {
        this.removeClass(e.srcElement, "is-focus");
        let currentContextTabId = e.srcElement.id.split("-")[1];
        if (currentContextTabId !== this.currentTableData.pageIndex) {
          this.$store.commit("ShowTable/SET_ACTIVEINDEX", currentContextTabId);
        }
        this.contextMenuVisible = true;

        //是否存在左边
        if (this.tableDataList.length > 1) {
          this.isDisabledCloseOtherBtnFlag = false;
          this.closeLeftPageIndexs = this.getLeftPageIndexs();
          this.closeRightPageIndexs = this.getRightPageIndexs();
          this.isDisabledCloseLeftBtnFlag = !(
            this.closeLeftPageIndexs.length > 0
          );
          this.isDisabledCloseRightBtnFlag = !(
            this.closeRightPageIndexs.length > 0
          );
        } else {
          this.isDisabledCloseLeftBtnFlag = true;
          this.isDisabledCloseRightBtnFlag = true;
          this.isDisabledCloseOtherBtnFlag = true;
        }
        this.left = e.clientX;
        this.top = e.clientY + 10;
      }
    },
    removeClass(ele, txt) {
      let str = ele.className;
      console.log(str);
      let index = str.indexOf(txt);
      if (index > -1) {
        let className = str.replace(txt, "");
        ele.setAttribute("class", "");
        ele.setAttribute("class", className);
      }
    },
    getLeftPageIndexs() {
      let indexs = [];
      for (let index = 0; index < this.tableDataList.length; index++) {
        let tableData = this.tableDataList[index];
        if (tableData.pageIndex === this.activeIndex) {
          break;
        }
        indexs.push(tableData.pageIndex);
      }
      return indexs;
    },
    getRightPageIndexs() {
      let indexs = [];
      let bfind = false;
      for (let index = 0; index < this.tableDataList.length; index++) {
        let tableData = this.tableDataList[index];
        if (tableData.pageIndex === this.activeIndex) {
          bfind = true;
          continue;
        }
        if (bfind) indexs.push(tableData.pageIndex);
      }
      return indexs;
    },
    async sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("done");
        }, ms);
      });
    },
    // 关闭contextMenu
    closeContextMenu() {
      this.contextMenuVisible = false;
    },
    removeTab(targetName) {
      this.contextMenuVisible = false;
      this.$store.commit("ShowTable/REMOVE_TABLE_DATA_FROM_LIST", {
        pageIndex: String(targetName),
      });
    },
    closeAllTabs() {
      this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
      this.closeContextMenu();
      this.contextMenuVisible = false;
    },
    closeCurrentTab() {
      this.$store.commit("ShowTable/REMOVE_TABLE_DATA_FROM_LIST", {
        pageIndex: String(this.activeIndex),
      });
    },
    closeOtherTabs(param) {
      switch (param) {
        case "left":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            pageIndexList: this.closeLeftPageIndexs,
          });
          break;
        case "right":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            pageIndexList: this.closeRightPageIndexs,
          });
          break;
        case "other":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            pageIndexList: this.closeLeftPageIndexs.concat(
              this.closeRightPageIndexs
            ),
          });
          break;
      }
      this.contextMenuVisible = false;
      this.closeContextMenu();
    },
    rename() {
      this.inputNewTitle = this.currentTableData.title;
      this.showRename = true;
      this.$nextTick((x) => {
        this.$refs.inputName.focus();
      });
    },
    handleClickSureName() {
      let newTitle = this.inputNewTitle.trim();
      if (newTitle.length > 0) {
        this.$store.commit("ShowTable/MODIFY_TAB_TITLE", newTitle);
      }
      this.showRename = false;
    },
  },
};
</script>
<style>
.el-tabs .el-tabs__content {
  padding: 0;
}

.el-tabs__item:focus.is-active.is-focus:not(:active) {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
</style>
<style scoped>
.el-tabs {
  overflow-x: scroll;
  /*横向滚动*/
  width: 100%;
  height: 100%;
}

/deep/.el-tabs_item {
  box-shadow: none;
}

.contextmenu {
  /* width: 100px; */
  margin: 0;
  border: 1px solid #ccc;
  background: #fff;
  z-index: 200;
  position: absolute;
  list-style-type: none;
  padding: 0;
  border-radius: 5px;
  font-size: 11px;
  color: #3c4e6b;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);
}

.menu__item:first-child {
  margin-top: 5px;
}

.menu__item:last-child {
  margin-bottom: 5px;
}

.menu__item {
  font-size: 12px;
  display: block;
  padding: 5px 20px 5px 20px;
  cursor: default;
}

.menu__item:hover {
  color: white;
  background-color: #2460c4;
}
</style>