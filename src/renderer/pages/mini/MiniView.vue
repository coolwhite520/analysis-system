<template>
  <div>hahah</div>
</template>
<script>
import csvReader from "@/utils/reader/csvReader";
import xlsReader from "@/utils/reader/xlsReader";
import dataImport from "../../db/DataImport";
import DataTypeList from "@/json/buttonGroup.json";
const UUID = require("uuid");
import path from "path";
export default {
  data() {
    return {
      softVersion: "",
    };
  },
  methods: {
    async getValueOfMbdm(ryid, fileName, mbdm, extField) {
      let value = "";
      switch (mbdm) {
        case "150001": //"gas_tax_records_source":
          {
            if (extField.toLowerCase() === "ryid") {
              value = ryid;
            } else if (extField.toLowerCase() === "swmxid") {
              // 税务
              value = UUID.v1();
            } else if (extField.toLowerCase() === "swlx") {
              value = "0"; // 税务类型，进项税0，销项税1
            } else if (extField.toLowerCase() === "fplx") {
              value = "0"; //发票类型  普通0，专项1
            }
          }
          break;
        case "220001": //"gas_phone_call_info":
          {
            if (extField.toLowerCase() === "thjlid") {
              value = UUID.v1();
            } else if (extField.toLowerCase() === "ddfzsxm") {
              value = fileName;
            }
          }
          break;
        case "61000021": //"gas_account_info": 平台导出账户信息
          {
            if (extField.toLowerCase() === "ryid") {
              value = ryid;
            }
          }
          break;
        case "61000020": //"gas_person": 平台导出人员信息
          {
            if (extField.toLowerCase() === "ryid") {
              value = ryid;
            } else if (extField.toLowerCase() === "zzlxmc") {
              value = "z1";
            } else if (extField.toLowerCase() === "sjlx") {
              // 默认个人99
              // 数据类型(DM) 嫌疑人1
              // 被调查人2
              // 证人3
              // 受害人4
              // 律师5
              // 报案人6
              // 嫌疑单位7
              // 受害单位8
              // 从业人员9
              // 易感人员10
              // 洗钱企业11
              // 传销企业12
              // 传销人员13
              // 非法集资人员14
              // 非法集资企业15
              // 假发票人员16
              // 侵犯知识产权17
              // 洗钱人员18
              // 银行卡19
              // 其他20
              // 法人23
              // 查控单位98查控人员99
              value = "99";
            }
          }
          break;
        case "130002": //"gas_bank_records_source": // 交易明细
          {
            if (extField.toLowerCase() === "yhjymxid") {
              // 交易记录
              value = UUID.v1(); //银行交易明细id,UUID
            } else if (extField.toLowerCase() === "jyyhmc") {
              value = ""; //银行交易名称 空
            } else if (extField.toLowerCase() === "sfddbs") {
              value = ""; //是否调单标志
            }
          }
          break;
        case "10100001011": //"gas_tax_swdj":
          {
            if (extField.toLowerCase() === "ryid") {
              value = ryid;
            } else if (extField.toLowerCase() === "id") {
              //企业税务登记
              value = UUID.v1();
            }
          }
          break;
        case "145001": //"gas_im_msg":  微信通讯记录
          {
            if (extField.toLowerCase() === "sjlx") {
              // 0：QQ 1：微信 2：MailBox 3:微博 4:其它
              value = "1";
            }
          }
          break;
        case "110002": //"gas_bank_records_source": // 通用模版
          {
            //ryid,yhjymxid,sfddbs
            if (extField.toLowerCase() === "ryid") {
              // 交易记录
              value = ryid;
            } else if (extField.toLowerCase() === "yhjymxid") {
              value = UUID.v1();
            } else if (extField.toLowerCase() === "sfddbs") {
              value = "";
            }
          }
          break;
        case "160001": //"gas_account_info": 开户信息
          {
            if (extField.toLowerCase() === "ryid") {
              // 交易记录
              value = ryid;
            }
          }
          break;
        case "130001": //gas_account_info 账户信息列表
          {
            if (extField.toLowerCase() === "ryid") {
              // 交易记录
              value = ryid;
            }
          }
          break;
        case "130003": //gas_person 身份信息列表
          {
            //ryid,zzlx,zzlxmc,sjlx
            if (extField.toLowerCase() === "ryid") {
              value = ryid;
            } else if (extField.toLowerCase() === "zzlx") {
              value = "dz1";
            } else if (extField.toLowerCase() === "zzlxmc") {
              value = "dz1"; //时为居民身份证；zzlx=dz1时为企业法人营业执照
            } else if (extField.toLowerCase() === "sjlx") {
              value = "98";
            }
          }
          break;
      }
      return value;
    },
    async readExampleFile(e, args) {
      const { filePathList, pdm, caseDetail, batchCount } = args;
      let data = {};
      let resultList = [];
      for (let filePathName of filePathList) {
        try {
          let ext = path.extname(filePathName).slice(1);
          switch (ext) {
            case "txt":
              {
              }
              break;
            case "csv":
              {
                resultList = await csvReader.parseFileExampleSync(filePathName);
              }
              break;
            case "xls":
            case "xlsx":
              {
                resultList = await xlsReader.parseFileExampleSync(filePathName);
                console.log(resultList);
              }
              break;
          }
          for (let result of resultList) {
            let { fileName, sheetName, fileColsName, ins1, ins2 } = result;
            data.mc = DataTypeList.find((ele) => {
              return ele.pdm === pdm;
            }).mc;
            data.DataTypeList = DataTypeList;
            data.enableModify = false;
            data.sheetName = sheetName;
            data.fileName = fileName;
            data.filePathName = filePathName;
            data.caseDetail = caseDetail;
            data.batchCount = batchCount;
            // 文件的所有列名称去掉空格
            fileColsName.forEach((element, index) => {
              fileColsName[index] = element.trim();
            });

            data.fileColsName = fileColsName;
            // 根据点击的按钮获取对应的模版表
            let matchTemplates = await dataImport.QueryMatchTableListByPdm(pdm);
            data.matchTemplates = matchTemplates;

            // 最佳匹配的模版（表）
            let bestMatchTemplate = await dataImport.QueryBestMatchMbdm(
              pdm,
              fileColsName
            );
            // 获取tablecname
            let tabletemp = data.matchTemplates.filter((value) => {
              return value.mbdm === bestMatchTemplate;
            });
            let tablecname = tabletemp[0].tablecname;

            let externFields = tabletemp[0].extern_field
              ? tabletemp[0].extern_field.split(",")
              : [];
            let mbmc = tabletemp[0].mbmc;

            let publicFields = [
              "batch",
              "sjlylx",
              "crrq",
              "ajid",
              "sjlyid",
              "rownum",
            ];
            data.publicFields = publicFields;
            data.tablecname = tablecname;
            data.mbmc = mbmc;
            data.externFields = externFields;
            data.bestMatchTemplate = bestMatchTemplate;
            // 最佳匹配的模版对应的字段名称
            let templateToFieldNames = await dataImport.QueryColsNameByMbdm(
              bestMatchTemplate
            );
            data.templateToFieldNames = templateToFieldNames;

            // 读取log表中的匹配list
            let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
              bestMatchTemplate
            );
            let dataList = [];
            for (let i = 0; i < fileColsName.length; i++) {
              let fileColName = fileColsName[i];
              // 这个地方需要参考log表进行匹配
              let bestArray = templateToFieldNames.filter((ele) => {
                return ele.fieldcname === fileColName;
              });
              let obj = {
                fileColName, // 文件中的列名
                ins1: ins1.length > 0 ? ins1[i] : "",
                ins2: ins2.length > 0 ? ins2[i] : "",
                matchedFieldName:
                  bestArray.length > 0 ? bestArray[0].fieldename : "",
              };
              // 如果没有直接匹配上，那么和log表再次进行匹配。
              if (obj.matchedFieldName === "") {
                bestArray = logMatchList.filter((ele) => {
                  return ele.columnname === fileColName;
                });
                if (bestArray.length > 0) {
                  bestArray = templateToFieldNames.filter((ele) => {
                    return ele.fieldcname === bestArray[0].fieldname;
                  });
                  obj.matchedFieldName =
                    bestArray.length > 0 ? bestArray[0].fieldename : "";
                } else {
                  obj.matchedFieldName = "";
                }
              }
              dataList.push(obj);
            }

            // 查找相同的列
            let resultSameArr = [];
            for (let item of dataList) {
              for (let item2 of dataList) {
                if (
                  item !== item2 &&
                  item.matchedFieldName === item2.matchedFieldName &&
                  item.matchedFieldName !== "" &&
                  item2.matchedFieldName !== ""
                ) {
                  resultSameArr.push(item);
                  resultSameArr.push(item2);
                }
              }
            }
            for (let item of dataList) {
              item.sameMatchedRow = false;
            }
            for (let item of resultSameArr) {
              item.sameMatchedRow = true;
            }

            data.dataList = dataList;
            data.success = true;
            this.$electron.ipcRenderer.send(
              "read-one-example-sheet-over",
              data
            );
            console.log(data);
          }
        } catch (e) {
          data.filePathName = filePathName;
          data.success = false;
          data.errormsg = e.message;
          this.$electron.ipcRenderer.send("read-one-example-sheet-over", data);
        }
      }
      this.$electron.ipcRenderer.send("read-all-example-file-over", {});
      // this.$store.commit("DataCollection/SET_CSV_LIST", data); // 如果需要多进程访问vuex，需要启用插件功能并所有的commit都需要改成dispatch
    },
    async readAllFile(e, args) {
      console.log(args);
      let ryid = UUID.v1();
      for (let sheetIndex = 0; sheetIndex < args.length; sheetIndex++) {
        let data = args[sheetIndex];
        let {
          filePathName,
          fileColsName,
          batchCount,
          bestMatchTemplate,
          tablecname,
          mbmc,
          publicFields,
          externFields,
          caseDetail,
          fileName,
          sheetName,
        } = data;
        let { ajid, ajmc } = caseDetail;
        let filepath = path.dirname(data.filePathName);
        let fileExt = path.extname(fileName).slice(1);

        // 统计选中的列名称
        let fields = [];
        let fileInsertCols = [];
        for (let item of data.dataList) {
          if (item.matchedFieldName !== "") {
            fields.push(item.matchedFieldName);
            fileInsertCols.push(item.fileColName);
          }
        }
        fields = publicFields.concat(fields).concat(externFields);
        fields = fields.map((value) => {
          return value.toLowerCase();
        });
        //插入到批次表中 会生成一个新的sjlyid自增
        let sjlyid = await dataImport.insertBatch(
          ajid,
          ajmc,
          fileExt,
          fileName,
          filepath,
          bestMatchTemplate,
          batchCount,
          sheetName,
          mbmc,
          tablecname,
          this.softVersion
        );

        this.$electron.ipcRenderer.send("read-one-file-begin", {
          fileName,
          sheetName,
        });
        // 解析数据并插入到库中
        let resultList = [];
        switch (fileExt) {
          case "txt":
            {
            }
            break;
          case "csv":
            {
              resultList = await csvReader.parseFileAllSync(
                filePathName,
                fileColsName,
                fileInsertCols
              );
            }
            break;
          case "xls":
          case "xlsx":
            {
              resultList = await xlsReader.parseFileAllSync(
                filePathName,
                sheetName,
                fileColsName,
                fileInsertCols
              );
            }
            break;
        }
        // 创建temp表存储数据
        let createdTableName = await dataImport.createTempTable(
          ajid,
          tablecname,
          bestMatchTemplate,
          fields
        );
        console.log("begin:", new Date().Format("yyyy-MM-dd hh:mm:ss"));
        for (let i = 0; i < resultList.length; i++) {
          let item = resultList[i];
          let rownum = i + 1;
          // 给公共字段进行赋值
          let publicData = [
            `${batchCount}`,
            `采集录入`,
            `${new Date().Format("yyyy-MM-dd hh:mm:ss")}`,
            `${ajid}`,
            `${sjlyid}`, // st_data_source 自增的数据
            `${rownum}`,
          ];
          // 分配扩展字段的值
          let externData = [];
          for (let extField of externFields) {
            let value = await this.getValueOfMbdm(
              ryid,
              fileName,
              bestMatchTemplate,
              extField
            );
            externData.push(value);
          }
          item = publicData.concat(item).concat(externData);
          let newData = item.map((el) => {
            return `\'${el}\'`;
          });
          let successInsert = await dataImport.importOneRowData(
            createdTableName,
            fields,
            newData
          );
          if (successInsert) {
            let percentage = parseInt(parseFloat(i / resultList.length) * 100);
            this.$electron.ipcRenderer.send("read-one-file-proccess", {
              fileName,
              sheetName,
              percentage,
            });
          }
        }
        this.$electron.ipcRenderer.send("read-one-file-over", {
          fileName,
          sheetName,
          sheetIndex,
          tableName: createdTableName,
        });
      }
      this.$electron.ipcRenderer.send("read-all-file-over", {});
    },
  },
  mounted() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
    this.$electron.ipcRenderer.on("read-all-file", this.readAllFile);
    this.$electron.ipcRenderer.on(
      "read-all-example-file",
      this.readExampleFile
    );
  },
};
</script>