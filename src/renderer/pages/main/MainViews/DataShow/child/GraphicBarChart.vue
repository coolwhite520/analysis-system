<template>
  <div style="margin-top:15px;">
    <el-row>
      <el-col :span="8">&nbsp;</el-col>
      <el-col :span="8" style="text-align:center;">
        <h4>{{Title}}</h4>
      </el-col>
      <el-col :span="8" style="text-align: right;">
        <el-select v-model="selectValue" size="mini" placeholder="请选择" @change="handleChangeValue">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="22"></el-col>
    </el-row>
    <el-row>
      <div :id="id" :style="{height: limitHeight + 'px', marginTop: 0 + 'px'}"></div>
    </el-row>
  </div>
</template>

<script>
const uuid = require("uuid");
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
      myChart: null,
      id: uuid.v1(),
      Title: "",
      OneBarTitle: "",
      TwoBarTitle: "",
      LineBarTitle: "",
      xArrayData: [], //x轴
      OneBarArrayData: [],
      TwoBarArrayData: [],
      LineBarArrayData: [],
      selectValue: "1",
      options: [
        {
          value: "1",
          label: "交易金额",
        },
        {
          value: "2",
          label: "交易笔数",
        },
      ],
    };
  },
  watch: {
    tableData: {
      handler(newValue, oldValue) {
        this.myChart.resize();
        this.parseData(this.selectValue, newValue);
        this.draw();
      },
      deep: true,
    },
  },
  mounted() {
    let el = document.getElementById(this.id);
    this.myChart = this.$echarts.init(el);
    this.myChart.on("click", "series.bar", this.handleClickBar);
    this.myChart.on("mouseover", this.handleMouseover);
    window.onresize = this.myChart.resize;
    this.parseData(this.selectValue, this.tableData);
    this.draw();
  },
  methods: {
    async handleMouseover(params) {
      // console.log(params);
      // let elTable = document.getElementById(this.tableData.uuid);
      // elTable.scrollTop = params.dataIndex * 20;
      // console.log(elTable);
      // let row = this.tableData.rows[params.dataIndex];
    },
    async handleClickBar(params) {
      if (
        params.seriesName === "进账笔数" ||
        params.seriesName === "出账笔数"
      ) {
        let row = this.tableData.rows[params.dataIndex];
        let fieldename = params.seriesName === "进账笔数" ? "jzbs" : "czbs";
        let header = this.tableData.headers.find(
          (el) => el.fieldename === fieldename
        );
        if (header && header.showrightbtn_type) {
          let linkMid = header.link_mid;
          let value = params.value;
          // 找到tableData对应的行
          console.log(row, fieldename, linkMid, value);
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
        }
      }
    },
    parseData(selValue, tableData) {
      this.xArrayData = [];
      this.OneBarArrayData = [];
      this.TwoBarArrayData = [];
      this.LineBarArrayData = [];
      if (selValue === "1") {
        switch (tableData.tid) {
          case "305":
            this.Title = "进出账金额";
            this.OneBarTitle = "进账金额";
            this.TwoBarTitle = "出账金额";
            this.LineBarTitle = "进出账差额";
            for (let row of tableData.rows) {
              this.xArrayData.push(row["jyrq"].value);
              this.OneBarArrayData.push(row["jzje"].value);
              this.TwoBarArrayData.push(row["czje"].value);
              this.LineBarArrayData.push(row["jczce"].value);
            }
            break;
          case "352":
            {
              this.Title = "进出账金额";
              this.OneBarTitle = "进账金额";
              this.TwoBarTitle = "出账金额";
              this.LineBarTitle = "";
              for (let row of tableData.rows) {
                this.xArrayData.push(row["jyqj"].value);
                this.OneBarArrayData.push(row["jzje"].value);
                this.TwoBarArrayData.push(row["czje"].value);
              }
            }
            break;
          case "358":
            {
              this.Title = "进出账金额";
              this.OneBarTitle = "进账金额";
              this.TwoBarTitle = "出账金额";
              this.LineBarTitle = "进出账差额";
              for (let row of tableData.rows) {
                this.xArrayData.push(row["jyqj"].value);
                this.OneBarArrayData.push(row["jzje"].value);
                this.TwoBarArrayData.push(row["czje"].value);
                this.LineBarArrayData.push(row["jczce"].value);
              }
            }
            break;
        }
      } else if (selValue === "2") {
        switch (this.tableData.tid) {
          case "305":
            {
              this.Title = "进出账笔数";
              this.OneBarTitle = "进账笔数";
              this.TwoBarTitle = "出账笔数";
              this.LineBarTitle = "";
              for (let row of tableData.rows) {
                this.xArrayData.push(row["jyrq"].value);
                this.OneBarArrayData.push(row["jzbs"].value);
                this.TwoBarArrayData.push(row["czbs"].value);
              }
            }

            break;
          case "352":
            {
              this.Title = "进出账笔数";
              this.OneBarTitle = "进账笔数";
              this.TwoBarTitle = "出账笔数";
              this.LineBarTitle = "";
              for (let row of tableData.rows) {
                this.xArrayData.push(row["jyqj"].value);
                this.OneBarArrayData.push(row["jzbs"].value);
                this.TwoBarArrayData.push(row["czbs"].value);
              }
            }
            break;
          case "358":
            {
              this.Title = "进出账笔数";
              this.OneBarTitle = "进账笔数";
              this.TwoBarTitle = "出账笔数";
              this.LineBarTitle = "";
              for (let row of tableData.rows) {
                this.xArrayData.push(row["jyqj"].value);
                this.OneBarArrayData.push(row["jzbs"].value);
                this.TwoBarArrayData.push(row["czbs"].value);
              }
            }
            break;
        }
      }
    },
    handleChangeValue(selValue) {
      this.parseData(selValue, this.tableData);
      this.draw();
    },
    draw() {
      // 绘制图表
      this.myChart.setOption({
        legend: {
          // orient: "vertical", // 'vertical'
          // x: "right", //可设定图例在左、右、居中
          y: "top", //可设定图例在上、下、居中
          // padding: [0, 50, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
          data: [
            {
              name: this.OneBarTitle,
              textStyle: {
                color: "#9cdcfe",
              },
            },
            {
              name: this.TwoBarTitle,
              textStyle: {
                color: "#ee6b5f",
              },
            },
            {
              name: this.LineBarTitle,
              textStyle: {
                color: "#6a9955",
              },
            },
          ],
        },
        grid: {
          containLabel: true,
        },
        // title: {
        //   text: this.Title,
        //   x: "center",
        //   y: "top",
        //   textAlign: "center",
        // },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        xAxis: {
          data: this.xArrayData,
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {},
        series: [
          {
            name: this.OneBarTitle,
            type: "bar",
            data: this.OneBarArrayData,
            stack: "union",
            itemStyle: {
              color: "#9cdcfe",
            },
          },
          {
            name: this.TwoBarTitle,
            type: "bar",
            data: this.TwoBarArrayData,
            stack: "union",
            itemStyle: {
              color: "#ee6b5f",
            },
          },
          {
            name: this.LineBarTitle,
            type: "line",
            data: this.LineBarArrayData,
            itemStyle: {
              color: "#6a9955",
            },
          },
        ],
      });
    },
  },
};
</script>