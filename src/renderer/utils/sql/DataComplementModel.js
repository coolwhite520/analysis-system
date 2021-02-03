import Default from "./Default";
import Base from "../../db/Base";
import cases from "../../db/Cases";
import { cat } from "shelljs";
const _ = require("lodash");
const Query = require("pg").Query;

function SimpleAccountModel() {
  this.Zzhm = "";
  this.Khyh = "";
  this.Zhmc = "";
  this.bool_0 = false;
  this.get_IsHandUpdate = function() {
    if (
      this.IsKHYHHandUpdate() ||
      this.IsZZHMHandUpdate() ||
      this.IsZZMCHandUpdate()
    ) {
      this.bool_0 = true;
    }

    return this.bool_0;
  };
  this.set_IsHandUpdate = function(value) {
    this.bool_0 = value;
  };
  this.IsZZMCHandUpdate = function() {
    return this.ZhmcList.length > 1 && this.Zhmc != this.ZhmcList[0];
  };
  this.IsKHYHHandUpdate = function() {
    return this.KhyhList.length > 1 && this.Khyh != this.KhyhList[0];
  };
  this.IsZZHMHandUpdate = function() {
    return this.ZzhmList.length > 1 && this.Zzhm != this.ZzhmList[0];
  };
  this.Zh; //this.string_0;
  this.ZhmcColor = false; //this.bool_4;
  this.ZhmcIsenable = false; //this.bool_5;
  this.KhyhIsenable = false; //this.bool_6;
  this.KhyhcColor = false; //this.bool_7;
  this.ZzhmColor = false; //this.bool_8;
  this.ZzhmIsenable = false; //this.bool_9;
  this.IsChecked = true; //this.bool_10;
  this.ZzhmList = [];
  this.set_ZzhmList = function(value) {
    this.ZzhmList = value;
    if (this.ZzhmList != null && this.ZzhmList != undefined) {
      if (this.ZzhmList.length == 0) {
        this.ZzhmIsenable = false;
        return;
      }
      this.Zzhm = this.ZzhmList[0];
      if (this.ZzhmList.length > 1) {
        this.ZzhmIsenable = true;
        return;
      }
    }
    this.ZzhmIsenable = false;
  };
  this.get_ZzhmSelected = function() {
    return this.Zzhm;
  };
  this.set_ZzhmSelected = function(value) {
    this.Zzhm = value;
  };
  this.KhyhList = [];
  this.set_KhyhList = function(value) {
    this.KhyhList = value;
    if (this.KhyhList != null && this.KhyhList != undefined) {
      if (this.KhyhList.length == 0) {
        this.KhyhIsenable = false;
        return;
      }
      this.Khyh = this.KhyhList[0];
      if (this.KhyhList.length > 1) {
        this.KhyhIsenable = true;
        return;
      }
    }
    this.KhyhIsenable = false;
  };
  this.get_KhyhSelected = function() {
    return this.Khyh;
  };
  this.set_KhyhSelected = function(value) {
    this.Khyh = value;
    // this.IsKHYHHandUpdate = true;
  };
  this.ZhmcList = [];
  this.set_ZhmcList = function(value) {
    this.ZhmcList = value;
    if (this.ZhmcList != undefined && this.ZhmcList != null) {
      if (this.ZhmcList.length == 0) {
        this.ZhmcIsenable = false;
        return;
      }
      this.Zhmc = this.ZhmcList[0];
      if (this.ZhmcList.length > 1) {
        this.ZhmcIsenable = true;
        return;
      }
    }
    this.ZhmcIsenable = false;
  };
  this.get_ZhmcSelected = function() {
    return this.Zhmc;
  };
  this.set_ZhmcSelected = function(value) {
    this.Zhmc = value;
    //this.IsZZMCHandUpdate = true;
  };
  this.ShardId;
  this.IsRecord;
  this.RowNum;
  this.int_1 = 0;
  this.get_RankNum = function() {
    if (this.ZhmcColor || this.ZzhmColor || this.KhyhcColor) {
      this.int_1++;
      if (this.ZhmcList != undefined && this.ZhmcList != null) {
        this.int_1 += this.ZhmcList.length <= 1 ? 1 : this.ZhmcList.length;
      }
      if (this.ZzhmList != undefined && this.ZzhmList != null) {
        this.int_1 += this.ZzhmList.length <= 1 ? 1 : this.ZzhmList.length;
      }
      if (this.KhyhList != undefined && this.KhyhList != null) {
        this.int_1 += this.KhyhList.length <= 1 ? 1 : this.KhyhList.length;
      }
    }
    return this.int_1;
  };
  this.set_RankNum = function(value) {
    this.int_1 = value;
  };
}

function DataSupplementWinModel(ajid) {
  this.ajid = ajid;
  this.string_0 = "";
  this.string_1 = "";
  this.notCheckedList = [];
  this.CheckedList = [];
  this.bool_2 = true;
  this.bool_4 = true;
  this.string_2 = "数据加载中...";
  this.bool_5 = true;
  this.string_3 = "*";
  this.string_4 = "*";
  this.bool_6 = true;
  this.dictionary_1 = {};
  this.bool_0 = false;
  this.bool_1 = false;
  this.bool_3 = false;
  this.dictionary_0 = {};
  this.dictionary_2 = {};
  this.AccountModelscan = [];
  this.InilaizeDataState = function() {
    this.bool_0 = false;
    this.bool_1 = false;
    this.notCheckedList = [];
    this.CheckedList = [];
    this.bool_2 = true;
    this.bool_3 = false;
    this.dictionary_1 = {};
  };

  this.GetMasterData = async function() {
    this.bool_4 = true;
    await this.Initalize();
    //for(let item of this.AccountModelscan){
    //    console.log(item.Zh,item.ZhmcList,item.KhyhList,item.ZzhmList )
    //}
    return this.AccountModelscan;
  };
  this.createTableIndex = async function() {
    const client = await global.pool.connect();
    try {
      // 创建索引
      await cases.SwitchCase(client, this.ajid);
      let sqlIndexCreate = `CREATE INDEX search_fast_index
      ON gas_bank_records (cxkh, jydfzkh);`;
      await client.query(sqlIndexCreate);
    } catch (e) {
      console.log(e.message);
    } finally {
      client.release();
    }
  };
  this.GetAllData = async function() {
    this.bool_4 = false;
    await this.Initalize();
    return this.AccountModelscan;
  };
  this.Initalize = async function() {
    console.log("Initalize");
    await this.createTableIndex();
    this.InilaizeDataState();
    this.bool_1 = true;
    await this.RefreashUIDatasCan_DoWork();
  };
  this.RefreashUIDatasCan_DoWork = async function() {
    console.log("RefreashUIDatasCan_DoWork");
    this.bool_1 = true;
    await this.method_2();
    this.bool_1 = false;
  };
  this.method_2 = async function() {
    console.log("method_2");
    await this.method_7();
  };
  this.GetAllEmptyRowCount = async function() {
    let num = 0;
    let sql = `SELECT COUNT
    ( shard_id ) 
  FROM
    (
    SELECT
      shard_id 
    FROM
      (
      SELECT
        shard_id,
        jydfzkh zh,
        jydfmc zhmc,
        jydfzhkhh khyh,
        jydfzjhm zzhm 
      FROM
        gas_bank_records 
      WHERE
        jydfzkh IS NOT NULL 
        AND jydfzkh != '' 
        AND ( ( jydfmc IS NULL OR jydfmc = '' ) OR ( jydfzhkhh IS NULL OR jydfzhkhh = '' ) OR ( jydfzjhm IS NULL OR jydfzjhm = '' ) ) 
        AND ajid = ${this.ajid} UNION ALL
      SELECT
        shard_id,
        cxkh zh,
        jymc zhmc,
        JYKHH khyh,
        jyzjhm zzhm 
      FROM
        gas_bank_records 
      WHERE
        cxkh IS NOT NULL 
        AND cxkh != '' 
        AND ( ( jymc IS NULL OR jymc = '' ) OR ( JYKHH IS NULL OR JYKHH = '' ) OR ( jyzjhm IS NULL OR jyzjhm = '' ) ) 
        AND ajid = ${this.ajid}
      ) A 
    GROUP BY
    shard_id 
    ) B`;
    console.log(sql);
    let res = await Base.QueryCustom(sql, this.ajid);
    if (!Default.IsNullOrEmpty(res) && res.rows.length > 0) {
      let count = parseInt(res.rows[0].count);
      return isNaN(count) ? 0 : count;
    }
    return 0;
  };
  this.GetCanSuppleentRowCount = async function(ismasterdata = false) {
    let num = 0;
    let arg = "";
    if (!ismasterdata) {
      arg = `SELECT
      shard_id,
      jydfzkh zh,
      jydfmc zhmc,
      jydfzhkhh khyh,
      jydfzjhm zzhm 
    FROM
      gas_bank_records 
    WHERE
      jydfzkh IS NOT NULL 
      AND jydfzkh != '' 
      AND ( ( jydfmc IS NULL OR jydfmc = '' ) OR ( jydfzhkhh IS NULL OR jydfzhkhh = '' ) OR ( jydfzjhm IS NULL OR jydfzjhm = '' ) ) 
      AND ajid = ${this.ajid} UNION ALL`;
    }
    let sql = `SELECT COUNT
    ( shard_id ) 
  FROM
     (
    SELECT A.shard_id 
    FROM
       (
         ${arg}
        SELECT shard_id,
        cxkh zh,
        jymc zhmc,
        JYKHH khyh,
        jyzjhm zzhm 
      FROM
        gas_bank_records 
      WHERE
         cxkh IS NOT NULL 
        AND cxkh != '' 
        AND ( ( jymc IS NULL OR jymc = '' ) OR ( JYKHH IS NULL OR JYKHH = '' ) OR ( jyzjhm IS NULL OR jyzjhm = '' ) )  AND ajid = ${this.ajid}
      )
      A INNER JOIN gas_account_info B   ON A.zh = B.kh 
    WHERE
      B.ajid = ${this.ajid} 
      AND  (
         (
          ( A.zhmc IS NULL OR TRIM ( BOTH '\t ' FROM A.zhmc ) = '' ) 
          AND ( B.zhkhmc IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhmc ) != '' ) 
          )  or (
          ( A.khyh IS NULL OR TRIM ( BOTH '\t ' FROM A.khyh ) = '' ) 
          AND ( B.zhkhyh IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhyh ) != '' ) 
          )  or (
          ( A.zzhm IS NULL OR TRIM ( BOTH '\t ' FROM A.zzhm ) = '' ) 
          AND ( B.khrzjhm IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.khrzjhm ) != '' ) 
        ) 
      ) 
    GROUP BY
    A.shard_id 
    ) C ;`;

    let res = await Base.QueryCustom(sql, this.ajid);
    if (!Default.IsNullOrEmpty(res) && res.rows.length > 0) {
      let count = parseInt(res.rows[0].count);
      return isNaN(count) ? 0 : count;
    }
  };

  this.GetSupplementAll = async function() {
    let client = await global.pool.connect();
    try {
      return await new Promise(async (resolve, reject) => {
        let sql = this.GetSupplementAllSql(this.bool_4);
        let AccountModelscan1 = [];
        client = await cases.SwitchCase(client, this.ajid);
        const query = new Query(sql);
        client.query(query);
        query.on("row", (dataRow) => {
          let simpleAccountModel = new SimpleAccountModel();
          simpleAccountModel.Zh = Default.IsNullOrEmpty(dataRow["zh"])
            ? ""
            : dataRow["zh"];
          simpleAccountModel.Zhmc = Default.IsNullOrEmpty(dataRow["zhmc"])
            ? ""
            : dataRow["zhmc"];
          simpleAccountModel.Khyh = Default.IsNullOrEmpty(dataRow["khyh"])
            ? ""
            : dataRow["khyh"];
          simpleAccountModel.Zzhm = Default.IsNullOrEmpty(dataRow["zzhm"])
            ? ""
            : dataRow["zzhm"];
          if (this.dictionary_0.hasOwnProperty(simpleAccountModel.Zh)) {
            let flag = false;
            if (this.dictionary_1.hasOwnProperty(simpleAccountModel.Zh)) {
              flag = true;
            }
            if (Default.IsNullOrEmpty(simpleAccountModel.Zhmc)) {
              let list = this.dictionary_0[simpleAccountModel.Zh][0];
              if (list.length > 0 && !flag) {
                simpleAccountModel.ZhmcColor = true;
                if (!Default.IsNullOrEmpty(list[list.length - 1])) {
                  list.push("");
                }
              }
              simpleAccountModel.set_ZhmcList(list);
            } else {
              simpleAccountModel.ZhmcColor = false;
            }
            if (Default.IsNullOrEmpty(simpleAccountModel.Khyh)) {
              let list2 = this.dictionary_0[simpleAccountModel.Zh][1];
              if (list2.length > 0 && !flag) {
                simpleAccountModel.KhyhcColor = true;
                if (!Default.IsNullOrEmpty(list2[list2.length - 1])) {
                  list2.push("");
                }
              }
              simpleAccountModel.set_KhyhList(list2);
            } else {
              simpleAccountModel.KhyhcColor = false;
            }
            if (Default.IsNullOrEmpty(simpleAccountModel.Zzhm)) {
              let list3 = this.dictionary_0[simpleAccountModel.Zh][2];
              if (list3.length > 0 && !flag) {
                simpleAccountModel.ZzhmColor = true;
                if (!Default.IsNullOrEmpty(list3[list3.length - 1])) {
                  list3.push("");
                }
              }
              simpleAccountModel.set_ZzhmList(list3);
            } else {
              simpleAccountModel.ZzhmColor = false;
            }
          } else {
            let list4 = [];
            let list5 = [];
            let list6 = [];
            let array = [];
            this.AddStr(list4, simpleAccountModel.Zhmc);
            this.AddStr(list5, simpleAccountModel.Khyh);
            this.AddStr(list6, simpleAccountModel.Zzhm);
            array[0] = list4;
            array[1] = list5;
            array[2] = list6;
            this.dictionary_1[simpleAccountModel.Zh] = true;
            this.dictionary_0[simpleAccountModel.Zh] = array;
            simpleAccountModel.ZhmcList = this.dictionary_0[
              simpleAccountModel.Zh
            ][0];
            simpleAccountModel.KhyhList = this.dictionary_0[
              simpleAccountModel.Zh
            ][1];
            simpleAccountModel.ZzhmList = this.dictionary_0[
              simpleAccountModel.Zh
            ][2];
          }
          simpleAccountModel.set_RankNum(simpleAccountModel.get_RankNum());
          AccountModelscan1.push(simpleAccountModel);
        });

        query.on("end", () => {
          AccountModelscan1.sort(function(a, b) {
            return b.int_1 - a.int_1;
          });
          this.AccountModelscan = AccountModelscan1;
          console.log("query done");
          resolve("end");
        });
        query.on("error", (err) => {
          console.error(err);
          reject(err);
        });
      });
    } catch (e) {
      console.log(e);
    } finally {
      client.release();
    }
  };
  this.method_7 = async function() {
    try {
      await this.GetCanData();
      await this.GetSupplementAll();
    } catch (e) {
      console.log(e);
    }
  };
  this.GetSupplementAllSql = function(isgetmasterdata = false) {
    let arg = "";
    let arg2 = "";
    if (!isgetmasterdata) {
      arg = `SELECT
      jydfzkh zh,
      COALESCE ( jydfmc, '' ) zhmc,
      COALESCE ( jydfzhkhh, '' ) khyh,
      COALESCE ( jydfzjhm, '' ) zzhm,
      '0' jydd  
    FROM
       gas_bank_records  
    WHERE
       jydfzkh IS NOT NULL 
      AND jydfzkh != '' 
      AND ( ( jydfmc IS NULL OR jydfmc = '' ) OR ( jydfzhkhh IS NULL OR jydfzhkhh = '' ) OR ( jydfzjhm IS NULL OR jydfzjhm = '' ) )  
      AND  ajid = ${this.ajid} UNION `;
      arg2 = `SELECT
      jydfzkh zh,
      COALESCE ( jydfmc, '' ) zhmc,
      COALESCE ( jydfzhkhh, '' ) khyh,
      COALESCE ( jydfzjhm, '' ) zzhm,
      '0' jydd  
    FROM
       gas_bank_records 
    WHERE
      jydfzkh IS NOT NULL 
      AND jydfzkh != '' 
      AND ( ( jydfmc IS NULL OR jydfmc = '' ) OR ( jydfzhkhh IS NULL OR jydfzhkhh = '' ) OR ( jydfzjhm IS NULL OR jydfzjhm = '' ) )  
      AND  ajid = ${this.ajid}  UNION `;
    }
    let sql = `SELECT
    * 
  FROM
    (
    SELECT
      * 
    FROM
      (
      SELECT A
        .zh,
        A.zhmc,
        A.khyh,
        A.zzhm,
        jydd 
      FROM
        (
          ${arg} 
          SELECT
          cxkh zh,
          COALESCE ( jymc, '' ) zhmc,
          COALESCE ( JYKHH, '' ) khyh,
          COALESCE ( jyzjhm, '' ) zzhm,
          '1' jydd 
        FROM
          gas_bank_records 
        WHERE
          cxkh IS NOT NULL 
          AND cxkh != '' 
          AND ( ( jymc IS NULL OR jymc = '' ) OR ( JYKHH IS NULL OR JYKHH = '' ) OR ( jyzjhm IS NULL OR jyzjhm = '' ) ) 
          AND ajid = ${this.ajid}
        )
        A INNER JOIN gas_account_info B ON A.zh = B.kh 
      WHERE
        B.ajid = ${this.ajid}
        AND (
          (
            ( A.zhmc IS NULL OR TRIM ( BOTH '\t ' FROM A.zhmc ) = '' ) 
            AND ( B.zhkhmc IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhmc ) != '' ) 
          ) 
          OR (
            ( A.khyh IS NULL OR TRIM ( BOTH '\t ' FROM A.khyh ) = '' ) 
            AND ( B.zhkhyh IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhyh ) != '' ) 
          ) 
          OR (
            ( A.zzhm IS NULL OR TRIM ( BOTH '\t ' FROM A.zzhm ) = '' ) 
            AND ( B.khrzjhm IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.khrzjhm ) != '' ) 
          ) 
        ) 
      ) C 
    GROUP BY
      ( zh, zhmc, khyh, zzhm, jydd ) 
    ORDER BY
      zh DESC 
    ) N UNION
  SELECT
    * 
  FROM
    (
      ${arg2}
       SELECT
      cxkh zh,
      COALESCE ( jymc, '' ) zhmc,
      COALESCE ( JYKHH, '' ) khyh,
      COALESCE ( jyzjhm, '' ) zzhm,
      '1' jydd 
    FROM
      gas_bank_records 
    WHERE
      cxkh IS NOT NULL 
      AND cxkh != '' 
      AND ( ( jymc IS NULL OR jymc = '' ) OR ( JYKHH IS NULL OR JYKHH = '' ) OR ( jyzjhm IS NULL OR jyzjhm = '' ) ) 
      AND ajid = ${this.ajid}
    GROUP BY
      ( zh, zhmc, zzhm, khyh ) 
    ORDER BY
    zh 
    ) A `;
    // if (sql != undefined && sql != null && sql != "") {
    //   return await Base.QueryCustom(sql, this.ajid);
    // }
    return sql;
  };
  this.GetCanData = async function() {
    let client = await global.pool.connect();
    try {
      return await new Promise(async (resolve, reject) => {
        let sql = this.GetSqlForBackDictionary(this.bool_4);
        if (sql != undefined && sql != null && sql != "") {
          this.dictionary_0 = {};
          this.dictionary_2 = {};
          client = await cases.SwitchCase(client, this.ajid);
          const query = new Query(sql);
          client.query(query);
          query.on("row", (dataRow) => {
            let text = Default.IsNullOrEmpty(dataRow["zh"])
              ? ""
              : dataRow["zh"];
            let str = Default.IsNullOrEmpty(dataRow["zhmcb"])
              ? ""
              : dataRow["zhmcb"];
            let str2 = Default.IsNullOrEmpty(dataRow["khyhb"])
              ? ""
              : dataRow["khyhb"];
            let str3 = Default.IsNullOrEmpty(dataRow["zzhmb"])
              ? ""
              : dataRow["zzhmb"];
            let str4 = Default.IsNullOrEmpty(dataRow["jydd"])
              ? ""
              : dataRow["jydd"];
            if (!Default.IsNullOrEmpty(text)) {
              if (this.dictionary_0.hasOwnProperty(text)) {
                let array = this.dictionary_0[text];
                this.AddStr(array[0], str);
                this.AddStr(array[1], str2);
                this.AddStr(array[2], str3);
              } else {
                let list = [];
                let list2 = [];
                let list3 = [];
                let array2 = [];
                this.AddStr(list, str);
                this.AddStr(list2, str2);
                this.AddStr(list3, str3);
                array2[0] = list;
                array2[1] = list2;
                array2[2] = list3;
                this.dictionary_0[text] = array2;
              }
              let key = text + "_" + str4;
              if (!this.dictionary_2[key]) {
                this.dictionary_2[key] = "";
              }
            }
          });
          query.on("end", () => {
            console.log("query done end");
            resolve("end");
          });
          query.on("error", (err) => {
            console.error(err);
            reject(err);
          });
        } else {
          resolve("end");
        }
      });
    } finally {
      client.release();
    }
  };
  this.GetSqlForBackDictionary = function(ismasterdata = false) {
    let arg = "";
    if (!ismasterdata) {
      arg = `SELECT
      shard_id,
      jydfzkh zh,
      COALESCE ( jydfmc, '' ) zhmc,
      COALESCE ( jydfzhkhh, '' ) khyh,
      COALESCE ( jydfzjhm, '' ) zzhm,
      '0' jydd 
    FROM
      gas_bank_records 
    WHERE
      jydfzkh IS NOT NULL 
      AND jydfzkh != '' 
      AND ( ( jydfmc IS NULL OR jydfmc = '' ) OR ( jydfzhkhh IS NULL OR jydfzhkhh = '' ) OR ( jydfzjhm IS NULL OR jydfzjhm = '' ) ) 
      AND ajid = ${this.ajid} UNION `;
    }
    let res = `SELECT A
    .zh,
    A.zhmc,
    A.khyh,
    A.zzhm,
    B.zhkhmc zhmcB,
    B.zhkhyh khyhB,
    B.khrzjhm zzhmB,
    A.shard_id,
    jydd 
  FROM
    (
      ${arg} SELECT
      shard_id,
      cxkh zh,
      COALESCE ( jymc, '' ) zhmc,
      COALESCE ( JYKHH, '' ) khyh,
      COALESCE ( jyzjhm, '' ) zzhm,
      '1' jydd 
    FROM
      gas_bank_records 
    WHERE
      cxkh IS NOT NULL 
      AND cxkh != '' 
      AND ( ( jymc IS NULL OR jymc = '' ) OR ( JYKHH IS NULL OR JYKHH = '' ) OR ( jyzjhm IS NULL OR jyzjhm = '' ) ) 
      AND ajid = ${this.ajid}
    )
    A INNER JOIN gas_account_info B ON A.zh = B.kh 
  WHERE
    B.ajid = ${this.ajid}
    AND (
      (
        ( A.zhmc IS NULL OR TRIM ( BOTH '\t ' FROM A.zhmc ) = '' ) 
        AND ( B.zhkhmc IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhmc ) != '' ) 
      ) 
      OR (
        ( A.khyh IS NULL OR TRIM ( BOTH '\t ' FROM A.khyh ) = '' ) 
        AND ( B.zhkhyh IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.zhkhyh ) != '' ) 
      ) 
      OR (
        ( A.zzhm IS NULL OR TRIM ( BOTH '\t ' FROM A.zzhm ) = '' ) 
        AND ( B.khrzjhm IS NOT NULL AND TRIM ( BOTH '\t ' FROM B.khrzjhm ) != '' ) 
      ) 
    )`;

    return res;
  };
  this.AddStr = function(strs, str) {
    if (!Default.IsNullOrEmpty(str) && !strs.includes(str)) {
      strs.push(str);
    }
    return strs;
  };

  this.UpdataAllData = async function(Modelscan, callbackProcess) {
    console.log(
      "UpdataAllData:",
      Object.keys(this.dictionary_2).length,
      Modelscan.length
    );
    this.AccountModelscan = Modelscan.map((current) => {
      let obj = new SimpleAccountModel();
      obj.IsChecked = current.IsChecked;
      obj.Khyh = current.Khyh;
      obj.KhyhIsenable = current.KhyhIsenable;
      obj.KhyhList = current.KhyhList;
      obj.Zh = current.Zh;
      obj.Zhmc = current.Zhmc;
      obj.ZhmcIsenable = current.ZhmcIsenable;
      obj.ZhmcList = current.ZhmcList;
      obj.Zzhm = current.Zzhm;
      obj.ZzhmIsenable = current.ZzhmIsenable;
      obj.ZzhmList = current.ZzhmList;
      return obj;
    });
    if (
      this.AccountModelscan == undefined ||
      this.AccountModelscan == null ||
      this.AccountModelscan.length == 0
    ) {
      return;
    }
    const client = await global.pool.connect();
    await cases.SwitchCase(client, this.ajid);
    try {
      return await new Promise(async (resolve, reject) => {
        let sumLoop = this.AccountModelscan.length;
        let indexLoop = 0;
        let stringBuilder = "";
        let percentage = 0;
        for (let current of this.AccountModelscan) {
          indexLoop++;
          stringBuilder = "";
          if (!current.get_IsHandUpdate()) {
            continue;
          }
          let key = current.Zh + "_1";
          let array = ["JYZJHM", "JYMC", "JYKHH"];
          let array2 = ["JYDFZJHM", "JYDFMC", "JYDFZHKHH"];
          let text = " ajid=" + this.ajid + " and  cxkh='" + current.Zh + "' ";
          let text_df =
            " ajid=" + this.ajid + " and  jydfzkh='" + current.Zh + "' ";
          let text2 =
            "(coalesce(" +
            array[0] +
            ",'')='' or coalesce(" +
            array[1] +
            ",'')='' or coalesce(" +
            array[2] +
            ",'')='') ";
          let text3 =
            "(coalesce(" +
            array2[0] +
            ",'')='' or coalesce(" +
            array2[1] +
            ",'')='' or coalesce(" +
            array2[2] +
            ",'')='') ";
          if (this.dictionary_2.hasOwnProperty(key)) {
            let text4 = "update gas_bank_records set  ";
            let text5 = "";
            if (current.IsZZHMHandUpdate()) {
              let selectzzhm = current.get_ZzhmSelected();
              if (!Default.IsNullOrEmpty(selectzzhm)) {
                text5 = text5 + array[0] + "='" + selectzzhm + "',";
              } else {
                text5 = text5 + array[0] + "='A@A',";
              }
            }
            if (current.IsZZMCHandUpdate()) {
              let selectzzmc = current.get_ZhmcSelected();
              if (!Default.IsNullOrEmpty(selectzzmc)) {
                text5 = text5 + array[1] + "='" + selectzzmc + "',";
              } else {
                text5 = text5 + array[1] + "='A@A',";
              }
            }
            if (current.IsKHYHHandUpdate()) {
              let selectKhyh = current.get_KhyhSelected();
              if (!Default.IsNullOrEmpty(selectKhyh)) {
                text5 = text5 + array[2] + "='" + selectKhyh + "',";
              } else {
                text5 = text5 + array[2] + "='A@A',";
              }
            }
            if (text5 != "") {
              text5 = text5.substring(0, text5.length - 1);
              text4 = text4 + text5 + " where " + text + " and " + text2 + " ;";
              stringBuilder += text4;
            }
          }
          key = current.Zh + "_0";
          if (this.dictionary_2.hasOwnProperty(key)) {
            let text6 = "update   gas_bank_records set  ";
            let text7 = "";
            if (current.IsZZHMHandUpdate()) {
              let selectzzhm = current.get_ZzhmSelected();
              if (!Default.IsNullOrEmpty(selectzzhm)) {
                text7 = text7 + array2[0] + "='" + selectzzhm + "',";
              } else {
                text7 = text7 + array2[0] + "='A@A',";
              }
            }
            if (current.IsZZMCHandUpdate()) {
              let selectzzmc = current.get_ZhmcSelected();
              if (!Default.IsNullOrEmpty(selectzzmc)) {
                text7 = text7 + array2[1] + "='" + selectzzmc + "',";
              } else {
                text7 = text7 + array2[1] + "='A@A',";
              }
            }
            if (current.IsKHYHHandUpdate()) {
              let selectKhyh = current.get_KhyhSelected();
              if (!Default.IsNullOrEmpty(selectKhyh)) {
                text7 = text7 + array2[2] + "='" + selectKhyh + "',";
              } else {
                text7 = text7 + array2[2] + "='A@A',";
              }
            }
            if (text7 != "") {
              text7 = text7.substring(0, text7.length - 1);
              text6 =
                text6 + text7 + " where " + text_df + " and " + text3 + " ;";
              stringBuilder += text6;
            }
          }
          if (stringBuilder.length > 0) {
            try {
              console.log(stringBuilder);
              await client.query(stringBuilder);
              percentage = parseInt((indexLoop / sumLoop) * 100);
              callbackProcess({
                data: { percentage },
                success: true,
                type: "progress",
              });
            } catch (e) {
              reject(e);
            }
          }
        }
        let loop = setInterval(() => {
          percentage++;
          if (percentage >= 99) {
            percentage = 99;
          }
          callbackProcess({
            data: { percentage },
            success: true,
            type: "progress",
          });
        }, 600);
        for (let i = 0; i < 2; i++) {
          await this.execSqlUpdate();
        }
        clearInterval(loop);
        callbackProcess({
          data: { percentage: 100 },
          success: true,
          type: "progress",
        });
        resolve("done");
      });
    } catch (e) {
      console.log(e);
      callbackProcess({
        data: { percentage },
        success: false,
        msg: e.message,
        type: "progress",
      });
    } finally {
      client.release();
    }

    // console.log(stringBuilderArr);
    // return;
    // console.log(stringBuilder);
    // const fs = require("fs");
  };
  this.execSqlUpdate = async function() {
    let sql1 = `UPDATE gas_bank_records A 
    SET JYZJHM =
    CASE
        
        WHEN JYZJHM IS NULL 
        OR JYZJHM = '' THEN
          B.KHRZJHM ELSE JYZJHM 
          END,
        JYMC =
      CASE
          
          WHEN JYMC IS NULL 
          OR JYMC = '' THEN
            B.ZHKHMC ELSE JYMC 
            END,
          JYKHH =
        CASE
            
            WHEN JYKHH IS NULL 
            OR JYKHH = '' THEN
              B.ZHKHYH ELSE JYKHH 
            END 
            FROM
              gas_account_info B 
            WHERE
              B.KH = A.CXKH 
              AND A.AJID = ${this.ajid} 
              AND B.KH IS NOT NULL 
              AND B.KH != '' 
              AND (
                (
                  ( b.KHRZJHM IS NOT NULL AND b.KHRZJHM != '' ) 
                  AND ( A.JYZJHM IS NULL OR LENGTH ( A.JYZJHM ) = 0 ) 
                ) 
                OR (
                  ( b.ZHKHMC IS NOT NULL AND b.ZHKHMC != '' ) 
                  AND ( A.JYMC IS NULL OR LENGTH ( A.JYMC ) = 0 ) 
                ) 
                OR (
                  ( b.ZHKHYH IS NOT NULL AND b.ZHKHYH != '' ) 
                  AND ( A.JYKHH IS NULL OR LENGTH ( A.JYKHH ) = 0 ) 
                ) 
              ) 
      AND B.AJID = ${this.ajid};`;

    let sql2 = `UPDATE gas_bank_records A 
    SET JYDFZJHM =
    CASE
        
        WHEN JYDFZJHM IS NULL 
        OR JYDFZJHM = '' THEN
          B.KHRZJHM ELSE JYDFZJHM 
          END,
        JYDFMC =
      CASE
          
          WHEN JYDFMC IS NULL 
          OR JYDFMC = '' THEN
            B.ZHKHMC ELSE JYDFMC 
            END,
          JYDFZHKHH =
        CASE
            
            WHEN JYDFZHKHH IS NULL 
            OR JYDFZHKHH = '' THEN
              B.ZHKHYH ELSE JYDFZHKHH 
            END 
            FROM
              gas_account_info B 
            WHERE
              B.KH = A.JYDFZKH 
              AND A.AJID = ${this.ajid} 
              AND B.KH IS NOT NULL 
              AND B.KH != '' 
              AND (
                (
                  ( b.KHRZJHM IS NOT NULL AND b.KHRZJHM != '' ) 
                  AND ( A.JYDFZJHM IS NULL OR LENGTH ( A.JYDFZJHM ) = 0 ) 
                ) 
                OR (
                  ( b.ZHKHMC IS NOT NULL AND b.ZHKHMC != '' ) 
                  AND ( A.JYDFMC IS NULL OR LENGTH ( A.JYDFMC ) = 0 ) 
                ) 
                OR (
                  ( b.ZHKHYH IS NOT NULL AND b.ZHKHYH != '' ) 
                  AND ( A.JYDFZHKHH IS NULL OR LENGTH ( A.JYDFZHKHH ) = 0 ) 
                ) 
              ) 
      AND B.AJID = ${this.ajid};`;

    let sql3 = `UPDATE gas_bank_records 
      SET JYZJHM =
      CASE
          
          WHEN JYZJHM = 'A@A' THEN
          '' ELSE JYZJHM 
        END,
        JYMC =
      CASE
        
        WHEN JYMC = 'A@A' THEN
        '' ELSE JYMC 
        END,
        JYKHH =
      CASE
        
        WHEN JYKHH = 'A@A' THEN
        '' ELSE JYKHH 
      END 
      WHERE
        JYZJHM = 'A@A' 
        OR JYMC = 'A@A' 
        OR JYKHH = 'A@A' 
        AND ajid = ${this.ajid};
        
      UPDATE gas_bank_records 
      SET JYDFZJHM =
      CASE
          
          WHEN JYDFZJHM = 'A@A' THEN
          '' ELSE JYDFZJHM 
        END,
        JYDFMC =
      CASE
        
        WHEN JYDFMC = 'A@A' THEN
        '' ELSE JYDFMC 
        END,
        JYDFZHKHH =
      CASE
        
        WHEN JYDFZHKHH = 'A@A' THEN
        '' ELSE JYDFZHKHH 
      END 
      WHERE
        JYDFZJHM = 'A@A' 
        OR JYDFMC = 'A@A' 
        OR JYDFZHKHH = 'A@A' 
        AND ajid = ${this.ajid};`;

    await Base.QueryCustom(sql1, this.ajid);
    await Base.QueryCustom(sql2, this.ajid);
    await Base.QueryCustom(sql3, this.ajid);
  };
}

export default DataSupplementWinModel;

// let num = await this.GetAllEmptyRowCount();
// console.log("GetAllEmptyRowCount:", num);
// let count = await this.GetCanSuppleentRowCount(this.bool_4);
// console.log("GetCanSuppleentRowCount:", count);
// async myTest(ajid) {
//   let test = new DataSupplementWinModel(ajid);
//   let list = await test.GetMasterData();
//   console.log(list);
//   let list2 = await test.GetAllData();
//   console.log(list2);
//   // await test.UpdataAllData(list);
// },
