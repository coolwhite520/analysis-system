import xlsx from "xlsx";
import path from "path";

export default {
  parseFileExampleSync: function(filePathName) {
    let book = xlsx.readFileSync(filePathName, { sheetRows: 3 }); // 每个sheet只要三条数据
    let resultList = [];
    //循环工作表中的每个 sheet 页
    book.SheetNames.forEach(function(name) {
      //拿到当前 sheet 页对象
      let sheet = book.Sheets[name];
      //得到当前页内数据范围
      let range = xlsx.utils.decode_range(sheet["!ref"]);
      console.log(range);
      //保存数据范围数据
      let row_start = range.s.r;
      let row_end = range.e.r;
      let col_start = range.s.c;
      let col_end = range.e.c;
      let rows = [];
      //按行对 sheet 内的数据循环
      for (; row_start <= row_end; row_start++) {
        let row_data = [];
        //读取当前行里面各个列的数据
        for (let i = col_start; i <= col_end; i++) {
          let addr =
            xlsx.utils.encode_col(i) + xlsx.utils.encode_row(row_start);
          let cell = sheet[addr];
          //如果是链接，保存为对象，其它格式直接保存原始值
          if (cell.l) {
            row_data.push({ text: cell.v, link: cell.l.Target });
          } else {
            let newValue = String(cell.v).trimRight();
            row_data.push(newValue);
          }
        }
        rows.push(row_data);
      }
      //保存当前页内的数据
      let result = {
        fileName: path.basename(filePathName),
        sheetName: name,
        fileColsName: rows.length > 0 ? rows[0] : [],
        ins1: rows.length > 1 ? rows[1] : [],
        ins2: rows.length > 2 ? rows[2] : [],
      };
      resultList.push(result);
    });
    return resultList;
  },

  parseFileAllSync: function(
    filePathName,
    sheetName,
    fileColsName,
    fileInsertCols
  ) {
    console.log(filePathName, sheetName);
    let book = xlsx.readFileSync(filePathName, { sheets: sheetName });
    let result = {};
    //拿到当前 sheet 页对象
    let sheet = book.Sheets[sheetName];
    // let json = xlsx.utils.sheet_to_json(sheet);
    // return json;
    //得到当前页内数据范围
    let range = xlsx.utils.decode_range(sheet["!ref"]);
    //保存数据范围数据
    let row_start = range.s.r + 1; // 第一行为列名称行
    let row_end = range.e.r;
    let col_start = range.s.c;
    let col_end = range.e.c;
    let rows = [];
    //按行对 sheet 内的数据循环
    for (; row_start <= row_end; row_start++) {
      let row_data = [];
      //读取当前行里面各个列的数据
      for (let i = col_start; i <= col_end; i++) {
        let addr = xlsx.utils.encode_col(i) + xlsx.utils.encode_row(row_start);
        let cell = sheet[addr];
        if (typeof cell === "undefined") {
          continue;
        }
        //如果是链接，保存为对象，其它格式直接保存原始值
        if (cell.l) {
          row_data.push({ text: cell.v, link: cell.l.Target });
        } else {
          let colName = fileColsName[i];
          let bfind = fileInsertCols.find((el) => {
            return el === colName;
          });
          if (bfind) {
            let value = String(cell.v).trimRight();
            row_data.push(value);
          }
        }
      }
      rows.push(row_data);
    }
    //保存当前页内的数据
    return rows;
  },
};
