<template>
  <div id="barChart" :style="{height: limitHeight + 'px', marginTop: 50 + 'px'}"></div>
</template>

<script>
export default {
  props: ["tableData", "limitHeight"],
  mounted() {
    this.drawLine();
  },
  methods: {
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let el = document.getElementById("barChart");
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
          myChart.on("click", "series.bar", function (params) {
            console.log(params);
          });
        }
      }
    },
  },
};
</script>