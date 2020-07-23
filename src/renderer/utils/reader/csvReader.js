import fs from "fs";
import parse from "csv-parse";
import path from "path";
const { resolve } = path;

export default {
  // 读取所有的行
  parseFileAllLineSync: async function(filePathName) {
    return new Promise(function(resolve, reject) {
      try {
        let content = fs.readFileSync(filePathName, "utf-8");
        content = content.trimRight();
        let records;
        parse(content, {
          columns: true,
          skip_empty_lines: true,
        })
          .on("readable", function() {
            let record;
            while ((record = this.read())) {
              records.push(record);
            }
          })
          .on("end", function() {
            resolve(records);
          });
      } catch (e) {
        console.log(e);
        reject(null);
      }
    });
  },
  // 根据需要进行读取 ，通过参数linecount进行控制行数
  parseFileExampleSync: async function(filePathName) {
    return new Promise(function(resolve, reject) {
      try {
        let content = fs.readFileSync(filePathName, "utf-8");
        content = content.trimRight();
        let records = [];
        parse(content, {
          to: 3,
          // columns: true,
          skip_empty_lines: true,
        })
          .on("readable", function() {
            let record;
            while ((record = this.read())) {
              records.push(record);
            }
          })
          .on("end", function() {
            let result = {
              fileName: path.basename(filePathName),
              sheetName: path.basename(filePathName),
              colsName: records.length > 0 ? records[0] : [],
              ins1: records.length > 0 ? records[1] : [],
              ins2: records.length > 1 ? records[2] : [],
            };
            resolve(result);
          });
      } catch (e) {
        console.log(e);
        reject(null);
      }
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
