<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showParseBankCardVisible"
    width="30%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe619;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div v-loading="loading" :element-loading-text="loadingText">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="单卡号查询" name="first">
          <div style="text-align: center">
            <el-input
              size="mini"
              v-model="searchCardNo"
              placeholder="请输入查询的卡号"
            ></el-input>
            <div style="font-size: 10px; margin: 5px; text-align: left">
              <b>所属银行：</b>{{ bankName }}
            </div>
            <div style="font-size: 10px; text-align: left; margin: 5px">
              <b>所属区域：</b>{{ bankLocation }}
            </div>
            <el-button
              type="primary"
              size="mini"
              style="width: 60%; margin-top: 10px"
              @click="handleClickSerachOne"
              >开始查询</el-button
            >
          </div>
        </el-tab-pane>
        <el-tab-pane label="批量卡号解析" name="second">
          <div class="content" style="text-align: center">
            <el-button
              size="mini"
              type="primary"
              style="width: 60%"
              @click="handleClickImportFile"
              >选择文件并导入，仅支持csv格式</el-button
            >
            <div v-if="fileAllCols.length > 0" style="margin-top: 20px">
              <div style="font-size: 10px; margin: 5px">
                <b>解析的文件名：</b>{{ parsedFileName }}
              </div>

              <span style="font-size: 10px; margin: 5px"
                ><b>请选择需要解析的列名</b></span
              >
              <el-select
                size="mini"
                v-model="selectedParsedCol"
                placeholder="请选择"
              >
                <el-option
                  v-for="(item, index) in fileAllCols"
                  :key="item + index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
              <div
                style="font-size: 10px; margin: 5px"
                v-if="selectedParsedCol !== ''"
              >
                <b>输出的文件路径：</b>{{ outputFilePathName }}
              </div>
              <div v-if="selectedParsedCol !== ''">
                <el-button
                  size="mini"
                  style="margin-top: 10px; width: 60%"
                  type="primary"
                  @click="handleClickParseNow"
                >
                  开始解析
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div style="text-align: center">
      <el-progress v-if="percentage > 0" :percentage="percentage"></el-progress>
    </div>
    <div
      style="
        text-align: center;
        color: green;
        font-size: 10px;
        margin-top: 20px;
      "
    >
      本程序使用第三方网站进行解析, 特此鸣谢&nbsp;&nbsp;!
      <!-- <el-button
        type="text"
        style="font-size: 10px"
        @click="handleClickJump('http://www.guabu.com/')"
        >卦卜网
      </el-button> -->
    </div>
  </el-dialog>
</template>

<script>
import { remote } from "electron";
import { mapState } from "vuex";
const cheerio = require("cheerio");
import Papa from "papaparse";
const csv = require("@fast-csv/parse");
const iconv = require("iconv-lite");
import fs from "fs";
import path from "path";
const jschardet = require("jschardet");
const through2 = require("through2");
export default {
  computed: {
    ...mapState("CaseDetail", ["caseBase", "batchCount"]),
    ...mapState("DialogPopWnd", ["showParseBankCardVisible"]),
  },
  data() {
    return {
      title: "银行卡归属地解析",
      fileAllCols: [],
      selectedParsedCol: "",
      parsedFileName: "",
      parsedFilePathName: "",
      outputFilePathName: "",
      loading: false,
      loadingText: "银行卡信息解析中， 请稍后...",
      percentage: 0,
      activeName: "first",
      searchCardNo: "",
      bankName: "",
      bankLocation: "",
      stopSearchThread: false,
    };
  },
  methods: {
    async handleClickSerachOne() {
      if (this.searchCardNo.trim().length === 0) {
        this.$message.error({
          message: "输入的卡号为空，必须为16-19位。",
        });
        return;
      }
      if (this.searchCardNo.length >= 16 && this.searchCardNo.length <= 19) {
        try {
          this.loading = true;
          let requestParamString =
            process.env.NODE_ENV === "development"
              ? `/bank/?cardid=${this.searchCardNo}`
              : `http://www.guabu.com/bank/?cardid=${this.searchCardNo}`;
          let ret = await await this.$axios.get(requestParamString);
          const $ = cheerio.load(ret.data);
          let cardLocation = $(
            "#mainleft > table > tbody > tr:nth-child(3) > td:nth-child(2)"
          ).text();
          let cardBelongsTo = $(
            "#mainleft > table > tbody > tr:nth-child(4) > td:nth-child(2)"
          ).text();
          this.bankName = cardBelongsTo.trim();
          this.bankLocation = cardLocation.trim();
          this.loading = false;
        } catch (e) {
          this.$message.error({
            message: e.message,
          });
          this.loading = false;
        }
      } else {
        this.$message.error({
          message: "输入的卡号长度错误，必须为16-19位.",
        });
      }
    },
    async getHttpResource(requstStr) {
      return new Promise((resolve, reject) => {
        this.$jsonp(requstStr)
          .then((json) => {
            console.log(json);
            resolve(json);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      });
    },
    async handleClickParseNow() {
      this.loading = true;
      this.percentage = 0;
      await this.parseCsvFile(
        this.parsedFilePathName,
        this.outputFilePathName,
        this.selectedParsedCol,
        this.fileAllCols
      );
      this.$message({
        type: "success",
        message: "解析完成，输出路径为：" + this.outputFilePathName,
      });
      this.loading = false;
      this.percentage = 0;
      await this.$electron.shell.openPath(this.outputFilePathName);
      try {
      } catch (e) {
        this.loading = false;
        this.$message.error({
          message: e.message,
        });
      }
    },
    async parseCsvFile(
      filePathName,
      outputFilePath,
      matchedFileCol,
      fileAllCols
    ) {
      let _this = this;
      let encoding = await this.getFileEncoding(filePathName);
      try {
        return await new Promise(async function (resolve, reject) {
          let allCardNoList = [];
          let stats = fs.statSync(filePathName);
          let rownum = 0;
          let everySize = 1024 * 2;
          let readSize = 0;
          let fileSize = stats.size;
          let colIndex = fileAllCols.findIndex(
            (item) => item === matchedFileCol
          );
          console.log({ colIndex });
          fileAllCols = fileAllCols.concat(["所属银行", "卡片归属地"]);
          console.log(fileAllCols);
          let lastOneBuffer = Buffer.from([]); // \n 后面的部分buffer
          let writeFileStream = fs.createWriteStream(outputFilePath);
          writeFileStream.write(fileAllCols.join(",") + "\n");
          let readFileStream = fs.createReadStream(filePathName, {
            highWaterMark: everySize,
          });
          readFileStream
            .pipe(
              through2(
                { objectMode: true },
                async function (chunk, enc, callback) {
                  if (_this.stopSearchThread) {
                    readFileStream.destroy();
                    return;
                  }
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
                  let retRows = [];
                  let lines = utf8Str.split("\n");
                  let promiseArr = [];

                  for (let line of lines) {
                    let rowObj = Papa.parse(line, {
                      skipEmptyLines: "greedy",
                      delimiter: ",",
                    });
                    if (rowObj.data.length > 0) {
                      let row = rowObj.data[0].map((item) =>
                        item
                          .replace(/\"/g, "")
                          .replace(/\'/g, "")
                          .replace(/^\s+|\s+$/g, "")
                      );
                      let cardNo = row[colIndex];
                      if (
                        cardNo.length >= 16 &&
                        cardNo.length <= 19 &&
                        !allCardNoList.includes(cardNo)
                      ) {
                        allCardNoList.push(cardNo);
                        promiseArr.push(
                          (async function () {
                            let requestParam =
                              process.env.NODE_ENV === "development"
                                ? `/bank/?cardid=${cardNo}`
                                : `http://www.guabu.com/bank/?cardid=${cardNo}`;
                            let ret = await _this.$axios.get(requestParam);
                            const $ = cheerio.load(ret.data);
                            let cardNumber = $(
                              "#mainleft > table > tbody > tr:nth-child(2) > td:nth-child(2)"
                            ).text();
                            let cardLocation = $(
                              "#mainleft > table > tbody > tr:nth-child(3) > td:nth-child(2)"
                            ).text();
                            let cardBelongsTo = $(
                              "#mainleft > table > tbody > tr:nth-child(4) > td:nth-child(2)"
                            ).text();
                            if (
                              cardBelongsTo.length > 3 ||
                              cardLocation.length > 3
                            ) {
                              row = row.concat([cardBelongsTo, cardLocation]);
                              retRows.push(row);
                            }
                          })().catch((err) => {
                            console.log(err);
                          })
                        );
                      }
                    }
                  }
                  await Promise.all(promiseArr);
                  if (retRows.length === 0) {
                    callback();
                    return;
                  }
                  this.push(retRows);
                  callback();
                }
              )
            )
            .pipe(
              through2.obj(function (rows, enc, callback) {
                let insertValues = [];
                for (let row of rows) {
                  let insertStr = row.join(", ") + "\n";
                  insertValues.push(insertStr);
                }
                let insertAllStr = insertValues.join("");
                this.push(insertAllStr);
                readSize += everySize;
                let percentage = parseInt(
                  parseFloat(readSize / fileSize) * 100
                );
                _this.percentage = percentage;
                callback();
              })
            )
            .pipe(writeFileStream)
            .on("finish", () => {
              resolve("done");
            })
            .on("error", (err) => {
              reject(err);
            });
        });
      } finally {
      }
    },
    async handleClickImportFile() {
      let _this = this;
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据导入",
          buttonLabel: "打开",
          filters: [
            {
              name: "Support Files",
              extensions: ["csv"],
            },
          ],
        }
      );
      if (typeof filePathList !== "undefined") {
        try {
          let ret = await this.parseExampleCsvFile(filePathList[0]);
          if (ret.length == 0) {
            this.$message.error({
              message: "无法解析当前csv文件",
            });
            return;
          }
          this.$message({
            type: "success",
            message: "文件解析成功",
          });
          console.log(ret[0]);
          this.parsedFilePathName = filePathList[0];
          this.outputFilePathName = filePathList[0] + ".out.csv";
          this.parsedFileName = path.basename(filePathList[0]);
          this.fileAllCols = ret[0].fileAllCols;
        } catch (e) {
          this.$message.error({
            message: e.message,
          });
        }
      }
    },
    handleClickJump(url) {
      this.$electron.shell.openExternal(url);
    },
    handleClose() {
      this.stopSearchThread = true;
      this.$store.commit("DialogPopWnd/SET_SHOWPARSEBANKCARDVISIBLE", false);
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
    async parseExampleCsvFile(filePathName) {
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
  },
};
</script>