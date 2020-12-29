<template>
  <div>
    <div id="myDiagramDiv" style="width: 1000px; height: 600px"></div>
    <div id="myOverviewDiv"></div>
  </div>
</template>

<script>
import go from "gojs";
const $ = go.GraphObject.make;
function ParallelRouteLink() {
  go.Link.call(this);
}
go.Diagram.inherit(ParallelRouteLink, go.Link);
ParallelRouteLink.prototype.computeSpacing = function () {
  return 20;
};
ParallelRouteLink.prototype.computePoints = function () {
  var result = go.Link.prototype.computePoints.call(this);
  if (
    !this.isOrthogonal &&
    this.curve !== go.Link.Bezier &&
    this.hasCurviness()
  ) {
    var curv = this.computeCurviness();
    if (curv !== 0) {
      var num = this.pointsCount;
      // console.log({ num });
      var pidx = 0;
      var qidx = num - 1;
      if (num >= 4) {
        pidx++;
        qidx--;
      }

      var frompt = this.getPoint(pidx);
      var topt = this.getPoint(qidx);
      var dx = topt.x - frompt.x;
      var dy = topt.y - frompt.y;

      var mx = frompt.x + (dx * 1) / 800;
      var my = frompt.y + (dy * 1) / 800;
      var px = mx;
      var py = my;
      if (-0.01 < dy && dy < 0.01) {
        if (dx > 0) py -= curv;
        else py += curv;
      } else {
        var slope = -dx / dy;
        var e = Math.sqrt((curv * curv) / (slope * slope + 1));
        if (curv < 0) e = -e;
        px = (dy < 0 ? -1 : 1) * e + mx;
        py = slope * (px - mx) + my;
      }

      mx = frompt.x + (dx * 799) / 800;
      my = frompt.y + (dy * 799) / 800;
      var qx = mx;
      var qy = my;
      if (-0.01 < dy && dy < 0.01) {
        if (dx > 0) qy -= curv;
        else qy += curv;
      } else {
        var slope = -dx / dy;
        var e = Math.sqrt((curv * curv) / (slope * slope + 1));
        if (curv < 0) e = -e;
        qx = (dy < 0 ? -1 : 1) * e + mx;
        qy = slope * (qx - mx) + my;
      }
      this.clearPoints();
      this.insertPointAt(pidx + 1, px, py);
      this.insertPointAt(qidx + 1, qx, qy);
    }
  }
  return result;
};
export default {
  data() {
    return {
      // 默认overview
      defaultOverViewStrokeColor: "#3982f7",
      // node默认属性
      defaultFillColor: "#d9dce1",
      mouseEnterFillColor: "#f8ce5f",
      selectedStrokeColor: "red",
      defualtStrokeColor: "#3c4e6b",
      defaultStrokeWidth: 1,
      myDiagram: null,
      myOverview: null,
      isScroll: false,
      // link默认属性
      linkTextVisible: true,
      linkTexteditable: false,
    };
  },
  methods: {
    CircularLayout() {
      this.myDiagram.layout = $(go.CircularLayout);

      this.myDiagram.startTransaction("change Layout");
      var lay = this.myDiagram.layout;

      var radius = "NaN"; // document.getElementById("radius").value;
      if (radius !== "NaN") radius = parseFloat(radius, 10);
      else radius = NaN;
      lay.radius = radius;

      var aspectRatio = 1; // document.getElementById("aspectRatio").value;
      aspectRatio = parseFloat(aspectRatio, 10);
      lay.aspectRatio = aspectRatio;

      var startAngle = 0; // document.getElementById("startAngle").value;
      startAngle = parseFloat(startAngle, 10);
      lay.startAngle = startAngle;

      var sweepAngle = 360; // ocument.getElementById("sweepAngle").value;
      sweepAngle = parseFloat(sweepAngle, 10);
      lay.sweepAngle = sweepAngle;

      var spacing = 20; // document.getElementById("spacing").value;
      spacing = parseFloat(spacing, 10);
      lay.spacing = spacing;

      var arrangement = "ConstantDistance"; // document.getElementById("arrangement").value;
      if (arrangement === "ConstantDistance")
        lay.arrangement = go.CircularLayout.ConstantDistance;
      else if (arrangement === "ConstantAngle")
        lay.arrangement = go.CircularLayout.ConstantAngle;
      else if (arrangement === "ConstantSpacing")
        lay.arrangement = go.CircularLayout.ConstantSpacing;
      else if (arrangement === "Packed")
        lay.arrangement = go.CircularLayout.Packed;

      var diamFormula = "Pythagorean"; // getRadioValue("diamFormula");
      if (diamFormula === "Pythagorean")
        lay.nodeDiameterFormula = go.CircularLayout.Pythagorean;
      else if (diamFormula === "Circular")
        lay.nodeDiameterFormula = go.CircularLayout.Circular;

      var direction = "Clockwise"; // document.getElementById("direction").value;
      if (direction === "Clockwise")
        lay.direction = go.CircularLayout.Clockwise;
      else if (direction === "Counterclockwise")
        lay.direction = go.CircularLayout.Counterclockwise;
      else if (direction === "BidirectionalLeft")
        lay.direction = go.CircularLayout.BidirectionalLeft;
      else if (direction === "BidirectionalRight")
        lay.direction = go.CircularLayout.BidirectionalRight;

      var sorting = "Forwards"; // document.getElementById("sorting").value;
      if (sorting === "Forwards") lay.sorting = go.CircularLayout.Forwards;
      else if (sorting === "Reverse") lay.sorting = go.CircularLayout.Reverse;
      else if (sorting === "Ascending")
        lay.sorting = go.CircularLayout.Ascending;
      else if (sorting === "Descending")
        lay.sorting = go.CircularLayout.Descending;
      else if (sorting === "Optimized")
        lay.sorting = go.CircularLayout.Optimized;

      this.myDiagram.commitTransaction("change Layout");

      this.myDiagram.layout = $(go.Layout);
    },
    SetAllowScroll(type) {
      if (!type) {
        this.myDiagram.allowHorizontalScroll = false;
        this.myDiagram.allowVerticalScroll = false;
      } else {
        this.myDiagram.allowHorizontalScroll = true;
        this.myDiagram.allowVerticalScroll = true;
      }
    },
    initDiagram() {
      this.myDiagram = $(
        go.Diagram,
        myDiagramDiv,
        {
          initialAutoScale: go.Diagram.UniformToFill,
          initialContentAlignment: go.Spot.Center,
          contentAlignment: go.Spot.Center,
          allowDrop: true,
          "animationManager.isEnabled": false,
          "animationManager.duration": 800,
          allowHorizontalScroll: true,
          allowVerticalScroll: true,
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          "commandHandler.archetypeGroupData": {
            text: "组",
            isGroup: true,
            color: "blue",
          },
          "toolManager.hoverDelay": 100, // how quickly tooltips are shown
          "undoManager.isEnabled": true,
        },
        {
          doubleClick: (e, node) => {
            if (!this.isScroll) {
              this.SetAllowScroll(true);
              this.isScroll = true;
            } else {
              this.SetAllowScroll(false);
              this.isScroll = false;
            }
          },
        }
      );
    },
    initOverView() {
      let _this = this;
      this.myOverview = $(
        go.Overview,
        "myOverviewDiv", // the HTML DIV element for the Overview
        {
          observed: _this.myDiagram,
          contentAlignment: go.Spot.Center,
          initialScale: 0.05,
          autoScale: go.Diagram.None,
          hasHorizontalScrollbar: false, // don't show any scrollbars
          hasVerticalScrollbar: false,
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          "undoManager.isEnabled": true,
        }
      ); // tell it which Diagram to show and pan
      let shape = this.myOverview.box.elt(0);
      shape.stroke = _this.defaultOverViewStrokeColor;
      console.log(shape.fill);
    },
    textStyle() {
      return {
        font: "bold 9pt Segoe UI, sans-serif",
        stroke: "black",
        margin: 0,
      };
    },
    initNodeTemplate() {
      let _this = this;
      function mouseEnter(e, obj) {
        var shape = obj.findObject("SHAPE");
        shape.fill = _this.mouseEnterFillColor;
        
        let links = obj.findLinksConnected();
        links.each((link) => {
          link.stroke = "rgba(0,90,156,0.3)";
        });
        let nodes = obj.findNodesConnected();
        nodes.each((node) => {
          var shape = node.findObject("SHAPE");
          shape.fill = _this.mouseEnterFillColor;
        });
      }
      function mouseLeave(e, obj) {
        var shape = obj.findObject("SHAPE");
        shape.fill = _this.defaultFillColor;

        let links = obj.findLinksConnected();
        links.each((link) => {
          link.stroke = "transparent";
        });
        let nodes = obj.findNodesConnected();
        nodes.each((node) => {
          var shape = node.findObject("SHAPE");
          shape.fill = _this.defaultFillColor;
        });
      }

      this.myDiagram.nodeTemplate = $(
        go.Node,
        "Vertical",
        {
          selectionAdorned: false,
          mouseEnter: mouseEnter,
          mouseLeave: mouseLeave,
        },
        new go.Binding("zOrder"),
        $(
          go.Panel,
          "Auto",
          $(
            go.Shape,
            "Circle",
            {
              name: "SHAPE",
              fill: _this.defaultFillColor,
              portId: "",
            },
            new go.Binding("fill", "color")
          ),
          $(
            go.Picture,
            {
              width: 32,
              height: 32,
              name: "GRAPHPICTURE",
            },
            new go.Binding("source", "source")
          )
        ),
        $(go.TextBlock, { margin: 8, name: "TEXT" }, new go.Binding("text")),
        {
          click: function (e, obj) {},
          selectionChanged: function (obj) {
            var shape = obj.findObject("SHAPE");
            shape.stroke = obj.isSelected
              ? _this.selectedStrokeColor
              : _this.defualtStrokeColor;
            var textObj = obj.findObject("TEXT");
            textObj.background = obj.isSelected
              ? _this.selectedStrokeColor
              : "transparent";
          },
        }
      );
    },
    linkSelectionAdornmentTemplate() {
      var linkSelectionAdornmentTemplate = $(
        go.Adornment,
        "Link",
        $(
          go.Shape,
          {
            isPanelMain: true,
            fill: "color",
            strokeWidth: 0,
            stroke: "rgba(0, 0, 255, 0.3)",
          }, //rgba(173, 173, 173, 0.25)
          new go.Binding("stroke", "rgba(0, 0, 255, 0.3)"),
          new go.Binding("strokeWidth", "width")
        ),
        $(
          go.Shape,
          { toArrow: "Standard", stroke: null, fill: "rgba(0, 0, 255, 0.3)" },
          new go.Binding("fill", "rgba(0, 0, 255, 0.3)")
        )
      );
      return linkSelectionAdornmentTemplate;
    },
    initLinkTemplate() {
      this.myDiagram.linkTemplate = $(
        ParallelRouteLink,
        $(go.Shape, {
          isPanelMain: true,
          stroke: "transparent",
          strokeWidth: 8,
        }),
        $(go.Shape, { isPanelMain: true }), // default stroke === "black", strokeWidth === 1
        $(go.Shape, { toArrow: "Standard", scale: 2 }),
        $(
          go.Panel,
          "Auto", // this whole Panel is a link label
          $(go.Shape, "Rectangle", {
            fill: "white",
            stroke: "transparent",
          }),
          $(go.TextBlock, { margin: 3 }, new go.Binding("text", "text"))
        ),
        {
          mouseEnter: function (e, link) {
            link.elt(0).stroke = "rgba(0,90,156,0.3)";
          },
          mouseLeave: function (e, link) {
            link.elt(0).stroke = "transparent";
          },
        }
      );
    },
    makeData() {
      let nodes = [];
      for (let i = 0; i < 10; i++) {
        nodes.push({
          key: i,
          text: "Alpha" + i,
          source: "/static/images/icons/银行卡.png",
        });
      }
      let links = [
        { from: 1, to: 2, text: "asdfasdfasdfasdf" },
        { from: 1, to: 2, text: "asdfasdfasdfasdf" },
        { from: 2, to: 3, text: "asdfasdfasdfasdf" },
        { from: 4, to: 1, text: "asdfasdfasdfasdf" },
      ];

      return { nodes, links };
    },
  },
  mounted() {
    let arrData = [];
    this.initDiagram();
    this.initOverView();
    this.initNodeTemplate();
    let { nodes, links } = this.makeData();
    console.log(nodes, links);
    this.myDiagram.model = new go.GraphLinksModel(nodes, links);
    this.CircularLayout();
    this.initLinkTemplate();
  },
};
</script>

<style  scoped>
#myOverviewDiv {
  position: absolute;
  width: 200px;
  height: 100px;
  bottom: 2px;
  right: 2px;
  background-color: #f5f7fa;
  z-index: 300;
  border: solid 1px #e2e2e2;
}
</style>