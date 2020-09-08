<template>
  <div>
    <el-row style="background-color: #f5f7fa;padding: 5px;border: 1px solid #dddfe5;">
      <el-col :span="16">
        <!-- <el-checkbox-group v-model="userCheckList" size="mini" @change="handleChangeSelect">
          <el-checkbox
            v-for="item of defaultCheckList"
            :label="item.label"
            :key="item.value"
            v-model="checked"
            :style="{color: item.color}"
          ></el-checkbox>
        </el-checkbox-group>-->
        <el-button-group>
          <el-button
            size="mini"
            v-for="item of defaultCheckList"
            :key="item.value"
            :style="{ color: item.selected ? item.color:'#fff' }"
            type="primary"
            :icon="item.selected?'el-icon-success':'el-icon-error'"
            @click="handleClick(item.value)"
          >{{item.label}}</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="1">
        <el-button size="mini" type="primary" icon="el-icon-s-tools" circle></el-button>
      </el-col>
      <el-col :span="7">
        <el-input size="mini"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <div :id="id" :style="{height: limitHeight + 'px', marginTop: 0 + 'px'}"></div>
    </el-row>
  </div>
</template>

<script>
const uuid = require("uuid");
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
      id: uuid.v1(),
      defaultCheckList: [
        {
          label: "10万以下",
          value: "1",
          color: "#9cdcfe",
          selected: true,
        },
        {
          label: "10-100万",
          value: "2",
          color: "#6a9955",
          selected: true,
        },
        {
          label: "100-1000万",
          value: "3",
          color: "#edad40",
          selected: true,
        },
        {
          label: "1000万以上",
          value: "4",
          color: "#ee6b5f",
          selected: true,
        },
        // {
        //   label: "离散实体",
        //   value: "5",
        //   color: "#fff",
        //   selected: false,
        // },
        // {
        //   label: "线宽",
        //   value: "6",
        //   color: "#fff",
        //   selected: false,
        // },
      ],
    };
  },
  methods: {
    handleClick(value) {
      for (let index = 0; index < this.defaultCheckList.length; index++) {
        if (this.defaultCheckList[index].value === value) {
          this.defaultCheckList[index].selected = !this.defaultCheckList[index]
            .selected;
          break;
        }
      }
      console.log(this.defaultCheckList);
    },
  },
  mounted() {},
};
</script>

<style scoped>
</style>