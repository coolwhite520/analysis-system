<template>
  <div>
    <!-- top="30vh" -->
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :append-to-body="true"
      :visible="showReportVisible"
      width="50%"
      @close="handleClose"
      :modal="true"
    >
      <div slot="title" class="dialog-title">
        <i class="iconfont" style="color: white; font-size: 30px">&#xe630;</i>
        <span class="title-text" style="color: white">{{ title }}</span>
        <div class="button-right">
          <span class="title-close" @click="handleClose"></span>
        </div>
      </div>
      <el-collapse
        v-model="activeNames"
        @change="handleChange"
        accordion
        v-loading="loading"
        :element-loading-text="loadingText"
      >
        <el-collapse-item name="1">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[2].value"
              >主要获利对手分析</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">
              <span>最小获利金额：</span>
            </el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.MIN_HLJE"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[3].value"
              >密切联系对手分析</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">最小关联人数：</el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.MIN_GLRS"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="3">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[4].value"
              >主要资金去向账号分析（主要转出对手）</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="2">
              <span>排序方式：</span>
            </el-col>
            <el-col :span="4">
              <el-select
                value-key="Soft_Type"
                v-model="ReportParams.SoftTypeObj607"
                placeholder="请选择"
                size="mini"
              >
                <el-option
                  v-for="item in SoftTypeListZC"
                  :key="item.Soft_Type"
                  :label="item.Soft_Name"
                  :value="item"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="2">
              <span>排序前几:</span>
            </el-col>
            <el-col :span="4">
              <el-input
                size="mini"
                v-model="ReportParams.Soft_No607"
              ></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="4">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[5].value"
              >主要资金来源账号分析（主要转入对手）</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="2">
              <span>排序方式：</span>
            </el-col>
            <el-col :span="4">
              <el-select
                value-key="Soft_Type"
                v-model="ReportParams.SoftTypeObj608"
                placeholder="请选择"
                size="mini"
              >
                <el-option
                  v-for="item in SoftTypeListZR"
                  :key="item.Soft_Type"
                  :label="item.Soft_Name"
                  :value="item"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="2">&nbsp;</el-col>
            <el-col :span="2">
              <span>排序前几:</span>
            </el-col>
            <el-col :span="4">
              <el-input
                size="mini"
                v-model="ReportParams.Soft_No608"
              ></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="5">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[6].value"
              >即进即出可以账户分析（按小时）</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="3">交易时间区间：</el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.JYSJQJ"></el-input>
            </el-col>
            <el-col :span="1">&nbsp;小时</el-col>
            <el-col :span="3">&nbsp;</el-col>
            <el-col :span="3">交易最小金额：</el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.MIN_JYJE"></el-input>
            </el-col>
            <el-col :span="1">&nbsp;元</el-col>
          </el-row>
          <el-row style="margin-top: 5px">
            <el-col :span="3">出进比最小值：</el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.MIN_CJB"></el-input>
            </el-col>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="3">出进比最大值：</el-col>
            <el-col :span="4">
              <el-input size="mini" v-model="ReportParams.MAX_CJB"></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item name="6">
          <template slot="title">
            <el-checkbox v-model="IsCheckedArray[7].value"
              >交易方式统计</el-checkbox
            >
            <i class="header-icon el-icon-info"></i>
          </template>
          <el-row>
            <el-col :span="4">交易方式前几条：</el-col>
            <el-col :span="4">
              <el-input
                size="mini"
                v-model="ReportParams.JyfsSoftNo"
              ></el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>

      <el-steps
        :active="activeStep"
        v-show="
          buttonDisabled && IsCheckedArray.filter((el) => el.value).length > 0
        "
        align-center
        style="margin-top: 20px"
        finish-status="success"
      >
        <el-step
          v-for="(item, index) of IsCheckedArray.filter((el) => el.value)"
          :key="index"
          :title="String(index)"
          :description="item.label"
        ></el-step>
      </el-steps>

      <el-row style="text-align: center; margin-top: 20px">
        <div>
          <el-button
            type="primary"
            @click="handleClickGenerateReport"
            :disabled="buttonDisabled"
            >生成报告</el-button
          >
        </div>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
const log = require("@/utils/log");
import { mapState } from "vuex";
import Report from "@/db/Report.js";
import cases from "@/db/Cases.js";
import aes from "@/utils/aes";
import reportSqlFormat from "@/utils/sql/ReportSqlFormat";
import Default from "@/utils/sql/Default";
import os from "os";
import path from "path";
const excel = require("exceljs");
const fs = require("fs");

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showReportVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  data() {
    return {
      title: "分析报告参数设定",
      buttonDisabled: false,
      activeStep: 0,
      activeNames: [],
      loading: false,
      loadingText: "",
      SoftTypeListZC: [
        { Soft_No: 10, Soft_Type: "CZJE", Soft_Name: "转出总金额" },
        { Soft_No: 10, Soft_Type: "CZCS", Soft_Name: "转出总笔数" },
      ],
      SoftTypeListZR: [
        { Soft_No: 10, Soft_Type: "JZJE", Soft_Name: "转入总金额" },
        { Soft_No: 10, Soft_Type: "JZCS", Soft_Name: "转入总笔数" },
      ],

      ReportParams: {
        SoftTypeObj607: {
          Soft_No: 10,
          Soft_Type: "CZJE",
          Soft_Name: "转出总金额",
        },
        SoftTypeObj608: {
          Soft_No: 10,
          Soft_Type: "JZJE",
          Soft_Name: "转入总金额",
        },
        MIN_HLJE: "20000", //最小获利金额
        MIN_GLRS: "2", //最小关联人数
        Soft_No607: "10", //排序前几（主要转出对手）
        Soft_No608: "10", //排序前几（主要转入对手）
        JYSJQJ: "48", //交易时间区间
        MIN_JYJE: "0", //交易最小金额
        MIN_CJB: "0.9", //出进比最小值
        MAX_CJB: "1.1", //出进比最大值
        JyfsSoftNo: "20", //交易方式前几条
        JyJCZCE: "100",
        JYZH: "",
        Condtion: "",
        MaxLevel: "4",
        MinLevel: "0",
        bool_0: "",
      },
      IsCheckedArray: [
        {
          id: 603,
          label: "调取银行卡交易记录分析",
          value: true,
        },
        {
          id: 604,
          label: "调集人员交易进出情况分析",
          value: true,
        },
        {
          id: 605,
          label: "主要获利对手分析",
          value: true,
        },
        {
          id: 606,
          label: "密切联系对手分析",
          value: true,
        },
        {
          id: 607,
          label: "主要转出对手分析",
          value: true,
        },
        {
          id: 608,
          label: "主要转入对手分析",
          value: true,
        },
        {
          id: 609,
          label: "即进即出分析",
          value: true,
        },
        {
          id: 610,
          label: "交易方式统计分析",
          value: true,
        },
      ],
    };
  },
  methods: {
    handleChange(val) {},
    handleClose() {
      if (this.buttonDisabled) {
        return;
      }
      this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", false);
    },
    async WriteToExcelFile(ajid, item, filePath, tableDic, exportSql) {
      const client = await global.pool.connect();
      try {
        let extName = path.extname(filePath);
        let fileName = path.basename(filePath);
        fileName = fileName.replace(extName, "");
        let res = fs.createWriteStream(filePath);
        const options = {
          stream: res,
          useStyles: true,
          useSharedStrings: true,
        };
        let workbook = new excel.stream.xlsx.WorkbookWriter(options);
        workbook.creator = "fanfu";
        workbook.lastModifiedBy = "";
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();
        let worksheet = workbook.addWorksheet(fileName, {
          headerFooter: {
            firstHeader: "繁复科技出品",
            firstFooter: "繁复科技出品",
          },
        });
        let columns = [];
        for (let k in tableDic) {
          columns.push({
            header: tableDic[k],
            key: k.toLowerCase(),
            width: 20,
            style: {
              fill: {
                type: "pattern",
                bgColor: {
                  argb: "FFA4A5A5",
                },
              },
            },
          });
        }
        // 生成标题头
        worksheet.columns = columns;
        worksheet.properties.defaultRowHeight = 30;
        await cases.SwitchCase(client, ajid);
        let { rows } = await client.query(exportSql);
        for (let index = 0; index < rows.length; index++) {
          worksheet.addRow(rows[index]).commit();
        }
        worksheet.commit();
        workbook.commit();
        let mainTitle = "";
        let subTitle = "";
        let p = "";
        switch (item.id) {
          case 603:
            {
              subTitle = `（一）调取银行卡交易记录情况表`;
              p = `银行卡账号交易总金额排名前30条如下所示，全部数据请查看附件Excel表格【调取银行卡交易记录情况表.xls】`;
            }
            break;
          case 604:
            {
              subTitle = `（二）调集人员交易进出情况分析`;
              p = `调单方人员交易总金额排名前30条如下所示，全部数据请查看附件Excel表格【调集人员交易进出情况分析.xls】`;
            }
            break;
          case 605:
            {
              mainTitle = item.label;
              p = `此分析根据进出账差额，找出与调集账号交易过程中，主要的获利的对手账号。此分析目的用于找出资金的最终流向。全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
          case 606:
            {
              mainTitle = item.label;
              p = `此分析用于找出与调集账号多重联系的对手，其关联调集人员个数，指的是，该对手账号，曾与几名调集账号的人员有过交易。此分析的目的，是找出团伙内部成员。全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
          case 607:
            {
              mainTitle = item.label;
              p = `按转出总金额排序，关联对手账号汇总前30条数据如下所示，全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
          case 608:
            {
              mainTitle = item.label;
              p = `按转入总金额排序，关联对手账号汇总前30条数据如下所示，全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
          case 609:
            {
              mainTitle = item.label;
              p = `即进即出账户如下所示，全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
          case 610:
            {
              mainTitle = item.label;
              p = `不同交易方式数据汇总如下所示，全部数据请查看附件Excel文件【${mainTitle}.xls】`;
            }
            break;
        }
        return { tableDataRows: rows.slice(0, 30), subTitle, p, mainTitle };
      } finally {
        client.release();
      }
    },

    async formatCaseBaseInfo(ajid, ajmc) {
      const client = await global.pool.connect();
      try {
        let PageItem = {
          Index: 0, //页面ID
          CurrentExeSql: "", //模板sql
          Tb_Name: "", //页面表名，目前报告中没有该参数
        };
        let data = await Report.QueryReportTemplateByMid(602);
        let template = await aes.decrypt(data.pgsqltemplate);
        PageItem.Index = 602;
        PageItem.CurrentExeSql = template;
        let sql = reportSqlFormat.GetReportSql(
          ajid,
          PageItem,
          this.ReportParams
        );
        await cases.SwitchCase(client, ajid);
        let res = await client.query(sql);
        let jyrs = res.rows[0].jyrs;
        let jyzhs = res.rows[0].jyzhs;
        let jyjls = res.rows[0].jyjls;
        let jydszhs = res.rows[0].jydszhs;
        let zrje = res.rows[0].zrje;
        let zcje = res.rows[0].zcje;
        let tip = "";
        if (this.IsCheckedArray.filter((el) => el.value).length === 0) {
          tip =
            "本次仅分析了【调取银行卡交易记录情况】和【调取人员交易进出情况】。";
        }
        let str =
          "案件【" +
          ajmc +
          "】分析报告包含了【资金交易明细】的筛选条件：" +
          "无";
        // let text8 = selectCondons[1];
        // if (string.IsNullOrWhiteSpace(text8)) {
        //   text8 = "无";
        // }
        let baseInfo = `涉案主体数量：${jyrs}个，银行卡数量：${jyzhs}张，交易记录共计：${jyjls}条，涉及交易对手账号：${jydszhs}条，涉及转出金额：${zcje}元，涉及转入金额：${zrje}元。${tip}本次根据条件生成的报告，可点击【预览报告】查看内容。本次报告的详细数据，可点击【预览数据文件夹】预览全部数据。`;
        return str + "\n" + baseInfo;
      } finally {
        client.release();
      }
    },
    convertNumToCh(num) {
      switch (num) {
        case 1:
          return "一、";
          break;
        case 2:
          return "二、";
          break;
        case 3:
          return "三、";
          break;
        case 4:
          return "四、";
          break;
        case 5:
          return "五、";
          break;
        case 6:
          return "六、";
          break;
        case 7:
          return "七、";
          break;
      }
    },
    async makeTableDataToWord(tableDataRows, tableDic) {
      let resultTable = [];
      let tableHeader = [];
      for (let k in tableDic) {
        let header = {
          val: tableDic[k],
          opts: {
            // cellColWidth: 4261,
            b: true,
            sz: "5",
            align: "left",
            shd: {
              fill: "7F7F7F",
              themeFill: "text1",
              themeFillTint: "40",
            },
            fontFamily: "Avenir Book",
          },
        };
        tableHeader.push(header);
      }
      resultTable.push(tableHeader);
      for (let row of tableDataRows) {
        let values = [];
        for (let k in row) {
          values.push(row[k]);
        }
        resultTable.push(values);
      }
      var tableStyle = {
        // tableColWidth: 4261,
        tableSize: 1,
        tableColor: "ada",
        tableAlign: "left",
        borders: true,
      };

      return { resultTable, tableStyle };
    },

    // 点击生成
    async handleClickGenerateReport() {
      try {
        const uuid = require("uuid");
        this.loading = true;
        this.buttonDisabled = true;
        let { ajid, ajmc } = this.caseBase;
        let PageItem = {
          Index: 0, //页面ID
          CurrentExeSql: "", //模板sql
          Tb_Name: "", //页面表名，目前报告中没有该参数
        };
        let now = new Date().Format("yyyy_MM_dd_hh_mm_ss");
        let homedir = os.homedir();
        homedir = path.join(homedir, "Desktop", ajmc + "_" + now);
        fs.mkdirSync(homedir, { recursive: true });

        let docfilePath = path.join(
          homedir,
          ajid + "-" + ajmc + uuid.v1() + ".docx"
        );
        // 引用officegen
        const officegen = require("officegen");
        let docx = officegen("docx");
        docx.on("finalize", function (written) {
          log.info("Finish to create a Microsoft Word document.");
        });
        docx.on("error", function (err) {
          log.error(err);
        });
        // 添加页眉 页脚
        let headerFontSytle = {
          font_face: "仿宋",
          font_size: 6,
          color: "A4A5A5",
        };
        let header = docx.getHeader().createP({ align: "center" });
        header.addText("北京繁复科技有限公司制作", headerFontSytle);
        // 添加文档主标题
        let pObj = docx.createP({ align: "center" });
        pObj.addText("智能分析报告", { font_face: "黑体", font_size: 25 });
        // 添加文档副标题
        pObj = docx.createP({ align: "right" });
        pObj.addText("--" + this.caseBase.ajlbmc, {
          font_face: "宋体",
          font_size: 10,
        });
        // 定义正文标题字体和字号
        let mainTitleFontStyle = {
          font_face: "黑体",
          font_size: 18,
        };
        let subTitleFontSylte = {
          font_face: "宋体",
          font_size: 13,
        };
        // 定义正文字体和字号
        let mainPageFontSytle = { font_face: "仿宋", font_size: 8 };
        pObj = docx.createP();
        pObj.addText("一、基本情况", mainTitleFontStyle);
        pObj = docx.createP();
        let text = await this.formatCaseBaseInfo(ajid, ajmc);
        pObj.addText(text, mainPageFontSytle);

        for (let item of this.IsCheckedArray) {
          if (item.value) {
            this.loadingText = `正在生成[${item.label}]相关数据...`;
            let data = await Report.QueryReportTemplateByMid(item.id);
            let template = await aes.decrypt(data.pgsqltemplate);
            PageItem.Index = item.id;
            PageItem.CurrentExeSql = template;
            let sql = reportSqlFormat.GetReportSql(
              ajid,
              PageItem,
              this.ReportParams
            );
            let tableDic = Default.ReportTableDic[item.id];
            let filePath = path.join(homedir, item.label + ".xls");
            let dataResult = await this.WriteToExcelFile(
              ajid,
              item,
              filePath,
              tableDic,
              sql
            );

            let { tableDataRows, subTitle, p, mainTitle } = dataResult;
            if (mainTitle.length !== 0) {
              let title = this.convertNumToCh(this.activeStep);
              pObj = docx.createP();
              pObj.addText(title + mainTitle, mainTitleFontStyle);
            }
            if (subTitle.length !== 0) {
              pObj = docx.createP();
              pObj.addText(subTitle, subTitle);
            }
            if (p.length !== 0) {
              pObj = docx.createP();
              pObj.addText(p, mainPageFontSytle);
            }
            let { resultTable, tableStyle } = await this.makeTableDataToWord(
              tableDataRows,
              tableDic
            );
            pObj = docx.createTable(resultTable, tableStyle);
            this.activeStep++;
          }
        }
        let out = fs.createWriteStream(docfilePath);
        out.on("error", function (err) {
          log.error(err);
        });
        docx.generate(out);

        this.loading = false;
        this.buttonDisabled = false;
        this.$message({
          title: "成功",
          message: "生成报告成功，保存在目录：" + homedir,
          type: "success",
        });
        this.activeStep = 0;
        this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", false);
      } catch (e) {
        log.info(e);
        this.$message.error({
          title: "失败",
          message: "生成报告失败，错误信息：" + e.message,
        });
        this.activeStep = 0;
        this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", false);
        this.loading = false;
        this.buttonDisabled = false;
      }
    },
  },
};
</script>
