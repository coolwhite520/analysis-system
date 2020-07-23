<template>
  <div>hahah</div>
</template>
<script>
import csvReader from "@/utils/reader/csvReader";
export default {
  mounted() {
    this.$electron.ipcRenderer.on("read-csv-file", async (e, args) => {
      console.log("panda:", args);
      let data = await csvReader.parseFileExampleSync(args);
      console.log(data);
      this.$electron.ipcRenderer.send("read-csv-file-over", data);
      // this.$store.commit("DataCollection/SET_CSV_LIST", data); // 如果需要多进程访问vuex，需要启用插件功能并所有的commit都需要改成dispatch
    });
  },
};
</script>