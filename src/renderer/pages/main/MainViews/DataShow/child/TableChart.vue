<template>
  <div>
    <el-table
      :id="tableData.uuid"
      style="width: 100%"
      :data="tableData.rows"
      size="mini"
      :max-height="limitHeight"
      :height="limitHeight"
      stripe
      border
      @sort-change="sortChange"
      @row-contextmenu="handleRightClickRow"
    >
      <!-- <el-table-column fixed type="index" width="50" label="编号"></el-table-column> -->
      <el-table-column
        v-for="header in tableData.showHeaders"
        :label="header.fieldcname"
        :key="header.cid + Math.random()"
        show-overflow-tooltip
        :prop="header.fieldename"
        sortable="custom"
      >
        <template slot-scope="scope">
          <div v-if="header.showrightbtn_type">
            <el-button
              type="text"
              size="mini"
              style="color: #2e69b7"
              @click="
                handleClickTableCellLink(
                  header.showrightbtn_type,
                  scope.row,
                  header.fieldename,
                  header.link_mid,
                  scope.row[header.fieldename].value
                )
              "
            >
              <u>{{ scope.row[header.fieldename].value }}</u>
            </el-button>
          </div>
          <div v-else>
            {{ scope.row[header.fieldename].value }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-row
      style="
        background-color: #f5f7fa;
        padding: 5px;
        border-bottom: 1px solid #dddfe5;
        border-left: 1px solid #dddfe5;
        border-right: 1px solid #dddfe5;
      "
    >
      <el-col :span="12">
        <div style="font-size: 12px; color: gray; margin-top: 5px">
          每页显示{{ pageSize }}条，当前页面条目数量：{{
            tableData.rows.length
          }}条, 总计：{{ tableData.sum }}条
        </div>
      </el-col>
      <el-col :span="10" style="text-align: right">
        <div>
          <el-pagination
            small
            :current-page="currentPage"
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="tableData.sum"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-col>
      <el-col :span="2">
        <el-select
          v-model="pageSize"
          placeholder="请选择"
          size="mini"
          @change="handleChangePageSize"
        >
          <el-option
            v-for="item in optionsPageSize"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const { clipboard } = require("electron");
import { mapState } from "vuex";
import awaitTask from "@/db/AwaitTask";

export default {
  mounted() {
    for (let size = 1; size <= 60; size++) {
      this.optionsPageSize.push({
        label: String(size),
        value: size,
      });
    }
  },

  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  props: ["tableData", "limitHeight"],
  data() {
    return {
      optionsPageSize: [],
      pageSize: 30,
      currentPage: 1,
    };
  },
  methods: {
    async handleChangePageSize() {
      // 根据tableName获取表的数据
      await this.$store.dispatch(this.tableData.dispatchName, {
        ...this.tableData,
        offset: 0,
        count: this.pageSize,
      });
      this.currentPage = 1;
    },
    async handleRightClickRow(row, column, event) {
      let value = row[column.property].value;
      console.log(row);
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    sortChange(column) {
      //获取字段名称和排序类型
      let fieldName = column.prop;
      let sortingType = column.order;
      let newTableData = JSON.parse(JSON.stringify(this.tableData));
      function compare(property, sortingType) {
        return function (a, b) {
          var value1 = a[property].value;
          var value2 = b[property].value;
          // 如果是中文
          if (
            /^[\u4e00-\u9fa5]+$/i.test(value1) &&
            /^[\u4e00-\u9fa5]+$/i.test(value2)
          ) {
            return sortingType === "descending"
              ? value1.localeCompare(value2)
              : value2.localeCompare(value1);
          }
          return sortingType === "descending"
            ? value1 - value2
            : value2 - value1;
        };
      }
      newTableData.rows = newTableData.rows.sort(
        compare(fieldName, sortingType)
      );
      this.$store.commit("ShowTable/UPDATE_TABLE_DATA", {
        pageIndex: this.tableData.pageIndex,
        rows: newTableData.rows,
      });
    },
    async handleClickTableCellLink(
      showrightbtn_type,
      row,
      fieldename,
      linkMid,
      value
    ) {
      console.log(showrightbtn_type);
      if (showrightbtn_type === "link") {
        let newRow = {};
        for (let k in row) {
          newRow[k] = row[k].value;
        }

        this.$store.dispatch("ShowTable/showLinkTable", {
          tid: parseInt(this.tableData.tid),
          linkMid,
          selectCondition: this.tableData.selectCondition,
          row: newRow,
          fieldename: fieldename.toUpperCase(), // 注意列名需要传递大写
        });
      } else if (showrightbtn_type === "button") {
        console.log(row);
        if (["251", "252", "253", "254", "255"].includes(this.tableData.tid)) {
          try {
            let {
              success,
              havesame,
            } = await awaitTask.QueryHaveSameInfoInModelTable(
              this.caseBase.ajid,
              row["zh"].value
            );
            if (success && havesame) {
              this.$message({
                message: `存在相同的数据项，已经被添加。`,
              });
              return;
            }
            awaitTask.InsertNewAwaitTaskToTable(
              this.caseBase.ajid,
              row["zh"].value,
              row["mc"].value,
              this.tableData.tid
            );
            this.$message({
              type: "success",
              message:
                "成功添加了调单项目，可在调单任务窗口进行查看、修改、删除等操作",
            });
          } catch (e) {
            this.$message.error({
              message: e.message,
            });
          }
        } else {
          this.$message({
            message: `请移步到待调单窗口进行手动添加。`,
          });
        }
      }
    },

    async handleCurrentChange(val) {
      let offset = (val - 1) * this.pageSize;
      // 根据tableName获取表的数据
      await this.$store.dispatch(this.tableData.dispatchName, {
        ...this.tableData,
        offset: offset,
        count: this.pageSize,
      });
    },
  },
};
</script>
<style scoped>
</style>>

