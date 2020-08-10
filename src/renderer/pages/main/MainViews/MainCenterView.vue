<template>
  <div class="view-style" :style="{ height: contentViewHeight + 'px'}" v-loading="loadingShowData">
    <ul
      v-if="contextMenuVisible"
      :style="{position: 'fixed' ,left:left+'px',top:top+'px'}"
      class="contextmenu"
    >
      <li>
        <el-button size="mini" type="text" @click="closeAllTabs">关闭所有</el-button>
      </li>
      <li>
        <el-button
          size="mini"
          type="text"
          @click="closeOtherTabs('left')"
          :disabled="isDisabledCloseLeftBtnFlag"
        >关闭左边</el-button>
      </li>
      <li>
        <el-button
          size="mini"
          type="text"
          @click="closeOtherTabs('right')"
          :disabled="isDisabledCloseRightBtnFlag"
        >关闭右边</el-button>
      </li>
      <li>
        <el-button
          size="mini"
          type="text"
          @click="closeOtherTabs('other')"
          :disabled="isDisabledCloseOtherBtnFlag"
        >关闭其他</el-button>
      </li>
    </ul>
    <el-tabs
      class="el-tabs"
      v-model="activeIndex"
      type="border-card"
      closable
      @tab-remove="removeTab"
      @contextmenu.prevent.native="openContextMenu($event)"
    >
      <el-tab-pane
        :key="item.tid"
        v-for="(item) in tableDataList"
        :label="item.title"
        :name="item.tid"
      >
        <!-- <span slot="label" style="font-size:10px;">{{item.title}}</span> -->
        <!-- <keep-alive> -->
        <div v-if="item.showType === 1">
          <component :is="item.componentName" :tableData="item"></component>
        </div>
        <div v-else>{{item.showType}}</div>
        <!-- </keep-alive> -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import NoDataView from "./DataShow/NoDataView";
import TableDataView from "./DataShow/TableDataView";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("CaseDetail", ["caseBase", "dataSum"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", [
      "tableDataList",
      "activeIndex",
      "loadingShowData",
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
    if (this.dataSum === 0) {
      this.$store.dispatch("ShowTable/showNoDataPage", {
        ajid: this.caseBase.ajid,
        tid: "99999",
        tablecname: "数据采集",
      });
    } else {
      this.$store.dispatch("ShowTable/showPersonTable", {
        ajid: this.caseBase.ajid,
        tid: "1",
        tablecname: "人员基本信息",
        tableename: "gas_person",
        offset: 0,
        count: 30,
      });
    }
  },
  data() {
    return {
      left: 0,
      top: 0,
      isDisabledCloseLeftBtnFlag: false,
      isDisabledCloseRightBtnFlag: false,
      isDisabledCloseOtherBtnFlag: false,
      closeLeftTids: [],
      closeRightTids: [],
      contextMenuVisible: false,
      // editableTabs: [
      //   {
      //     title: "标准采集",
      //     tid: "9999",
      //     componentName: "no-data-view",
      //   },
      // ],
      // tabIndex: 3,
    };
  },
  methods: {
    openContextMenu(e) {
      console.log(e.srcElement);
      if (e.srcElement.id) {
        console.log(e.clientX, e.clientY);
        let currentContextTabId = e.srcElement.id.split("-")[1];
        console.log({ currentContextTabId });
        this.contextMenuVisible = true;
        this.$store.commit("ShowTable/SET_ACTIVEINDEX", currentContextTabId);
        //是否存在左边
        if (this.tableDataList.length > 1) {
          this.isDisabledCloseOtherBtnFlag = false;
          this.closeLeftTids = this.getLeftTids();
          this.closeRightTids = this.getRightTids();
          this.isDisabledCloseLeftBtnFlag = !(this.closeLeftTids.length > 0);
          this.isDisabledCloseRightBtnFlag = !(this.closeRightTids.length > 0);
        } else {
          this.isDisabledCloseLeftBtnFlag = true;
          this.isDisabledCloseRightBtnFlag = true;
          this.isDisabledCloseOtherBtnFlag = true;
        }
        this.left = e.clientX;
        this.top = e.clientY + 10;
      }
    },
    getLeftTids() {
      let tids = [];
      for (let index = 0; index < this.tableDataList.length; index++) {
        let tableData = this.tableDataList[index];
        if (tableData.tid === this.activeIndex) {
          break;
        }
        tids.push(tableData.tid);
      }
      return tids;
    },
    getRightTids() {
      let tids = [];
      let bfind = false;
      for (let index = 0; index < this.tableDataList.length; index++) {
        let tableData = this.tableDataList[index];
        if (tableData.tid === this.activeIndex) {
          bfind = true;
          continue;
        }
        if (bfind) tids.push(tableData.tid);
      }
      return tids;
    },
    // 关闭contextMenu
    closeContextMenu() {
      this.contextMenuVisible = false;
    },
    removeTab(targetName) {
      console.log(targetName, this.activeIndex);
      this.$store.commit("ShowTable/REMOVE_TABLE_DATA_FROM_LIST", {
        tid: String(targetName),
      });
    },
    closeAllTabs() {
      this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
      this.closeContextMenu();
      this.contextMenuVisible = false;
    },
    closeOtherTabs(param) {
      switch (param) {
        case "left":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            tids: this.closeLeftTids,
          });
          break;
        case "right":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            tids: this.closeRightTids,
          });
          break;
        case "other":
          this.$store.commit("ShowTable/REMOVE_TABLE_DATAS_FROM_LIST", {
            tids: this.closeLeftTids.concat(this.closeRightTids),
          });
          break;
      }
      this.contextMenuVisible = false;
      this.closeContextMenu();
    },
  },
};
</script>
<style scoped>
.el-tabs {
  overflow-x: scroll; /*横向滚动*/
  width: 100%;
  height: 100%;
}

.contextmenu {
  /* width: 100px; */
  margin: 0;
  border: 1px solid #ccc;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 0;
  border-radius: 4px;
  font-size: 11px;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);
}
.contextmenu li {
  margin: 0;
  padding: 7px;
}
.contextmenu li:hover {
  background: #f2f2f2;
  cursor: pointer;
}
</style>