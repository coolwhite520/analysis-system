<template>
  <div></div>
</template>
<script>
const log = require("@/utils/log");
import fs from "fs";
import excel from "exceljs";
import moment from "moment";
import dataImport from "../../db/DataImport";
import cases from "../../db/Cases";
import { Pool, Client } from "pg";
import DataTypeList from "@/json/buttonGroup.json";
const UUID = require("uuid");
import path from "path";
const copyFrom = require("pg-copy-streams").from;
const csv = require("@fast-csv/parse");
export default {
  data() {
    return {
      softVersion: "",
    };
  },
  methods: {
    formatExcelDate(numb) {
      const time = new Date(new Date(1900, 0, numb));
      const year = time.getFullYear() + "";
      let month = time.getMonth() + 1 + "";
      month = month.length === 1 ? "0" + month : month;
      let date = time.getDate() - 1 + "";
      date = date.length === 1 ? "0" + date : date;
      return year + "-" + month + "-" + date;
    },
    formatExcelTime(numb) {
      const time = new Date(new Date(1900, 0, 0, numb));
      let hour = time.getHours() + 1 + "";
      hour = hour.length === 1 ? "0" + hour : hour;
      let min = time.getMinutes() - 1 + "";
      min = min.length === 1 ? "0" + min : min;

      return hour + ":" + min;
    },
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
    // 解析示例xlsx文件
    async parseExampleExcelFile(filePathName) {
      let resultList = [];
      const workbookReader = new excel.stream.xlsx.WorkbookReader(filePathName);
      for await (const worksheetReader of workbookReader) {
        let rows = [];
        for await (const row of worksheetReader) {
          let newRow = [];
          if (!row.hasValues) continue;
          for (let cindex = 1; cindex <= row.actualCellCount; cindex++) {
            let cell = row.getCell(cindex);
            if (cell.type === 4) {
              let cellDate = new Date(cell);
              let m = moment(cellDate).utc();
              let year = m.year();
              let month = m.month() + 1;
              month = String(month).length === 1 ? "0" + month : month;
              let day = m.date();
              day = String(day).length === 1 ? "0" + day : day;
              let hour = m.hour();
              hour = String(hour).length === 1 ? "0" + hour : hour;
              let minute = m.minute();
              minute = String(minute).length === 1 ? "0" + minute : minute;
              let sec = m.second();
              sec = String(sec).length === 1 ? "0" + sec : sec;
              if (year === 1899) {
                cell = `${hour}:${minute}:${sec}`;
              } else {
                cell = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
              }
            } else {
              cell = cell.toString().trim();
            }
            newRow.push(cell);
          }
          if (rows.length === 3) {
            break;
          }
          if (newRow.length > 0) rows.push(newRow);
        }
        if (rows.length === 0) {
          continue;
        }
        let result = {
          fileName: path.basename(filePathName),
          sheetName: worksheetReader.name,
          fileAllCols: rows.length > 0 ? rows[0] : [],
          ins1: rows.length > 1 ? rows[1] : [],
          ins2: rows.length > 2 ? rows[2] : [],
          sheetId: worksheetReader.id,
        };
        resultList.push(result);
        log.info(worksheetReader.rowCount);
      }
      return resultList;
    },
    /**
     * 解析示例csv文件
     */
    async parseExampleCsvFile(filePathName) {
      return new Promise(function (resolve, reject) {
        let rows = [];
        fs.createReadStream(filePathName)
          .pipe(
            csv.parse({
              trim: true,
              headers: true,
              objectMode: true,
              ignoreEmpty: true,
              maxRows: 2,
            })
          )
          .on("error", (error) => {
            console.error(error);
            reject(error);
          })
          .on("data", (row) => {
            console.log(row);
            rows.push(row);
          })
          .on("end", (rowCount) => {
            console.log(`Parsed ${rowCount} rows`);
            if (rows.length < 2) {
              resolve([]);
              return;
            }
            let fileAllCols = [];
            let ins1 = [];
            let ins2 = [];
            for (let row of rows) {
              if (fileAllCols.length === 0) {
                for (let k in row) {
                  fileAllCols.push(k);
                  ins1.push(row[k]);
                }
              } else {
                for (let k in row) {
                  ins2.push(row[k]);
                }
              }
            }
            let result = {
              fileName: path.basename(filePathName),
              sheetName: path.basename(filePathName),
              fileAllCols,
              ins1,
              ins2,
            };
            resolve([result]);
          });
      });
    },
    // 事件响应函数
    async onReadExampleFile(e, args) {
      let { filePathList, pdm, caseBase, batchCount } = args;
      let publicFields = [
        "batch",
        "sjlylx",
        "crrq",
        "ajid",
        "sjlyid",
        "rownum",
      ];
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
                resultList = await this.parseExampleCsvFile(filePathName);
              }
              break;
            case "xls":
            case "xlsx":
              {
                resultList = await this.parseExampleExcelFile(filePathName);
              }
              break;
          }
          if (resultList.length === 0) {
            continue;
          }
          for (let result of resultList) {
            let { fileName, sheetName, fileAllCols, ins1, ins2 } = result;
            // 文件的所有列名称去掉空格
            fileAllCols.forEach((element, index) => {
              fileAllCols[index] = element.trim();
            });
            data.fileAllCols = fileAllCols;
            let queryResult = await dataImport.QueryBestMatchMbdm(
              pdm,
              fileAllCols
            );

            let matchedMbdm = queryResult.mbdm;
            // 说明是自动匹配
            if (pdm === "") {
              pdm = queryResult.pdm;
            }
            data.mc = DataTypeList.find((ele) => {
              return ele.pdm === pdm;
            }).mc;
            data.DataTypeList = DataTypeList;
            data.enableModify = false;
            data.sheetName = sheetName;
            data.fileName = fileName;
            data.filePathName = filePathName;
            data.caseBase = caseBase;
            data.batchCount = batchCount;

            // 根据点击的按钮获取对应的模版表
            let matchedMbdmList = await dataImport.QueryMatchTableListByPdm(
              pdm
            );
            data.matchedMbdmList = matchedMbdmList;
            // 获取tablecname
            let tabletemp = data.matchedMbdmList.filter((value) => {
              return value.mbdm === matchedMbdm;
            });
            let tablecname = tabletemp[0].tablecname;

            let externFields = tabletemp[0].extern_field
              ? tabletemp[0].extern_field.split(",")
              : [];
            let mbmc = tabletemp[0].mbmc;
            data.publicFields = publicFields;
            data.tablecname = tablecname;
            data.mbmc = mbmc;
            data.externFields = externFields;
            data.matchedMbdm = matchedMbdm;
            // 最佳匹配的模版对应的字段名称
            let templateToFieldObjList = await dataImport.QueryColsNameByMbdm(
              matchedMbdm
            );
            data.templateToFieldObjList = templateToFieldObjList;

            // 读取log表中的匹配list
            let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
              matchedMbdm
            );
            let dataList = [];
            for (let i = 0; i < fileAllCols.length; i++) {
              let fileColName = fileAllCols[i];
              // 这个地方需要参考log表进行匹配
              let bestArray = templateToFieldObjList.filter((ele) => {
                return ele.fieldcname === fileColName;
              });
              let obj = {
                fileColName, // 文件中的列名
                ins1: ins1.length > 0 ? ins1[i] : "",
                ins2: ins2.length > 0 ? ins2[i] : "",
                matchedFieldName:
                  bestArray.length > 0 ? bestArray[0].fieldename : "",
                matchedFieldType:
                  bestArray.length > 0 ? bestArray[0].fieldtype : "",
              };
              // 如果没有直接匹配上，那么和log表再次进行匹配。
              if (obj.matchedFieldName === "") {
                bestArray = logMatchList.filter((ele) => {
                  return ele.columnname === fileColName;
                });
                if (bestArray.length > 0) {
                  bestArray = templateToFieldObjList.filter((ele) => {
                    return ele.fieldcname === bestArray[0].fieldname;
                  });
                  obj.matchedFieldName =
                    bestArray.length > 0 ? bestArray[0].fieldename : "";
                } else {
                  obj.matchedFieldName = "";
                }
              }
              if (obj.matchedFieldType === 4) {
                obj.ins1 = this.formatExcelDate(obj.ins1);
                obj.ins2 = this.formatExcelDate(obj.ins2);
              } else if (obj.matchedFieldType === 5) {
                obj.ins1 = this.formatExcelTime(obj.ins1);
                obj.ins2 = this.formatExcelTime(obj.ins2);
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
              "parse-one-example-sheet-over",
              data
            );
          }
        } catch (e) {
          log.error(e);
          data.filePathName = filePathName;
          data.success = false;
          data.errormsg = e.message;
          this.$electron.ipcRenderer.send("parse-one-example-sheet-over", data);
        }
      }
      this.$electron.ipcRenderer.send("parse-all-example-file-over", {});
      // this.$store.commit("DataCollection/SET_CSV_LIST", data); // 如果需要多进程访问vuex，需要启用插件功能并所有的commit都需要改成dispatch
    },

    async onReadAllFile(e, args) {
      try {
        let _this = this;
        let ryid = UUID.v1();
        for (let sheetIndex = 0; sheetIndex < args.length; sheetIndex++) {
          let data = args[sheetIndex];
          let {
            filePathName,
            fileAllCols,
            batchCount,
            matchedMbdm,
            tablecname,
            mbmc,
            publicFields,
            externFields,
            caseBase,
            fileName,
            sheetName,
          } = data;
          let { ajid, ajmc } = caseBase;
          let filepath = path.dirname(data.filePathName);
          let fileExt = path.extname(fileName).slice(1);

          // 统计选中的列名称
          let fields = [];
          let matchedFields = [];
          let matchedFileCols = [];
          for (let item of data.dataList) {
            if (item.matchedFieldName !== "") {
              matchedFields.push(item.matchedFieldName);
              matchedFileCols.push(item.fileColName);
            }
          }
          console.log(matchedFields, matchedFileCols);
          fields = publicFields.concat(matchedFields).concat(externFields);
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
            matchedMbdm,
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
          // 创建temp表存储数据
          let { createTableName } = await dataImport.createTempTable(
            ajid,
            tablecname,
            matchedMbdm,
            fields
          );
          // 解析数据并插入到库中
          let externFieldsValues = [];
          for (let extField of externFields) {
            let value = await _this.getValueOfMbdm(
              ryid,
              fileName,
              matchedMbdm,
              extField
            );
            externFieldsValues.push(value);
          }

          switch (fileExt) {
            case "txt":
              {
              }
              break;
            case "csv":
              {
                await this.parseCsvFile(
                  sheetIndex,
                  fileName,
                  filePathName,
                  sheetName,
                  matchedFields,
                  fileAllCols,
                  publicFields,
                  matchedFileCols,
                  externFields,
                  externFieldsValues,
                  caseBase,
                  batchCount,
                  sjlyid,
                  createTableName
                );
              }
              break;
            case "xls":
            case "xlsx": {
              await this.parseExcelFile(
                sheetIndex,
                fileName,
                filePathName,
                sheetName,
                matchedFields,
                fileAllCols,
                publicFields,
                matchedFileCols,
                externFields,
                externFieldsValues,
                caseBase,
                batchCount,
                sjlyid,
                createTableName
              );
            }
          }
        }
        this.$electron.ipcRenderer.send("read-all-file-over", {});
      } catch (e) {
        log.info(e);
      }
    },
    async sleep(ms) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve("done");
        }, ms);
      });
    },
    // 解析excel文件并通过异步bulk insert 流的方式进行数据导入。 存在的问题：exceljs模块无法获取row的条目数量和sheetname
    async parseExcelFile(
      sheetIndex,
      fileName,
      filePathName,
      sheetName,
      matchedFields,
      fileAllCols,
      publicFields,
      matchedFileCols,
      externFields,
      externFieldsValues,
      caseBase,
      batchCount,
      sjlyid,
      createTableName
    ) {
      let _this = this;
      try {
        let { ajid } = caseBase;
        let fields = publicFields.concat(matchedFields).concat(externFields);
        fields = fields.map((el) => el.toLowerCase());
        let sqlStr = `COPY ${createTableName}(${fields}) FROM STDIN`;
        console.log(sqlStr);
        let streamFrom;
        let client = await global.db.connect();
        let sql = `SET search_path TO icap_${ajid}`;
        let res = await client.query(sql);
        streamFrom = await client.query(copyFrom(sqlStr));
        console.log(streamFrom);
        streamFrom.on("error", function (e) {
          console.log(e);
        });
        streamFrom.on("finish", function (e) {
          log.info(e, "import finish .....");
        });
        let matchedColNumList = [];
        let stats = fs.statSync(filePathName);
        for (let item of matchedFileCols) {
          let f = fileAllCols.findIndex((el) => el === item);
          if (f !== -1) {
            matchedColNumList.push(f + 1);
          }
        }
        let rownum = 0;
        let readSize = 0;
        let fileSize = stats.size;
        let bFirstRow = true;
        const workbookReader = new excel.stream.xlsx.WorkbookReader(
          filePathName
        );
        for await (const worksheetReader of workbookReader) {
          if (worksheetReader.name !== sheetName) continue;
          for await (const row of worksheetReader) {
            if (!row.hasValues) continue;
            if (bFirstRow) {
              bFirstRow = false;
              continue;
            }
            let rowDataValues = [];
            for (let cindex of matchedColNumList) {
              let cell = row.getCell(cindex);
              if (cell.type === 4) {
                let cellDate = new Date(cell);
                let m = moment(cellDate).utc();
                let year = m.year();
                let month = m.month() + 1;
                month = String(month).length === 1 ? "0" + month : month;
                let day = m.date();
                day = String(day).length === 1 ? "0" + day : day;
                let hour = m.hour();
                hour = String(hour).length === 1 ? "0" + hour : hour;
                let minute = m.minute();
                minute = String(minute).length === 1 ? "0" + minute : minute;
                let sec = m.second();
                sec = String(sec).length === 1 ? "0" + sec : sec;
                if (year === 1899) {
                  cell = `${hour}:${minute}:${sec}`;
                } else {
                  cell = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
                }
              } else {
                cell = cell.toString().trim();
              }
              rowDataValues.push(cell);
            }
            readSize += `${rowDataValues}`.length;
            rownum++;
            let publicValues = [
              `${batchCount}`,
              `采集录入`,
              `${new Date().Format("yyyy-MM-dd hh:mm:ss")}`,
              `${ajid}`,
              `${sjlyid}`,
              `${rownum}`,
            ];
            let realValues = publicValues
              .concat(rowDataValues)
              .concat(externFieldsValues);
            let insertStr = realValues.join("\t") + "\n";
            // 写入流中
            streamFrom.write(insertStr, function (err) {
              if (!err) {
                let percentage = parseInt(
                  parseFloat(readSize / fileSize) * 100
                );
                let secondTitle = "";
                if (percentage >= 60) {
                  secondTitle = "文件较大，正在加速载入...";
                }
                if (percentage >= 99) {
                  percentage = 99;
                  secondTitle = "距离加载完毕已经不远了，请耐心等待...";
                }
                _this.$electron.ipcRenderer.send("read-one-file-proccess", {
                  success: true,
                  fileName,
                  sheetName,
                  percentage,
                  secondTitle,
                  msg: `载入条目：${rownum} ${rowDataValues}`,
                });
              } else {
                _this.$electron.ipcRenderer.send("read-one-file-proccess", {
                  success: false,
                  fileName,
                  sheetName,
                  secondTitle: "出错了...",
                  msg: err,
                });
              }
            });
          }
        }
        streamFrom.end();
        _this.$electron.ipcRenderer.send("read-one-file-over", {
          fileName,
          sheetName,
          sheetIndex,
          tableName: createTableName,
        });
      } catch (e) {
        log.error(e);
      }
    },
    // 解析csv文件全部内容
    async parseCsvFile(
      sheetIndex,
      fileName,
      filePathName,
      sheetName,
      matchedFields,
      fileAllCols,
      publicFields,
      matchedFileCols,
      externFields,
      externFieldsValues,
      caseBase,
      batchCount,
      sjlyid,
      createTableName
    ) {
      let _this = this;
      return new Promise(async function (resolve, reject) {
        try {
          let { ajid } = caseBase;
          let fields = publicFields.concat(matchedFields).concat(externFields);
          fields = fields.map((el) => el.toLowerCase());
          let sqlStr = `COPY ${createTableName}(${fields}) FROM STDIN`;
          console.log(sqlStr);
          let streamFrom;
          let client = await global.db.connect();
          let sql = `SET search_path TO icap_${ajid}`;
          let res = await client.query(sql);
          streamFrom = await client.query(copyFrom(sqlStr));
          console.log(streamFrom);
          streamFrom.on("error", function (e) {
            console.log(e);
          });
          streamFrom.on("finish", function (e) {
            log.info(e, "import finish .....");
          });
          let matchedColNumList = [];
          let stats = fs.statSync(filePathName);
          let rownum = 0;
          let readSize = 0;
          let fileSize = stats.size;
          let bFirstRow = true;
          fs.createReadStream(filePathName)
            .pipe(
              csv.parse({
                trim: true,
                headers: true,
                objectMode: true,
                ignoreEmpty: true,
              })
            )
            .on("error", (error) => {
              console.error(error);
            })
            .on("data", (row) => {
              let rowDataValues = [];
              for (let k in row) {
                if (matchedFileCols.includes(k)) {
                  rowDataValues.push(row[k]);
                }
              }
              readSize += `${rowDataValues}`.length;
              rownum++;
              let publicValues = [
                `${batchCount}`,
                `采集录入`,
                `${new Date().Format("yyyy-MM-dd hh:mm:ss")}`,
                `${ajid}`,
                `${sjlyid}`,
                `${rownum}`,
              ];
              let realValues = publicValues
                .concat(rowDataValues)
                .concat(externFieldsValues);
              let insertStr = realValues.join("\t") + "\n";
              // 写入流中
              streamFrom.write(insertStr, function (err) {
                if (!err) {
                  let percentage = parseInt(
                    parseFloat(readSize / fileSize) * 100
                  );
                  let secondTitle = "";
                  if (percentage >= 60) {
                    secondTitle = "文件较大，正在加速载入...";
                  }
                  if (percentage >= 99) {
                    percentage = 99;
                    secondTitle = "距离加载完毕已经不远了，请耐心等待...";
                  }
                  _this.$electron.ipcRenderer.send("read-one-file-proccess", {
                    success: true,
                    fileName,
                    sheetName,
                    percentage,
                    secondTitle,
                    msg: `载入条目：${rownum} ${rowDataValues}`,
                  });
                } else {
                  _this.$electron.ipcRenderer.send("read-one-file-proccess", {
                    success: false,
                    fileName,
                    sheetName,
                    secondTitle: "出错了...",
                    msg: err,
                  });
                }
              });
            })
            .on("end", (rowCount) => {
              console.log(`Parsed ${rowCount} rows`);
              streamFrom.end();
              _this.$electron.ipcRenderer.send("read-one-file-over", {
                fileName,
                sheetName,
                sheetIndex,
                tableName: createTableName,
              });
              resolve("done");
            });
        } catch (e) {
          log.error(e);
          reject(e);
        }
      });
    },
    async copyTempDataToRealTable(e, args) {
      let _this = this;
      let {
        ajid,
        tableName,
        tablecname,
        matchedMbdm,
        publicFields,
        matchedFields,
        externFields,
        tabIndex,
      } = args;
      await dataImport.importDataFromTempTableToRealTable(
        ajid,
        tableName,
        tablecname,
        matchedMbdm,
        publicFields,
        matchedFields,
        externFields,
        function ({ sumRow, index, success, msg }) {
          _this.$electron.ipcRenderer.send("import-one-table-process", {
            tabIndex,
            sumRow,
            index,
            success,
            msg,
          });
        }
      );
    },
  },
  beforeMount() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
  },
  mounted() {
    this.$electron.ipcRenderer.on("read-all-file", this.onReadAllFile);
    this.$electron.ipcRenderer.on(
      "parse-all-example-file",
      this.onReadExampleFile
    );
    this.$electron.ipcRenderer.on(
      "import-one-table-begin",
      this.copyTempDataToRealTable
    );
  },
};
</script>