<template>
  <div></div>
</template>
<script>
import Papa from "papaparse";
const jschardet = require("jschardet");
const log = require("@/utils/log");
const iconv = require("iconv-lite");
const through2 = require("through2");
import fs from "fs";
import excel from "exceljs";
import moment from "moment";
import dataImport from "../../db/DataImport";
import cases from "../../db/Cases";
import { Pool, Client, Query } from "pg";
const QueryStream = require("pg-query-stream");
import DataTypeList from "@/json/buttonGroup.json";
import importModel from "@/utils/sql/ImportModel.js";
const UUID = require("uuid");
import path from "path";
import { create } from "domain";
import { inflate } from "zlib";
const copyFrom = require("pg-copy-streams").from;
const csv = require("@fast-csv/parse");
const lodash = require("lodash");
const readLine = require("readline");
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
    // 解析示例xlsx文件
    async parseSheet(worksheetReader, filePathName) {
      let rows = [];
      let loopCount = 0;
      for await (const row of worksheetReader) {
        loopCount++;
        // 寻找前十行中行内拥有最多cell的行, 列数最多的项作为header
        if (loopCount === 10) {
          break;
        }
        let newRow = [];
        if (!row.hasValues) continue;
        for (let cindex = 1; cindex <= row.actualCellCount; cindex++) {
          let cell = row.getCell(cindex);
          if (cell.type === 4) {
            // ////console.log(cell.type, cell.value);
            let cellDate = new Date(cell.value);
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
              if (hour === "00" && minute === "00" && sec === "00") {
                cell = `${year}-${month}-${day}`;
              } else {
                cell = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
              }
            }
          } else {
            cell = cell.toString().trim();
          }
          newRow.push(cell);
        }
        rows.push(newRow);
      }
      // ////console.log(rows);
      if (rows.length < 3) {
        return null;
      }
      // 非空字段个数最多的行作为header
      function findHaveMoreCellsIndex(rows) {
        let max = 0;
        let findindex = 0;
        for (let index = 0; index < rows.length; index++) {
          let row = rows[index];
          let notEmptyLen = 0;
          row.forEach((element) => {
            if (element.length > 0) notEmptyLen++;
          });
          if (notEmptyLen > max) {
            max = notEmptyLen;
            findindex = index;
          }
        }
        return findindex;
      }
      let index = findHaveMoreCellsIndex(rows);
      rows = rows.slice(index);
      let result = {
        fileName: path.basename(filePathName),
        sheetName: worksheetReader.name,
        fileAllCols: rows[0],
        ins1: rows.length > 1 ? rows[1] : [],
        ins2: rows.length > 2 ? rows[2] : [],
        skipLines: index,
      };
      return result;
    },

    async parseExampleExcelFile(filePathName) {
      let resultList = [];
      const workbookReader = new excel.stream.xlsx.WorkbookReader(
        filePathName,
        {
          entries: "emit",
          sharedStrings: "cache",
          hyperlinks: "cache",
          styles: "cache",
          worksheets: "emit",
        }
      );
      for await (const worksheetReader of workbookReader) {
        let result = await this.parseSheet(worksheetReader, filePathName);
        // ////console.log(result);
        if (result) resultList.push(result);
      }
      return resultList;
    },

    getFileEncoding(filePathName) {
      return new Promise(function (resolve, reject) {
        let readFileStream = fs.createReadStream(filePathName);
        readFileStream.on("data", function (chunk) {
          let { encoding, confidence } = jschardet.detect(chunk);
          if (confidence > 0.6) {
            // log.info({ filePathName, confidence, encoding });
            resolve(encoding);
          } else {
            resolve("UTF-8");
            // log.info({ filePathName, confidence, encoding });
          }
          readFileStream.close();
        });
        readFileStream.on("close", function () {
          ////console.log("close file");
        });
      });
    },

    /**
     * 解析示例csv文件
     */
    async parseExampleCsvFile(filePathName) {
      // await dataImport.InsertOrUpdateMatchedRecord(
      //   ["1", "2", "'3"],
      //   ["a", "b", "c"],
      //   "进",
      //   "出"
      // );
      let encoding = await this.getFileEncoding(filePathName);
      return new Promise((resolve, reject) => {
        let rows = [];
        let csvParseStream = csv.parse({
          trim: true,
          objectMode: true,
          ignoreEmpty: true,
          maxRows: 10,
          strictColumnHandling: true,
        });
        let readFileStream = fs.createReadStream(filePathName);
        csvParseStream
          .on("error", (error) => {
            log.info(error);
            readFileStream.close();
            reject(error);
          })
          .on("data", (row) => {
            rows.push(row);
          })
          .on("end", (rowCount) => {
            if (rows.length < 1) {
              readFileStream.close();
              resolve([]);
              return;
            }
            function findHaveMoreCellsIndex(rows) {
              let max = 0;
              let findindex = 0;
              for (let index = 0; index < rows.length; index++) {
                let row = rows[index];
                let notEmptyLen = 0;
                row.forEach((element) => {
                  if (element.length > 0) notEmptyLen++;
                });
                if (notEmptyLen > max) {
                  max = notEmptyLen;
                  findindex = index;
                }
              }
              return findindex;
            }
            let index = findHaveMoreCellsIndex(rows);
            rows = rows.slice(index);
            let result = {
              fileName: path.basename(filePathName),
              sheetName: path.basename(filePathName),
              fileAllCols: rows[0],
              ins1: rows.length > 1 ? rows[1] : [],
              ins2: rows.length > 2 ? rows[2] : [],
              skipLines: index,
            };
            resolve([result]);
            readFileStream.close();
          });
        // 判断编码格式并进行转换
        if (encoding !== "UTF-8") {
          readFileStream.on("data", function (chuck) {
            let str = iconv.decode(chuck, encoding);
            // log.info(str);
            csvParseStream.write(Buffer.from(str));
          });
        } else {
          readFileStream.pipe(csvParseStream);
        }
        readFileStream.on("end", function () {
          csvParseStream.end();
        });
      });
    },
    GetRandomNum(Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      return Min + Math.round(Rand * Range);
    },
    // 事件响应函数
    async onReadExampleFile(e, args) {
      let { filePathList } = args;
      for (let filePathName of filePathList) {
        try {
          let resultList = [];
          let ext = path.extname(filePathName).slice(1);
          switch (ext) {
            case "txt":
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
          await this.makeExampleDataStruct(filePathName, resultList, args);
        } catch (e) {
          let data = {};
          log.error(e);
          data.filePathName = filePathName;
          data.success = false;
          data.errormsg = e.message;
          data.id = UUID.v1();
          this.$electron.ipcRenderer.send("parse-one-example-sheet-over", data);
        }
      }
      this.$electron.ipcRenderer.send("parse-all-example-file-over", {});
      // this.$store.commit("DataCollection/SET_CSV_LIST", data); // 如果需要多进程访问vuex，需要启用插件功能并所有的commit都需要改成dispatch
    },
    async makeExampleDataStruct(filePathName, resultList, args) {
      let { pdm, caseBase, batchCount } = args;
      let publicFields = [
        "batch",
        "sjlylx",
        "crrq",
        "ajid",
        "sjlyid",
        "rownum",
      ];
      for (let result of resultList) {
        let data = {};
        let {
          fileName,
          sheetName,
          fileAllCols,
          ins1,
          ins2,
          skipLines,
        } = result;

        // 文件的所有列名称去掉空格
        fileAllCols.forEach((element, index) => {
          fileAllCols[index] = element.trim();
        });
        data.fileAllCols = fileAllCols;
        let queryResult = await dataImport.QueryBestMatchMbdm(pdm, fileAllCols);
        // log.info(fileName, queryResult);
        let matchedMbdm = queryResult.mbdm;
        // 说明是自动匹配
        if (pdm === "") {
          pdm = queryResult.pdm;
        }
        let itemTemp = DataTypeList.find((ele) => {
          return ele.pdm === pdm;
        });
        data.mc = itemTemp ? itemTemp.mc : "";
        data.DataTypeList = DataTypeList;
        data.enableModify = false;
        data.sheetName = sheetName;
        data.fileName = fileName;
        data.filePathName = filePathName;
        data.caseBase = caseBase;
        data.batchCount = batchCount;
        data.skipLines = skipLines;
        // 根据点击的按钮获取对应的模版表
        let matchedMbdmList = await dataImport.QueryMatchTableListByPdm(pdm);
        data.matchedMbdmList = matchedMbdmList;
        // 获取tablecname
        let tabletemp = data.matchedMbdmList.filter((value) => {
          return value.mbdm === matchedMbdm;
        });
        let tablecname = tabletemp.length > 0 ? tabletemp[0].tablecname : "";

        let externFields =
          tabletemp.length > 0 ? tabletemp[0].extern_field.split(",") : [];
        let mbmc = tabletemp.length > 0 ? tabletemp[0].mbmc : "";
        data.publicFields = publicFields;
        data.tablecname = tablecname;
        data.mbmc = mbmc;
        data.externFields = externFields;
        data.matchedMbdm = matchedMbdm;
        // 最佳匹配的模版对应的字段名称
        let templateToFieldObjList = await dataImport.QueryColsNameByMbdm(
          matchedMbdm
        );
        templateToFieldObjList.unshift({
          fieldcname: "",
          fieldename: "",
        });
        data.templateToFieldObjList = templateToFieldObjList;
        data.inFlag = "";
        data.outFlag = "";

        let retData = await dataImport.QueryMatchedRecordByFileAllCols(
          matchedMbdm,
          fileAllCols
        );
        let dataList = [];
        if (retData.success) {
          // 匹配上了record，那么直接取出来
          data.inFlag = retData.inFlag;
          data.outFlag = retData.outFlag;
          for (let i = 0; i < fileAllCols.length; i++) {
            let fileColName = fileAllCols[i];
            let obj = {
              fileColName, // 文件中的列名
              ins1: ins1.length > 0 ? ins1[i] : "",
              ins2: ins2.length > 0 ? ins2[i] : "",
              matchedFieldName: retData.rows[i],
            };
            dataList.push(obj);
          }
        } else {
          // 查询log表获取数据
          let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
            matchedMbdm
          );
          //console.log(logMatchList);
          for (let i = 0; i < fileAllCols.length; i++) {
            let fileColName = fileAllCols[i];
            let bestArray = templateToFieldObjList.filter((ele) => {
              return ele.fieldcname === fileColName;
            });
            // 如果没有直接匹配上，那么和log表再次进行匹配。
            if (bestArray.length === 0) {
              bestArray = logMatchList.filter((ele) => {
                return ele.columnname === fileColName;
              });
              if (bestArray.length > 0) {
                bestArray = templateToFieldObjList.filter((ele) => {
                  return ele.fieldcname === bestArray[0].fieldname;
                });
              }
            }
            let obj = {
              fileColName, // 文件中的列名
              ins1: ins1.length > 0 ? ins1[i] : "",
              ins2: ins2.length > 0 ? ins2[i] : "",
              matchedFieldName:
                bestArray.length > 0 ? bestArray[0].fieldename : "",
            };

            dataList.push(obj);
          }
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
        data.id = UUID.v1();
        data.progressColor = this.getRandomColor();
        this.$electron.ipcRenderer.send("parse-one-example-sheet-over", data);
      }
    },
    /*随机获取颜色*/
    getRandomColor() {
      // var r = Math.floor(Math.random() * 256);
      // var g = Math.floor(Math.random() * 256);
      // var b = Math.floor(Math.random() * 256);
      // return "rgb(" + r + "," + g + "," + b + ")";
      return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
    },
    async onReadAllFile(e, args) {
      try {
        let _this = this;
        let ryid = UUID.v1();
        for (let data of args) {
          let {
            id,
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
            skipLines,
            inFlag,
            outFlag,
          } = data;

          let { ajid, ajmc } = caseBase;
          let filepath = path.dirname(data.filePathName);
          let fileExt = path.extname(fileName).slice(1);

          // 统计选中的列名称
          let fields = [];
          let matchedFields = [];
          let matchedFieldsAll = [];
          let matchedFileCols = [];
          for (let item of data.dataList) {
            if (item.matchedFieldName !== "") {
              matchedFields.push(item.matchedFieldName);
              matchedFileCols.push(item.fileColName);
            }
            matchedFieldsAll.push(item.matchedFieldName);
          }
          // //console.log(fileAllCols, matchedFieldsAll);
          dataImport.InsertOrUpdateMatchedRecord(
            matchedMbdm,
            fileAllCols,
            matchedFieldsAll,
            inFlag,
            outFlag
          );
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
          let {
            createTableName,
            createFields,
          } = await dataImport.createTempTable(
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
            case "csv":
              {
                await this.parseCsvFile(
                  tablecname,
                  createFields,
                  inFlag,
                  outFlag,
                  matchedMbdm,
                  id,
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
                  createTableName,
                  skipLines
                );
              }
              break;
            case "xls":
            case "xlsx": {
              await this.parseExcelFile(
                tablecname,
                createFields, // temp表全列
                inFlag,
                outFlag,
                matchedMbdm,
                id,
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
                createTableName,
                skipLines
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
    // 解析excel文件并通过异步bulk insert 流的方式进行数据导入

    async parseExcelFile(
      tablecname,
      createFields, // temp表全列
      inFlag,
      outFlag,
      matchedMbdm,
      id,
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
      createTableName,
      skipLines
    ) {
      let _this = this;
      let client = await global.pool.connect();
      let needInsertFields = [];
      try {
        return await new Promise(async function (resolve, reject) {
          let { ajid } = caseBase;
          let fields = publicFields.concat(matchedFields).concat(externFields);
          fields = fields.map((el) => el.toLowerCase());
          let sqlStr = `COPY ${createTableName}(${createFields}) FROM STDIN`;
          // ////console.log(sqlStr);
          let streamFrom;
          await cases.SwitchCase(client, ajid);
          streamFrom = await client.query(copyFrom(sqlStr));
          streamFrom.on("error", function (e) {
            log.info(e);
            reject(e);
          });
          streamFrom.on("finish", function () {
            log.info("import finish .....");
            _this.$electron.ipcRenderer.send("read-one-file-over", {
              fileName,
              sheetName,
              id,
              tableName: createTableName,
              needInsertFields,
              sjlyid,
            });
            resolve("done");
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
          const workbookReader = new excel.stream.xlsx.WorkbookReader(
            filePathName,
            {
              entries: "emit",
              sharedStrings: "cache",
              hyperlinks: "cache",
              styles: "cache",
              worksheets: "emit",
            }
          );
          let templateToFieldObjList = await dataImport.QueryColsNameByMbdm(
            matchedMbdm
          );

          for await (const worksheetReader of workbookReader) {
            if (worksheetReader.name !== sheetName) continue;
            for await (const row of worksheetReader) {
              if (!row.hasValues) continue;
              ////console.log(row.number, skipLines + 1);
              if (row.number <= skipLines + 1) continue;
              let rowDataValues = [];
              let matchedFieldIndex = 0;
              for (let cindex of matchedColNumList) {
                let cell = row.getCell(cindex);
                if (cell.type === 4) {
                  let cellDate = new Date(cell.value);
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
                    if (hour === "00" && minute === "00" && sec === "00") {
                      cell = `${year}-${month}-${day}`;
                    } else {
                      cell = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
                    }
                  }
                } else {
                  cell = cell.toString().trim();
                }
                matchedFieldIndex++;
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
              let tempRow = lodash.zipObject(fields, realValues);
              let newRowData = importModel.TestingHandle(
                createFields,
                tempRow,
                tablecname,
                inFlag,
                outFlag
              );
              let values = [];
              let keys = Object.keys(newRowData);
              needInsertFields = lodash.union(needInsertFields, keys);
              for (let field of createFields) {
                if (keys.includes(field)) {
                  values.push(newRowData[field]);
                } else {
                  values.push("");
                }
              }
              let insertStr = values.join("\t") + "\n";
              // 写入流中
              streamFrom.write(insertStr, function (err) {
                ////console.log({ insertStr });
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
        });
      } finally {
        client.release();
      }
    },
    // 解析csv文件全部内容
    async parseCsvFile(
      tablecname,
      createFields, // temp表全列
      inFlag,
      outFlag,
      matchedMbdm,
      id,
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
      createTableName,
      skipLines // 跳过的行数，非法行
    ) {
      let _this = this;
      let client = await global.pool.connect();
      let encoding = await this.getFileEncoding(filePathName);
      let needInsertFields = [];
      try {
        return await new Promise(async function (resolve, reject) {
          let { ajid } = caseBase;
          let fields = publicFields.concat(matchedFields).concat(externFields);
          fields = fields.map((el) => el.toLowerCase());
          let sqlStr = `COPY ${createTableName}(${createFields}) FROM STDIN`;
          ////console.log(sqlStr, matchedFileCols, { skipLines });
          await cases.SwitchCase(client, ajid);
          let streamFrom = await client.query(copyFrom(sqlStr));
          let matchedColNumList = [];
          let stats = fs.statSync(filePathName);
          let rownum = 0;
          let readSize = 0;
          let fileSize = stats.size;
          let bFirstRow = true;
          let indexList = []; // 获取匹配索引
          fileAllCols.forEach((v, i) => {
            if (matchedFileCols.includes(v)) {
              indexList.push(i);
            }
          });
          let lastOneBuffer = Buffer.from([]); // \n 后面的部分buffer
          let readFileStream = fs.createReadStream(filePathName);
          readFileStream
            .pipe(
              through2({ objectMode: true }, function (chunk, enc, callback) {
                chunk = Buffer.concat([lastOneBuffer, chunk]);
                let returnChar = 10;
                let resolvedChunk = [];
                let bFind = false;
                for (let index = chunk.length - 1; index >= 0; index--) {
                  if (returnChar === chunk[index]) {
                    bFind = true;
                    resolvedChunk = Buffer.from(chunk.slice(0, index + 1));
                    lastOneBuffer = Buffer.from(chunk.slice(index + 1));
                    break;
                  }
                }
                if (!bFind) {
                  lastOneBuffer = Buffer.from(chunk);
                  callback();
                  return;
                }
                let utf8Str;
                if (encoding !== "UTF-8") {
                  utf8Str = iconv.decode(resolvedChunk, encoding);
                } else {
                  utf8Str = resolvedChunk.toString();
                }
                let fileAllColsStr = fileAllCols.toString();
                let retRows = [];
                let lines = utf8Str.split("\n");
                for (let line of lines) {
                  let rowObj = Papa.parse(line, {
                    skipLines: "greedy",
                    delimiter: ",",
                  });
                  if (
                    rowObj.data.length > 0 &&
                    rowObj.data[0].length === fileAllCols.length
                  ) {
                    let row = rowObj.data[0].map((item) =>
                      item
                        .replace(/\"/g, "")
                        .replace(/\'/g, "")
                        .replace(/^\s+|\s+$/g, "")
                    );
                    if (row.toString() !== fileAllColsStr) {
                      retRows.push(row);
                    }
                  }
                }
                if (retRows.length === 0) {
                  callback();
                  return;
                }
                this.push(retRows);
                callback();
              })
            )
            // .pipe(
            //   csv.parse({
            //     trim: true,
            //     headers: fileAllCols,
            //     objectMode: true,
            //     ignoreEmpty: true,
            //     skipLines: skipLines + 1,
            //     strictColumnHandling: true,
            //     renameHeaders: true,
            //   })
            // )
            // .on("error", (error) => console.error(rownum, error))
            .pipe(
              through2.obj(function (rows, enc, callback) {
                let insertValues = [];
                for (let row of rows) {
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
                    .concat(row)
                    .concat(externFieldsValues);
                  // 把fields和realValues合并成一个对象row
                  let tempRow = lodash.zipObject(fields, realValues);
                  let newRowData = importModel.TestingHandle(
                    createFields,
                    tempRow,
                    tablecname,
                    inFlag,
                    outFlag
                  );
                  let values = [];
                  let keys = Object.keys(newRowData);
                  needInsertFields = lodash.union(needInsertFields, keys);
                  for (let field of createFields) {
                    if (keys.includes(field)) {
                      values.push(newRowData[field]);
                    } else {
                      values.push("");
                    }
                  }
                  let insertStr = values.join("\t") + "\n";
                  insertValues.push(insertStr);
                }
                let insertAllStr = insertValues.join("");
                this.push(insertAllStr);

                readSize += 64 * 1024;
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
                  msg: `载入条目序号：${rownum}`,
                });
                callback();
              })
            )
            .pipe(streamFrom)
            .on("finish", () => {
              _this.$electron.ipcRenderer.send("read-one-file-over", {
                fileName,
                sheetName,
                id,
                tableName: createTableName,
                needInsertFields,
                sjlyid,
              });
              resolve("done");
            })
            .on("error", (err) => {
              _this.$electron.ipcRenderer.send("read-one-file-proccess", {
                success: false,
                fileName,
                sheetName,
                secondTitle: "出错了...",
                msg: err,
              });
              reject(err);
            });
        });
      } finally {
        client.release();
      }
    },
    async onCopyTempDataToRealTable(e, args) {
      let { list } = args;
      let chunkCount = 5;
      ////console.log(list);
      let newChunkList = this.$lodash.chunk(list, chunkCount);
      for (let innerList of newChunkList) {
        let promiseArr = [];
        for (let item of innerList) {
          promiseArr.push(
            (async () => {
              await this.copyTempDataToRealTable(item);
            })()
          );
        }
        await Promise.all(promiseArr);
      }
    },
    // 从temp表格导入到真正的数据表
    async copyTempDataToRealTable(args) {
      let _this = this;
      let {
        ajid,
        tableName, // temp表
        tablecname, // 真实表
        matchedMbdm,
        needInsertFields,
        sjlyid,
        id,
      } = args;

      let tempTableName = tableName;
      let targetTableName = tablecname;
      let client = await global.pool.connect();
      let client2 = await global.pool.connect();
      let lastPercentage = 0;
      let index = 0;
      try {
        return await new Promise(async (resolve, rejcect) => {
          await cases.SwitchCase(client, ajid);
          await cases.SwitchCase(client2, ajid);
          let targetTableStruct = await dataImport.showTableStruct(
            ajid,
            targetTableName
          );
          let realTableAllFields = targetTableStruct.rows.map(
            (row) => row.fieldename
          );
          let tempneedInsertFields = [];
          for (let field of needInsertFields) {
            if (realTableAllFields.includes(field)) {
              tempneedInsertFields.push(field);
            }
          }
          needInsertFields = tempneedInsertFields;
          let countSql = `select count(*)::int count from ${tempTableName}`;
          let sumRow = await client.query(countSql);
          sumRow = sumRow.rows[0].count;

          // 创建queryStream
          let sqlSelect = `select ${needInsertFields} from ${tempTableName}`;
          const query = new QueryStream(sqlSelect);
          const stream = client.query(query);

          // 创建copyFrom流
          let copyFromStr = `COPY ${targetTableName}(${needInsertFields}) FROM STDIN`;
          ////console.log(copyFromStr);
          let streamFrom = await client2.query(copyFrom(copyFromStr));
          streamFrom.on("error", (err) => {
            rejcect(err);
          });
          streamFrom.on("finish", async () => {
            log.info("streamFrom.finish");
            // 数据抽取
            await dataImport.extractDataFromTempTable(
              ajid,
              tempTableName,
              matchedMbdm,
              sjlyid
            );
            await dataImport.deleteTempTable(ajid, tempTableName);
            this.$electron.ipcRenderer.send("import-one-table-complete", {
              id,
              success: true,
              msg: "success",
            });
            resolve("done");
          });
          streamFrom.on("drain", () => {
            log.info("streamFrom drain...");
            stream.resume();
          });
          //异步方式读取
          stream
            .pipe(
              through2.obj(function (row, enc, callback) {
                let values = [];
                for (let k in row) {
                  let obj = targetTableStruct.rows.find(
                    (el) => el.fieldename.toLowerCase() === k
                  );
                  if (obj.fieldtype === 1 || obj.fieldtype === 6) {
                    values.push(`${row[k].trim()}`);
                  } else if (obj.fieldtype === 4) {
                    values.push(row[k]);
                  } else {
                    let temValue = row[k].trim() ? row[k].trim() : 0;
                    values.push(`${temValue}`);
                  }
                }
                let valueStr = values.join("\t") + "\n";
                // ////console.log(valueStr);
                this.push(valueStr);
                callback();
              })
            )
            .on("data", (data) => {
              index++;
              let percentage = parseInt(parseFloat(index / sumRow) * 100);
              if (lastPercentage !== percentage) {
                lastPercentage = percentage;
                _this.$electron.ipcRenderer.send("import-one-table-process", {
                  id,
                  percentage,
                  success: true,
                  msg: "success",
                });
              }
              if (!streamFrom.write(data)) {
                stream.pause();
              }
            })
            .on("error", (err) => {
              rejcect(err);
            })
            .on("end", async () => {
              log.info("querystream.end");
              streamFrom.end();
            });
        });
      } catch (e) {
        log.info(e);
        this.$electron.ipcRenderer.send("import-one-table-process", {
          id,
          success: false,
          msg: e.message,
        });
      } finally {
        client.release();
        client2.release();
      }
    },
  },
  async beforeMount() {
    this.softVersion = this.$electron.remote.getGlobal("softVersion");
    // 每个子进程自己一个pool
    global.pool = new Pool(await this.$electron.remote.getGlobal("dbCon"));
  },
  async mounted() {
    this.$electron.ipcRenderer.on("read-all-file", this.onReadAllFile);
    this.$electron.ipcRenderer.on(
      "parse-all-example-file",
      this.onReadExampleFile
    );
    this.$electron.ipcRenderer.on(
      "import-one-table-begin",
      this.onCopyTempDataToRealTable
    );
    this.$electron.ipcRenderer.send("data-collection-open-complete");
  },
  destroyed() {
    log.info("datacollection destroyed.");
  },
};
</script>
