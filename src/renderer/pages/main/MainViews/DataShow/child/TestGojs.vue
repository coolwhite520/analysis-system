<template>
  <div
    id="myDiagramDiv"
    style="width: 500px; height: 350px; background-color: #dae4e4"
  ></div>
</template>

<script>
export default {
  mounted() {
    var go_maker = this.$go.GraphObject.make;
    // 第一步：创建图表
    var myDiagram = go_maker(this.$go.Diagram, "myDiagramDiv", {
      "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
    }); // 创建图表，用于在页面上画图
    var myModel = go_maker(this.$go.Model);
    // in the model data, each node is represented by a JavaScript object:
    myModel.nodeDataArray = [
      { key: "Alpha" },
      { key: "Beta" },
      { key: "Gamma" },
    ];
    myDiagram.model = myModel;
  },
};
</script>
