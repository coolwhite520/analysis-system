<template>
  <div>
    <el-table
      :ref="tableData.pageIndex"
      :id="tableData.pageIndex"
      style="width: 100%"
      :data="tableData.rows"
      size="mini"
      :max-height="limitHeight"
      :height="limitHeight"
      stripe
      border
      @sort-change="sortChange"
      :row-class-name="rowClassName"
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        prop="rowIndex"
        label="序号"
        width="60"
        header-align="center"
        align="center"
      ></el-table-column>
      <!--  -->
      <el-table-column
        v-for="(header, index) in tableData.showHeaders"
        :label="header.fieldcname"
        :key="index"
        show-overflow-tooltip
        :prop="header.fieldename"
        sortable="custom"
        header-align="center"
        align="center"
        :render-header="labelHead"
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
                  scope.row[header.fieldename] &&
                    typeof scope.row[header.fieldename] === 'object'
                    ? scope.row[header.fieldename].value
                    : scope.row[header.fieldename]
                )
              "
            >
              <u>{{
                scope.row[header.fieldename] &&
                typeof scope.row[header.fieldename] === "object"
                  ? scope.row[header.fieldename].value
                  : scope.row[header.fieldename]
              }}</u>
            </el-button>
          </div>
          <div v-else>
            {{
              scope.row[header.fieldename] &&
              typeof scope.row[header.fieldename] === "object"
                ? scope.row[header.fieldename].value
                : scope.row[header.fieldename]
            }}
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-row
      style="
        background-color: #f5f7fa;
        padding: 5px;
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
import Models from "@/db/Models.js";
export default {
  watch: {
    // 列的显示与否需要更新table
    "tableData.showHeaders": {
      handler(newValue, oldValue) {
        this.$nextTick(() => {
          this.$refs[`${this.tableData.pageIndex}`].doLayout();
        });
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    for (let size = 1; size <= 60; size++) {
      this.optionsPageSize.push({
        label: String(size),
        value: size,
      });
    }
  },
  components: {},
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
    labelHead(h, { column, index }) {
      let l = column.label.length;
      let f = 30; //每个字大小，其实是每个字的比例值，大概会比字体大小差不多大一点，
      column.minWidth = f * (l + 1); //字大小乘个数即长度 ,注意不要加px像素，这里minWidth只是一个比例值，不是真正的长度 //然后将列标题放在一个div块中，注意块的宽度一定要100%，否则表格显示不完全
      // console.log(column);
      // fontSize: "14px"
      return h("div", { style: { width: "100%" } }, [column.label]);
    },
    rowClassName({ row, rowIndex }) {
      row.rowIndex = rowIndex + 1;
    },
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
      let value = row[column.property].value || row[column.property];
      console.log(row);
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    async sortChange(column) {
      if (this.tableData.tid === 901) {
        this.$message({
          message: "当前表格不支持列排序.",
        });
        return;
      }
      let fieldName = column.prop;
      let sortingType = column.order;
      console.log(fieldName, sortingType);
      if (sortingType) {
        if (sortingType === "descending") {
          sortingType = "DESC";
        } else {
          sortingType = "ASC";
        }
        let orderBy = ` ORDER BY ${fieldName} ${sortingType}`;
        console.log(orderBy);
        this.$store.commit("ShowTable/SET_TABLE_ORDERBY", orderBy);

        this.currentPage = 1;
        await this.$store.dispatch(this.tableData.dispatchName, {
          ...this.tableData,
          offset: 0,
          count: this.pageSize,
        });
      }
      return;
    },
    async handleClickTableCellLink(
      showrightbtn_type,
      row,
      fieldename,
      linkMid,
      value
    ) {
      console.log(this.tableData);
      if (showrightbtn_type === "link") {
        let newRow = {};
        for (let k in row) {
          newRow[k] = typeof row[k] === "object" ? row[k].value : row[k];
        }
        console.log(newRow);
        // 资金用途
        let tid = this.tableData.tid;
        let selectedCNColumnName = "";
        if (tid === 901) {
          for (let item of this.tableData.showHeaders) {
            if (item.fieldename.toUpperCase() === fieldename.toUpperCase()) {
              selectedCNColumnName = item.fieldcname;
              break;
            }
          }
        }
        this.$store.dispatch("ShowTable/showLinkTable", {
          tid,
          linkMid,
          selectCondition: this.tableData.selectCondition,
          row: newRow,
          fieldename: fieldename.toUpperCase(), // 注意列名需要传递大写
          selectedCNColumnName,
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
      this.currentPage = val;
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
/deep/.el-table .cell {
  position: relative;
}
/deep/.el-table .caret-wrapper {
  position: absolute;
  top: -4px;
  right: 0;
}
</style>

