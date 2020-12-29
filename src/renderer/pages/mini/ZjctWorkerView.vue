<template>
  <div></div>
</template>
<script>
import linkPathModel from "@/utils/sql/LinkPathViewModel";
import path from "path";
import { Pool, Client, Query } from "pg";
import cases from "@/db/Cases.js";
export default {
  methods: {
    async onCalLinkData(event, data) {
      let {
        modelType,
        searchType,
        weiDuType,
        isGroup,
        directrion,
        searchMaxCeng,
        searchMinCeng,
        beginPoint,
        endPoint,
        beginDate,
        endDate,
        minJyje,
        minBs,
        timeSpan,
        minJcb,
        maxJcb,
        condition,
        ajid,
      } = data;
      let args = await linkPathModel.getCapitalPenetration(
        modelType,
        searchType,
        weiDuType,
        isGroup,
        directrion,
        searchMaxCeng,
        searchMinCeng,
        beginPoint,
        endPoint,
        beginDate,
        endDate,
        minJyje,
        minBs,
        timeSpan,
        minJcb,
        maxJcb,
        condition,
        ajid
      );
      if (args && args.nodes && args.nodes.length > 2) {
        this.$electron.ipcRenderer.send("calculate-link-end", args);
      } else {
        this.$electron.ipcRenderer.send("calculate-link-end", null);
      }
    },
  },
  async beforeMount() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
    // 每个子进程自己一个pool
    global.pool = new Pool(await this.$electron.remote.getGlobal("dbCon"));
  },
  mounted() {
    this.$electron.ipcRenderer.send("calculate-link-ready");
    this.$electron.ipcRenderer.on("calculate-link-begin", this.onCalLinkData);
  },
};
</script>