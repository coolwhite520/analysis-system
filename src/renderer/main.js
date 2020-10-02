import Vue from "vue";
import axios from "axios";

import App from "./App";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "./assets/theme/index.css";
import "./assets/css/iconfont/iconfont.css";
import "./assets/css/iconfont/iconfont.js";
import "./assets/css/animate.css";
import "echarts";
import "./utils/dialog";
import echarts from "echarts";
import "./utils/extern";
const lodash = require("lodash");

Vue.prototype.$lodash = lodash;

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.prototype.$echarts = echarts;

import G6 from "@antv/g6";
Vue.prototype.$G6 = G6;
Vue.prototype.$bus = new Vue();
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");
