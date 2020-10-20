

<template>
  <el-collapse v-model="activeNames" @change="handleChange">
    <el-collapse-item
      :title="item.title"
      :name="item.time"
      v-for="item of renderList"
      :key="item.key"
    >
      <div>
        <el-image
          :src="item.src"
          style="height: 200px; width: 200px; box-shadow: 5px 5px 5px #888888"
        ></el-image>
      </div>
      <div>名称：{{ item.title }}</div>
      <div>简要说明：{{ item.des }}</div>
      <div>保存时间：{{ item.datetime }}</div>
      <el-row style="text-align: center; margin-top: 10px">
        <el-button size="mini" type="primary" @click="handleClickRestore(item)">
          跳转到记录</el-button
        >
        <el-button size="mini" @click="handleClickDelete(item)">
          删除记录</el-button
        >
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>
<script>
import levelDb from "../../../../level/leveldb";
const fs = require("fs");
export default {
  computed: {
    renderList() {},
  },
  data() {
    return {
      activeNames: [],
      renderList: [],
    };
  },

  async mounted() {
    //           dbPath: newDbPath,
    //           dbPathFile,
    //           screenShotPath: obj.filePathName,
    //           time: nowTimeStr,
    //           title,
    //           des,
    this.freshList();
    this.$bus.$on("FreshTimeLineView", this.freshList);
  },
  methods: {
    handleClickDelete(item) {},
    handleClickRestore(item) {},
    async convertToBase64Image(fileUrl) {
      const imageData = fs.readFileSync(fileUrl); // 例：xxx/xx/xx.png
      const imageBase64 = imageData.toString("base64");
      const imagePrefix = "data:image/png;base64,";
      console.log(imagePrefix + imageBase64);
      return imagePrefix + imageBase64;
    },
    async freshList() {
      let prefix = this.$electron.remote.getGlobal("levelPrefix");
      let { success, list, msg } = await levelDb.find(prefix);
      if (success) {
        let ret = [];
        for (let item of list) {
          let obj = {
            key: item.key,
            title: item.value.title,
            datetime: item.value.time,
            des: item.value.des,
            dbPath: item.value.dbPath,
            dbPathFile: item.value.dbPathFile,
          };
          obj.src = await this.convertToBase64Image(item.value.screenShotPath);
          ret.push(obj);
        }
        ret = this.$lodash.sortBy(ret, function (item) {
          return item.datetime;
        });
        this.renderList = ret;
      } else {
        console.log(msg);
      }
    },
    handleChange(val) {
      console.log(val);
    },
  },
};
</script>