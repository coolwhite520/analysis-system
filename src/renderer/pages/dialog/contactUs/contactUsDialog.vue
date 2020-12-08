<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showContactUsVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe62b;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-row>
      <el-col :span="10">
        <div class="logo iconfont">&#xe66a;</div>
      </el-col>
      <el-col :span="14">
        <el-row>
          <div class="iconfont">
            &#xe62f; <span style="font-size: 10px">联系人：李工</span>
          </div>
        </el-row>
        <el-row
          ><div class="iconfont">
            &#xe6ba; <span style="font-size: 10px">移动电话：***********</span>
          </div></el-row
        >
        <el-row
          ><div class="iconfont">
            &#xe683; <span style="font-size: 10px">固定电话：***********</span>
          </div></el-row
        >
        <el-row
          ><div class="iconfont">
            &#xe62e; <span style="font-size: 10px">QQ：***********</span>
          </div></el-row
        >

        <el-row>
          <el-popover trigger="hover" placement="top">
            <img
              :height="200"
              :width="200"
              style="border-radius: 5px; border: 1px solid gray"
            />
            <div class="iconfont" slot="reference">
              &#xe643; <span style="font-size: 10px">微信：***********</span>
            </div>
          </el-popover>
        </el-row>
        <el-row
          ><div class="iconfont">
            &#xe66e; <span style="font-size: 10px">E-mail：***********</span>
          </div></el-row
        >
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showContactUsVisible"]),
  },
  data() {
    return {
      title: "联系我们",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWCONTACTUSVISIBLE", false);
    },
  },
};
</script>

<style scoped>
.logo {
  font-size: 100px;
  text-align: center;
  color: #313f57;
}
</style>