<template>
  <div>
    <div
      class="entityView"
      :style="{ height: contentViewHeight - 40 - 15 + 'px' }"
    >
      <el-row class="title">
        <el-col :span="2" style="text-align: center">
          <el-tooltip
            class="item"
            effect="dark"
            content="点击收缩右边栏"
            placement="top"
          >
            <span @click="handleClickShowRightSlider" class="close iconfont">{{
              currentTableData.isShowRightSlider ? "&#xe626;" : "&#xe668;"
            }}</span></el-tooltip
          >
        </el-col>
        <el-col :span="20">
          <div>
            <span class="iconfont">&#xe61c;&nbsp;&nbsp;&nbsp;实体信息</span>
          </div>
        </el-col>
        <el-col :span="2">
          <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
        </el-col>
      </el-row>

      <el-table
        :data="currentTableData.entity.entityTableData"
        @row-contextmenu="handleRightClickRow"
        :height="tableHeight"
        size="mini"
        style="width: 100%"
        border
      >
        <el-table-column prop="title" label="说明" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="describe" label="统计结果" show-overflow-tooltip>
          <template slot-scope="scope">
            <span
              v-if="scope.row.title.indexOf('差额') > 0"
              :style="{
                color: scope.row.describe > 0 ? '#cd594b' : '#46962e',
              }"
            >
              {{ scope.row.describe }}&nbsp;元
            </span>
            <span v-else
              >{{ scope.row.describe
              }}{{ scope.row.title.indexOf("额") > 0 ? " 元" : "" }}</span
            >
          </template></el-table-column
        >
      </el-table>

      <el-table
        :data="myNodeStyle"
        :height="table2Height"
        size="mini"
        style="width: 100%"
        border
      >
        <el-table-column label="个性化设置">
          <el-table-column prop="title" label="说明" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="describe" label="状态" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.title.indexOf('色') > 0">
                <el-color-picker
                  v-model="scope.row.describe"
                  size="mini"
                  @change="() => onChangeColor(scope.row)"
                ></el-color-picker>
              </span>
              <span v-else-if="scope.row.title.indexOf('图') > 0">
                <el-image
                  style="width: 20px; height: 20px; vertical-align: middle"
                  :src="scope.row.describe"
                ></el-image>
                <el-dropdown
                  split-button
                  type="text"
                  size="mini"
                  @command="(command) => handleCommand(command, scope.row)"
                >
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      style="text-align: center"
                      v-for="(item, index) in iconList"
                      :key="index"
                      :command="item.name"
                    >
                      <span v-if="item.name === '自定义'">
                        <span>{{ item.name }}</span>
                      </span>
                      <span v-else>
                        <span>{{ item.name }}:</span>
                        <el-image
                          style="
                            width: 20px;
                            height: 20px;
                            vertical-align: middle;
                          "
                          :src="item.src"
                        ></el-image>
                      </span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>

                <!-- <el-button
                  size="mini"
                  @click="() => handleClickModify(scope.row)"
                ></el-button> -->
              </span>
            </template></el-table-column
          >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
const { clipboard } = require("electron");
export default {
  data() {
    return {
      iconsPath: "",
      iconList: [],
    };
  },
  mounted() {
    this.iconsPath = "/static/images/icons/";
    let iconNames = [
      "证件",
      "主体",
      "金融",
      "男",
      "女",
      "企业",
      "银行卡",
      "组织",
    ];
    this.iconList = iconNames.map((name) => {
      return {
        name,
        src: this.iconsPath + name + ".png",
      };
    });
    this.iconList.push({
      name: "自定义",
    });
  },
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
    tableHeight() {
      return (
        36 * 1 + 36 * this.currentTableData.entity.entityTableData.length + 2
      );
    },
    table2Height() {
      return 36 * 2 + 48 * this.currentTableData.entity.nodeStyle.length + 2;
    },
    myNodeStyle() {
      return JSON.parse(JSON.stringify(this.currentTableData.entity.nodeStyle));
    },
  },
  methods: {
    async handleRightClickRow(row, column, event) {
      let value = row[column.property];
      console.log(row);
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    handleClickShowRightSlider() {
      this.$store.commit("ShowTable/SWITCH_ISSHOWRIGHTSLIDER");
    },
    onChangeColor(row) {
      console.log(row);
      this.$bus.$emit("nodeStyleSetting", {
        graphid: this.currentTableData.graphid,
        nodeid: this.currentTableData.entity.nodeid,
        nodeStyle: row,
      });
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-view",
        action: "remove",
      });
    },
    async convertToBase64Image(fileUrl) {
      const fs = require("fs");
      const imageData = fs.readFileSync(fileUrl); // 例：xxx/xx/xx.png
      const imageBase64 = imageData.toString("base64");
      const imagePrefix = "data:image/png;base64,";
      return imagePrefix + imageBase64;
    },
    async handleCommand(command, row) {
      if (command === "自定义") {
        let mainWindow = this.$electron.remote.getGlobal("mainWindow");
        let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
          mainWindow,
          {
            title: "数据导入",
            buttonLabel: "打开",
            filters: [{ name: "Files", extensions: ["png", "jpeg", "bmp"] }],
            properties: ["openFile"],
          }
        );
        if (typeof filePathList === "undefined") return;
        row.describe = await this.convertToBase64Image(filePathList[0]);
        console.log({ row });
        this.$bus.$emit("nodeStyleSetting", {
          graphid: this.currentTableData.graphid,
          nodeid: this.currentTableData.entity.nodeid,
          nodeStyle: row,
        });
      } else {
        row.describe = this.iconsPath + command + ".png";
        this.$bus.$emit("nodeStyleSetting", {
          graphid: this.currentTableData.graphid,
          nodeid: this.currentTableData.entity.nodeid,
          nodeStyle: row,
        });
      }
    },
  },
};
</script>
<style  scoped>
.entityView {
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