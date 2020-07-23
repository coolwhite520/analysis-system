import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "AnalysisView",
      component: function(resolve) {
        require(["@/pages/AnalysisView"], resolve);
      },
    },
    {
      path: "/mini",
      name: "mini",
      component: function(resolve) {
        require(["@/pages/mini/MiniView"], resolve);
      },
    },
  ],
});
