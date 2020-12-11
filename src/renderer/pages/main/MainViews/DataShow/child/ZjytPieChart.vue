<template>
  <div
    :id="id"
    :style="{ height: limitHeight + 'px', marginTop: 0 + 'px' }"
  ></div>
</template>
<script>
const uuid = require("uuid");
const elementResizeDetectorMaker = require("element-resize-detector");

export default {
  props: ["pie", "rows", "limitHeight"],
  watch: {
    pie: {
      handler(newValue, oldValue) {
        this.myChart.resize();
        this.draw();
      },
      deep: true,
    },
  },
  data() {
    return {
      myChart: null,
      id: uuid.v1(),
    };
  },
  mounted() {
    console.log(this.pie);
    let el = document.getElementById(this.id);
    this.myChart = this.$echarts.init(el);
    this.draw();
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.id), (element) => {
      if (this.myChart) this.myChart.resize();
    });
  },
  methods: {
    draw() {
      let title = this.pie.title;
      let legendData = this.pie.legendData.map((item) => {
        return `${item.title}`;
      });
      let seriesInnerData = this.pie.legendData.map((item) => {
        return {
          value: item.rate,
          name: item.title,
        };
      });
      let seriesOuterData = this.pie.pieData
        .filter((row) => row.rate !== null && Number(row.rate) > 0)
        .map((row) => {
          return {
            value: row.rate,
            name: row.title,
          };
        });
      let option = {
        title: {
          text: title + "分析",
          x: "center",
          y: 10,
          textAlign: "center",
          textStyle: {
            color: "#3c4e6b",
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: 10,
          top: 10,
          data: legendData,
        },
        series: [
          {
            top: 50,
            name: title,
            type: "pie",
            selectedMode: "single",
            radius: [0, "30%"],
            label: {
              position: "inner",
            },
            labelLine: {
              show: false,
            },
            data: seriesInnerData,
          },
          {
            top: 50,
            name: title,
            type: "pie",
            radius: ["40%", "55%"],
            label: {
              formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{per|{d}%}  ",
              backgroundColor: "#eee",
              borderColor: "#aaa",
              borderWidth: 1,
              borderRadius: 4,
              rich: {
                a: {
                  color: "#999",
                  lineHeight: 22,
                  align: "center",
                },
                hr: {
                  borderColor: "#aaa",
                  width: "100%",
                  borderWidth: 0.5,
                  height: 0,
                },
                b: {
                  fontSize: 10,
                  lineHeight: 20,
                },
                per: {
                  color: "#eee",
                  backgroundColor: "#334455",
                  padding: [2, 4],
                  borderRadius: 2,
                },
              },
            },
            data: seriesOuterData,
            // data: [
            //   { value: 335, name: "直达" },
            //   { value: 310, name: "邮件营销" },
            //   { value: 234, name: "联盟广告" },
            //   { value: 135, name: "视频广告" },
            //   { value: 1048, name: "百度" },
            //   { value: 251, name: "谷歌" },
            //   { value: 147, name: "必应" },
            //   { value: 102, name: "其他" },
            // ],
          },
        ],
      };
      this.myChart.setOption(option);
    },
  },
};
</script>