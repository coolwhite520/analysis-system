<template>
  <div class="TabAbout">
    <el-row style="text-align: center">
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickContactUs"
        >
          <span class="iconfont selfIcont">&#xe62b;</span>
          <br />
          <span class="title-content">联系我们</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickCheckUpdate"
        >
          <span class="iconfont selfIcont">&#xe62d;</span>
          <br />
          <span class="title-content">升级检测</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row style="font-size: 8px; color: gray; text-align: center">
      <el-col :span="2">
        <div>关于</div>
      </el-col>
    </el-row>

    <contact-us v-if="showContactUsVisible"></contact-us>
    <update-view v-if="showUpdateVisible"></update-view>
  </div>
</template>
<script>
import { mapState } from "vuex";
import ContactUsView from "@/pages/dialog/contactUs/contactUsDialog";
import UpdaterView from "@/pages/dialog/updateProduct/update";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showContactUsVisible", "showUpdateVisible"]),
  },
  components: {
    "contact-us": ContactUsView,
    "update-view": UpdaterView,
  },
  methods: {
    handleClickContactUs() {
      this.$store.commit("DialogPopWnd/SET_SHOWCONTACTUSVISIBLE", true);
    },
    handleClickCheckUpdate() {
      this.$store.commit("DialogPopWnd/SET_SHOWUPDATEVISIBLE", true);
    },
  },
};
</script>
<style  scoped>
.TabAbout {
  -webkit-user-select: none;
  height: 100;
}
.selfIcont {
  font-size: 18px;
  color: rgb(24, 84, 95);
}
.title-content {
  font-size: 10px;
}
.ctrl-button {
  padding-top: 4px;
}
</style>