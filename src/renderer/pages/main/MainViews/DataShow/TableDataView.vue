<template>
  <div>
    <div
      :style="{height: (tableData.showType === 1? contentViewHeight -121:(contentViewHeight -121)/2) + 'px'}"
    >
      <el-table
        style="width: 100%;"
        :data="tableData.data.rows"
        size="mini"
        :max-height="tableData.showType===1? contentViewHeight -121:(contentViewHeight - 121)/2"
        stripe
        border
        @sort-change="sortChange"
      >
        <el-table-column fixed type="index" width="50" label="编号"></el-table-column>
        <el-table-column
          v-for="(header) in tableData.data.headers"
          :label="header.fieldcname"
          :key="header.cid"
          show-overflow-tooltip
          :prop="header.fieldename"
          sortable="custom"
        >
          <template slot-scope="scope">
            <div v-if="header.showrightbtn_type">
              <el-button
                type="text"
                size="mini"
                style="color:#2e69b7"
                @click="handleClickTableCellLink(scope.row, header.fieldename, header.link_mid, scope.row[header.fieldename].value)"
              >{{ scope.row[header.fieldename].value }}</el-button>
            </div>
            <div v-else>{{ scope.row[header.fieldename].value }}</div>
          </template>
        </el-table-column>
      </el-table>
      <el-row style="margin-top:10px;">
        <el-col :span="12">
          <div
            style="font-size:12px;color:gray"
          >每页显示{{pageSize}}条，当前页面条目数量：{{ tableData.data.rows.length }}条, 总计：{{tableData.data.sum}}条</div>
        </el-col>
        <el-col :span="12" style="text-align:right;">
          <div>
            <el-pagination
              small
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="tableData.data.sum"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>
        </el-col>
      </el-row>
    </div>
    <div
      id="myChart"
      v-if="tableData.showType===4"
      :style="{height: (tableData.showType === 1? contentViewHeight -121:(contentViewHeight -121)/2) + 'px',marginTop: 50 + 'px'}"
    >
      <!-- 输出表类型 1表格， 2视图，3上表下图,4上表下柱状图,5上饼图下表 -->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  mounted() {
    console.log(this.contentViewHeight);
    this.drawLine();
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  props: ["tableData"],
  data() {
    return {
      pageSize: 30,
    };
  },
  methods: {
    sortChange(column) {
      console.log(column);
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

      newTableData.data.rows = newTableData.data.rows.sort(
        compare(fieldName, sortingType)
      );

      for (let row of newTableData.data.rows) {
        console.log(row[fieldName].value);
      }
      this.$store.commit("ShowTable/UPDATE_TABLE_DATA", {
        tid: this.tableData.tid,
        data: newTableData.data,
      });
    },
    async handleClickTableCellLink(row, fieldename, linkMid, value) {
      console.log(row, fieldename, linkMid, value);
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let el = document.getElementById("myChart");
      if (el) {
        let xArray = [];
        let jzbsArray = [];
        let czbsArray = [];
        for (let row of this.tableData.data.rows) {
          xArray.push(row["jyqj"].value);
          jzbsArray.push(row["jzbs"].value);
          czbsArray.push(row["czbs"].value);
        }
        let myChart = this.$echarts.init(el);
        if (myChart) {
          // 绘制图表
          myChart.setOption({
            // backgroundColor: "#2c343c",
            // textStyle: {
            //   color: "rgba(255, 255, 255, 0.3)",
            // },
            // color: ["#3398DB"],
            legend: {
              orient: "vertical", // 'vertical'
              x: "right", //可设定图例在左、右、居中
              y: "top", //可设定图例在上、下、居中
              // padding: [0, 50, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
              data: [
                {
                  name: "进账笔数",
                  textStyle: {
                    color: "#9cdcfe",
                  },
                },
                {
                  name: "出账笔数",
                  textStyle: {
                    color: "#ee6b5f",
                  },
                },
              ],
            },
            grid: {},
            title: {
              text: "进出账笔数",
              // subtext: "在此测试",
              x: "center",
              y: "top",
              textAlign: "center",
            },
            tooltip: {},
            xAxis: {
              data: xArray,
              // axisTick: {
              //   alignWithLabel: true,
              // },
            },
            yAxis: {},
            series: [
              {
                name: "进账笔数",
                type: "bar",
                data: jzbsArray,
                itemStyle: {
                  color: "#9cdcfe",
                },
              },
              {
                name: "出账笔数",
                type: "bar",
                data: czbsArray,
                itemStyle: {
                  color: "#ee6b5f",
                },
              },
            ],
          });
        }
      }
    },
    async handleCurrentChange(val) {
      let { ajid } = this.caseBase;
      let offset = (val - 1) * this.pageSize;
      let {
        tid,
        tablecname,
        dispatchName,
        pgsql,
        orderby,
        showType,
        mpids,
        params,
      } = this.tableData;
      console.log(this.tableData);
      // 根据tableName获取表的数据
      await this.$store.dispatch(dispatchName, {
        ajid,
        tid,
        pgsql,
        orderby,
        tablecname,
        showType,
        offset: offset,
        params,
        mpids,
        count: this.pageSize,
      });
    },
  },
};
</script>
<style >
</style>