import fs from "fs";
import parse from "csv-parse";
import path from "path";
const { resolve } = path;

export default {
  // 读取所有的行
  parseFileAllSync: async function(filePathName, fileColsName, fileInsertCols) {
    return new Promise(function(resolve, reject) {
      let indexList = [];
      for (let i = 0; i < fileColsName.length; i++) {
        let bfind = fileInsertCols.find((el) => {
          return el === fileColsName[i];
        });
        if (bfind) indexList.push(i);
      }
      let content = fs.readFileSync(filePathName, "utf-8");
      content = content.trimRight();
      let records = [];
      parse(content, {
        // columns: true,
        from_line: 2,
        ltrim: true,
        rtrim: true,
        skip_empty_lines: true,
        skip_lines_with_error: true,
      })
        .on("readable", function() {
          let record;
          while ((record = this.read())) {
            let temp = [];
            for (let index of indexList) {
              temp.push(record[index]);
            }
            records.push(temp);
          }
        })
        .on("end", function() {
          resolve(records);
        });
    });
  },
  // 根据需要进行读取 ，通过参数linecount进行控制行数
  parseFileExampleSync: async function(filePathName) {
    return new Promise(function(resolve, reject) {
      let content = fs.readFileSync(filePathName, "utf-8");
      content = content.trimRight();
      let records = [];
      parse(content, {
        to: 3,
        // columns: true,
        ltrim: true,
        rtrim: true,
        skip_empty_lines: true,
        skip_lines_with_error: true,
      })
        .on("readable", function() {
          let record;
          while ((record = this.read())) {
            records.push(record);
          }
        })
        .on("end", function() {
          let arr = [];
          let result = {
            fileName: path.basename(filePathName),
            sheetName: path.basename(filePathName),
            fileColsName: records.length > 0 ? records[0] : [],
            ins1: records.length > 1 ? records[1] : [],
            ins2: records.length > 2 ? records[2] : [],
          };
          arr.push(result);
          resolve(arr);
        });
    });
  },
  // 获取所有的行数
  getFileLines: async function(filePathName) {
    return new Promise((resolve, reject) => {
      let i;
      let count = 0;
      fs.createReadStream(filePathName)
        .on("data", function(chunk) {
          for (i = 0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
        })
        .on("end", function() {
          resolve(count);
        });
    });
  },
};
