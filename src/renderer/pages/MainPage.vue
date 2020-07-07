<template>
  <div>
    <el-button type="text" @click="handleClickOpenNewWin">open new win</el-button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      dialogVisible: false
    };
  },
  methods: {
    createMiniWindow() {
      const miniWinURL =
        process.env.NODE_ENV === "development"
          ? `http://localhost:9080/#/mini`
          : `file://${__dirname}/index.html/#/mini`;
      let obj = {
        height: 200,
        width: 800,
        show: false,
        backgroundColor: "#2e2c29", // 初始化一个背景色
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          webSecurity: false
        }
      };
      let miniWindow = new this.$electron.remote.BrowserWindow(obj);
      miniWindow.loadURL(miniWinURL);
      miniWindow.on("closed", () => {
        miniWindow = null;
      });
      return miniWindow;
    },
    handleClickOpenNewWin() {
      let miniWin = this.createMiniWindow()
      miniWin.show()
    }
  }
};
</script>
