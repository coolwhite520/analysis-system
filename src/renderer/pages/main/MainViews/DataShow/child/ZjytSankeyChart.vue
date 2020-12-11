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
  props: ["dataList", "limitHeight"],
  data() {
    return {
      id: uuid.v1(),
      myChart: null,
      myDataList: JSON.parse(JSON.stringify(this.dataList)),
    };
  },
  methods: {
    makeData() {
      let totalName = { name: "总账户", je: "" };
      for (let data of this.myDataList) {
        data.pie.legendData.forEach((item) => {
          if (item.title === "其它" && item.parentid === "77") {
            item.title = "其它（入账）";
          }
          if (item.title === "其它" && item.parentid === "78") {
            item.title = "其它（出账）";
          }
        });
      }
      // 先计算入账links
      let inLinks = [];
      let inData = this.myDataList[0];
      for (let item of inData.pie.legendData) {
        inLinks.push({
          target: totalName.name + "\n" + totalName.je,
          source: item.title + "\n" + item.je,
          value: parseFloat(item.je),
        });
      }
      for (let row of inData.rows) {
        let obj = inData.pie.legendData.find(
          (data) => row.parentid === data.tid
        );
        if (obj) {
          inLinks.push({
            source: row.ZJYT + "\n" + row.JZJE,
            target: obj.title + "\n" + obj.je,
            value: parseFloat(row.JZJE),
          });
        }
      }
      // 计算出账links
      let outLinks = [];
      let outData = this.myDataList[1];
      for (let item of outData.pie.legendData) {
        outLinks.push({
          target: item.title + "\n" + item.je,
          source: totalName.name + "\n" + totalName.je,
          value: parseFloat(item.je),
        });
      }
      for (let row of outData.rows) {
        let obj = outData.pie.legendData.find(
          (data) => row.parentid === data.tid
        );
        if (obj) {
          outLinks.push({
            source: obj.title + "\n" + obj.je,
            target: row.ZJYT + "\n" + row.CZJE,
            value: parseFloat(row.CZJE),
          });
        }
      }
      let links = inLinks.concat(outLinks);
      let nodes = [];
      for (let link of links) {
        let name1 = link.target;
        let name2 = link.source;
        if (nodes.findIndex((item) => item.name === name1) === -1) {
          nodes.push({ name: name1 });
        }
        if (nodes.findIndex((item) => item.name === name2) === -1) {
          nodes.push({ name: name2 });
        }
      }
      return { nodes, links };
    },
    draw() {
      let data = this.makeData();
      console.log(data);
      let option = {
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
        },
        series: [
          {
            type: "sankey",
            layoutIterations: 32,
            nodeGap: 16,
            data: data.nodes,
            links: data.links,
            focusNodeAdjacency: "allEdges",
            label: {
              fontSize: 6,
            },
            itemStyle: {
              borderWidth: 1,
              borderColor: "#aaa",
            },
            lineStyle: {
              color: "source",
              curveness: 0.5,
            },
            levels: [
              {
                depth: 0,
                itemStyle: {
                  color: "#fbb4ae",
                },
                lineStyle: {
                  color: "source",
                  opacity: 0.6,
                },
              },
              {
                depth: 1,
                itemStyle: {
                  color: "#b3cde3",
                },
                lineStyle: {
                  color: "source",
                  opacity: 0.6,
                },
              },
              {
                depth: 2,
                itemStyle: {
                  color: "#ccebc5",
                },
                lineStyle: {
                  color: "source",
                  opacity: 0.6,
                },
              },
              {
                depth: 3,
                itemStyle: {
                  color: "#decbe4",
                },
                lineStyle: {
                  color: "source",
                  opacity: 0.6,
                },
              },
            ],
          },
        ],
      };
      this.myChart.setOption(option);
    },
  },
  mounted() {
    let el = document.getElementById(this.id);
    this.myChart = this.$echarts.init(el);
    this.draw();
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.id), (element) => {
      if (this.myChart) this.myChart.resize();
    });
  },
};
</script>