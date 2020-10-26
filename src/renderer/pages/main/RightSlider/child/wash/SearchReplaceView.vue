<template>
  <div>
    <div
      class="searchReplace"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="22">
          <div>
            <span class="iconfont">&#xe61c;&nbsp;&nbsp;&nbsp;查找替换</span>
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>
      <el-collapse v-model="activeNames" @change="handleChangeCollapse">
        <el-collapse-item
          v-for="(item, index) in collapseList"
          :key="index"
          :name="item.id"
        >
          <template slot="title">
            &nbsp;&nbsp;&nbsp;<i class="header-icon el-icon-link">
              {{ item.header.fieldcname }}
            </i>
          </template>
          <el-row class="rowItem">
            <el-select
              v-model="item.header"
              value-key="fieldename"
              placeholder="请选择"
              size="mini"
              @change="handleChangeFilter(item)"
            >
              <el-option
                v-for="header of currentTableData.showHeaders.filter(
                  (header) => {
                    return header.data_type === null;
                  }
                )"
                :label="header.fieldcname"
                :key="header.cid + Math.random()"
                :value="header"
              ></el-option>
            </el-select>
          </el-row>
          <el-row class="rowItem">
            <el-autocomplete
              style="width: 100%"
              size="mini"
              v-model="item.inValue"
              placeholder="请输入原始值"
              :fetch-suggestions="
                (queryString, cb) => querySearch(queryString, cb, item)
              "
              :trigger-on-focus="false"
              @select="handleSelect"
            ></el-autocomplete>
          </el-row>

          <el-row class="rowItem">
            <el-input
              size="mini"
              v-model="item.outValue"
              placeholder="请输入替换值"
            ></el-input>
          </el-row>
          <el-row style="text-align: center">
            <el-button
              type="text"
              @click="handleClickDelItem(item)"
              class="iconfont"
              size="mini"
              style="font-size: 12px"
              :disabled="collapseList.length < 2"
              >&#xe616; 删除</el-button
            >
            <el-button
              type="text"
              style="font-size: 12px"
              @click="handleClickAddItem"
              class="iconfont"
              size="mini"
              >&#xe61f; 新增</el-button
            ></el-row
          >
        </el-collapse-item>
      </el-collapse>
      <el-row style="text-align: center; margin-top: 20px">
        <el-button
          size="small"
          type="primary"
          @click="handleClickReplace"
          :loading="loading"
          >执行替换</el-button
        >
      </el-row>
    </div>
  </div>
</template>

<script>
import dataShowTable from "@/db/DataShowTable.js";
import { mapState, mapGetters } from "vuex";
const log = require("electron-log");
export default {
  data() {
    return {
      loading: false,
      index: 1,
      activeNames: [],
      collapseList: [],
    };
  },
  mounted() {
    this.collapseList.push({
      id: `${this.index}`,
      header: JSON.parse(JSON.stringify(this.currentTableData.showHeaders[0])),
      inValue: "",
      outValue: "",
    });
    this.activeNames.push(`${this.index}`);
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  methods: {
    handleClickAddItem() {
      this.index++;
      this.collapseList.push({
        id: `${this.index}`,
        header: JSON.parse(
          JSON.stringify(this.currentTableData.showHeaders[0])
        ),
        inValue: "",
        outValue: "",
      });
      this.activeNames = [];
      this.activeNames.push(`${this.index}`);
    },
    createFilter(queryString) {
      return (item) => {
        return item.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0;
      };
    },
    async querySearch(queryString, cb, item) {
      console.log(item);
      if (queryString.length > 0) {
        let ajid = this.caseBase.ajid;
        let fieldename = item.header.fieldename;
        let { tid, tableename } = this.currentTableData;
        let filter = ` and ${fieldename} like '%${queryString}%'`;
        let ret = await dataShowTable.QuerySearchLike(
          ajid,
          tid,
          tableename,
          fieldename,
          filter
        );
        cb(ret.rows);
      }
    },
    handleSelect(item) {
      console.log(item);
    },
    async handleClickReplace() {
      this.loading = true;
      try {
        let taskArray = [];
        for (let item of this.collapseList) {
          let ajid = this.caseBase.ajid;
          let fieldename = item.header.fieldename;
          let inValue = item.inValue;
          let outValue = item.outValue;
          if (inValue === "" || outValue === "") {
            this.$message.error({
              title: "错误",
              message: `字段[${item.header.fieldcname}]必须输入原始值和替换值，任何一个不能为空`,
            });
            this.loading = false;
            return;
          }
          let { tableename } = this.currentTableData;
          console.log(this.currentTableData);
          taskArray.push(
            (async () => {
              return await dataShowTable.UpdateTableLike(
                ajid,
                tableename,
                fieldename,
                inValue,
                outValue
              );
            })()
          );
        }
        await Promise.all(taskArray);
        this.$message({
          title: "成功",
          message: "更新替换数据成功",
          type: "success",
        });
        await this.$store.dispatch(this.currentTableData.dispatchName, {
          ...this.currentTableData,
          offset: 0,
          count: 30,
        });
      } catch (e) {
        this.$message.error({
          message: "更新替换数据失败：" + e.message,
        });
        log.info(e.message);
      }
      this.loading = false;
    },
    handleClickDelItem(item) {
      this.activeNames = [];
      for (let index = 0; index < this.collapseList.length; index++) {
        let collapse = this.collapseList[index];
        if (collapse.id === item.id) {
          this.collapseList.splice(index, 1);
          break;
        }
      }
    },
    handleChangeFilter(item) {
      console.log(item);
      item.inValue = "";
      item.outValue = "";
    },
    handleChangeCollapse(value) {
      console.log(value);
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "search-replace-view",
        action: "remove",
      });
    },
  },
};
</script>
<style  scoped>
.searchReplace {
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
.rowItem {
  margin: 10px;
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