<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showWeiSettingVisible"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe607;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>

    <el-transfer
      filterable
      :filter-method="filterMethod"
      filter-placeholder="请输入拼音"
      v-model="value"
      :data="data"
      :titles="['分类维度待选框', '分类维度选中框']"
    >
      <div slot="left-footer">
        <el-checkbox v-model="checkedHiddenNull" style="margin-top: 10px"
          >隐藏空字段</el-checkbox
        >
      </div>
      <div slot="right-footer" style="text-align: center">
        <el-button-group style="width: 100%; margin-top: 5px">
          <el-button
            size="small"
            style="width: 50%; border-right: 1px solid #eceef4"
            type="text"
            >上移</el-button
          >
          <el-button size="small" style="width: 50%" type="text"
            >下移</el-button
          >
        </el-button-group>
      </div>
    </el-transfer>
    <el-row style="text-align: center; margin-top: 40px">
      <el-button size="medium" @click="handleClose" style="width: 30%"
        >取消</el-button
      >
      <el-button
        size="medium"
        @click="handleClickSure"
        type="primary"
        style="width: 30%"
        >确定</el-button
      >
    </el-row>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showWeiSettingVisible"]),
  },
  data() {
    const generateData = (_) => {
      const data = [];
      const cities = ["上海", "北京", "广州", "深圳", "南京", "西安", "成都"];
      const pinyin = [
        "shanghai",
        "beijing",
        "guangzhou",
        "shenzhen",
        "nanjing",
        "xian",
        "chengdu",
      ];
      cities.forEach((city, index) => {
        data.push({
          label: city,
          key: index,
          pinyin: pinyin[index],
        });
      });
      return data;
    };
    return {
      checkedHiddenNull: false,
      title: "设置分类维度",
      data: generateData(),
      value: [],
      filterMethod(query, item) {
        return item.pinyin.indexOf(query) > -1;
      },
    };
  },
  methods: {
    handleClickSure() {
      console.log(this.value);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWWEISETTINGVISIBLE", false);
    },
  },
};
</script>

<style scoped>
/deep/.el-dialog {
  width: 700px;
}
/deep/.el-transfer {
  width: 640px;
  margin: 0 auto;
  margin-left: 40px;
}
/deep/.el-transfer-panel {
  height: 400px;
}
/deep/.el-transfer-panel__list {
  height: 400px;
}
</style>