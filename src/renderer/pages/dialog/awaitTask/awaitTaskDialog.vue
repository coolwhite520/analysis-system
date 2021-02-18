<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showAwaitTaskDialogVisible"
    width="60%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe748;</i>
      <span class="title-text" style="color: white; cursor: pointer">{{
        title
      }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>

    <div style="position: absolute; right: 20px; top: 65px; z-index: 999">
      <el-button-group>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-folder-add"
          round
          @click="handleClickNew"
          >新增</el-button
        >
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-edit"
          round
          @click="handleClickEdit"
          >编辑</el-button
        >
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-delete"
          round
          @click="handleClickDel"
          >删除</el-button
        >
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-upload2"
          round
          @click="handleClickExport"
          >导出</el-button
        >
      </el-button-group>
    </div>

    <el-tabs v-model="activeName">
      <el-tab-pane :label="humanLabel" name="1">
        <el-table
          size="mini"
          :data="awaitTaskList.filter((row) => row.task_type === activeName)"
          style="width: 100%; margin-top: 5px"
          :height="300"
          border
          ref="multipleTable1"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            prop="id"
            label="序号"
            width="60"
            type="index"
          ></el-table-column>
          <el-table-column
            v-for="(header, index) of headerArr[0]"
            :label="header.fieldcname"
            :key="index + '' + Math.random()"
            show-overflow-tooltip
            :prop="header.fieldename"
          >
            <template slot-scope="scope">
              <div>
                {{
                  scope.row[header.fieldename] instanceof Date
                    ? scope.row[header.fieldename].Format("yyyy-MM-dd hh:mm:ss")
                    : scope.row[header.fieldename]
                }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="danWeiLabel" name="2">
        <el-table
          size="mini"
          :data="awaitTaskList.filter((row) => row.task_type === activeName)"
          style="width: 100%; margin-top: 5px"
          :height="300"
          border
          ref="multipleTable2"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            prop="id"
            label="序号"
            width="60"
            type="index"
          ></el-table-column>
          <el-table-column
            v-for="(header, index) of headerArr[1]"
            :label="header.fieldcname"
            :key="index + '' + Math.random()"
            show-overflow-tooltip
            :prop="header.fieldename"
          >
            <template slot-scope="scope">
              <div>
                {{
                  scope.row[header.fieldename] instanceof Date
                    ? scope.row[header.fieldename].Format("yyyy-MM-dd hh:mm:ss")
                    : scope.row[header.fieldename]
                }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="zhangKaHaoLabel" name="账卡号">
        <el-table
          size="mini"
          :data="awaitTaskList.filter((row) => row.task_type === activeName)"
          style="width: 100%; margin-top: 5px"
          :height="300"
          border
          ref="multipleTable账卡号"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            prop="id"
            label="序号"
            width="60"
            type="index"
          ></el-table-column>
          <el-table-column
            v-for="(header, index) of headerArr[2]"
            :label="header.fieldcname"
            :key="index + '' + Math.random()"
            show-overflow-tooltip
            :prop="header.fieldename"
          >
            <template slot-scope="scope">
              <div>
                {{
                  scope.row[header.fieldename] instanceof Date
                    ? scope.row[header.fieldename].Format("yyyy-MM-dd hh:mm:ss")
                    : scope.row[header.fieldename]
                }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <div v-if="showChildPopWnd">
      <el-dialog
        v-dialogDrag
        :close-on-click-modal="false"
        class="standard-data-dialog"
        :append-to-body="true"
        :visible.sync="showChildPopWnd"
        width="30%"
        @close="handleCloseChild"
        :modal="true"
      >
        <div slot="title" class="dialog-title">
          <i
            :class="subDialogClassIcon"
            style="color: white; font-size: 30px"
          ></i>
          <span class="title-text" style="color: white; cursor: pointer">{{
            titleChild
          }}</span>
          <div class="button-right">
            <span class="title-close" @click="handleCloseChild"></span>
          </div>
        </div>
        <!-- 个人 -->
        <div v-if="activeName === '1'">
          <el-form
            ref="form"
            label-position="right"
            label-width="180px"
            :model="form"
            size="small"
            :rules="formRules"
          >
            <el-form-item label="涉案个人名称：" prop="jyhm">
              <el-input v-model="form.jyhm"></el-input>
            </el-form-item>
            <el-form-item label="证件（照）类型：" prop="zz_name">
              <el-select v-model="form.zz_name" placeholder="请选择">
                <el-option
                  v-for="(item, index) of optionsRytypeList"
                  :key="index"
                  :label="item.item_name"
                  :value="item.item_name"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="证件（照）号码：" prop="zz_code">
              <el-input v-model="form.zz_code"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                style="width: 50%"
                @click="handleClickSure('form')"
                >确定</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <!-- 单位 -->
        <div v-if="activeName === '2'">
          <el-form
            ref="form"
            label-position="right"
            label-width="180px"
            :model="form"
            size="small"
            :rules="formRules"
          >
            <el-form-item label="涉案单位名称：" prop="jyhm">
              <el-input v-model="form.jyhm"></el-input>
            </el-form-item>
            <el-form-item label="证件（照）类型：" prop="zz_name">
              <el-select v-model="form.zz_name" placeholder="请选择">
                <el-option
                  v-for="(item, index) of optionsDwtypeList"
                  :key="index"
                  :label="item.item_name"
                  :value="item.item_name"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="证件（照）号码：" prop="zz_code">
              <el-input v-model="form.zz_code"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                style="width: 50%"
                @click="handleClickSure('form')"
                >确定</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <!-- 账卡号 -->
        <div v-if="activeName === '账卡号'">
          <el-form
            ref="form"
            label-position="right"
            label-width="180px"
            :model="form"
            size="small"
            :rules="formRules"
          >
            <el-form-item label="涉案账卡号：" prop="cxzh">
              <el-input v-model="form.cxzh"></el-input>
            </el-form-item>
            <el-form-item label="户名：" prop="jyhm">
              <el-input v-model="form.jyhm" placeholder="请选择"> </el-input>
            </el-form-item>
            <el-form-item label="主体类别：" prop="zh_ztlb_name">
              <el-select v-model="form.zh_ztlb_name" placeholder="请选择">
                <el-option
                  v-for="(item, index) of optionsZtlbList"
                  :key="index"
                  :label="item.item_name"
                  :value="item.item_name"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="银行名称：" prop="yh_name">
              <!-- <el-input v-model="form.yh_name"></el-input> -->
              <el-autocomplete
                style="width: 100%"
                v-model="form.yh_name"
                placeholder="输入银行名称只能匹配"
                :fetch-suggestions="
                  (queryString, cb) => querySearch(queryString, cb)
                "
                :trigger-on-focus="false"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                style="width: 50%"
                @click="handleClickSure('form')"
                >确定</el-button
              >
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import baseDb from "@/db/Base";
import awaitTask from "@/db/AwaitTask";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showAwaitTaskDialogVisible"]),
    ...mapState("CaseDetail", ["caseBase", "awaitTaskList"]),

    humanLabel() {
      let count = 0;
      this.awaitTaskList.forEach((element) => {
        if (element["task_type"] === "1") {
          count++;
        }
      });
      return `个人（${count}）`;
    },
    danWeiLabel() {
      let count = 0;
      this.awaitTaskList.forEach((element) => {
        if (element["task_type"] === "2") {
          count++;
        }
      });
      return `单位（${count}）`;
    },
    zhangKaHaoLabel() {
      let count = 0;
      this.awaitTaskList.forEach((element) => {
        if (element["task_type"] === "账卡号") {
          count++;
        }
      });
      return `账卡号（${count}）`;
    },
    titleChild() {
      let title;
      let subTitle;
      if (this.opration === 0) {
        subTitle = "新增";
      } else if (this.opration === 1) {
        subTitle = "编辑";
      }
      switch (this.activeName) {
        case "1":
          title = `${subTitle}待调单任务-个人`;
          break;
        case "2":
          title = `${subTitle}待调单任务-单位`;
          break;
        case "账卡号":
          title = `${subTitle}待调单任务-账卡号`;
          break;
      }
      return title;
    },
    exportFileName() {
      let title;
      let subTitle;
      if (this.opration === 0) {
        subTitle = "";
      } else if (this.opration === 1) {
        subTitle = "";
      }
      switch (this.activeName) {
        case "1":
          title = `${subTitle}待调单任务-个人`;
          break;
        case "2":
          title = `${subTitle}待调单任务-单位`;
          break;
        case "账卡号":
          title = `${subTitle}待调单任务-账卡号`;
          break;
      }
      return title;
    },
    subDialogClassIcon() {
      if (this.opration === 0) return "el-icon-folder-add";
      else return "el-icon-edit";
    },
  },

  data() {
    return {
      activeName: "1",
      optionsRytypeList: [],
      optionsDwtypeList: [],
      optionsZtlbList: [
        {
          item_name: "个人",
        },
        {
          item_name: "单位",
        },
      ],
      form: {
        id: "",
        zz_code: "",
        zz_name: "",
        jyhm: "",
        yh_name: "",
        cxzh: "",
        zh_ztlb_name: "",
      },
      formRules: {
        jyhm: [{ required: true, message: "不能为空", trigger: "blur" }],
        zz_code: [{ required: true, message: "不能为空", trigger: "blur" }],
        zz_name: [{ required: true, message: "不能为空", trigger: "blur" }],
        cxzh: [{ required: true, message: "不能为空", trigger: "blur" }],
        zh_ztlb_name: [
          { required: true, message: "不能为空", trigger: "blur" },
        ],
      },
      opration: 0, // 0: 新增 1:编辑 2: 删除 3: 导出
      showChildPopWnd: false,
      title: "待调单任务",
      headerArr: require("./headerArray.json"),
    };
  },
  async mounted() {
    // 个人：CKZJLXPERSON 单位：CKZJLXUNIT
  },
  methods: {
    async querySearch(queryString, cb) {
      if (queryString.length > 0) {
        let sql = `SELECT bank_name FROM ck_yhdm WHERE bank_name like '%${queryString}%'`;
        let ret = await baseDb.QueryCustom(sql);
        let retRows = ret.rows.map((row) => {
          return {
            value: row.bank_name,
          };
        });
        cb(retRows);
      }
    },
    async insertData() {
      let { zz_code, zz_name, jyhm, yh_name, cxzh, zh_ztlb_name } = this.form;
      if (this.activeName === "1") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "1"
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.InsertNewAwaitTask(
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "1"
          );
        }
      } else if (this.activeName === "2") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "2"
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.InsertNewAwaitTask(
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "2"
          );
        }
      } else if (this.activeName === "账卡号") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "账卡号",
          yh_name,
          cxzh,
          zh_ztlb_name
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.InsertNewAwaitTask(
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "账卡号",
            yh_name,
            cxzh,
            zh_ztlb_name
          );
        }
      }
    },
    async updateData() {
      let {
        zz_code,
        zz_name,
        jyhm,
        yh_name,
        cxzh,
        zh_ztlb_name,
        id,
      } = this.form;

      if (this.activeName === "1") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "1"
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.UpdateAwaitTaskById(
            id,
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "1"
          );
        }
      } else if (this.activeName === "2") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "2"
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.UpdateAwaitTaskById(
            id,
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "2"
          );
        }
      } else if (this.activeName === "账卡号") {
        let { success, havesame } = await awaitTask.QueryHaveSameInfo(
          this.caseBase.ajid,
          zz_code,
          zz_name,
          jyhm,
          "账卡号",
          yh_name,
          cxzh,
          zh_ztlb_name
        );
        if (success && havesame) {
          throw new Error("存在相同的条目信息。");
        } else {
          await awaitTask.UpdateAwaitTaskById(
            id,
            this.caseBase.ajid,
            zz_code,
            zz_name,
            jyhm,
            "账卡号",
            yh_name,
            cxzh,
            zh_ztlb_name
          );
        }
      }
    },
    async freshList() {
      let { success, rows } = await awaitTask.QueryAwaitTaskInfo(
        this.caseBase.ajid
      );
      this.$store.commit("CaseDetail/SET_AWAITTASKLIST", rows);
      await this.$store.dispatch(
        "CaseDetail/queryAwaitTaskCount",
        this.caseBase.ajid
      );
    },
    async handleClickSure(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            if (this.opration === 0) {
              await this.insertData();
              await this.freshList();
              this.$message({
                type: "success",
                message: this.opration === 0 ? "新增数据成功" : "修改数据成功",
              });
              this.showChildPopWnd = false;
            } else if (this.opration === 1) {
              await this.updateData();
              await this.freshList();
              this.$message({
                type: "success",
                message: this.opration === 0 ? "新增数据成功" : "修改数据成功",
              });
              this.showChildPopWnd = false;
            }
          } catch (e) {
            this.$message({
              message: e.message,
            });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async handleClickNew() {
      this.form = {
        id: "",
        zz_code: "",
        zz_name: "",
        jyhm: "",
        yh_name: "",
        cxzh: "",
        zh_ztlb_name: "",
      };
      this.opration = 0;
      this.showChildPopWnd = true;
      try {
        if (this.activeName === "1") {
          let ryList = await awaitTask.QueryZzTypeList("CKZJLXPERSON");
          if (ryList.success) this.optionsRytypeList = ryList.rows;
        } else if (this.activeName === "2") {
          let danweiList = await awaitTask.QueryZzTypeList("CKZJLXUNIT");
          if (danweiList.success) this.optionsDwtypeList = danweiList.rows;
        }
      } catch (e) {
        this.$message({
          message: e.message,
        });
      }
    },
    async handleClickEdit() {
      let selectedRows = this.$refs[`multipleTable${this.activeName}`]
        .selection;
      if (selectedRows.length === 0) {
        this.$message({
          message: "没有找到选中的行！",
        });
        return;
      } else if (selectedRows.length > 1) {
        this.$message({
          message: `当前选择了${selectedRows.length}多行的数据，无法批量处理，请选择一行进行编辑`,
        });
        return;
      }
      this.opration = 1;
      this.showChildPopWnd = true;
      try {
        if (this.activeName === "1") {
          let ryList = await awaitTask.QueryZzTypeList("CKZJLXPERSON");
          if (ryList.success) this.optionsRytypeList = ryList.rows;
        } else {
          let danweiList = await awaitTask.QueryZzTypeList("CKZJLXUNIT");
          if (danweiList.success) this.optionsDwtypeList = danweiList.rows;
        }
        this.form = JSON.parse(JSON.stringify(selectedRows[0]));
        console.log(this.form);
      } catch (e) {
        this.$message({
          message: e.message,
        });
      }
    },
    async handleClickDel() {
      let selectedRows = this.$refs[`multipleTable${this.activeName}`]
        .selection;
      if (selectedRows.length === 0) {
        this.$message({
          message: "没有找到选中的行！",
        });
        return;
      }
      let ids = selectedRows.map((row) => row.id);
      console.log(ids);
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `确定要删除当前选中的调单任务吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
      } else {
        return;
      }
      try {
        await awaitTask.DeleteAwaitTask(this.caseBase.ajid, ids);
        await this.freshList();
      } catch (e) {
        this.$message({
          message: e.message,
        });
      }
    },
    async handleClickExport() {
      let selectedRows = this.$refs[`multipleTable${this.activeName}`]
        .selection;
      if (selectedRows.length === 0) {
        this.$message({
          message: "没有找到选中的行！",
        });
        return;
      }
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath: `案件(${this.caseBase.ajmc})${
          this.exportFileName
        }-${new Date().Format("yyyyMMddhhmmss")}`,
        filters: [
          { name: "excel", extensions: ["xlsx"] },
          { name: "csv", extensions: ["csv"] },
        ],
      });
      if (!result.canceled) {
        let index;
        switch (this.activeName) {
          case "1":
            index = 0;
            break;
          case "2":
            index = 1;
            break;
          case "账卡号":
            index = 2;
            break;
        }
        let ids = selectedRows.map((row) => row.id);
        let exportSql = `select * from ff_awaittask where id in (${ids})`;
        let args = {
          ajid: this.caseBase.ajid,
          exportSql,
          filePath: result.filePath,
          headers: this.headerArr[index],
          sumRowCount: selectedRows.length,
        };
        this.$electron.ipcRenderer.send("export-one-file-begin", args);
      }
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWAWAITTASKDIALOGVISIBLE", false);
    },
    handleCloseChild() {
      this.showChildPopWnd = false;
    },
  },
};
</script>

<style scoped>
/deep/.el-dialog__body {
  padding: 15px;
}
</style>
