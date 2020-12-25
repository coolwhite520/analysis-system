<template>
  <div class="TabAbout">
    <el-row style="text-align: center">
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button" @click="handleClickConvert">
          <span class="iconfont selfIcont">&#xe631;</span>
          <br />
          <span class="title-content">文件格式转换</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button type="text" class="ctrl-button" @click="handleClickIP">
          <span class="iconfont selfIcont">&#xe651;</span>
          <br />
          <span class="title-content">IP查询</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickParseBankCards"
        >
          <span class="iconfont selfIcont">&#xe619;</span>
          <br />
          <span class="title-content">银行卡归属地解析</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row style="font-size: 8px; color: gray; text-align: center">
      <el-col :span="3">
        <div>工具</div>
      </el-col>
    </el-row>
    <file-convert
      v-if="showConvertDialog"
      :iniImportDir="importDir"
    ></file-convert>
    <ip-search v-if="showIpDialogVisible"></ip-search>
    <parse-bank-card-view
      v-if="showParseBankCardVisible"
    ></parse-bank-card-view>
  </div>
</template>
<script>
import { mapState } from "vuex";
import FileConvert from "@/pages/dialog/fileConvert/fileConvert.vue";
import IpSearch from "@/pages/dialog/ipSearch/ipSearch";
import ParseBankCardView from "@/pages/dialog/parseBankCard/parseBankCardView.vue";
export default {
  data() {
    return {
      importDir: "",
    };
  },
  computed: {
    ...mapState("DialogPopWnd", [
      "showConvertDialog",
      "showIpDialogVisible",
      "showParseBankCardVisible",
    ]),
  },
  components: {
    "file-convert": FileConvert,
    "ip-search": IpSearch,
    ParseBankCardView,
  },
  methods: {
    handleClickIP() {
      this.$store.commit("DialogPopWnd/SET_SHOWIPDIALOGVISIBLE", true);
    },
    handleClickConvert() {
      this.$store.commit("DialogPopWnd/SET_SHOWCONVERTDIALOG", true);
    },
    handleClickParseBankCards() {
      this.$store.commit("DialogPopWnd/SET_SHOWPARSEBANKCARDVISIBLE", true);
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