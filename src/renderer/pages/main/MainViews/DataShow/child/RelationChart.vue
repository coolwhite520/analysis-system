<template>
  <div>
    <el-row style="background-color: #f5f7fa;padding: 5px;border: 1px solid #dddfe5;">
      <el-col :span="16">
        <el-button-group>
          <el-button
            size="mini"
            v-for="(item, index) of tableData.graphicMoneySectionList"
            :key="item.id"
            :style="{ color: item.selected ? item.color:'#fff' }"
            type="primary"
            :icon="item.selected?'el-icon-success':'el-icon-error'"
            @click="handleClick(item.id)"
          >{{calLabel(item, index>0?tableData.graphicMoneySectionList[index-1]:null)}}</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="1">
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-s-tools"
          @click="handleClickSetting"
          circle
        ></el-button>
      </el-col>
      <el-col :span="7">
        <el-input size="mini"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <div :id="id" :style="{height: limitHeight + 'px', marginTop: 0 + 'px'}"></div>
    </el-row>
    <graphic-setting v-if="graphicSettingVisible"></graphic-setting>
  </div>
</template>

<script>
import { mapState } from "vuex";
import GraphicSetting from "@/pages/dialog/graphicsetting/graphicSettingDialog";
const uuid = require("uuid");
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
      id: uuid.v1(),
    };
  },
  components: {
    "graphic-setting": GraphicSetting,
  },
  computed: {
    ...mapState("DialogPopWnd", ["graphicSettingVisible"]),
  },
  methods: {
    calLabel(item, preItem) {
      let label = "";
      if (item.id === "1" || item.id === "4") {
        label = `${item.value}${item.label}`;
      } else {
        if (preItem) label = `${preItem.value}-${item.value}${item.label}`;
      }
      return label;
    },
    handleClickSetting() {
      this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", true);
    },
    handleClick(value) {
      this.$store.commit("ShowTable/MODIFY_MONDY_SECTION_CHECKED", value);
    },
  },
  mounted() {},
};
</script>

<style scoped>
</style>