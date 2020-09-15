// import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import excel from "exceljs";
import moment from "moment";

export default {
  parseFileExampleSync: async function(filePathName) {
    const workbook = new excel.Workbook();
    workbook.calcProperties.fullCalcOnLoad = true;
    let resultList = [];
    let actualRowCount = 0;
    await workbook.xlsx.read(fs.createReadStream(filePathName));
    workbook.eachSheet(function(worksheet, id) {
      let rows = [];
      let count = 0;
      actualRowCount = worksheet.actualRowCount;
      worksheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
        if (count >= 3) return;
        row = row.values.filter((el, index) => index !== 0);
        for (let index = 0; index < row.length; index++) {
          if (row[index] instanceof Date) {
            let cellDate = new Date(row[index]);
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
              row[index] = `${hour}:${minute}:${sec}`;
            } else {
              row[index] = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
            }
          }
        }
        rows.push(row);
        count++;
      });

      if (rows.length === 0) {
        return [];
      }
      let result = {
        fileName: path.basename(filePathName),
        sheetName: worksheet.name,
        fileColsName: rows.length > 0 ? rows[0] : [],
        ins1: rows.length > 1 ? rows[1] : [],
        ins2: rows.length > 2 ? rows[2] : [],
        sheetId: worksheet.id,
      };
      resultList.push(result);
    });
    return resultList;
  },
  parseFileAllSync: async function(
    filePathName,
    sheetName,
    matchedfields,
    fileColsName,
    fileInsertCols
  ) {
    let indexList = [];
    for (let i = 0; i < fileColsName.length; i++) {
      let bfind = fileInsertCols.find((el) => {
        return el === fileColsName[i];
      });
      if (bfind) indexList.push(i + 1);
    }
    const workbook = new excel.Workbook();
    let rows = [];
    await workbook.xlsx.read(fs.createReadStream(filePathName));
    workbook.eachSheet(function(worksheet, id) {
      if (worksheet.name === sheetName) {
        let rowCount = worksheet.rowCount;
        let isFirstRow = true;
        worksheet.eachRow(function(row, rowNumber) {
          if (isFirstRow) {
            isFirstRow = false;
            return;
          }
          row = row.values.filter((el, index) => indexList.includes(index));
          for (let index = 0; index < row.length; index++) {
            if (row[index] instanceof Date) {
              let cellDate = new Date(row[index]);
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
                row[index] = `${hour}:${minute}:${sec}`;
              } else {
                row[index] = `${year}-${month}-${day} ${hour}:${minute}:${sec}`;
              }
            } else {
              row[index] = String(row[index]).trim();
            }
          }
          rows.push(row);
        });
      }
    });
    return rows.slice(1);
  },
  // parseFileExampleSync2: function(filePathName) {
  //   let book = xlsx.readFileSync(filePathName, { sheetRows: 3 }); // 每个sheet只要三条数据
  //   let resultList = [];
  //   //循环工作表中的每个 sheet 页
  //   book.SheetNames.forEach(function(name) {
  //     //拿到当前 sheet 页对象
  //     let sheet = book.Sheets[name];
  //     log.info(sheet);
  //     //得到当前页内数据范围
  //     let range = xlsx.utils.decode_range(sheet["!ref"]);
  //     log.info(range);
  //     //保存数据范围数据
  //     let row_start = range.s.r;
  //     let row_end = range.e.r;
  //     let col_start = range.s.c;
  //     let col_end = range.e.c;
  //     let rows = [];
  //     //按行对 sheet 内的数据循环
  //     for (; row_start <= row_end; row_start++) {
  //       let row_data = [];
  //       //读取当前行里面各个列的数据
  //       for (let i = col_start; i <= col_end; i++) {
  //         var cell_address = { c: i, r: row_start };
  //         /* if an A1-style address is needed, encode the address */
  //         var addr = xlsx.utils.encode_cell(cell_address);
  //         log.info(addr);
  //         // let addr =
  //         //   xlsx.utils.encode_col(i) + xlsx.utils.encode_row(row_start);
  //         let cell = sheet[addr];

  //         //如果是链接，保存为对象，其它格式直接保存原始值
  //         if (cell.l) {
  //           row_data.push({ text: cell.v, link: cell.l.Target });
  //         } else {
  //           let newValue = String(cell.v).trimRight();
  //           row_data.push(newValue);
  //         }
  //       }
  //       log.info(row_data);
  //       rows.push(row_data);
  //     }
  //     //保存当前页内的数据
  //     let result = {
  //       fileName: path.basename(filePathName),
  //       sheetName: name,
  //       fileColsName: rows.length > 0 ? rows[0] : [],
  //       ins1: rows.length > 1 ? rows[1] : [],
  //       ins2: rows.length > 2 ? rows[2] : [],
  //     };
  //     resultList.push(result);
  //   });
  //   log.info(resultList);
  //   return resultList;
  // },

  // parseFileAllSync2: function(
  //   filePathName,
  //   sheetName,
  //   fileColsName,
  //   fileInsertCols
  // ) {
  //   log.info(filePathName, sheetName);
  //   let book = xlsx.readFileSync(filePathName, { sheets: sheetName });
  //   let result = {};
  //   //拿到当前 sheet 页对象
  //   let sheet = book.Sheets[sheetName];
  //   // let json = xlsx.utils.sheet_to_json(sheet);
  //   // return json;
  //   //得到当前页内数据范围
  //   let range = xlsx.utils.decode_range(sheet["!ref"]);
  //   //保存数据范围数据
  //   let row_start = range.s.r + 1; // 第一行为列名称行
  //   let row_end = range.e.r;
  //   let col_start = range.s.c;
  //   let col_end = range.e.c;
  //   let rows = [];
  //   //按行对 sheet 内的数据循环
  //   for (; row_start <= row_end; row_start++) {
  //     let row_data = [];
  //     //读取当前行里面各个列的数据
  //     for (let i = col_start; i <= col_end; i++) {
  //       var cell_address = { c: i, r: row_start };
  //       /* if an A1-style address is needed, encode the address */
  //       var addr = xlsx.utils.encode_cell(cell_address);
  //       // let addr = xlsx.utils.encode_col(i) + xlsx.utils.encode_row(row_start);
  //       let cell = sheet[addr];
  //       //如果是链接，保存为对象，其它格式直接保存原始值
  //       if (cell.l) {
  //         row_data.push({ text: cell.v, link: cell.l.Target });
  //       } else {
  //         let colName = fileColsName[i];
  //         let bfind = fileInsertCols.find((el) => {
  //           return el === colName;
  //         });
  //         if (bfind) {
  //           let value = String(cell.v).trimRight();
  //           row_data.push(value);
  //         }
  //       }
  //     }
  //     rows.push(row_data);
  //   }
  //   //保存当前页内的数据
  //   return rows;
  // },
};
