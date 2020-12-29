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
      path: "/dataCollection",
      name: "dataCollection",
      component: function(resolve) {
        require(["@/pages/mini/DataCollection"], resolve);
      },
    },
    {
      path: "/export",
      name: "export",
      component: function(resolve) {
        require(["@/pages/mini/ExportView"], resolve);
      },
    },
    {
      path: "/zjct",
      name: "zjct",
      component: function(resolve) {
        require(["@/pages/mini/ZjctWorkerView"], resolve);
      },
    },
    // {
    //   path: "/dbconfig",
    //   name: "dbconfig",
    //   component: function(resolve) {
    //     require(["@/pages/mini/DbconfigView"], resolve);
    //   },
    // },
  ],
});
