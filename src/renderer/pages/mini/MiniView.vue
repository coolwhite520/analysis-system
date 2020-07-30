<template>
  <div>hahah</div>
</template>
<script>
import csvReader from "@/utils/reader/csvReader";
import xlsReader from "@/utils/reader/xlsReader";
import dataImport from "../../db/DataImport";
import DataTypeList from "@/json/buttonGroup.json";
import path from "path";
export default {
  data() {
    return {
      softVersion: "",
    };
  },
  methods: {
    async readExampleFile(e, args) {
      console.log("panda:", args);
      const { filePathName, pdm, caseDetail, batchCount } = args;
      let data = {};
      let resultList = [];

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
          data.dataList = dataList;
          data.success = true;
          this.$electron.ipcRenderer.send("read-example-file-over", data);
          console.log(data);
        }
      } catch (e) {
        data.filePathName = filePathName;
        data.success = false;
        data.errormsg = e.message;
        this.$electron.ipcRenderer.send("read-example-file-over", data);
      }
      // this.$store.commit("DataCollection/SET_CSV_LIST", data); // 如果需要多进程访问vuex，需要启用插件功能并所有的commit都需要改成dispatch
    },
    async readAllFile(e, args) {
      console.log(args);
      for (let data of args) {
        let {
          filePathName,
          fileColsName,
          batchCount,
          bestMatchTemplate,
          caseDetail,
          fileName,
          sheetName,
        } = data;
        let { ajid, ajmc } = caseDetail;
        let filepath = path.dirname(data.filePathName);
        let fileExt = path.extname(fileName).slice(1);
        // 获取tablecname
        let tabletemp = data.matchTemplates.filter((value) => {
          return value.mbdm === bestMatchTemplate;
        });
        let tablecname = tabletemp[0].tablecname;
        let mbmc = tabletemp[0].mbmc;
        // 统计选中的列名称
        let fields = [];
        let fileInsertCols = [];
        for (let item of data.dataList) {
          if (item.matchedFieldName !== "") {
            fields.push(item.matchedFieldName);
            fileInsertCols.push(item.fileColName);
          }
        }
        let publicFields = [
          "batch",
          "sjlylx",
          "crrq",
          "ajid",
          "sjlyid",
          "rownum",
        ];
        let externFields = [];
        switch (tablecname) {
          case "gas_bank_records_source":
            // ["Yhjymxid", "Sfddbs"]
            fields = publicFields.concat(fields).concat(externFields);
            break;
          case "gas_account_info":
            // ["ryid"]
            fields = publicFields.concat(fields).concat(externFields);
            break;
          case "gas_person":
            // ["Zzlx", "zzlxmc", "Ryid", "Sjlx"]
            fields = publicFields.concat(fields).concat(externFields);
            break;
        }
        fields = fields.map((value) => {
          return value.toLowerCase();
        });
        //插入到批次表中
        let success = await dataImport.insertBatch(
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
        console.log(resultList);
        // 创建temp表存储数据
        let createdTableName = await dataImport.createTempTable(
          ajid,
          tablecname,
          bestMatchTemplate,
          fields
        );
        console.log(new Date().Format("yyyy-MM-dd hh:mm:ss"));
        for (let i = 0; i < resultList.length; i++) {
          let item = resultList[i];
          let rownum = i + 1;
          let publicData = [
            `${batchCount}`,
            `采集录入`,
            `${new Date().Format("yyyy-MM-dd hh:mm:ss")}`,
            `${ajid}`,
            `sjlyid`,
            `${rownum}`,
          ];
          item = publicData.concat(item);
          let newData = item.map((el) => {
            return `\'${el}\'`;
          });
          await dataImport.importOneRowData(createdTableName, fields, newData);
        }
        console.log(new Date().Format("yyyy-MM-dd hh:mm:ss"));
      }
    },
  },
  mounted() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
    this.$electron.ipcRenderer.on("read-all-file", this.readAllFile);
    this.$electron.ipcRenderer.on("read-example-file", this.readExampleFile);
  },
};
</script>