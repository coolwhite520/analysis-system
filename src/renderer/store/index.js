import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
// import levelDb from "./plugins/leveldb";
import modules from "./modules";
import SecureLS from "secure-ls";
import { remote } from "electron";
import path from "path";

let resoreDbPath = remote.getGlobal("resoreDbPath");
let dbFullPath = path.join(resoreDbPath, "restore.db");

const ls = new SecureLS({ isCompression: false });
const store = require("data-store")({ path: dbFullPath });
Vue.use(Vuex);

// localstorage路径：/Users/baiyang/Library/Application Support/analysis-system
export default new Vuex.Store({
  modules,
  plugins: [
    // createPersistedState(),
    createPersistedState({
      storage: {
        // getItem: levelDb.get,
        // setItem: levelDb.set,
        // removeItem: levelDb.del,
        getItem: (key) => store.get(key),
        setItem: (key, value) => store.set(key, value),
        removeItem: (key) => store.del(key),
        // getItem: (key) => ls.get(key),
        // setItem: (key, value) => ls.set(key, value),
        // removeItem: (key) => ls.remove(key),
      },
    }),
  ],
  strict: process.env.NODE_ENV !== "production",
});
