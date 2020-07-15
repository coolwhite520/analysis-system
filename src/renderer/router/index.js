import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "mainPage",
      component: function(resolve) {
        require(["@/pages/mainPage"], resolve);
      },
    },
    {
      path: "/StandardCollection",
      name: "StandardCollection",
      component: function(resolve) {
        require(["@/pages/dialog/StandardCollection"], resolve);
      },
    },
  ],
});
