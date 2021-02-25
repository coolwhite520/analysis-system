<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showTransLocationDialogVisible"
    width="50%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe64c;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
      <div style="text-align: right">
        <el-button
          style="color: white; margin-right: 10px"
          v-if="unKnowCount > 0"
          size="mini"
          @click="handleClickUnKnow"
          type="text"
          ><u>未知：{{ unKnowCount }}</u></el-button
        >
        <el-select
          v-model="selectedValue"
          placeholder="请选择"
          size="mini"
          @change="changedValue"
        >
          <el-option
            v-for="item in selectList"
            :key="item.value"
            :label="'按' + item.cname + '划分'"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div v-loading="loading">
      <div :id="id" style="height: 400px; width: 100%"></div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
import { slugify } from "transliteration";
const uuid = require("uuid");
let nameMapWorld = {
  Afghanistan: "阿富汗",
  Singapore: "新加坡",
  Angola: "安哥拉",
  Albania: "阿尔巴尼亚",
  "United Arab Emirates": "阿联酋",
  Argentina: "阿根廷",
  Armenia: "亚美尼亚",
  "French Southern and Antarctic Lands": "法属南半球和南极领地",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Azerbaijan: "阿塞拜疆",
  Burundi: "布隆迪",
  Belgium: "比利时",
  Benin: "贝宁",
  "Burkina Faso": "布基纳法索",
  Bangladesh: "孟加拉国",
  Bulgaria: "保加利亚",
  "The Bahamas": "巴哈马",
  "Bosnia and Herzegovina": "波斯尼亚和黑塞哥维那",
  Belarus: "白俄罗斯",
  Belize: "伯利兹",
  Bermuda: "百慕大",
  Bolivia: "玻利维亚",
  Brazil: "巴西",
  Brunei: "文莱",
  Bhutan: "不丹",
  Botswana: "博茨瓦纳",
  "Central African Republic": "中非共和国",
  Canada: "加拿大",
  Switzerland: "瑞士",
  Chile: "智利",
  China: "中国",
  "Ivory Coast": "象牙海岸",
  Cameroon: "喀麦隆",
  "Democratic Republic of the Congo": "刚果民主共和国",
  "Republic of the Congo": "刚果共和国",
  Colombia: "哥伦比亚",
  "Costa Rica": "哥斯达黎加",
  Cuba: "古巴",
  "Northern Cyprus": "北塞浦路斯",
  Cyprus: "塞浦路斯",
  "Czech Republic": "捷克共和国",
  Germany: "德国",
  Djibouti: "吉布提",
  Denmark: "丹麦",
  "Dominican Republic": "多明尼加共和国",
  Algeria: "阿尔及利亚",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  Eritrea: "厄立特里亚",
  Spain: "西班牙",
  Estonia: "爱沙尼亚",
  Ethiopia: "埃塞俄比亚",
  Finland: "芬兰",
  Fiji: "斐",
  "Falkland Islands": "福克兰群岛",
  France: "法国",
  Gabon: "加蓬",
  "United Kingdom": "英国",
  Georgia: "格鲁吉亚",
  Ghana: "加纳",
  Guinea: "几内亚",
  Gambia: "冈比亚",
  "Guinea Bissau": "几内亚比绍",
  Greece: "希腊",
  Greenland: "格陵兰",
  Guatemala: "危地马拉",
  "French Guiana": "法属圭亚那",
  Guyana: "圭亚那",
  Honduras: "洪都拉斯",
  Croatia: "克罗地亚",
  Haiti: "海地",
  Hungary: "匈牙利",
  Indonesia: "印度尼西亚",
  India: "印度",
  Ireland: "爱尔兰",
  Iran: "伊朗",
  Iraq: "伊拉克",
  Iceland: "冰岛",
  Israel: "以色列",
  Italy: "意大利",
  Jamaica: "牙买加",
  Jordan: "约旦",
  Japan: "日本",
  Kazakhstan: "哈萨克斯坦",
  Kenya: "肯尼亚",
  Kyrgyzstan: "吉尔吉斯斯坦",
  Cambodia: "柬埔寨",
  Kosovo: "科索沃",
  Kuwait: "科威特",
  Laos: "老挝",
  Lebanon: "黎巴嫩",
  Liberia: "利比里亚",
  Libya: "利比亚",
  "Sri Lanka": "斯里兰卡",
  Lesotho: "莱索托",
  Lithuania: "立陶宛",
  Luxembourg: "卢森堡",
  Latvia: "拉脱维亚",
  Morocco: "摩洛哥",
  Moldova: "摩尔多瓦",
  Madagascar: "马达加斯加",
  Mexico: "墨西哥",
  Macedonia: "马其顿",
  Mali: "马里",
  Myanmar: "缅甸",
  Montenegro: "黑山",
  Mongolia: "蒙古",
  Mozambique: "莫桑比克",
  Mauritania: "毛里塔尼亚",
  Malawi: "马拉维",
  Malaysia: "马来西亚",
  Namibia: "纳米比亚",
  "New Caledonia": "新喀里多尼亚",
  Niger: "尼日尔",
  Nigeria: "尼日利亚",
  Nicaragua: "尼加拉瓜",
  Netherlands: "荷兰",
  Norway: "挪威",
  Nepal: "尼泊尔",
  "New Zealand": "新西兰",
  Oman: "阿曼",
  Pakistan: "巴基斯坦",
  Panama: "巴拿马",
  Peru: "秘鲁",
  Philippines: "菲律宾",
  "Papua New Guinea": "巴布亚新几内亚",
  Poland: "波兰",
  "Puerto Rico": "波多黎各",
  "North Korea": "北朝鲜",
  Portugal: "葡萄牙",
  Paraguay: "巴拉圭",
  Qatar: "卡塔尔",
  Romania: "罗马尼亚",
  Russia: "俄罗斯",
  Rwanda: "卢旺达",
  "Western Sahara": "西撒哈拉",
  "Saudi Arabia": "沙特阿拉伯",
  Sudan: "苏丹",
  "South Sudan": "南苏丹",
  Senegal: "塞内加尔",
  "Solomon Islands": "所罗门群岛",
  "Sierra Leone": "塞拉利昂",
  "El Salvador": "萨尔瓦多",
  Somaliland: "索马里兰",
  Somalia: "索马里",
  "Republic of Serbia": "塞尔维亚",
  Suriname: "苏里南",
  Slovakia: "斯洛伐克",
  Slovenia: "斯洛文尼亚",
  Sweden: "瑞典",
  Swaziland: "斯威士兰",
  Syria: "叙利亚",
  Chad: "乍得",
  Togo: "多哥",
  Thailand: "泰国",
  Tajikistan: "塔吉克斯坦",
  Turkmenistan: "土库曼斯坦",
  "East Timor": "东帝汶",
  "Trinidad and Tobago": "特里尼达和多巴哥",
  Tunisia: "突尼斯",
  Turkey: "土耳其",
  "United Republic of Tanzania": "坦桑尼亚",
  Uganda: "乌干达",
  Ukraine: "乌克兰",
  Uruguay: "乌拉圭",
  "United States": "美国",
  Uzbekistan: "乌兹别克斯坦",
  Venezuela: "委内瑞拉",
  Vietnam: "越南",
  Vanuatu: "瓦努阿图",
  "West Bank": "西岸",
  Yemen: "也门",
  "South Africa": "南非",
  Zambia: "赞比亚",
  Korea: "韩国",
  Tanzania: "坦桑尼亚",
  Zimbabwe: "津巴布韦",
  Congo: "刚果",
  "Central African Rep.": "中非",
  Serbia: "塞尔维亚",
  "Bosnia and Herz.": "波黑",
  "Czech Rep.": "捷克",
  "W. Sahara": "西撒哈拉",
  "Lao PDR": "老挝",
  "Dem.Rep.Korea": "朝鲜",
  "Falkland Is.": "福克兰群岛",
  "Timor-Leste": "东帝汶",
  "Solomon Is.": "所罗门群岛",
  Palestine: "巴勒斯坦",
  "N. Cyprus": "北塞浦路斯",
  Aland: "奥兰群岛",
  "Fr. S. Antarctic Lands": "法属南半球和南极陆地",
  Mauritius: "毛里求斯",
  Comoros: "科摩罗",
  "Eq. Guinea": "赤道几内亚",
  "Guinea-Bissau": "几内亚比绍",
  "Dominican Rep.": "多米尼加",
  "Saint Lucia": "圣卢西亚",
  Dominica: "多米尼克",
  "Antigua and Barb.": "安提瓜和巴布达",
  "U.S. Virgin Is.": "美国原始岛屿",
  Montserrat: "蒙塞拉特",
  Grenada: "格林纳达",
  Barbados: "巴巴多斯",
  Samoa: "萨摩亚",
  Bahamas: "巴哈马",
  "Cayman Is.": "开曼群岛",
  "Faeroe Is.": "法罗群岛",
  "IsIe of Man": "马恩岛",
  Malta: "马耳他共和国",
  Jersey: "泽西",
  "Cape Verde": "佛得角共和国",
  "Turks and Caicos Is.": "特克斯和凯科斯群岛",
  "St. Vin. and Gren.": "圣文森特和格林纳丁斯",
};
var selfnameMap = {
  Iran: "Islamic Republic of Iran",
  "United States": "USA",
  "Democratic Republic of the Congo": "Congo-Brazzaville",
  "Republic of the Congo": "Congo-Kinshasa",
};
var specialAreas = {
  USA: {
    Alaska: {
      // 把阿拉斯加移到美国主大陆左下方
      left: -131,
      top: 25,
      width: 15,
    },
    Hawaii: {
      left: -110, // 夏威夷
      top: 28,
      width: 5,
    },
    "Puerto Rico": {
      // 波多黎各
      left: -76,
      top: 26,
      width: 2,
    },
  },
  France: {
    Guadeloupe: {
      left: -4.8,
      top: 37,
      width: 1,
    },
    Martinique: {
      left: -1,
      top: 37,
      width: 1,
    },
    "French Guiana": {
      left: 3.2,
      top: 37,
      width: 2,
    },
    Mayotte: {
      left: 9,
      top: 37,
      width: 1,
    },
    Réunion: {
      left: 11,
      top: 37,
      width: 1.5,
    },
  },
};
import Base from "@/db/Base.js";
export default {
  mounted() {
    this.$nextTick(() => {
      let el = document.getElementById(this.id);
      this.myChart = this.$echarts.init(el);
      this.myChart.on("click", "series.map", this.handleClickArea);
      this.makeData(this.selectedValue);
      this.draw();
      window.onresize = this.myChart.resize;
    });
  },
  watch: {
    currentTableData: {
      handler(newValue, oldValue) {
        this.makeData(this.selectedValue);
        this.draw();
        this.loading = false;
      },
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      unKnowCount: 0,
      id: uuid.v1(),
      data: [],
      minValue: 0,
      maxValue: 0,
      title: "交易地区分布 - 国家",
      currentCountry: "",
      currentProvince: "",
      tipTitle: "",
      myChart: null,
      selectedValue: "allcount",
      selectList: [
        {
          value: "allcount",
          cname: "交易总笔数",
        },
        {
          value: "incount",
          cname: "进账笔数",
        },
        {
          value: "jzje",
          cname: "进账金额",
        },
        {
          value: "outcount",
          cname: "出账笔数",
        },
        {
          value: "czje",
          cname: "出账金额",
        },
      ],
    };
  },
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("DialogPopWnd", ["showTransLocationDialogVisible"]),
  },
  methods: {
    makeDataForWorld(type) {
      this.tipTitle = this.selectList.find((el) => el.value === type).cname;
      this.data = this.currentTableData.rows.map((row) => {
        return {
          name: row.gjmc.value,
          value: row[`${type}`].value,
        };
      });
      for (let item of this.data) {
        if (item.name === "") {
          this.unKnowCount = item.value;
          break;
        }
      }
      this.data = this.data.filter((item) => item.name.length > 0);
      if (this.data.length === 0) return;
      this.maxValue = this.data[0].value;
      if (this.data.length > 1) this.minValue = this.data[0].value;
      for (let item of this.data) {
        if (item.value >= this.maxValue) {
          this.maxValue = parseInt(item.value);
        }
        if (item.value <= this.minValue) {
          this.minValue = parseInt(item.value);
        }
      }
    },
    makeDataForCountry(type) {
      this.tipTitle = this.selectList.find((el) => el.value === type).cname;
      this.data = this.currentTableData.rows.map((row) => {
        return {
          name: row.sfmc.value,
          value: row[`${type}`].value,
        };
      });
      for (let item of this.data) {
        if (item.name === "") {
          this.unKnowCount = item.value;
          break;
        }
      }
      this.data = this.data.filter((item) => item.name.length > 0);
      if (this.data.length === 0) return;
      this.maxValue = this.data[0].value;
      if (this.data.length > 1) this.minValue = this.data[0].value;

      for (let item of this.data) {
        if (item.value >= this.maxValue) {
          this.maxValue = parseInt(item.value);
        }
        if (item.value <= this.minValue) {
          this.minValue = parseInt(item.value);
        }
      }
    },
    makeDataForProvince(type) {
      this.tipTitle = this.selectList.find((el) => el.value === type).cname;
      this.data = this.currentTableData.rows.map((row) => {
        return {
          name: row.csmc.value,
          value: row[`${type}`].value,
        };
      });
      for (let item of this.data) {
        if (item.name === "") {
          this.unKnowCount = item.value;
          break;
        }
      }
      this.data = this.data.filter((item) => item.name.length > 0);
      if (this.data.length === 0) return;
      this.maxValue = this.data[0].value;
      if (this.data.length > 1) this.minValue = this.data[0].value;

      for (let item of this.data) {
        if (item.value >= this.maxValue) {
          this.maxValue = parseInt(item.value);
        }
        if (item.value <= this.minValue) {
          this.minValue = parseInt(item.value);
        }
      }

      let newData = this.data.map((item) => {
        return {
          name: item.name + "市",
          value: item.value,
        };
      });
      this.data = this.data.concat(
        newData.filter((item) => item.name !== "市")
      );
    },
    makeData(type) {
      this.maxValue = 0;
      this.minValue = 0;
      this.unKnowCount = 0;
      if (this.currentTableData.tid === 353) {
        this.makeDataForWorld(type);
      } else if (this.currentTableData.tid === 359) {
        this.currentCountry = this.currentTableData.rows[0].gjmc.value;
        this.makeDataForCountry(type);
      } else if (this.currentTableData.tid === 360) {
        this.currentCountry = this.currentTableData.rows[0].gjmc.value;
        this.currentProvince = this.currentTableData.rows[0].sfmc.value;
        this.makeDataForProvince(type);
      }
    },
    drawWorldMap() {
      require("echarts/map/js/" + "world");
      this.title = "交易地区分布 - 国家";
      let _this = this;
      let option = {
        backgroundColor: "#aad6f8",
        tooltip: {
          trigger: "item",
        },
        visualMap: {
          left: "right",
          min: _this.minValue,
          max: _this.maxValue,
          inRange: {
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
          },
          text: ["最大值", "最小值"], // 文本，默认为数值文本
          calculable: true,
        },
        nameMap: nameMapWorld,
        toolbox: {
          show: true,
          orient: "horizontal",
          left: "left",
          top: "bottom",
          feature: {
            mark: { show: true },
            saveAsImage: { show: true, name: "交易地区分布图" },
          },
        },
        roamController: {
          show: true,
          left: "right",
          mapTypeControl: {
            world: true,
          },
        },
        series: [
          {
            coordinateSystem: "geo",
            name: _this.tipTitle,
            type: "map",
            mapType: "world",
            roam: true,
            label: {
              show: false, // 这里就不在地图上显示名字了，200多个会晕的
              color: "gray",
            },
            data: _this.data,
          },
        ],
      };
      this.myChart.setOption(option);
    },
    findENNameByCNname(cnname) {
      for (let k in nameMapWorld) {
        if (nameMapWorld[k] === cnname) {
          return k;
        }
      }
      return "";
    },
    // 根据国家的中文名称从数据库获取省份、州的英文和中文信息
    async getNamedMapByCnCountry(cnCountry) {
      let sql = `SELECT DISTINCT "state", cn_state from city_en_cn WHERE cn_country='${cnCountry}';`;
      let { success, rows } = await Base.QueryCustom(sql);
      if (success) {
        let namedMap = {};
        rows.forEach((element) => {
          namedMap[element.state] = element.cn_state;
        });
        return namedMap;
      }
    },
    async drawCountryMap() {
      let _this = this;
      let enName = this.findENNameByCNname(this.currentCountry);
      if (enName === "") {
        this.$message({
          message: `未找到【${this.currentCountry}】国家的地图。`,
        });
        return;
      }
      if (selfnameMap[enName]) {
        enName = selfnameMap[enName];
      }
      enName = enName.split(" ").join("_");
      let geoJson = require("./json/" + enName + ".json");
      this.$echarts.registerMap(enName, geoJson, specialAreas[enName]);
      let nameMapCoutry = {};
      // let nameMapCoutry = await this.getNamedMapByCnCountry(
      //   this.currentCountry
      // );
      // let nameMapCoutry = require("./output/" + enName + "_en_cn.json");
      this.title = `交易地区分布 - ${this.currentCountry}`;
      let option = {
        backgroundColor: "#aad6f8",
        tooltip: {
          trigger: "item",
        },
        visualMap: {
          left: "right",
          min: _this.minValue,
          max: _this.maxValue,
          inRange: {
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
          },
          text: ["最大值", "最小值"], // 文本，默认为数值文本
          calculable: true,
        },
        nameMap: nameMapCoutry,
        toolbox: {
          show: true,
          orient: "horizontal",
          left: "left",
          top: "bottom",
          feature: {
            mark: { show: true },
            saveAsImage: { show: true, name: "交易地区分布图" },
          },
        },
        roamController: {
          show: true,
          left: "right",
          mapTypeControl: {
            world: true,
          },
        },
        series: [
          {
            coordinateSystem: "geo",
            name: _this.tipTitle,
            type: "map",
            mapType: enName,
            roam: true,
            label: {
              show: true, // 这里就不在地图上显示名字了，200多个会晕的
              color: "gray",
              fontSize: 8,
            },
            data: _this.data,
          },
        ],
      };
      this.myChart.setOption(option);
    },
    drawChinaMap() {
      require("echarts/map/js/" + "china");
      this.title = `交易地区分布 - 中国`;
      let _this = this;
      let option = {
        backgroundColor: "#aad6f8",
        tooltip: {
          trigger: "item",
        },
        visualMap: {
          left: "right",
          min: _this.minValue,
          max: _this.maxValue,
          inRange: {
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
          },
          text: ["最大值", "最小值"], // 文本，默认为数值文本
          calculable: true,
        },
        toolbox: {
          show: true,
          orient: "horizontal",
          left: "left",
          top: "bottom",
          feature: {
            mark: { show: true },
            saveAsImage: { show: true, name: "交易地区分布图" },
          },
        },
        roamController: {
          show: true,
          left: "right",
          mapTypeControl: {
            world: true,
          },
        },
        series: [
          {
            coordinateSystem: "geo",
            name: _this.tipTitle,
            type: "map",
            mapType: "china",
            roam: true,
            label: {
              show: true, // 这里就不在地图上显示名字了，200多个会晕的
              color: "gray",
              fontSize: 8,
            },
            data: _this.data,
          },
        ],
      };
      this.myChart.setOption(option);
    },
    drawProvinceMapForChina() {
      let sfmc = this.currentTableData.rows[0].sfmc.value;
      let sfmcPinyin = slugify(sfmc).replace(/-/g, "");
      require("echarts/map/js/province/" + sfmcPinyin);
      this.title = `交易地区分布 - ${sfmc}`;
      let _this = this;
      let option = {
        backgroundColor: "#aad6f8",
        tooltip: {
          trigger: "item",
        },
        visualMap: {
          left: "right",
          min: _this.minValue,
          max: _this.maxValue,
          inRange: {
            color: [
              "#313695",
              "#4575b4",
              "#74add1",
              "#abd9e9",
              "#e0f3f8",
              "#ffffbf",
              "#fee090",
              "#fdae61",
              "#f46d43",
              "#d73027",
              "#a50026",
            ],
          },
          text: ["最大值", "最小值"], // 文本，默认为数值文本
          calculable: true,
        },
        toolbox: {
          show: true,
          orient: "horizontal",
          left: "left",
          top: "bottom",
          feature: {
            mark: { show: true },
            saveAsImage: { show: true, name: "交易地区分布图" },
          },
        },
        roamController: {
          show: true,
          left: "right",
          mapTypeControl: {
            world: true,
          },
        },
        series: [
          {
            coordinateSystem: "geo",
            name: _this.tipTitle,
            type: "map",
            mapType: sfmc,
            roam: true,
            label: {
              show: true, // 这里就不在地图上显示名字了，200多个会晕的
              color: "gray",
              fontSize: 8,
            },
            data: _this.data,
          },
        ],
      };
      this.myChart.setOption(option);
    },
    async draw() {
      this.myChart.dispatchAction({
        type: "restore",
      });
      if (this.currentTableData.tid === 353) {
        this.drawWorldMap();
      } else if (this.currentTableData.tid === 359) {
        if (this.currentCountry === "中国") this.drawChinaMap();
        else {
          this.handleClose();
          return;
          // await this.drawCountryMap();
        }
      } else if (this.currentTableData.tid === 360) {
        if (this.currentCountry === "中国") this.drawProvinceMapForChina();
        else {
          this.handleClose();
          return;
        }
      }
    },
    changedValue(type) {
      this.makeData(type);
      this.draw();
    },
    handleClickUnKnow() {
      let newRow = {};
      if (this.currentTableData.tid === 353) {
        newRow = {
          gjmc: "",
        };
      } else if (this.currentTableData.tid === 359) {
        newRow = {
          gjmc: this.currentCountry,
          sfmc: "",
        };
      } else if (this.currentTableData.tid === 360) {
        newRow = {
          gjmc: this.currentCountry,
          sfmc: this.currentProvince,
          csmc: "",
        };
      }
      this.$store.dispatch("ShowTable/showLinkTable", {
        tid: this.currentTableData.tid,
        linkMid: 4,
        selectCondition: this.currentTableData.selectCondition,
        row: newRow,
        fieldename: this.selectedValue.toUpperCase(), // 注意列名需要传递大写
      });
      this.handleClose();
    },
    handleClickArea(params) {
      console.log(params);
      if (isNaN(params.value) || params.value === 0) {
        return;
      }
      if (this.currentTableData.tid === 353) {
        let newRow = {
          gjmc: params.name,
        };
        this.currentCountry = params.name;
        this.loading = true;
        this.$store.dispatch("ShowTable/showLinkTable", {
          tid: this.currentTableData.tid,
          linkMid: 359,
          selectCondition: this.currentTableData.selectCondition,
          row: newRow,
          fieldename: "GJMC", // 注意列名需要传递大写
        });
      } else if (this.currentTableData.tid === 359) {
        let sfmc = params.name;
        this.currentProvince = sfmc;
        let newRow = {
          gjmc: this.currentCountry,
          sfmc,
        };
        this.loading = true;
        this.$store.dispatch("ShowTable/showLinkTable", {
          tid: this.currentTableData.tid,
          linkMid: 360,
          selectCondition: this.currentTableData.selectCondition,
          row: newRow,
          fieldename: "SFMC", // 注意列名需要传递大写
        });
        if (this.currentCountry !== "中国") {
          this.handleClose();
        }
      } else if (this.currentTableData.tid === 360) {
        this.loading = true;
        let csmc = params.name;
        let newRow = {
          gjmc: "中国",
          sfmc: this.currentTableData.rows[0].sfmc.value,
          csmc: csmc.replace(/市/g, ""),
        };
        newRow[`${this.selectedValue}`] = params.value;
        this.$store.dispatch("ShowTable/showLinkTable", {
          tid: this.currentTableData.tid,
          linkMid: 4,
          selectCondition: this.currentTableData.selectCondition,
          row: newRow,
          fieldename: this.selectedValue.toUpperCase(), // 注意列名需要传递大写
        });
        this.handleClose();
      }
    },
    handleClose() {
      this.$store.commit(
        "DialogPopWnd/SET_SHOWTRANSLOCATIONDIALOGVISIBLE",
        false
      );
    },
  },
};
</script>

<style scoped>
/deep/.el-dialog__body {
  padding: 0;
}
/deep/.el-dialog__header {
  height: 80px;
}
</style>

