import fs from "fs";
import log from "@/utils/log";
import dataImport from "./DataImport";
import base from "./Base";
import { DbConfig } from "@/utils/config";
import { remote } from "electron";
import lodash from "lodash";

// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  // 切换Schema， 一个schema 可以认为是一个案件
  SwitchCase: async function(client, ajid) {
    try {
      let sql = `SET search_path TO icap_${ajid}`;
      const res = await client.query(sql);
      return res.command === "SET" ? true : false;
    } catch (e) {
      log.error(e);
    }
  },
  SwitchDefaultCase: async function(client) {
    try {
      let sql = `SET search_path TO icap_base`;
      const res = await client.query(sql);
      return res.command === "SET" ? true : false;
    } catch (e) {
      log.info(e);
      return false;
    }
  },
  // 获取采集记录
  QueryCollectionRecords: async function(ajid, offset, count) {
    const client = await global.pool.connect();
    try {
      let headers = [
        {
          fieldename: "batch",
          fieldcname: "导入批次",
        },
        {
          fieldename: "filename",
          fieldcname: "文件名",
        },
        {
          fieldename: "sheetname",
          fieldcname: "sheet名",
        },
        {
          fieldename: "mbmc",
          fieldcname: "导入文件模板",
        },
        {
          fieldename: "jh",
          fieldcname: "导入人员编号",
        },
        {
          fieldename: "name",
          fieldcname: "导入人员",
        },
        {
          fieldename: "drrq",
          fieldcname: "导入时间",
        },
      ];
      let rowCount = 0;
      let countSql = `select count(*)::int count  from icap_base.st_data_source where ajid=${ajid}`;
      const resCount = await client.query(countSql);
      rowCount = resCount.rows[0].count;
      let queryStr = headers.map((header) => header.fieldename);
      queryStr.push("sjlyid");
      let sql = `select ${queryStr}  from icap_base.st_data_source where ajid=${ajid} LIMIT ${count} OFFSET ${offset};`;
      const res = await client.query(sql);
      return { rows: res.rows, success: true, headers, rowCount };
    } catch (e) {
      return { rows: [], success: false, msg: e.message };
    } finally {
      client.release();
    }
  },
  // 查询一个案件中的所有表名称
  showLAllTableTableName: async function(ajid) {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT table_name  FROM information_schema.tables
      WHERE table_schema = 'icap_${ajid}'`;
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } finally {
      client.release();
    }
  },
  // 删除一个案件中所有表中包含sjlyid字段，并且值为特定值的数据
  DeleteCollectionRecords: async function(ajid, sjlyid) {
    try {
      let { success, rows } = await this.showLAllTableTableName(ajid);
      if (!success) return { success: false };
      let chunkCount = 5;
      let newChunkList = lodash.chunk(rows, chunkCount);
      console.log(newChunkList);
      for (let innerList of newChunkList) {
        let promiseArr = [];
        for (let row of innerList) {
          promiseArr.push(
            (async function() {
              if (row.table_name.endsWith("_temp")) {
                let sqlDelTable = `DROP TABLE ${row.table_name}`;
                await base.QueryCustom(sqlDelTable, ajid);
                return true;
              }
              let result = await dataImport.showTableStruct(
                ajid,
                row.table_name
              );
              if (result.success) {
                // console.log(result.rows);
                let findResult = result.rows.find((row) => {
                  if (row.fieldename) {
                    return row.fieldename.toLowerCase() === "sjlyid";
                  } else {
                    return false;
                  }
                });
                if (findResult) {
                  console.log(row.table_name);
                  let sqlDelRows = `DELETE FROM ${row.table_name} WHERE  SJLYID IN(${sjlyid})`; //ajid =${ajid} AND
                  await base.QueryCustom(sqlDelRows, ajid);
                }
                return true;
              }
            })()
          );
        }
        let ret = await Promise.all(promiseArr);
      }

      // 把base库的记录表中的数据删除
      let sqlDelRows = `DELETE FROM  icap_base.st_data_source WHERE ajid =${ajid} AND SJLYID IN(${sjlyid})`;
      console.log(sqlDelRows);
      await base.QueryCustom(sqlDelRows);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    } finally {
    }
  },
  CreateNewCaseSchema: async function(ajid, userName) {
    const client = await global.pool.connect();
    try {
      let scheamName = `icap_${ajid}`;
      let sql = `create SCHEMA if not exists ${scheamName} AUTHORIZATION ${userName}`;
      const res = await client.query(sql);
      return res.command === "CREATE" ? scheamName : "";
    } finally {
      client.release();
    }
  },
  DropAllCases: async function() {
    const client = await global.pool.connect();
    try {
      await this.SwitchDefaultCase(client);
      let sql = `SELECT ID::int, ITEM_CODE, ITEM_NAME, DESCN FROM st_dictionary WHERE PARENT_ID = 5  ORDER BY thesort; `;
      const res = await client.query(sql);
      for (let row of res.rows) {
        await this.DropCaseByID(row.ajid);
      }
    } finally {
      client.release();
    }
  },
  // 删除案件
  DropCaseByID: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await this.SwitchCase(client, ajid);
      let sql = `drop table if exists bk_fk_dtcx; 
      drop table if exists bk_fk_dtcxsj; 
      drop table if exists bk_fk_gyyxq; 
      drop table if exists ck_cbrc_accesorry; 
      drop table if exists ck_cbrc_account; 
      drop table if exists ck_cbrc_object; 
      drop table if exists ck_cbrc_return_dj; 
      drop table if exists ck_cbrc_return_dj_detail; 
      drop table if exists ck_cbrc_return_end; 
      drop table if exists ck_cbrc_return_info; 
      drop table if exists ck_cbrc_return_jjzf; 
      drop table if exists ck_cbrc_return_jjzf_detail; 
      drop table if exists gas_account_info; 
      drop table if exists gas_account_info_chakong; 
      drop table if exists gas_analysis_record; 
      drop table if exists gas_analysis_record_visual; 
      drop table if exists gas_awaittask; 
      drop table if exists gas_bank_records; 
      drop table if exists gas_bank_records_source; 
      drop table if exists gas_cft_accountinfo; 
      drop table if exists gas_cft_zjxx; 
      drop table if exists gas_dsf_dlip; 
      drop table if exists gas_dsf_jbxx; 
      drop table if exists gas_dsf_jyjl; 
      drop table if exists gas_dsf_records; 
      drop table if exists gas_im_msg; 
      drop table if exists gas_jass_info; 
      drop table if exists gas_jstxhy_info; 
      drop table if exists gas_logistics_info; 
      drop table if exists gas_person; 
      drop table if exists gas_person_chakong; 
      drop table if exists gas_person_glzzh; 
      drop table if exists gas_person_gyyxq; 
      drop table if exists gas_person_pic; 
      drop table if exists gas_person_qzcs; 
      drop table if exists gas_phone_call_info; 
      drop table if exists gas_rmb_exrate_midprice; 
      drop table if exists gas_safe_trading; 
      drop table if exists gas_sjdx; 
      drop table if exists gas_sjtxl; 
      drop table if exists gas_taobao_info; 
      drop table if exists gas_taobao_log; 
      drop table if exists gas_taobao_trade_info; 
      drop table if exists gas_tax_bgd; 
      drop table if exists gas_tax_bgh; 
      drop table if exists gas_tax_hgjkshbd; 
      drop table if exists gas_tax_hgjkshxx; 
      drop table if exists gas_tax_hgjkzzs; 
      drop table if exists gas_tax_hgwspzjhbd; 
      drop table if exists gas_tax_records; 
      drop table if exists gas_tax_records_source; 
      drop table if exists gas_tax_swdj; 
      drop table if exists gas_ys_crjjl; 
      drop table if exists gas_ys_dbq_ldzs; 
      drop table if exists gas_ys_hyzk; 
      drop table if exists gas_ys_jsr; 
      drop table if exists gas_ys_jyxx; 
      drop table if exists gas_ys_mhlg; 
      drop table if exists gas_ys_qgjdc; 
      drop table if exists gas_ys_qgjdcwzxx; 
      drop table if exists gas_ys_sjhb; 
      drop table if exists gas_ys_sxrxx; 
      drop table if exists gas_ys_tlsp; 
      drop table if exists gas_ys_yhhc; 
      drop table if exists gas_zhifubao_trade; 
      drop table if exists gas_zhifubao_transfer; 
      drop table if exists mark_detail; 
      drop table if exists mark_dm_entity; 
      drop table if exists mark_group_detail; 
      drop table if exists mark_info; 
      drop table if exists result_gas_antimoney_core; 
      drop table if exists result_gas_antimoney_loop; 
      drop table if exists result_gas_antimoney_person; 
      drop table if exists result_gas_antimoney_point; 
      drop table if exists result_gas_model_xs_info; 
      drop table if exists result_gas_model_xs_info_tmp; 
      drop table if exists result_gas_phone_call_info_model_tmp; 
      drop table if exists result_model_fxq_dxqz; 
      drop table if exists result_model_fxq_dxqzcjzh_1; 
      drop table if exists result_model_fxq_dxqzhxzh_1; 
      drop table if exists result_model_fxq_dxqzhxzh_2; 
      drop table if exists result_model_fxq_dxqzjylzh_1; 
      drop table if exists result_model_fxq_dxqzjylzh_2; 
      drop table if exists result_model_fxq_dxqzkhzh; 
      drop table if exists result_model_fxq_dxqzqzzh; 
      drop table if exists result_model_fxq_dxqzrjzh_1; 
      drop table if exists t_model_antimoney_param; 
      DROP SCHEMA IF EXISTS icap_${ajid}  CASCADE;
      delete from icap_base.gas_report_records where id=${ajid} or reportajid=${ajid};
      delete from icap_base.diy_graphic_layout where AJID=${ajid} ; 
      delete from icap_base.layout_visual_line_parm where AJID=${ajid} ; 
      delete from icap_base.st_case where AJID=${ajid} ;
      delete from icap_base.st_case_child where AJID=${ajid} ; 
      delete from icap_base.st_data_source where AJID=${ajid} ; `;
      let res = await client.query(sql);
      return true;
    } finally {
      client.release();
    }
  },
  // 查询案件状态列表下拉信息
  QueryCaseState: async function() {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT ID::int, ITEM_CODE, ITEM_NAME, DESCN FROM icap_base.st_dictionary WHERE PARENT_ID = 5  ORDER BY thesort; `;
      const res = await client.query(sql);
      return res.rows; // id, item_code, item_name,
    } finally {
      client.release();
    }
  },
  // 获取案件类别下拉信息
  QueryCaseCategory: async function() {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT chargeid::int, parent_id::int, leaf_flag::int, chargename FROM icap_base.st_charge ORDER BY thesort DESC `;
      const res = await client.query(sql);
      return res.rows;
    } finally {
      client.release();
    }
  },
  // 获取已经存在的case
  QueryExistCases: async function() {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT * FROM icap_base.st_case WHERE CJR in('00000000','00000000') AND SFSC='0'  ORDER  BY AJID DESC `;
      const res = await client.query(sql);
      return res.rows;
    } finally {
      client.release();
    }
  },
  // 根据id获取案件详细信息
  QueryCaseDetailByID: async function(ajid) {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT * FROM icap_base.st_case WHERE CJR in('00000000','00000000') AND SFSC='0' AND AJID=${ajid}  ORDER  BY AJID DESC `;
      const res = await client.query(sql);
      return res.rows[0];
    } finally {
      client.release();
    }
  },
  //根据子案件id获取父案件的id
  QueryParentAjidByChildID: async function(childAjid) {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT parent_id::int FROM icap_base.st_charge where chargeid=${childAjid}`;
      const res = await client.query(sql);
      return res.rows[0].parent_id;
    } finally {
      client.release();
    }
  },
  // 查询最大案件编号
  QueryCaseMaxCount: async function() {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT MAX(AJID)::int FROM icap_base.st_case`;
      const res = await client.query(sql);
      return res.rows[0].max === null ? 0 : res.rows[0].max;
    } finally {
      client.release();
    }
  },
  updateCaseBase: async function(
    ajid,
    ajbh,
    ajmc,
    ajlb,
    ajlbmc,
    zcjddm,
    zcjdmc,
    cjsj,
    jjsj,
    xgsj,
    asjfsddxzqhdm,
    asjfsddxzqmc,
    jyaq,
    zhaq,
    cjr,
    sfsc,
    sfbdwkj,
    sjlx
  ) {
    let params = [
      ajbh,
      ajmc,
      ajlb,
      ajlbmc,
      zcjddm,
      zcjdmc,
      cjsj,
      jjsj,
      xgsj,
      asjfsddxzqhdm,
      asjfsddxzqmc,
      jyaq,
      zhaq,
      cjr,
      sfsc,
      sfbdwkj,
      sjlx,
    ];
    const client = await global.pool.connect();
    try {
      let sql = `UPDATE icap_base.st_case SET
      AJBH=$1, AJMC=$2, AJLB=$3, AJLBMC=$4, ZCJDDM=$5, ZCJDMC=$6, CJSJ=$7, JJSJ=$8, XGSJ=$9,
      ASJFSDDXZQHDM=$10,ASJFSDDXZQMC=$11,JYAQ=$12,ZHAQ=$13,CJR=$14,SFSC=$15,SFBDWKJ=$16,SJLX=$17 where AJID=${ajid};`;
      await client.query(sql, params);
      return true;
    } finally {
      client.release();
    }
  },
  // 创建一个新的案件
  CreateNewCase: async function(
    ajbh,
    ajmc,
    ajlb,
    ajlbmc,
    zcjddm,
    zcjdmc,
    cjsj,
    jjsj,
    xgsj,
    asjfsddxzqhdm,
    asjfsddxzqmc,
    jyaq,
    zhaq,
    cjr,
    sfsc,
    sfbdwkj,
    sjlx
  ) {
    const client = await global.pool.connect();
    try {
      // 获取配置文件
      let configPath = remote.getGlobal("configPath");
      let conf = new DbConfig(configPath);
      let obj = await conf.readDbConfig();
      let ajid = (await this.QueryCaseMaxCount()) + 1;
      let scheamName = await this.CreateNewCaseSchema(ajid, obj.user);
      if (scheamName) {
        let content = ` -- ---------------------------- 
        -- Sequence structure for bk_fk_dtcx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "bk_fk_dtcx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "bk_fk_dtcx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for bk_fk_dtcxsj_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "bk_fk_dtcxsj_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "bk_fk_dtcxsj_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for bk_fk_gyyxq_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "bk_fk_gyyxq_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "bk_fk_gyyxq_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_accesorry_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_accesorry_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_accesorry_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_account_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_account_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_account_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_object_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_object_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_object_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_dj_detail_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_dj_detail_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_dj_detail_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_dj_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_dj_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_dj_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_end_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_end_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_end_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_info_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_info_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_info_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_jjzf_detail_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_jjzf_detail_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_jjzf_detail_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for ck_cbrc_return_jjzf_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "ck_cbrc_return_jjzf_id_seq" CASCADE; 
        CREATE SEQUENCE "ck_cbrc_return_jjzf_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_account_info_chakong_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_account_info_chakong_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_account_info_chakong_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_account_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_account_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_account_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_analysis_record_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_analysis_record_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_analysis_record_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_analysis_record_visual_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_analysis_record_visual_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_analysis_record_visual_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_awaittask_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_awaittask_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_awaittask_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_bank_records_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_bank_records_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_bank_records_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_bank_records_source_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_bank_records_source_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_bank_records_source_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_cft_accountinfo_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_cft_accountinfo_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_cft_accountinfo_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_cft_zjxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_cft_zjxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_cft_zjxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_dsf_dlip_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_dsf_dlip_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_dsf_dlip_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_dsf_jbxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_dsf_jbxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_dsf_jbxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_dsf_jyjl_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_dsf_jyjl_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_dsf_jyjl_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_dsf_records_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_dsf_records_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_dsf_records_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_im_msg_imltjlid_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_im_msg_imltjlid_seq" CASCADE; 
        CREATE SEQUENCE "gas_im_msg_imltjlid_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_im_msg_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_im_msg_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_im_msg_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_jass_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_jass_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_jass_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_jstxhy_info_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_jstxhy_info_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_jstxhy_info_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_jstxhy_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_jstxhy_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_jstxhy_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_logistics_info_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_logistics_info_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_logistics_info_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_logistics_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_logistics_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_logistics_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_chakong_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_chakong_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_chakong_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_glzzh_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_glzzh_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_glzzh_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_gyyxq_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_gyyxq_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_gyyxq_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_pic_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_pic_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_pic_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_qzcs_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_qzcs_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_qzcs_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_person_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_person_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_person_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_phone_call_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_phone_call_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_phone_call_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ----------
        ------------------ 
        -- Sequence structure for gas_safe_trading_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_safe_trading_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_safe_trading_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_sjdx_ch_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_sjdx_ch_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_sjdx_ch_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_sjdx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_sjdx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_sjdx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_sjtxl_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_sjtxl_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_sjtxl_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_sjtxl_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_sjtxl_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_sjtxl_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_taobao_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_taobao_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_taobao_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_taobao_log_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_taobao_log_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_taobao_log_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_taobao_trade_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_taobao_trade_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_taobao_trade_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_bgd_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_bgd_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_bgd_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_bgh_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_bgh_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_bgh_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_hgjkshbd_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_hgjkshbd_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_hgjkshbd_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_hgjkshxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_hgjkshxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_hgjkshxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_hgjkzzs_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_hgjkzzs_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_hgjkzzs_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_hgwspzjhbd_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_hgwspzjhbd_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_hgwspzjhbd_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_records_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_records_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_records_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_records_source_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_records_source_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_records_source_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_tax_swdj_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_tax_swdj_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_tax_swdj_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_crjjl_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_crjjl_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_crjjl_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_crjjl_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_crjjl_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_crjjl_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_dbq_ldzs_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_dbq_ldzs_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_dbq_ldzs_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_dbq_ldzs_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_dbq_ldzs_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_dbq_ldzs_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_hyzk_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_hyzk_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_hyzk_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_hyzk_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_hyzk_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_hyzk_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_jsr_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_jsr_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_jsr_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_jsr_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_jsr_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_jsr_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_jyxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_jyxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_jyxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_mhlg_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_mhlg_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_mhlg_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_mhlg_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_mhlg_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_mhlg_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_qgjdc_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_qgjdc_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_qgjdc_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_qgjdc_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_qgjdc_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_qgjdc_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_qgjdcwzxx_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_qgjdcwzxx_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_qgjdcwzxx_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_qgjdcwzxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_qgjdcwzxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_qgjdcwzxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_sjhb_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_sjhb_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_sjhb_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_sjhb_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_sjhb_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_sjhb_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_sxrxx_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_sxrxx_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_sxrxx_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_sxrxx_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_sxrxx_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_sxrxx_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_tlsp_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_tlsp_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_tlsp_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_tlsp_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_tlsp_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_tlsp_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_yhhc_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_yhhc_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_yhhc_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_ys_yhhc_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_ys_yhhc_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_ys_yhhc_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_zhifubao_trade_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_zhifubao_trade_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_zhifubao_trade_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for gas_zhifubao_transfer_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_zhifubao_transfer_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_zhifubao_transfer_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for mark_detail_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "mark_detail_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "mark_detail_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for mark_dm_entity_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "mark_dm_entity_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "mark_dm_entity_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for mark_group_detail_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "mark_group_detail_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "mark_group_detail_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for mark_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "mark_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "mark_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_gas_model_xs_info_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_gas_model_xs_info_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_gas_model_xs_info_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_gas_model_xs_info_tmp_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_gas_model_xs_info_tmp_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_gas_model_xs_info_tmp_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqz_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqz_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqz_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzcjzh_1_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzcjzh_1_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzcjzh_1_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzhxzh_1_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzhxzh_1_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzhxzh_1_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzhxzh_2_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzhxzh_2_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzhxzh_2_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzjylzh_1_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzjylzh_1_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzjylzh_1_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzjylzh_2_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzjylzh_2_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzjylzh_2_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzkhzh_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzkhzh_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzkhzh_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzqzzh_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzqzzh_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzqzzh_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
        -- ---------------------------- 
        -- Sequence structure for result_model_fxq_dxqzrjzh_1_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "result_model_fxq_dxqzrjzh_1_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "result_model_fxq_dxqzrjzh_1_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
         
         
        -- ---------------------------- 
        -- Sequence structure for gas_rmb_exrate_midprice_shard_id_seq 
        -- ---------------------------- 
        DROP SEQUENCE IF EXISTS "gas_rmb_exrate_midprice_shard_id_seq" CASCADE; 
        CREATE SEQUENCE "gas_rmb_exrate_midprice_shard_id_seq"  
        INCREMENT 1 
        MINVALUE  1 
        MAXVALUE 9223372036854775807 
        START 1 
        CACHE 1; 
       
       -- ---------------------------- 
         -- Table structure for bk_fk_dtcx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "bk_fk_dtcx" CASCADE; 
         CREATE TABLE "bk_fk_dtcx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('bk_fk_dtcx_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "qqdh" varchar(30) COLLATE "pg_catalog"."default", 
           "zxqssj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" numeric(22) DEFAULT NULL::numeric, 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "sbyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "zh" varchar(50) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "zxjg" varchar(10) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "mbjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "cxjssj" varchar(50) COLLATE "pg_catalog"."default", 
           "fksjhm" varchar(20) COLLATE "pg_catalog"."default", 
           "zxsjqj" varchar(10) COLLATE "pg_catalog"."default", 
           "kh" varchar(50) COLLATE "pg_catalog"."default", 
           "sqjgdm" varchar(100) COLLATE "pg_catalog"."default", 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "bk_fk_dtcx"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."id" IS 'ID'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."zxqssj" IS '执行起始时间'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."sjlyid" IS '数据来源id'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."sbyy" IS '失败原因'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."zh" IS '账号'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."zxjg" IS '执行结果'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."mbjgdm" IS '目标机构代码'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."cxjssj" IS '查询结束时间'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."fksjhm" IS '反馈手机号码'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."zxsjqj" IS '执行时间区间'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."kh" IS '卡号'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."sqjgdm" IS '申请代码'; 
         COMMENT ON COLUMN "bk_fk_dtcx"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "bk_fk_dtcx" IS '银行反馈动态查询'; 
          
         -- ------------------------
         ---- 
         -- Table structure for bk_fk_dtcxsj 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "bk_fk_dtc
         xsj" CASCADE; 
         CREATE TABLE "bk_fk_dtcxsj" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('bk_fk_dtcxsj_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "qqdh" varchar(30) COLLATE "pg_catalog"."default", 
           "kyxq" varchar(10) COLLATE "pg_catalog"."default", 
           "jybz" varchar(10) COLLATE "pg_catalog"."default", 
           "khzjlx" varchar(10) COLLATE "pg_catalog"."default", 
           "dfzhbz" varchar(10) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "jylxgjk" varchar(20) COLLATE "pg_catalog"."default", 
           "zhdykh" varchar(30) COLLATE "pg_catalog"."default", 
           "dfzhmc" varchar(100) COLLATE "pg_catalog"."default", 
           "wddz" varchar(100) COLLATE "pg_catalog"."default", 
           "dfzhdykh" varchar(20) COLLATE "pg_catalog"."default", 
           "shmc" varchar(50) COLLATE "pg_catalog"."default", 
           "khzjhm" varchar(20) COLLATE "pg_catalog"."default", 
           "sqgyh" varchar(20) COLLATE "pg_catalog"."default", 
           "fjybz" varchar(10) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(35) COLLATE "pg_catalog"."default", 
           "czsj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjly_id" numeric(22) DEFAULT NULL::numeric, 
           "shh" varchar(50) COLLATE "pg_catalog"."default", 
           "gyh" varchar(20) COLLATE "pg_catalog"."default", 
           "bz" varchar(50) COLLATE "pg_catalog"."default", 
           "pzzl" varchar(20) COLLATE "pg_catalog"."default", 
           "cxjssj" varchar(50) COLLATE "pg_catalog"."default", 
           "wdms" varchar(50) COLLATE "pg_catalog"."default", 
           "kh" varchar(30) COLLATE "pg_catalog"."default", 
           "zdh" varchar(20) COLLATE "pg_catalog"."default", 
           "xjbz" varchar(10) COLLATE "pg_catalog"."default", 
           "jycz" varchar(100) COLLATE "pg_catalog"."default", 
           "jylxyhk" varchar(20) COLLATE "pg_catalog"."default", 
           "jyje" float8, 
           "ajlx" varchar(50) COLLATE "pg_catalog"."default", 
           "zhbz" varchar(10) COLLATE "pg_catalog"."default", 
           "jydd" varchar(100) COLLATE "pg_catalog"."default", 
           "zh" varchar(30) COLLATE "pg_catalog"."default", 
           "zhmc" varchar(60) COLLATE "pg_catalog"."default", 
           "dfzh" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "mbjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "fwjm" varchar(50) COLLATE "pg_catalog"."default", 
           "wddh" varchar(20) COLLATE "pg_catalog"."default", 
           "zhxyed" float8, 
           "jydm" varchar(20) COLLATE "pg_catalog"."default", 
           "czjybs" varchar(40) COLLATE "pg_catalog"."default", 
           "pzh" varchar(255) COLLATE "pg_catalog"."default", 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."id" IS 'ID'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."kyxq" IS '卡有效期'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jybz" IS '交易币种'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."khzjlx" IS '客户证件类型'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."dfzhbz" IS '对方账户币种'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jylxgjk" IS '交易类型（个金、国际卡）'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zhdykh" IS '账户对应卡号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."dfzhmc" IS '对方账户名称'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."wddz" IS '交易网店地址'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."dfzhdykh" IS '对方账户对应卡号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."shmc" IS '商户名(银行卡)'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."khzjhm" IS '客户证件号码'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."sqgyh" IS '授权会员号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."fjybz" IS '反交易标识'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."czsj" IS '操作时间'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."sjly_id" IS '数据来源id'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."shh" IS '商户号(银行卡)'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."gyh" IS '柜员号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."bz" IS '备注'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."pzzl" IS '凭证种类'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."cxjssj" IS '查询结束时间'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."wdms" IS '交易网店描述'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."kh" IS '卡号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zdh" IS '终端号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."xjbz" IS '现金标志'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jycz" IS '交易操作'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jylxyhk" IS '交易类型（银行卡）'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."ajlx" IS '案件类型'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zhbz" IS '账户币种'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jydd" IS '交易地点'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zh" IS '账号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zhmc" IS '账户名称'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."dfzh" IS '对方账户'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."mbjgdm" IS '目标机构代码'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."fwjm" IS '服务界面'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."wddh" IS '交易网店电话'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."zhxyed" IS '账户信用额度'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."jydm" IS '交易代码'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."czjybs" IS '冲正交易标识'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."pzh" IS '凭证号'; 
         COMMENT ON COLUMN "bk_fk_dtcxsj"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "bk_fk_dtcxsj" IS '银行反馈动态手机查询'; 
          
         -- ---------------------------- 
         -- Table structure for bk_fk_gyyxq 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "bk_fk_gyyxq" CASCADE; 
         CREATE TABLE "bk_fk_gyyxq" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('bk_fk_gyyxq_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "qlrlxfs" varchar(64) COLLATE "pg_catalog"."default", 
           "qllx" varchar(64) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(64) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "khzh" varchar(64) COLLATE "pg_catalog"."default", 
           "beiz" varchar(200) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "zh" varchar(30) COLLATE "pg_catalog"."default", 
           "zhrxm" varchar(64) COLLATE "pg_catalog"."default", 
           "ccxh" numeric(10) DEFAULT NULL::numeric, 
           "zzhm" varchar(30) COLLATE "pg_catalog"."default", 
           "xh" numeric(10) DEFAULT NULL::numeric, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjly_id" numeric(22) DEFAULT NULL::numeric, 
           "qlje" float4, 
           "qlrdz" varchar(64) COLLATE "pg_catalog"."default", 
           "bankcode" varchar(20) COLLATE "pg_catalog"."default", 
           "qlrxm" varchar(60) COLLATE "pg_catalog"."default", 
           "qlr" varchar(64) COLLATE "pg_catalog"."default", 
           "zzlxdm" varchar(15) COLLATE "pg_catalog"."default", 
           "cxsqid" numeric(19) DEFAULT NULL::numeric, 
           "zjhm" varchar(64) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."id" IS 'ID'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qlrlxfs" IS '权利人联系方式'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qllx" IS '权利类型'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."khzh" IS '开户账号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."beiz" IS '备注'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."zh" IS '账号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."zhrxm" IS '账户人姓名'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."ccxh" IS '账户序号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."zzhm" IS '证件号码'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."xh" IS '序号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."sjly_id" IS '数据来源id'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qlje" IS '权利金额'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qlrdz" IS '权利人通讯地址'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."bankcode" IS '反馈数据用户代码'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qlrxm" IS '权利人姓名'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."qlr" IS '权利人'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."zzlxdm" IS '证件类型代码'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."cxsqid" IS '申请号'; 
         COMMENT ON COLUMN "bk_fk_gyyxq"."zjhm" IS '账户人证件号'; 
         COMMENT ON TABLE "bk_fk_gyyxq" IS '银行反馈共有优先权'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_accesorry 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_accesorry" CASCADE; 
         CREATE TABLE "ck_cbrc_accesorry" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_accesorry_id_seq'::regclass), 
           "apply_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL, 
           "file_path" varchar(255) COLLATE "pg_catalog"."default" NOT NULL, 
           "file_type" char(1) COLLATE "pg_catalog"."default" NOT NULL DEFAULT NULL::bpchar, 
           "file_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "bank_code" varchar(20) COLLATE "pg_catalog"."default", 
           "bank_name" varchar(100) COLLATE "pg_catalog"."default", 
           "wsh" varchar(50) COLLATE "pg_catalog"."default", 
           "creator" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "creator_name" varchar(60) COLLATE "pg_catalog"."default" NOT NULL, 
           "file_content" bytea, 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."apply_id" IS '查控单号'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."file_path" IS '文件地址'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."file_type" IS '附件类型(0法律文书)'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."file_name" IS '附件名称'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."bank_code" IS '银行编号'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."bank_name" IS '银行名称'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."wsh" IS '文书号'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."creator" IS '创建人'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."creator_name" IS '创建人名称'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."file_content" IS '图片内容，二进制存储'; 
         COMMENT ON COLUMN "ck_cbrc_accesorry"."create_time" IS '创建时间'; 
         COMMENT ON TABLE "ck_cbrc_accesorry" IS '银行附件表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_account 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_account" CASCADE; 
         CREATE TABLE "ck_cbrc_account" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_account_id_seq'::regclass), 
           "bank_code" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "bank_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "ckrn_code" varchar(2) COLLATE "pg_catalog"."default", 
           "ckrn_name" varchar(50) COLLATE "pg_catalog"."default", 
           "cardid" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "ztlb" varchar(2) COLLATE "pg_catalog"."default" NOT NULL, 
           "ztlb_name" varchar(255) COLLATE "pg_catalog"."default", 
           "kssj" varchar(50) COLLATE "pg_catalog"."default", 
           "jssj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjbs_name" varchar(255) COLLATE "pg_catalog"."default", 
           "sjbs" varchar(2) COLLATE "pg_catalog"."default", 
           "djfs" varchar(2) COLLATE "pg_catalog"."default", 
           "djfs_name" varchar(255) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(64) COLLATE "pg_catalog"."default", 
           "apply_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL, 
           "bz_code" varchar(30) COLLATE "pg_catalog"."default", 
           "bz_name" varchar(100) COLLATE "pg_catalog"."default", 
           "djzhhz" varchar(100) COLLATE "pg_catalog"."default", 
           "yqqdh" varchar(36) COLLATE "pg_catalog"."default", 
           "zhxh" varchar(100) COLLATE "pg_catalog"."default", 
           "dqzt" char(1) COLLATE "pg_catalog"."default" DEFAULT NULL::bpchar, 
           "yrwlsh" varchar(64) COLLATE "pg_catalog"."default", 
           "je" numeric(20,2) DEFAULT NULL::numeric, 
           "zjlx_code" varchar(30) COLLATE "pg_catalog"."default", 
           "zjlx_name" varchar(100) COLLATE "pg_catalog"."default", 
           "zxsjqj" int8, 
           "zxsjqj_name" varchar(255) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyjezd" numeric(20,2) DEFAULT NULL::numeric, 
           "jyjezg" numeric(20,2) DEFAULT NULL::numeric, 
           "jylsh" varchar(50) COLLATE "pg_catalog"."default", 
           "creator" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "creator_name" varchar(60) COLLATE "pg_catalog"."default" NOT NULL, 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_account"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_account"."bank_code" IS '银行代码'; 
         COMMENT ON COLUMN "ck_cbrc_account"."bank_name" IS '银行名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."ckrn_code" IS '查控内容代码'; 
         COMMENT ON COLUMN "ck_cbrc_account"."ckrn_name" IS '查控内容名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."cardid" IS '账号(交易柜员号)'; 
         COMMENT ON COLUMN "ck_cbrc_account"."ztlb" IS '查控主体类别(01个人,02单位)'; 
         COMMENT ON COLUMN "ck_cbrc_account"."ztlb_name" IS '主体类别名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."kssj" IS '开始时间'; 
         COMMENT ON COLUMN "ck_cbrc_account"."jssj" IS '结束时间'; 
         COMMENT ON COLUMN "ck_cbrc_account"."sjbs_name" IS '时间标识名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."sjbs" IS '时间标识（01标识开户至今，02表示当年数据 03自定义时间段）'; 
         COMMENT ON COLUMN "ck_cbrc_account"."djfs" IS '冻结方式(01-限额内冻结；02-只收不付)'; 
         COMMENT ON COLUMN "ck_cbrc_account"."djfs_name" IS '冻结方式名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_account"."apply_id" IS '查控单号'; 
         COMMENT ON COLUMN "ck_cbrc_account"."bz_code" IS '币种代码'; 
         COMMENT ON COLUMN "ck_cbrc_account"."bz_name" IS '币种名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."djzhhz" IS '冻结账户户主'; 
         COMMENT ON COLUMN "ck_cbrc_account"."yqqdh" IS '原请求单号（解冻、续冻时使用）'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zhxh" IS '账户序号'; 
         COMMENT ON COLUMN "ck_cbrc_account"."dqzt" IS '当前状态：冻结成功为0，解除冻结或者冻结失败为1；动态查询成功为0，解除动态查询成功或者动态查询失败为1；紧急止付成功为0，解除紧急止付成功或者紧急止付失败为1；'; 
         COMMENT ON COLUMN "ck_cbrc_account"."yrwlsh" IS '原任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_account"."je" IS '冻结金额(交易金额)'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zjlx_code" IS '证件类型'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zjlx_name" IS '证件名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zxsjqj" IS '执行时间区间(0对应请求措施类型的解除动态查询；1表示动态查询1个月，2表示2个月，3表示3个月，4表示规定的最长时间100天)'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zxsjqj_name" IS '时间区间名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "ck_cbrc_account"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "ck_cbrc_account"."jyjezd" IS '交易金额最低'; 
         COMMENT ON COLUMN "ck_cbrc_account"."jyjezg" IS '交易金额最高'; 
         COMMENT ON COLUMN "ck_cbrc_account"."jylsh" IS '交易流水号'; 
         COMMENT ON COLUMN "ck_cbrc_account"."creator" IS '创建人'; 
         COMMENT ON COLUMN "ck_cbrc_account"."creator_name" IS '创建人名称'; 
         COMMENT ON COLUMN "ck_cbrc_account"."create_time" IS '创建时间'; 
         COMMENT ON TABLE "ck_cbrc_account" IS '银行查控账户信息表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_object 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_object" CASCADE; 
         CREATE TABLE "ck_cbrc_object" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_object_id_seq'::regclass), 
           "name" varchar(200) COLLATE "pg_catalog"."default" NOT NULL, 
           "zjlx_code" varchar(30) COLLATE "pg_catalog"."default" NOT NULL, 
           "zjlx_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "zjhm" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ztlb" varchar(2) COLLATE "pg_catalog"."default" NOT NULL, 
           "ztlb_name" varchar(255) COLLATE "pg_catalog"."default", 
           "kssj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "jssj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "sjbs" varchar(2) COLLATE "pg_catalog"."default", 
           "sjbs_name" varchar(255) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(64) COLLATE "pg_catalog"."default", 
           "zw" varchar(64) COLLATE "pg_catalog"."default", 
           "zj" varchar(32) COLLATE "pg_catalog"."default", 
           "apply_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL, 
           "ckrn_code" varchar(2) 
         COLLATE "pg_catalog"."default", 
           "ckrn_name" varchar(50) COLLATE "pg_catalog"."default", 
           "bank_code" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "bank_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "creator" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "creator_name" varchar(60) COLLATE "pg_catalog"."default" NOT NULL, 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_object"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_object"."name" IS '名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."zjlx_code" IS '证件类型'; 
         COMMENT ON COLUMN "ck_cbrc_object"."zjlx_name" IS '证件名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "ck_cbrc_object"."ztlb" IS '涉案对象类型(01个人,02单位)'; 
         COMMENT ON COLUMN "ck_cbrc_object"."ztlb_name" IS '主体类别名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."kssj" IS '开始时间'; 
         COMMENT ON COLUMN "ck_cbrc_object"."jssj" IS '结束时间'; 
         COMMENT ON COLUMN "ck_cbrc_object"."sjbs" IS '时间标识（01标识开户至今，02表示当年数据 03自定义时间段）'; 
         COMMENT ON COLUMN "ck_cbrc_object"."sjbs_name" IS '时间标识名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_object"."zw" IS '职务'; 
         COMMENT ON COLUMN "ck_cbrc_object"."zj" IS '职级'; 
         COMMENT ON COLUMN "ck_cbrc_object"."apply_id" IS '查控单号'; 
         COMMENT ON COLUMN "ck_cbrc_object"."ckrn_code" IS '查控内容代码'; 
         COMMENT ON COLUMN "ck_cbrc_object"."ckrn_name" IS '查控内容名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."bank_code" IS '银行代码'; 
         COMMENT ON COLUMN "ck_cbrc_object"."bank_name" IS '银行名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."creator" IS '创建人'; 
         COMMENT ON COLUMN "ck_cbrc_object"."creator_name" IS '创建人名称'; 
         COMMENT ON COLUMN "ck_cbrc_object"."create_time" IS '创建时间'; 
         COMMENT ON TABLE "ck_cbrc_object" IS '银行查控对象信息表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_dj 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_dj" CASCADE; 
         CREATE TABLE "ck_cbrc_return_dj" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_dj_id_seq'::regclass), 
           "qqdh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zh" varchar(50) COLLATE "pg_catalog"."default", 
           "kh" varchar(50) COLLATE "pg_catalog"."default", 
           "zxjg" varchar(10) COLLATE "pg_catalog"."default", 
           "sqdjxe" numeric(14,2) DEFAULT NULL::numeric, 
           "sdje" numeric(14,2) DEFAULT NULL::numeric, 
           "ye" numeric(14,2) DEFAULT NULL::numeric, 
           "zxqssj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "djjsrq" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "wnkzyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "djjg" varchar(500) COLLATE "pg_catalog"."default", 
           "djje" numeric(14,2) DEFAULT NULL::numeric, 
           "djjzrq" date, 
           "lhdjje" numeric(14,2) DEFAULT NULL::numeric, 
           "zhkyye" numeric(14,2) DEFAULT NULL::numeric, 
           "beiz" varchar(30) COLLATE "pg_catalog"."default", 
           "zhxh" varchar(14) COLLATE "pg_catalog"."default", 
           "hzsj" date, 
           "bank_code" varchar(20) COLLATE "pg_catalog"."default", 
           "bank_name" varchar(100) COLLATE "pg_catalog"."default", 
           "caseid" int8, 
           "sjly_id" int8, 
           "rwlsh" varchar(35) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."zh" IS '账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."kh" IS '卡号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."zxjg" IS '执行结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."sqdjxe" IS '申请冻结限额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."sdje" IS '执行冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."ye" IS '余额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."zxqssj" IS '执行起始时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."djjsrq" IS '冻结结束时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."wnkzyy" IS '未能冻结原因'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."djjg" IS '在先冻结机关'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."djje" IS '冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."djjzrq" IS '冻结截止日期'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."lhdjje" IS '未能冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."zhkyye" IS '账户可用余额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."beiz" IS '备注'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."zhxh" IS '账号序号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."bank_code" IS '银行代码'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."bank_name" IS '银行名称'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."caseid" IS '案件ID(入库更新)'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."sjly_id" IS '数据来源ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."create_time" IS '创建时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "ck_cbrc_return_dj" IS '银监查控冻结反馈信息表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_dj_detail 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_dj_detail" CASCADE; 
         CREATE TABLE "ck_cbrc_return_dj_detail" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_dj_detail_id_seq'::regclass), 
           "rwlsh" varchar(35) COLLATE "pg_catalog"."default" NOT NULL, 
           "zh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zhzzh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhxh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhye" numeric(14,2) NOT NULL DEFAULT NULL::numeric, 
           "zxjg" varchar(10) COLLATE "pg_catalog"."default" NOT NULL, 
           "zxjgyy" varchar(500) COLLATE "pg_catalog"."default", 
           "djjg" varchar(500) COLLATE "pg_catalog"."default", 
           "zxdjje" numeric(14,2) DEFAULT NULL::numeric, 
           "djjzrq" date, 
           "djje" numeric(14,2) DEFAULT NULL::numeric, 
           "djkssj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "wdjje" numeric(14,2) DEFAULT NULL::numeric, 
           "djjssj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "bz" varchar(10) COLLATE "pg_catalog"."default" NOT NULL, 
           "chbz" varchar(20) COLLATE "pg_catalog"."default", 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zh" IS '账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zhzzh" IS '子账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zzhxh" IS '子账号序号'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zzhye" IS '子帐号余额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zxjg" IS '执行结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zxjgyy" IS '执行结果原因'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."djjg" IS '在先冻结机关'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."zxdjje" IS '执行冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."djjzrq" IS '冻结截止日期'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."djje" IS '冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."djkssj" IS '冻结开始时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."wdjje" IS '未能冻结金额'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."djjssj" IS '冻结结束时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."bz" IS '币种'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."chbz" IS '钞汇标志'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."create_time" IS '创建时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_dj_detail"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "ck_cbrc_return_dj_detail" IS '银监查控冻结明细反馈表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_end 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_end" CASCADE; 
         CREATE TABLE "ck_cbrc_return_end" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_end_id_seq'::regclass), 
           "apply_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL, 
           "qqcslx" varchar(2) COLLATE "pg_catalog"."default", 
           "sqjgdm" varchar(32) COLLATE "pg_catalog"."default", 
           "mbjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "hzsj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "jsrws" int8, 
           "fkrws" int8, 
           "fkkhs" int8, 
           "fkzhs" int8, 
           "fkjymxs" int8, 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."apply_id" IS '查控单号'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."qqcslx" IS '请求措施类型'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."sqjgdm" IS '申请机构代码(部门ID)'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."mbjgdm" IS '目标机构代码(银行代码)'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."jsrws" IS '接收任务数'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."fkrws" IS '反馈任务数'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."fkkhs" IS '反馈客户数'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."fkzhs" IS '反馈账户数'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."fkjymxs" IS '反馈交易明细数'; 
         COMMENT ON COLUMN "ck_cbrc_return_end"."create_time" IS '创建时间'; 
         COMMENT ON TABLE "ck_cbrc_return_end" IS '请求执行结束回执信息'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_info" CASCADE; 
         CREATE TABLE "ck_cbrc_return_info" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_info_id_seq'::regclass), 
           "sqjgdm" varchar(32) COLLATE "pg_catalog"."default", 
           "mbjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "hzsm" varchar(200) COLLATE "pg_catalog"."default", 
           "hzdm" varchar(50) COLLATE "pg_catalog"."default", 
           "cwlx" varchar(50) COLLATE "pg_catalog"."default", 
           "cljg" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int8, 
           "apply_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL, 
           "hzsj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."sqjgdm" IS '申请机构代码(部门ID)'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."mbjgdm" IS '目标机构代码(银行代码)'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."hzsm" IS '回执说明'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."hzdm" IS '回执代码'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."cwlx" IS '类型'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."cljg" IS '处理结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."apply_id" IS '查控单号'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."hzsj" IS '接收时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_info"."create_time" IS '创建时间'; 
         COMMENT ON TABLE "ck_cbrc_return_info" IS '请求接受回执信息'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_jjzf 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_jjzf" CASCADE; 
         CREATE TABLE "ck_cbrc_return_jjzf" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_jjzf_id_seq'::regclass), 
           "qqdh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zxjg" varchar(10) COLLATE "pg_catalog"."default" NOT NULL, 
           "sbyy" varchar(500) COLLATE "pg_catalog"."default", 
           "zxqssj" date, 
           "hzsj" date NOT NULL, 
           "bank_code" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "bank_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "caseid" int8 NOT NULL, 
           "sjly_id" int8, 
           "rwlsh" varchar(35) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."zh" IS '账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."zxjg" IS '执行结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."sbyy" IS '执行结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."zxqssj" IS '执行起始时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."bank_code" IS '银行代码'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."bank_name" IS '银行名称'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."caseid" IS '案件ID(入库更新)'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."sjly_id" IS '数据来源ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."create_time" IS '创建时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf"."maxid" IS '最大ID'
         ; 
         COMMENT ON TABLE "ck_cbrc_return_jjzf" IS '银监查控紧急止付反馈信息表'; 
          
         -- ---------------------------- 
         -- Table structure for ck_cbrc_return_jjzf_detail 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "ck_cbrc_return_jjzf_detail" CASCADE; 
         CREATE TABLE "ck_cbrc_return_jjzf_detail" ( 
           "id" int8 NOT NULL DEFAULT nextval('ck_cbrc_return_jjzf_detail_id_seq'::regclass), 
           "rwlsh" varchar(35) COLLATE "pg_catalog"."default" NOT NULL, 
           "zh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zhzzh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhxh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhye" numeric(14,2) NOT NULL DEFAULT NULL::numeric, 
           "zxjgyy" varchar(500) COLLATE "pg_catalog"."default", 
           "zxjg" varchar(10) COLLATE "pg_catalog"."default" NOT NULL, 
           "zfkssj" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "zfjssj" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "bz" varchar(10) COLLATE "pg_catalog"."default" NOT NULL, 
           "chbz" varchar(20) COLLATE "pg_catalog"."default", 
           "create_time" timestamp(6) NOT NULL DEFAULT NULL::timestamp without time zone, 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."id" IS '表ID'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zh" IS '账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zhzzh" IS '子账号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zzhxh" IS '子账号序号'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zzhye" IS '子帐号余额'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zxjgyy" IS '执行结果原因'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zxjg" IS '执行结果'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zfkssj" IS '止付开始时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."zfjssj" IS '止付结束时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."bz" IS '币种'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."chbz" IS '钞汇标志'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."create_time" IS '创建时间'; 
         COMMENT ON COLUMN "ck_cbrc_return_jjzf_detail"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "ck_cbrc_return_jjzf_detail" IS '银监查控紧急止付明细反馈信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_account_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_account_info" CASCADE; 
         CREATE TABLE "gas_account_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_account_info_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "zh" varchar(80) COLLATE "pg_catalog"."default" NOT NULL, 
           "kh" varchar(80) COLLATE "pg_catalog"."default" NOT NULL, 
           "yhkid" varchar(50) COLLATE "pg_catalog"."default", 
           "ah" varchar(60) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(20) COLLATE "pg_catalog"."default", 
           "ryid" varchar(50) COLLATE "pg_catalog"."default", 
           "sjkzryid" varchar(50) COLLATE "pg_catalog"."default", 
           "beiz" varchar(200) COLLATE "pg_catalog"."default", 
           "bz" varchar(10) COLLATE "pg_catalog"."default", 
           "chbz" varchar(10) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "cljg" varchar(2) COLLATE "pg_catalog"."default", 
           "cxsj" varchar(30) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(64) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "dlr" varchar(100) COLLATE "pg_catalog"."default", 
           "dlrdh" varchar(20) COLLATE "pg_catalog"."default", 
           "dsnsh" varchar(64) COLLATE "pg_catalog"."default", 
           "dwdh" varchar(20) COLLATE "pg_catalog"."default", 
           "dwdz" varchar(200) COLLATE "pg_catalog"."default", 
           "fksj" varchar(20) COLLATE "pg_catalog"."default", 
           "frdb" varchar(64) COLLATE "pg_catalog"."default", 
           "frdbzjhm" varchar(64) COLLATE "pg_catalog"."default", 
           "frdbzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "glzjzh" varchar(64) COLLATE "pg_catalog"."default", 
           "gsnsh" varchar(64) COLLATE "pg_catalog"."default", 
           "gzdw" varchar(200) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(20) COLLATE "pg_catalog"."default", 
           "ifdkh" varchar(10) COLLATE "pg_catalog"."default", 
           "jrjgdm" varchar(60) COLLATE "pg_catalog"."default", 
           "khcs" varchar(100) COLLATE "pg_catalog"."default", 
           "khdm" varchar(50) COLLATE "pg_catalog"."default", 
           "khgszzhm" varchar(64) COLLATE "pg_catalog"."default", 
           "khrgj" varchar(22) COLLATE "pg_catalog"."default", 
           "khrq" varchar(20) COLLATE "pg_catalog"."default", 
           "khrzjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "khrzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "khsf" varchar(100) COLLATE "pg_catalog"."default", 
           "khwd" varchar(100) COLLATE "pg_catalog"."default", 
           "khwddm" varchar(20) COLLATE "pg_catalog"."default", 
           "kyye" float4, 
           "lxdh" varchar(20) COLLATE "pg_catalog"."default", 
           "lxfs" varchar(100) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(64) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "sfydq" char(10) COLLATE "pg_catalog"."default" DEFAULT NULL::bpchar, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "txdz" varchar(200) COLLATE "pg_catalog"."default", 
           "xhrq" varchar(20) COLLATE "pg_catalog"."default", 
           "xhwd" varchar(100) COLLATE "pg_catalog"."default", 
           "xycd" varchar(30) COLLATE "pg_catalog"."default", 
           "yxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "yzbm" varchar(64) COLLATE "pg_catalog"."default", 
           "zdr" varchar(20) COLLATE "pg_catalog"."default", 
           "zhjysj" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::bpchar, 
           "zhkhmc" varchar(100) COLLATE "pg_catalog"."default", 
           "zhkhyh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "zhxhyh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhye" numeric, 
           "zhzl" varchar(8) COLLATE "pg_catalog"."default", 
           "zhzt" varchar(64) COLLATE "pg_catalog"."default", 
           "zzdh" varchar(20) COLLATE "pg_catalog"."default", 
           "zzdz" varchar(200) COLLATE "pg_catalog"."default", 
           "cjrq" varchar(20) COLLATE "pg_catalog"."default", 
           "cjr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int8 NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "yt" varchar(50) COLLATE "pg_catalog"."default", 
           "jrjgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "yxq" varchar(50) COLLATE "pg_catalog"."default", 
           "sftm" varchar(10) COLLATE "pg_catalog"."default", 
           "hqfs" varchar(50) COLLATE "pg_catalog"."default", 
           "qm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfwz" varchar(10) COLLATE "pg_catalog"."default", 
           "xyrbh" varchar(50) COLLATE "pg_catalog"."default", 
           "khrzjlxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "batch" int8, 
           "bh" varchar(30) COLLATE "pg_catalog"."default", 
           "maxid" int4, 
           "mark" varchar(2048) COLLATE "pg_catalog"."default", 
           "bbzje" numeric, 
           "wbzje" numeric, 
           "bbbs" float8, 
           "wbbs" float8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_account_info"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_account_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_account_info"."zh" IS '帐号'; 
         COMMENT ON COLUMN "gas_account_info"."kh" IS '卡号'; 
         COMMENT ON COLUMN "gas_account_info"."yhkid" IS '银行卡ID'; 
         COMMENT ON COLUMN "gas_account_info"."ah" IS '案号'; 
         COMMENT ON COLUMN "gas_account_info"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_account_info"."ryid" IS '人员ID'; 
         COMMENT ON COLUMN "gas_account_info"."sjkzryid" IS '实际控制人ID'; 
         COMMENT ON COLUMN "gas_account_info"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_account_info"."bz" IS '币种'; 
         COMMENT ON COLUMN "gas_account_info"."chbz" IS '钞汇标志'; 
         COMMENT ON COLUMN "gas_account_info"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_account_info"."cljg" IS '处理结果'; 
         COMMENT ON COLUMN "gas_account_info"."cxsj" IS '查询时间'; 
         COMMENT ON COLUMN "gas_account_info"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_account_info"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_account_info"."dlr" IS '代理人'; 
         COMMENT ON COLUMN "gas_account_info"."dlrdh" IS '代理人电话'; 
         COMMENT ON COLUMN "gas_account_info"."dsnsh" IS '地税纳税号'; 
         COMMENT ON COLUMN "gas_account_info"."dwdh" IS '单位电话'; 
         COMMENT ON COLUMN "gas_account_info"."dwdz" IS '单位地址'; 
         COMMENT ON COLUMN "gas_account_info"."fksj" IS '反馈时间'; 
         COMMENT ON COLUMN "gas_account_info"."frdb" IS '法人代表'; 
         COMMENT ON COLUMN "gas_account_info"."frdbzjhm" IS '法人证件号码'; 
         COMMENT ON COLUMN "gas_account_info"."frdbzjlx" IS '法人证件类型'; 
         COMMENT ON COLUMN "gas_account_info"."glzjzh" IS '关联资金帐户'; 
         COMMENT ON COLUMN "gas_account_info"."gsnsh" IS '国税纳税号'; 
         COMMENT ON COLUMN "gas_account_info"."gzdw" IS '工作单位'; 
         COMMENT ON COLUMN "gas_account_info"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_account_info"."ifdkh" IS '是否调开户'; 
         COMMENT ON COLUMN "gas_account_info"."jrjgdm" IS '金融机构代码'; 
         COMMENT ON COLUMN "gas_account_info"."khcs" IS '开户城市'; 
         COMMENT ON COLUMN "gas_account_info"."khdm" IS '客户代码'; 
         COMMENT ON COLUMN "gas_account_info"."khgszzhm" IS '客户工商执照号码'; 
         COMMENT ON COLUMN "gas_account_info"."khrgj" IS '开户人国籍'; 
         COMMENT ON COLUMN "gas_account_info"."khrq" IS '开户日期'; 
         COMMENT ON COLUMN "gas_account_info"."khrzjhm" IS '开户人证件号码'; 
         COMMENT ON COLUMN "gas_account_info"."khrzjlx" IS '开户人证件类型'; 
         COMMENT ON COLUMN "gas_account_info"."khsf" IS '开户省份'; 
         COMMENT ON COLUMN "gas_account_info"."khwd" IS '开户网点'; 
         COMMENT ON COLUMN "gas_account_info"."khwddm" IS '开户网点代码'; 
         COMMENT ON COLUMN "gas_account_info"."kyye" IS '可用余额'; 
         COMMENT ON COLUMN "gas_account_info"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_account_info"."lxfs" IS '开户联系方式'; 
         COMMENT ON COLUMN "gas_account_info"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_account_info"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_account_info"."sfydq" IS '是否已调集'; 
         COMMENT ON COLUMN "gas_account_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_account_info"."txdz" IS '通信地址'; 
         COMMENT ON COLUMN "gas_account_info"."xhrq" IS '销户日期'; 
         COMMENT ON COLUMN "gas_account_info"."xhwd" IS '销户网点'; 
         COMMENT ON COLUMN "gas_account_info"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_account_info"."yxdz" IS '邮箱地址'; 
         COMMENT ON COLUMN "gas_account_info"."yzbm" IS '邮政编码'; 
         COMMENT ON COLUMN "gas_account_info"."zdr" IS '帐单日'; 
         COMMENT ON COLUMN "gas_account_info"."zhjysj" IS '最后交易时间'; 
         COMMENT ON COLUMN "gas_account_info"."zhkhmc" IS '帐户客户名称'; 
         COMMENT ON COLUMN "gas_account_info"."zhkhyh" IS '帐户开户银行'; 
         COMMENT ON COLUMN "gas_account_info"."zhlx" IS '帐户类型'; 
         COMMENT ON COLUMN "gas_account_info"."zhxhyh" IS '帐户销户银行'; 
         COMMENT ON COLUMN "gas_account_info"."zhye" IS '帐户余额'; 
         COMMENT ON COLUMN "gas_account_info"."zhzl" IS '帐户种类(个人,单位)'; 
         COMMENT ON COLUMN "gas_account_info"."zhzt" IS '帐户状态'; 
         COMMENT ON COLUMN "gas_account_info"."zzdh" IS '住宅电话'; 
         COMMENT ON COLUMN "gas_account_info"."zzdz" IS '住宅地址'; 
         COMMENT ON COLUMN "gas_account_info"."cjrq" IS '创建日期'; 
         COMMENT ON COLUMN "gas_account_info"."cjr" IS '创建人'; 
         COMMENT ON COLUMN "gas_account_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_account_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_account_info"."yt" IS '用途'; 
         COMMENT ON COLUMN "gas_account_info"."jrjgmc" IS '金融机构名称'; 
         COMMENT ON COLUMN "gas_account_info"."yxq" IS '有效期'; 
         COMMENT ON COLUMN "gas_account_info"."sftm" IS '是否同名'; 
         COMMENT ON COLUMN "gas_account_info"."hqfs" IS '获取方式'; 
         COMMENT ON COLUMN "gas_account_info"."qm" IS '签名'; 
         COMMENT ON COLUMN "gas_account_info"."sfwz" IS '是否伪造'; 
         COMMENT ON COLUMN "gas_account_info"."xyrbh" IS '嫌疑人编号'; 
         COMMENT ON COLUMN "gas_account_info"."khrzjlxmc" IS '开户人证件类型名称'; 
         COMMENT ON COLUMN "gas_account_info"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_account_info"."bh" IS '编号'; 
         COMMENT ON COLUMN "gas_account_info"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_account_info"."mark" IS '标签'; 
         COMMENT ON COLUMN "gas_account_info"."bbzje" IS '本币总金额'; 
         COMMENT ON COLUMN "gas_account_info"."wbzje" IS '外币总金额'; 
         COMMENT ON COLUMN "gas_account_info"."bbbs" IS '本币笔数'; 
         COMMENT ON COLUMN "gas_account_info"."wbbs" IS '外币笔数'; 
         COMMENT ON TABLE "gas_account_info" IS '案件数据-银行卡信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_account_info_chakong 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_account_info_chakong" CASCADE; 
         CREATE TABLE "gas_account_info_chakong" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_account_info_chakong_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "zh" varchar(80) COLLATE "pg_catalog"."default" NOT NULL, 
           "kh" varchar(80) COLLATE "pg_catalog"."default" NOT NULL, 
          
          "qqdh" varchar(64) COLLATE "pg_catalog"."default" NOT NULL, 
           "yhkid" varchar(50) COLLATE "pg_catalog"."default", 
           "ah" varchar(60) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(20) COLLATE "pg_catalog"."default", 
           "ryid" varchar(50) COLLATE "pg_catalog"."default", 
           "sjkzryid" varchar(50) COLLATE "pg_catalog"."default", 
           "beiz" varchar(200) COLLATE "pg_catalog"."default", 
           "bz" varchar(10) COLLATE "pg_catalog"."default", 
           "chbz" varchar(10) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "cljg" varchar(2) COLLATE "pg_catalog"."default", 
           "cxsj" varchar(30) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(64) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "dlr" varchar(100) COLLATE "pg_catalog"."default", 
           "dlrdh" varchar(20) COLLATE "pg_catalog"."default", 
           "dsnsh" varchar(64) COLLATE "pg_catalog"."default", 
           "dwdh" varchar(20) COLLATE "pg_catalog"."default", 
           "dwdz" varchar(200) COLLATE "pg_catalog"."default", 
           "fksj" varchar(20) COLLATE "pg_catalog"."default", 
           "frdb" varchar(64) COLLATE "pg_catalog"."default", 
           "frdbzjhm" varchar(64) COLLATE "pg_catalog"."default", 
           "frdbzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "glzjzh" varchar(64) COLLATE "pg_catalog"."default", 
           "gsnsh" varchar(64) COLLATE "pg_catalog"."default", 
           "gzdw" varchar(200) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(20) COLLATE "pg_catalog"."default", 
           "ifdkh" varchar(2) COLLATE "pg_catalog"."default", 
           "jrjgdm" varchar(60) COLLATE "pg_catalog"."default", 
           "khcs" varchar(100) COLLATE "pg_catalog"."default", 
           "khdm" varchar(50) COLLATE "pg_catalog"."default", 
           "khgszzhm" varchar(64) COLLATE "pg_catalog"."default", 
           "khrgj" varchar(22) COLLATE "pg_catalog"."default", 
           "khrq" varchar(20) COLLATE "pg_catalog"."default", 
           "khrzjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "khrzjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "khsf" varchar(100) COLLATE "pg_catalog"."default", 
           "khwd" varchar(100) COLLATE "pg_catalog"."default", 
           "khwddm" varchar(20) COLLATE "pg_catalog"."default", 
           "kyye" numeric(24), 
           "lxdh" varchar(20) COLLATE "pg_catalog"."default", 
           "lxfs" varchar(100) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "sfydq" char(1) COLLATE "pg_catalog"."default" DEFAULT NULL::bpchar, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "txdz" varchar(200) COLLATE "pg_catalog"."default", 
           "xhrq" varchar(20) COLLATE "pg_catalog"."default", 
           "xhwd" varchar(100) COLLATE "pg_catalog"."default", 
           "xycd" varchar(30) COLLATE "pg_catalog"."default", 
           "yxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "yzbm" varchar(64) COLLATE "pg_catalog"."default", 
           "zdr" varchar(20) COLLATE "pg_catalog"."default", 
           "zhjysj" char(30) COLLATE "pg_catalog"."default" DEFAULT NULL::bpchar, 
           "zhkhmc" varchar(30) COLLATE "pg_catalog"."default", 
           "zhkhyh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "zhxhyh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhye" numeric(24), 
           "zhzl" varchar(8) COLLATE "pg_catalog"."default", 
           "zhzt" varchar(64) COLLATE "pg_catalog"."default", 
           "zzdh" varchar(20) COLLATE "pg_catalog"."default", 
           "zzdz" varchar(200) COLLATE "pg_catalog"."default", 
           "cjrq" varchar(20) COLLATE "pg_catalog"."default", 
           "cjr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "yt" varchar(50) COLLATE "pg_catalog"."default", 
           "jrjgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "yxq" varchar(50) COLLATE "pg_catalog"."default", 
           "sftm" varchar(10) COLLATE "pg_catalog"."default", 
           "hqfs" varchar(50) COLLATE "pg_catalog"."default", 
           "qm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfwz" varchar(10) COLLATE "pg_catalog"."default", 
           "xyrbh" varchar(50) COLLATE "pg_catalog"."default", 
           "khrzjlxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         
         COMMENT ON COLUMN "gas_account_info_chakong"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zh" IS '帐号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."kh" IS '卡号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."yhkid" IS '银行卡ID'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ah" IS '案号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ryid" IS '人员ID'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sjkzryid" IS '实际控制人ID'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."bz" IS '币种'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."chbz" IS '钞汇标志'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."cljg" IS '处理结果'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."cxsj" IS '查询时间'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dlr" IS '代理人'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dlrdh" IS '代理人电话'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dsnsh" IS '地税纳税号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dwdh" IS '单位电话'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."dwdz" IS '单位地址'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."fksj" IS '反馈时间'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."frdb" IS '法人代表'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."frdbzjhm" IS '法人证件号码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."frdbzjlx" IS '法人证件类型'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."glzjzh" IS '关联资金帐户'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."gsnsh" IS '国税纳税号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."gzdw" IS '工作单位'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."ifdkh" IS '是否调开户'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."jrjgdm" IS '金融机构代码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khcs" IS '开户城市'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khdm" IS '客户代码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khgszzhm" IS '客户工商执照号码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khrgj" IS '开户人国籍'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khrq" IS '开户日期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khrzjhm" IS '开户人证件号码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khrzjlx" IS '开户人证件类型'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khsf" IS '开户省份'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khwd" IS '开户网点'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khwddm" IS '开户网点代码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."kyye" IS '可用余额'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."lxfs" IS '开户联系方式'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sfydq" IS '是否已调集'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."txdz" IS '通信地址'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."xhrq" IS '销户日期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."xhwd" IS '销户网点'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."yxdz" IS '邮箱地址'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."yzbm" IS '邮政编码'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zdr" IS '帐单日'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhjysj" IS '最后交易时间'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhkhmc" IS '帐户客户名称'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhkhyh" IS '帐户开户银行'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhlx" IS '帐户类型'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhxhyh" IS '帐户销户银行'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhye" IS '帐户余额'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhzl" IS '帐户种类(个人,单位)'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zhzt" IS '帐户状态'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zzdh" IS '住宅电话'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."zzdz" IS '住宅地址'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."cjrq" IS '创建日期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."cjr" IS '创建人'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."yt" IS '用途'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."jrjgmc" IS '金融机构名称'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."yxq" IS '有效期'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sftm" IS '是否同名'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."hqfs" IS '获取方式'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."qm" IS '签名'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."sfwz" IS '是否伪造'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."xyrbh" IS '嫌疑人编号'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."khrzjlxmc" IS '开户人证件类型名称'; 
         COMMENT ON COLUMN "gas_account_info_chakong"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_account_info_chakong" IS '银行卡信息(查控返回数据)'; 
          
         -- ---------------------------- 
         -- Table structure for gas_analysis_record 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_analysis_record" CASCADE; 
         CREATE TABLE "gas_analysis_record" ( 
           "id" int8 NOT NULL DEFAULT nextval('gas_analysis_record_id_seq'::regclass), 
           "m_type" varchar(255) COLLATE "pg_catalog"."default", 
           "ajid" varchar(255) COLLATE "pg_catalog"."default", 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "r_name" varchar(200) COLLATE "pg_catalog"."default" NOT NULL, 
           "tjsj" varchar(255) COLLATE "pg_catalog"."default", 
           "out_type" int8, 
           "page_type" varchar(255) COLLATE "pg_catalog"."default", 
           "sql_var" bytea, 
           "md_type" varchar(255) COLLATE "pg_catalog"."default", 
           "mpids" varchar(255) COLLATE "pg_catalog"."default", 
           "sql_detail" bytea, 
           "batchid" varchar(255) COLLATE "pg_catalog"."default", 
           "version" varchar(16) COLLATE "pg_catalog"."default", 
           "alreadymids" varchar(1024) COLLATE "pg_catalog"."default", 
           "mpids_describe" varchar(512) COLLATE "pg_catalog"."default", 
           "m_param" bytea, 
           "sql_orderby" varchar(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_analysis_record"."m_type" IS '模型类型标识'; 
         COMMENT ON COLUMN "gas_analysis_record"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_analysis_record"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_analysis_record"."r_name" IS '记录名称标签'; 
         COMMENT ON COLUMN "gas_analysis_record"."tjsj" IS '记录添加时间'; 
         COMMENT ON COLUMN "gas_analysis_record"."out_type" IS '''输出表类型 1表格， 2视图，3上表下图'''; 
         COMMENT ON COLUMN "gas_analysis_record"."page_type" IS '页面类型'; 
         COMMENT ON COLUMN "gas_analysis_record"."sql_var" IS '存储当前执行SQL模板语句 '; 
         COMMENT ON COLUMN "gas_analysis_record"."md_type" IS '模型数据类型（0账卡号，1证照号，2主体名称）'; 
         COMMENT ON COLUMN "gas_analysis_record"."mpids" IS '模型匹配条件编号'; 
         COMMENT ON COLUMN "gas_analysis_record"."sql_detail" IS '详细数据笔数SQL'; 
         COMMENT ON COLUMN "gas_analysis_record"."batchid" IS '反洗钱批次标识'; 
         COMMENT ON COLUMN "gas_analysis_record"."version" IS '版本号'; 
         COMMENT ON COLUMN "gas_analysis_record"."alreadymids" IS '已完成子model'; 
         COMMENT ON COLUMN "gas_analysis_record"."mpids_describe" IS '模型匹配条件运算逻辑关系描述，如： 
         条件编号：1,2,3的逻辑关系为且，则需要编辑为： 
         DESC_1且DESC_2且DESC_3'; 
         COMMENT ON COLUMN "gas_analysis_record"."m_param" IS '模型参数'; 
         COMMENT ON COLUMN "gas_analysis_record"."sql_orderby" IS 'sql排序'; 
         COMMENT ON TABLE "gas_analysis_record" IS '分析历史记录-存储分析条件'; 
          
         -- ---------------------------- 
         -- Table structure for gas_analysis_record_visual 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_analysis_record_visual" CASCADE; 
         CREATE TABLE "gas_analysis_record_visual" ( 
           "id" int8 NOT NULL DEFAULT nextval('gas_analysis_record_visual_id_seq'::regclass), 
           "ajid" varchar(255) COLLATE "pg_catalog"."default", 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "v_name" varchar(200) COLLATE "pg_catalog"."default" NOT NULL, 
           "v_tjsj" varchar(255) COLLATE "pg_catalog"."default", 
           "v_content" bytea, 
           "m_name" varchar(255) COLLATE "pg_catalog"."default", 
           "m_type" varchar(255) COLLATE "pg_catalog"."default", 
          
          "md_type" varchar(255) COLLATE "pg_catalog"."default", 
           "version" varchar(16) COLLATE "pg_catalog"."default", 
           "m_param" bytea 
         ) 
         ; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."v_name" IS '记录名称'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."v_tjsj" IS '记录添加时间'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."v_content" IS '视图内容'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."m_name" IS '保存模型名称'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."m_type" IS '模型类型标识'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."md_type" IS '模型数据类型（0账卡号，1证照号，2主体名称,100筛选）'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."version" IS '版本号'; 
         COMMENT ON COLUMN "gas_analysis_record_visual"."m_param" IS '模型条件'; 
         COMMENT ON TABLE "gas_analysis_record_visual" IS '分析历史记录-存储可视化视图'; 
          
         -- ---------------------------- 
         -- Table structure for gas_awaittask 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_awaittask" CASCADE; 
         CREATE TABLE "gas_awaittask" ( 
           "id" int8 NOT NULL DEFAULT nextval('gas_awaittask_id_seq'::regclass), 
           "ajid" int8, 
           "cxzh" varchar(100) COLLATE "pg_catalog"."default", 
           "yh_code" varchar(100) COLLATE "pg_catalog"."default", 
           "yh_name" varchar(50) COLLATE "pg_catalog"."default", 
           "zz_code" varchar(100) COLLATE "pg_catalog"."default", 
           "zz_name" varchar(200) COLLATE "pg_catalog"."default", 
           "zh_ztlb" varchar(50) COLLATE "pg_catalog"."default", 
           "zh_ztlb_name" varchar(100) COLLATE "pg_catalog"."default", 
           "tjsj" timestamp(6) DEFAULT NULL::timestamp without time zone, 
           "tjrw" varchar(255) COLLATE "pg_catalog"."default", 
           "task_type" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "type_id" int8, 
           "jyhm" varchar(100) COLLATE "pg_catalog"."default", 
           "target" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "xgsj" timestamp(6) 
         ) 
         ; 
         COMMENT ON COLUMN "gas_awaittask"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_awaittask"."cxzh" IS '账卡号'; 
         COMMENT ON COLUMN "gas_awaittask"."yh_code" IS '账号银行代码'; 
         COMMENT ON COLUMN "gas_awaittask"."yh_name" IS '账号银行名称'; 
         COMMENT ON COLUMN "gas_awaittask"."zz_code" IS '开户证照号码'; 
         COMMENT ON COLUMN "gas_awaittask"."zz_name" IS '开户证照名称'; 
         COMMENT ON COLUMN "gas_awaittask"."zh_ztlb" IS '账号主体类别（01个人/02单位）'; 
         COMMENT ON COLUMN "gas_awaittask"."zh_ztlb_name" IS '账号主体类别名称'; 
         COMMENT ON COLUMN "gas_awaittask"."tjsj" IS '添加时间'; 
         COMMENT ON COLUMN "gas_awaittask"."tjrw" IS '添加任务人员（登录警号）'; 
         COMMENT ON COLUMN "gas_awaittask"."task_type" IS '待办任务类型'; 
         COMMENT ON COLUMN "gas_awaittask"."type_id" IS '调单类型编号'; 
         COMMENT ON COLUMN "gas_awaittask"."jyhm" IS '交易户名'; 
         COMMENT ON COLUMN "gas_awaittask"."target" IS '交易方或者对手方标识'; 
         COMMENT ON COLUMN "gas_awaittask"."xgsj" IS '修改时间'; 
         COMMENT ON TABLE "gas_awaittask" IS '待办任务信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_bank_records 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_bank_records" CASCADE; 
         CREATE TABLE "gas_bank_records" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_bank_records_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "yhjymxid" varchar(50) COLLATE "pg_catalog"."default", 
           "cxzh" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jdbz" varchar(10) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" numeric, 
           "jyye" numeric, 
           "jybz" varchar(20) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "dsjyye" numeric, 
           "jydfzhkhh" varchar(100) COLLATE "pg_catalog"."default", 
           "jyyhmc" varchar(200) COLLATE "pg_catalog"."default", 
           "shh" varchar(100) COLLATE "pg_catalog"."default", 
           "shmc" varchar(2000) COLLATE "pg_catalog"."default", 
           "zysm" varchar(200) COLLATE "pg_catalog"."default", 
           "qd" varchar(100) COLLATE "pg_catalog"."default", 
           "jywdmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ip" varchar(40) COLLATE "pg_catalog"."default", 
           "mac" varchar(100) COLLATE "pg_catalog"."default", 
           "rzh" varchar(30) COLLATE "pg_catalog"."default", 
           "jylx" varchar(100) COLLATE "pg_catalog"."default", 
           "jygj" varchar(20) COLLATE "pg_catalog"."default", 
           "jyhwdd" varchar(30) COLLATE "pg_catalog"."default", 
           "jyfsd" varchar(300) COLLATE "pg_catalog"."default", 
           "jycs" varchar(100) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(100) COLLATE "pg_catalog"."default", 
           "ssfkyhjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "sbyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "xycd" numeric(10), 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jysfcg" varchar(200) COLLATE "pg_catalog"."default", 
           "pzzl" varchar(10) COLLATE "pg_catalog"."default", 
           "cxjssj" varchar(50) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "sljgmc" varchar(200) COLLATE "pg_catalog"."default", 
           "ah" varchar(60) COLLATE "pg_catalog"."default", 
           "beiz" varchar(200) COLLATE "pg_catalog"."default", 
           "sljgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "jyyhkid" numeric(32) DEFAULT NULL::numeric, 
           "dqmc" varchar(100) COLLATE "pg_catalog"."default", 
           "xtgzh" varchar(20) COLLATE "pg_catalog"."default", 
           "fsjgmc" varchar(200) COLLATE "pg_catalog"."default", 
           "ysbh" varchar(30) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "jsckh" varchar(20) COLLATE "pg_catalog"."default", 
           "jylsh" varchar(50) COLLATE "pg_catalog"."default", 
           "jydfzkhlx" varchar(2) COLLATE "pg_catalog"."default", 
           "mxlx" varchar(1) COLLATE "pg_catalog"."default", 
           "qxdm" varchar(100) COLLATE "pg_catalog"."default", 
           "fsjgbsm" varchar(20) COLLATE "pg_catalog"."default", 
           "dsyhkid" numeric(32) DEFAULT NULL::numeric, 
           "qxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jygyh" varchar(30) COLLATE "pg_catalog"."default", 
           "cxfkjgyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "zdh" varchar(100) COLLATE "pg_catalog"."default", 
           "jykhh" varchar(100) COLLATE "pg_catalog"."default", 
           "xjbz" varchar(30) COLLATE "pg_catalog"."default", 
           "cxkssj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" numeric(32) NOT NULL DEFAULT NULL::numeric, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "ksx" varchar(20) COLLATE "pg_catalog"."default", 
           "jyds_ssfkyhjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "bankcode" varchar(100) COLLATE "pg_catalog"."default", 
           "dqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "cljg" varchar(2) COLLATE "pg_catalog"."default", 
           "cph" varchar(40) COLLATE "pg_catalog"."default", 
           "cxfkjg" varchar(30) COLLATE "pg_catalog"."default", 
           "jyjz" varchar(100) COLLATE "pg_catalog"."default", 
           "pzh" varchar(255) COLLATE "pg_catalog"."default", 
           "lytype" varchar(20) COLLATE "pg_catalog"."default", 
           "markrow" varchar(100) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "jkje" numeric, 
           "dkje" numeric, 
           "maxid" int4 DEFAULT 0, 
           "bsfs" varchar(100) COLLATE "pg_catalog"."default", 
           "bsrq" varchar(100) COLLATE "pg_catalog"."default", 
           "bwid" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrgj" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrmc" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "dekybs" varchar(50) COLLATE "pg_catalog"."default", 
           "del" varchar(50) COLLATE "pg_catalog"."default", 
           "fkfgj" varchar(100) COLLATE "pg_catalog"."default", 
           "fkflx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfwddm" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfwddmlx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfyhszd" varchar(300) COLLATE "pg_catalog"."default", 
           "fkfzhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfsdtemyqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfsmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyjlid" varchar(100) COLLATE "pg_catalog"."default", 
           "jytzdm" varchar(100) COLLATE "pg_catalog"."default", 
           "kjjybj" varchar(100) COLLATE "pg_catalog"."default", 
           "kjlb" varchar(100) COLLATE "pg_catalog"."default", 
           "ldrq" varchar(100) COLLATE "pg_catalog"."default", 
           "mbdm" varchar(100) COLLATE "pg_catalog"."default", 
           "mbmc" varchar(100) COLLATE "pg_catalog"."default", 
           "myje" varchar(100) COLLATE "pg_catalog"."default", 
           "rketlsj" varchar(100) COLLATE "pg_catalog"."default", 
           "rmbje" varchar(100) COLLATE "pg_catalog"."default", 
           "scbs" varchar(100) COLLATE "pg_catalog"."default", 
           "sffzhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "skfgj" varchar(100) COLLATE "pg_catalog"."default", 
           "skflx" varchar(100) COLLATE "pg_catalog"."default", 
           "skftemyqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "skfwddm" varchar(100) COLLATE "pg_catalog"."default", 
           "skfwddmlx" varchar(100) COLLATE "pg_catalog"."default", 
           "skfyhszd" varchar(300) COLLATE "pg_catalog"."default", 
           "skfzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "sxetlsj" varchar(100) COLLATE "pg_catalog"."default", 
           "tjzt" varchar(100) COLLATE "pg_catalog"."default", 
           "ybje" varchar(100) COLLATE "pg_catalog"."default", 
           "ydejygx" varchar(100) COLLATE "pg_catalog"."default", 
           "yjyid" varchar(100) COLLATE "pg_catalog"."default", 
           "ywbsh" varchar(100) COLLATE "pg_catalog"."default", 
           "zt" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfs" varchar(100) COLLATE "pg_catalog"."default", 
           "hbmc" varchar(100) COLLATE "pg_catalog"."default", 
           "bgjg" varchar(100) COLLATE "pg_catalog"."default", 
           "swszfl" varchar(100) COLLATE "pg_catalog"."default", 
           "wyipdz" varchar(30) COLLATE "pg_catalog"."default", 
           "ipsf" varchar(200) COLLATE "pg_catalog"."default", 
           "ipcs" varchar(200) COLLATE "pg_catalog"."default", 
           "ipdq" varchar(200) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_bank_records"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_bank_records"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_bank_records"."yhjymxid" IS '银行交易明细ID'; 
         COMMENT ON COLUMN "gas_bank_records"."cxzh" IS '查询账号'; 
         COMMENT ON COLUMN "gas_bank_records"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "gas_bank_records"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "gas_bank_records"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "gas_bank_records"."jdbz" IS '借贷标志'; 
         COMMENT ON COLUMN "gas_bank_records"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "gas_bank_records"."jyrq" IS '交易日期'; 
         COMMENT ON COLUMN "gas_bank_records"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_bank_records"."jyye" IS '交易余额'; 
         COMMENT ON COLUMN "gas_bank_records"."jybz" IS '交易币种'; 
         COMMENT ON COLUMN "gas_bank_records"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "gas_bank_records"."jydfmc" IS '对手户名'; 
         COMMENT ON COLUMN "gas_bank_records"."jydfzjhm" IS '对手身份证号'; 
         COMMENT ON COLUMN "gas_bank_records"."dsjyye" IS '对手交易余额'; 
         COMMENT ON COLUMN "gas_bank_records"."jydfzhkhh" IS '对手开户银行'; 
         COMMENT ON COLUMN "gas_bank_records"."jyyhmc" IS '交易银行名'; 
         COMMENT ON COLUMN "gas_bank_records"."shh" IS '商户代码'; 
         COMMENT ON COLUMN "gas_bank_records"."shmc" IS '商户名称'; 
         COMMENT ON COLUMN "gas_bank_records"."zysm" IS '摘要说明'; 
         COMMENT ON COLUMN "gas_bank_records"."qd" IS '渠道'; 
         COMMENT ON COLUMN "gas_bank_records"."jywdmc" IS '交易网点名称'; 
         COMMENT ON COLUMN "gas_bank_records"."ip" IS 'IP地址'; 
         COMMENT ON COLUMN "gas_bank_records"."mac" IS 'MAC地址'; 
         COMMENT ON COLUMN "gas_bank_records"."rzh" IS '日志号'; 
         COMMENT ON COLUMN "gas_bank_records"."jylx" IS '交易类型'; 
         COMMENT ON COLUMN "gas_bank_records"."jygj" IS '交易国家'; 
         COMMENT ON COLUMN "gas_bank_records"."jyhwdd" IS '交易网点号'; 
         COMMENT ON COLUMN "gas_bank_records"."jyfsd" IS '交易发生地'; 
         COMMENT ON COLUMN "gas_bank_records"."jycs" IS '交易场所'; 
         COMMENT ON COLUMN "gas_bank_records"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_bank_records"."ssfkyhjgdm" IS '所属发卡银行机构代码'; 
         COMMENT ON COLUMN "gas_bank_records"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_bank_records"."sbyy" IS '失败原因'; 
         COMMENT ON COLUMN "gas_bank_records"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_bank_records"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_bank_records"."ajcjrq" IS '案件采集日期'; 
         COMMENT ON COLUMN "gas_bank_records"."jysfcg" IS '交易是否成功'; 
         COMMENT ON COLUMN "gas_bank_records"."pzzl" IS '凭证种类'; 
         COMMENT ON COLUMN "gas_bank_records"."cxjssj" IS '查询结束时间'; 
         COMMENT ON COLUMN "gas_bank_records"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_bank_records"."sljgmc" IS '受理机构名称'; 
         COMMENT ON COLUMN "gas_bank_records"."ah" IS '案号（工商查询时使用）'; 
         COMMENT ON COLUMN "gas_bank_records"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_bank_records"."sljgdm" IS '受理机构代码'; 
         COMMENT ON COLUMN "gas_bank_records"."jyyhkid" IS '交易银行卡ID'; 
         COMMENT ON COLUMN "gas_bank_records"."dqmc" IS '地区名称'; 
         COMMENT ON COLUMN "gas_bank_records"."xtgzh" IS '系统跟踪号'; 
         COMMENT ON COLUMN "gas_bank_records"."fsjgmc" IS '发送机构名称'; 
         COMMENT ON COLUMN "gas_bank_records"."ysbh" IS '编号'; 
         COMMENT ON COLUMN "gas_bank_records"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_bank_records"."jsckh" IS '检索参考号'; 
         COMMENT ON COLUMN "gas_bank_records"."jylsh" IS '交易流水号'; 
         COMMENT ON COLUMN "gas_bank_records"."jydfzkhlx" IS '交易对方账卡号类型'; 
         COMMENT ON COLUMN "gas_bank_records"."mxlx" IS '明细类型，0为账户交易明显，1为商户信息，2调集银行卡信息'; 
         COMMENT ON COLUMN "gas_bank_records"."qxdm" IS '区县代码'; 
         COMMENT ON COLUMN "gas_bank_records"."fsjgbsm" IS '发送机构标识码'; 
         COMMENT ON COLUMN "gas_bank_records"."dsyhkid" IS '对手银行卡ID'; 
         COMMENT ON COLUMN "gas_bank_records"."qxmc" IS '区县名称'; 
         COMMENT ON COLUMN "gas_bank_records"."jygyh" IS '交易柜员号'; 
         COMMENT ON COLUMN "gas_bank_records"."cxfkjgyy" IS '查询反馈结果原因'; 
         COMMENT ON COLUMN "gas_bank_records"."zdh" IS '终端号'; 
         COMMENT ON COLUMN "gas_bank_records"."jykhh" IS '交易账户开户银行'; 
         COMMENT ON COLUMN "gas_bank_records"."xjbz" IS '现金标志'; 
         COMMENT ON COLUMN "gas_bank_records"."cxkssj" IS '查询开始时间'; 
         COMMENT ON COLUMN "gas_bank_records"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_bank_records"."sjlylx" IS '数据来源类型(采集录入、手工录入、数据抽取)'; 
         COMMENT ON COLUMN "gas_bank_records"."ksx" IS '卡属性'; 
         COMMENT ON COLUMN "gas_bank_records"."jyds_ssfkyhjgdm" IS '交易对手所属发卡银行机构代码'; 
         COMMENT ON COLUMN "gas_bank_records"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_bank_records"."bankcode" IS '银行代码'; 
         COMMENT ON COLUMN "gas_bank_records"."dqdm" IS '地区代码'; 
         COMMENT ON COLUMN "gas_bank_records"."cljg" IS '处理结果 0-成功；1-失败；2-零数据；'; 
         COMMENT ON COLUMN "gas_bank_records"."cph" IS '传票号'; 
         COMMENT ON COLUMN "gas_bank_records"."cxfkjg" IS '查询反馈结果'; 
         COMMENT ON COLUMN "gas_bank_records"."jyjz" IS '交易介质'; 
         COMMENT ON COLUMN "gas_bank_records"."pzh" IS '凭证号'; 
         COMMENT ON COLUMN "gas_bank_records"."lytype" IS '来源类型'; 
         COMMENT ON COLUMN "gas_bank_records"."markrow" IS '标记行'; 
         COMMENT ON COLUMN "gas_bank_records"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_bank_records"."jkje" IS '借款金额'; 
         COMMENT ON COLUMN "gas_bank_records"."dkje" IS '贷款金额'; 
         COMMENT ON COLUMN "gas_bank_records"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_bank_records"."bsfs" IS '报送方式'; 
         COMMENT ON COLUMN "gas_bank_records"."bsrq" IS '报送日期'; 
         COMMENT ON COLUMN "gas_bank_records"."bwid" IS '报文ID'; 
         COMMENT ON COLUMN "gas_bank_records"."dbrgj" IS '代办人国籍'; 
         COMMENT ON COLUMN "gas_bank_records"."dbrmc" IS '代办人名称'; 
         COMMENT ON COLUMN "gas_bank_records"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_bank_records"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_bank_records"."dekybs" IS '大额可疑标识'; 
         COMMENT ON COLUMN "gas_bank_records"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfgj" IS '付款方国籍'; 
         COMMENT ON COLUMN "gas_bank_records"."fkflx" IS '付款方类型'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfwddm" IS '付款方网点代码'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfwddmlx" IS '付款方网点代码类型'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfyhszd" IS '付款方银行所在地'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfzhlx" IS '付款方账号类型'; 
         COMMENT ON COLUMN "gas_bank_records"."fkfzjlx" IS '付款方证件类型'; 
         COMMENT ON COLUMN "gas_bank_records"."jyfsdtemyqdm" IS '交易发生地特殊贸易区代码'; 
         COMMENT ON COLUMN "gas_bank_records"."jyfsmc" IS '交易方式名称'; 
         COMMENT ON COLUMN "gas_bank_records"."jyjlid" IS '交易记录ID'; 
         COMMENT ON COLUMN "gas_bank_records"."jytzdm" IS '交易特征代码'; 
         COMMENT ON COLUMN "gas_bank_records"."kjjybj" IS '跨境交易标记'; 
         COMMENT ON COLUMN "gas_bank_records"."kjlb" IS '跨境类别'; 
         COMMENT ON COLUMN "gas_bank_records"."ldrq" IS '落地日期'; 
         COMMENT ON COLUMN "gas_bank_records"."mbdm" IS '模板代码'; 
         COMMENT ON COLUMN "gas_bank_records"."mbmc" IS '模板名称'; 
         COMMENT ON COLUMN "gas_bank_records"."myje" IS '美元金额'; 
         COMMENT ON COLUMN "gas_bank_records"."rketlsj" IS '入库ETL时间'; 
         COMMENT ON COLUMN "gas_bank_records"."rmbje" IS '人民币金额'; 
         COMMENT ON COLUMN "gas_bank_records"."scbs" IS '删除标识'; 
         COMMENT ON COLUMN "gas_bank_records"."sffzhlx" IS '收款方账号类型'; 
         COMMENT ON COLUMN "gas_bank_records"."skfgj" IS '收款方国籍'; 
         COMMENT ON COLUMN "gas_bank_records"."skflx" IS '收款方类型'; 
         COMMENT ON COLUMN "gas_bank_records"."skftemyqdm" IS '收款方贸易特殊区代码'; 
         COMMENT ON COLUMN "gas_bank_records"."skfwddm" IS '收款方网点代码'; 
         COMMENT ON COLUMN "gas_bank_records"."skfwddmlx" IS '收款方网点代码类型'; 
         COMMENT ON COLUMN "gas_bank_records"."skfyhszd" IS '收款方银行所在地'; 
         COMMENT ON COLUMN "gas_bank_records"."skfzjlx" IS '收款方证件类型'; 
         COMMENT ON COLUMN "gas_bank_records"."sxetlsj" IS '失效ETL时间'; 
         COMMENT ON COLUMN "gas_bank_records"."tjzt" IS '统计状态'; 
         COMMENT ON COLUMN "gas_bank_records"."ybje" IS '原币金额'; 
         COMMENT ON COLUMN "gas_bank_records"."ydejygx" IS '与大额交易的关系'; 
         COMMENT ON COLUMN "gas_bank_records"."yjyid" IS '原交易ID'; 
         COMMENT ON COLUMN "gas_bank_records"."ywbsh" IS '业务标识号'; 
         COMMENT ON COLUMN "gas_bank_records"."zt" IS '状态'; 
         COMMENT ON COLUMN "gas_bank_records"."jyfs" IS '交易方式'; 
         COMMENT ON COLUMN "gas_bank_records"."hbmc" IS '货币名称'; 
         COMMENT ON COLUMN "gas_bank_records"."bgjg" IS '报告机构'; 
         COMMENT ON COLUMN "gas_bank_records"."swszfl" IS '涉外收支分类'; 
         COMMENT ON COLUMN "gas_bank_records"."wyipdz" IS '网银IP地址'; 
         COMMENT ON COLUMN "gas_bank_records"."ipsf" IS 'ip所属省份'; 
         COMMENT ON COLUMN "gas_bank_records"."ipcs" IS 'ip所属城市'; 
         COMMENT ON COLUMN "gas_bank_records"."ipdq" IS 'ip所属地区'; 
         COMMENT ON TABLE "gas_bank_records" IS '资金分析账户交易明细表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_bank_records_source 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_bank_records_source" CASCADE; 
         CREATE TABLE "gas_bank_records_source" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_bank_records_source_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "yhjymxid" varchar(50) COLLATE "pg_catalog"."default", 
           "cxzh" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jdbz" varchar(10) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" numeric, 
           "jyye" numeric, 
           "jybz" varchar(20) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "dsjyye" numeric, 
           "jydfzhkhh" varchar(100) COLLATE "pg_catalog"."default", 
           "jyyhmc" varchar(200) COLLATE "pg_catalog"."default", 
           "shh" varchar(100) COLLATE "pg_catalog"."default", 
           "shmc" varchar(2000) COLLATE "pg_catalog"."default", 
           "zysm" varchar(200) COLLATE "pg_catalog"."default", 
           "qd" varchar(100) COLLATE "pg_catalog"."default", 
           "jywdmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ip" varchar(40) COLLATE "pg_catalog"."default", 
           "mac" varchar(100) COLLATE "pg_catalog"."default", 
           "rzh" varchar(30) COLLATE "pg_catalog"."default", 
           "jylx" varchar(100) COLLATE "pg_catalog"."default", 
           "jygj" varchar(20) COLLATE "pg_catalog"."default", 
           "jyhwdd" varchar(30) COLLATE "pg_catalog"."default", 
           "jyfsd" varchar(300) COLLATE "pg_catalog"."default", 
           "jycs" varchar(100) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(100) COLLATE "pg_catalog"."default", 
           "ssfkyhjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "sbyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "xycd" numeric(10), 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jysfcg" varchar(200) COLLATE "pg_catalog"."default", 
           "pzzl" varchar(10) COLLATE "pg_catalog"."default", 
           "cxjssj" varchar(50) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "sljgmc" varchar(200) COLLATE "pg_catalog"."default", 
           "ah" varchar(60) COLLATE "pg_catalog"."default", 
           "beiz" varchar(200) COLLATE "pg_catalog"."default", 
           "sljgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "jyyhkid" numeric(32), 
           "dqmc" varchar(100) COLLATE "pg_catalog"."default", 
           "xtgzh" varchar(20) COLLATE "pg_catalog"."default", 
           "fsjgmc" varchar(200) COLLATE "pg_catalog"."default", 
           "ysbh" varchar(30) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "jsckh" varchar(20) COLLATE "pg_catalog"."default", 
           "jylsh" varchar(50) COLLATE "pg_catalog"."default", 
           "jydfzkhlx" varchar(2) COLLATE "pg_catalog"."default", 
           "mxlx" varchar(1) COLLATE "pg_catalog"."default", 
           "qxdm" varchar(100) COLLATE "pg_catalog"."default", 
           "fsjgbsm" varchar(20) COLLATE "pg_catalog"."default", 
           "dsyhkid" numeric(32), 
           "qxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jygyh" varchar(30) COLLATE "pg_catalog"."default", 
           "cxfkjgyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "zdh" varchar(100) COLLATE "pg_catalog"."default", 
           "jykhh" varchar(100) COLLATE "pg_catalog"."default", 
           "xjbz" varchar(30) COLLATE "pg_catalog"."default", 
           "cxkssj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" numeric(32) NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "ksx" varchar(20) COLLATE "pg_catalog"."default", 
           "jyds_ssfkyhjgdm" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "bankcode" varchar(100) COLLATE "pg_catalog"."default", 
           "dqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "cljg" varchar(2) COLLATE "pg_catalog"."default", 
           "cph" varchar(40) COLLATE "pg_catalog"."default", 
           "cxfkjg" varchar(30) COLLATE "pg_catalog"."default", 
           "jyjz" varchar(100) COLLATE "pg_catalog"."default", 
           "pzh" varchar(255) COLLATE "pg_catalog"."default", 
           "lytype" varchar(20) COLLATE "pg_catalog"."default", 
           "markrow" varchar(100) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "jkje" numeric, 
           "dkje" numeric, 
           "maxid" int4 DEFAULT 0, 
           "bsfs" varchar(100) COLLATE "pg_catalog"."default", 
           "bsrq" varchar(100) COLLATE "pg_catalog"."default", 
           "bwid" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrgj" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrmc" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "dekybs" varchar(50) COLLATE "pg_catalog"."default", 
           "del" varchar(50) COLLATE "pg_catalog"."default", 
           "fkfgj" varchar(100) COLLATE "pg_catalog"."default", 
           "fkflx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfwddm" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfwddmlx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfyhszd" varchar(300) COLLATE "pg_catalog"."default", 
           "fkfzhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "fkfzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfsdtemyqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfsmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyjlid" varchar(100) COLLATE "pg_catalog"."default", 
           "jytzdm" varchar(100) COLLATE "pg_catalog"."default", 
           "kjjybj" varchar(100) COLLATE "pg_catalog"."default", 
           "kjlb" varchar(100) COLLATE "pg_catalog"."default", 
           "ldrq" varchar(100) COLLATE "pg_catalog"."default", 
           "mbdm" varchar(100) COLLATE "pg_catalog"."default", 
           "mbmc" varchar(100) COLLATE "pg_catalog"."default", 
           "myje" varchar(100) COLLATE "pg_catalog"."default", 
           "rketlsj" varchar(100) COLLATE "pg_catalog"."default", 
           "rmbje" varchar(100) COLLATE "pg_catalog"."default", 
           "scbs" varchar(100) COLLATE "pg_catalog"."default", 
           "sffzhlx" varchar(100) COLLATE "pg_catalog"."default", 
           "skfgj" varchar(100) COLLATE "pg_catalog"."default", 
           "skflx" varchar(100) COLLATE "pg_catalog"."default", 
           "skftemyqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "skfwddm" varchar(100) COLLATE "pg_catalog"."default", 
           "skfwddmlx" varchar(100) COLLATE "pg_catalog"."default", 
           "skfyhszd" varchar(300) COLLATE "pg_catalog"."default", 
           "skfzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "sxetlsj" varchar(100) COLLATE "pg_catalog"."default", 
           "tjzt" varchar(100) COLLATE "pg_catalog"."default", 
           "ybje" varchar(100) COLLATE "pg_catalog"."default", 
           "ydejygx" varchar(100) COLLATE "pg_catalog"."default", 
           "yjyid" varchar(100) COLLATE "pg_catalog"."default", 
           "ywbsh" varchar(100) COLLATE "pg_catalog"."default", 
           "zt" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfs" varchar(100) COLLATE "pg_catalog"."default", 
           "hbmc" varchar(100) COLLATE "pg_catalog"."default", 
           "bgjg" varchar(100) COLLATE "pg_catalog"."default", 
           "swszfl" varchar(100) COLLATE "pg_catalog"."default", 
           "wyipdz" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_bank_records_source"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."yhjymxid" IS '银行交易明细ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxzh" IS '查询账号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jdbz" IS '借贷标志'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyrq" IS '交易日期'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyye" IS '交易余额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jybz" IS '交易币种'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jydfmc" IS '对手户名'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jydfzjhm" IS '对手身份证号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dsjyye" IS '对手交易余额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jydfzhkhh" IS '对手开户银行'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyyhmc" IS '交易银行名'; 
         COMMENT ON COLUMN "gas_bank_records_source"."shh" IS '商户代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."shmc" IS '商户名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."zysm" IS '摘要说明'; 
         COMMENT ON COLUMN "gas_bank_records_source"."qd" IS '渠道'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jywdmc" IS '交易网点名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ip" IS 'IP地址'; 
         COMMENT ON COLUMN "gas_bank_records_source"."mac" IS 'MAC地址'; 
         COMMENT ON COLUMN "gas_bank_records_source"."rzh" IS '日志号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jylx" IS '交易类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jygj" IS '交易国家'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyhwdd" IS '交易网点号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyfsd" IS '交易发生地'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jycs" IS '交易场所'; 
         COMMENT ON COLUMN "gas_bank_records_source"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ssfkyhjgdm" IS '所属发卡银行机构代码';
          
         COMMENT ON COLUMN "gas_bank_records_source"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sbyy" IS '失败原因'; 
         COMMENT ON COLUMN "gas_bank_records_source"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_bank_records_source"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ajcjrq" IS '案件采集日期'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jysfcg" IS '交易是否成功'; 
         COMMENT ON COLUMN "gas_bank_records_source"."pzzl" IS '凭证种类'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxjssj" IS '查询结束时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sljgmc" IS '受理机构名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ah" IS '案号（工商查询时使用）'; 
         COMMENT ON COLUMN "gas_bank_records_source"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sljgdm" IS '受理机构代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyyhkid" IS '交易银行卡ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dqmc" IS '地区名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."xtgzh" IS '系统跟踪号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fsjgmc" IS '发送机构名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ysbh" IS '编号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jsckh" IS '检索参考号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jylsh" IS '交易流水号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jydfzkhlx" IS '交易对方账卡号类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."mxlx" IS '明细类型，0为账户交易明显，1为商户信息，2调集银行卡信息'; 
         COMMENT ON COLUMN "gas_bank_records_source"."qxdm" IS '区县代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fsjgbsm" IS '发送机构标识码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dsyhkid" IS '对手银行卡ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."qxmc" IS '区县名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jygyh" IS '交易柜员号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxfkjgyy" IS '查询反馈结果原因'; 
         COMMENT ON COLUMN "gas_bank_records_source"."zdh" IS '终端号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jykhh" IS '交易账户开户银行'; 
         COMMENT ON COLUMN "gas_bank_records_source"."xjbz" IS '现金标志'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxkssj" IS '查询开始时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sjlylx" IS '数据来源类型(采集录入、手工录入、数据抽取)'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ksx" IS '卡属性'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyds_ssfkyhjgdm" IS '交易对手所属发卡银行机构代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_bank_records_source"."bankcode" IS '银行代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dqdm" IS '地区代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cljg" IS '处理结果 0-成功；1-失败；2-零数据；'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cph" IS '传票号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."cxfkjg" IS '查询反馈结果'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyjz" IS '交易介质'; 
         COMMENT ON COLUMN "gas_bank_records_source"."pzh" IS '凭证号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."lytype" IS '来源类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."markrow" IS '标记行'; 
         COMMENT ON COLUMN "gas_bank_records_source"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jkje" IS '借款金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dkje" IS '贷款金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."bsfs" IS '报送方式'; 
         COMMENT ON COLUMN "gas_bank_records_source"."bsrq" IS '报送日期'; 
         COMMENT ON COLUMN "gas_bank_records_source"."bwid" IS '报文ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dbrgj" IS '代办人国籍'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dbrmc" IS '代办人名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."dekybs" IS '大额可疑标识'; 
         COMMENT ON COLUMN "gas_bank_records_source"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfgj" IS '付款方国籍'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkflx" IS '付款方类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfwddm" IS '付款方网点代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfwddmlx" IS '付款方网点代码类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfyhszd" IS '付款方银行所在地'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfzhlx" IS '付款方账号类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."fkfzjlx" IS '付款方证件类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyfsdtemyqdm" IS '交易发生地特殊贸易区代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyfsmc" IS '交易方式名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyjlid" IS '交易记录ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jytzdm" IS '交易特征代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."kjjybj" IS '跨境交易标记'; 
         COMMENT ON COLUMN "gas_bank_records_source"."kjlb" IS '跨境类别'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ldrq" IS '落地日期'; 
         COMMENT ON COLUMN "gas_bank_records_source"."mbdm" IS '模板代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."mbmc" IS '模板名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."myje" IS '美元金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."rketlsj" IS '入库ETL时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."rmbje" IS '人民币金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."scbs" IS '删除标识'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sffzhlx" IS '收款方账号类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skfgj" IS '收款方国籍'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skflx" IS '收款方类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skftemyqdm" IS '收款方贸易特殊区代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skfwddm" IS '收款方网点代码'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skfwddmlx" IS '收款方网点代码类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skfyhszd" IS '收款方银行所在地'; 
         COMMENT ON COLUMN "gas_bank_records_source"."skfzjlx" IS '收款方证件类型'; 
         COMMENT ON COLUMN "gas_bank_records_source"."sxetlsj" IS '失效ETL时间'; 
         COMMENT ON COLUMN "gas_bank_records_source"."tjzt" IS '统计状态'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ybje" IS '原币金额'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ydejygx" IS '与大额交易的关系'; 
         COMMENT ON COLUMN "gas_bank_records_source"."yjyid" IS '原交易ID'; 
         COMMENT ON COLUMN "gas_bank_records_source"."ywbsh" IS '业务标识号'; 
         COMMENT ON COLUMN "gas_bank_records_source"."zt" IS '状态'; 
         COMMENT ON COLUMN "gas_bank_records_source"."jyfs" IS '交易方式'; 
         COMMENT ON COLUMN "gas_bank_records_source"."hbmc" IS '货币名称'; 
         COMMENT ON COLUMN "gas_bank_records_source"."bgjg" IS '报告机构'; 
         COMMENT ON COLUMN "gas_bank_records_source"."swszfl" IS '涉外收支分类'; 
         COMMENT ON COLUMN "gas_bank_records_source"."wyipdz" IS '网银IP地址'; 
         COMMENT ON TABLE "gas_bank_records_source" IS '资金分析账户交易明细表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_cft_accountinfo 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_cft_accountinfo" CASCADE; 
         CREATE TABLE "gas_cft_accountinfo" ( 
           "ajid" int4 NOT NULL, 
           "zhzt" varchar(20) COLLATE "pg_catalog"."default", 
           "zh" varchar(80) COLLATE "pg_catalog"."default", 
           "zcxm" varchar(50) COLLATE "pg_catalog"."default", 
           "zcsfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "bdsj" varchar(20) COLLATE "pg_catalog"."default", 
           "bdzt" varchar(20) COLLATE "pg_catalog"."default", 
           "khhxx" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzh" varchar(80) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "zcsj" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_cft_accountinfo_shard_id_seq'::regclass), 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."zhzt" IS '账户状态'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."zh" IS '账号'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."zcxm" IS '注册姓名'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."zcsfzh" IS '注册身份证号'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."bdsj" IS '绑定手机'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."bdzt" IS '绑定状态'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."khhxx" IS '开户行信息'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."yhzh" IS '银行账号'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."sjlylx" IS '数据来源类型(手工?既?采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."zcsj" IS '注册时间'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_cft_accountinfo"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_cft_accountinfo" IS '财付通开户信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_cft_zjxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_cft_zjxx" CASCADE; 
         CREATE TABLE "gas_cft_zjxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_cft_zjxx_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "jdbz" varchar(20) COLLATE "pg_catalog"."default", 
           "jylx" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" numeric(22,2) DEFAULT NULL::numeric, 
           "zhye" numeric(22,2) DEFAULT NULL::numeric, 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "yhlx" varchar(50) COLLATE "pg_catalog"."default", 
           "jysm" varchar(200) COLLATE "pg_catalog"."default", 
           "shmc" varchar(200) COLLATE "pg_catalog"."default", 
           "fsf" varchar(50) COLLATE "pg_catalog"."default", 
           "fsje" numeric(22,2) DEFAULT NULL::numeric, 
           "jsf" varchar(50) COLLATE "pg_catalog"."default", 
           "jssj" varchar(50) COLLATE "pg_catalog"."default", 
           "jsje" numeric(22,2) DEFAULT NULL::numeric, 
           "sjlyid" int8, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jydh" varchar(80) COLLATE "pg_catalog"."default", 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_cft_zjxx"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jdbz" IS '借贷类型'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jylx" IS '交易类型'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jyje" IS '交易金额(分)'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."zhye" IS '账户余额'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."yhlx" IS '银行类型'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jysm" IS '交易说明'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."shmc" IS '商户名称'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."fsf" IS '发送方'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."fsje" IS '发送金额'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jsf" IS '接收方'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jssj" IS '接收时间'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jsje" IS '接收金额（分）'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."jydh" IS '交易单号'; 
         COMMENT ON COLUMN "gas_cft_zjxx"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_cft_zjxx" IS '财付通资金信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_dsf_dlip 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_dsf_dlip" CASCADE; 
         CREATE TABLE "gas_dsf_dlip" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_dsf_dlip_shard_id_seq'::regclass), 
           "dlip" varchar(30) COLLATE "pg_catalog"."default", 
           "dlsfcg" varchar(30) COLLATE "pg_catalog"."default", 
           "dlrq" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int8 NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying, 
           "sjlyid" int4, 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying, 
           "batch" int4, 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying 
         ) 
         ; 
         COMMENT ON COLUMN "gas_dsf_dlip"."dlip" IS '登录IP'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."dlsfcg" IS '登录是否成功'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."dlrq" IS '登陆日期'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."sjlyid" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."del"
          IS '删除标记'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_dsf_dlip"."sjlx" IS '数据类型'; 
         COMMENT ON TABLE "gas_dsf_dlip" IS '第三方登录IP'; 
          
         -- ---------------------------- 
         -- Table structure for gas_dsf_jbxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_dsf_jbxx" CASCADE; 
         CREATE TABLE "gas_dsf_jbxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_dsf_jbxx_shard_id_seq'::regclass), 
           "yhid" varchar(60) COLLATE "pg_catalog"."default", 
           "yhmc" varchar(50) COLLATE "pg_catalog"."default", 
           "gsmc" varchar(50) COLLATE "pg_catalog"."default", 
           "dlyx" varchar(50) COLLATE "pg_catalog"."default", 
           "yx" varchar(50) COLLATE "pg_catalog"."default", 
           "dlsj" varchar(20) COLLATE "pg_catalog"."default", 
           "bdsj" varchar(20) COLLATE "pg_catalog"."default", 
           "sj" varchar(20) COLLATE "pg_catalog"."default", 
           "gh" varchar(20) COLLATE "pg_catalog"."default", 
           "zcsj" varchar(50) COLLATE "pg_catalog"."default", 
           "zhlx" varchar(30) COLLATE "pg_catalog"."default", 
           "zhye" numeric(22,2), 
           "bdyhk" varchar(50) COLLATE "pg_catalog"."default", 
           "rzrq" varchar(50) COLLATE "pg_catalog"."default", 
           "rzlx" varchar(50) COLLATE "pg_catalog"."default", 
           "zcsyid" varchar(50) COLLATE "pg_catalog"."default", 
           "rzsyid" varchar(50) COLLATE "pg_catalog"."default", 
           "gj" varchar(30) COLLATE "pg_catalog"."default", 
           "zt" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int8 NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying, 
           "sjlyid" int4, 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying, 
           "batch" int4, 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying 
         ) 
         ; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."yhid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."yhmc" IS '用户名称'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."gsmc" IS '公司名称'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."dlyx" IS '登录邮箱'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."yx" IS '邮箱'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."dlsj" IS '登录手机'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."bdsj" IS '绑定手机'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."sj" IS '手机'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."gh" IS '固话'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."zcsj" IS '注册时间'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."zhlx" IS '账户类型'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."zhye" IS '账户余额'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."bdyhk" IS '绑定银行卡'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."rzrq" IS '认证日期'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."rzlx" IS '认证类型'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."zcsyid" IS '注册使用ID'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."rzsyid" IS '认证使用ID'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."gj" IS '国家'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."zt" IS '状态'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."sjlyid" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_dsf_jbxx"."sjlx" IS '数据类型'; 
         COMMENT ON TABLE "gas_dsf_jbxx" IS '第三方基本信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_dsf_jyjl 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_dsf_jyjl" CASCADE; 
         CREATE TABLE "gas_dsf_jyjl" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_dsf_jyjl_shard_id_seq'::regclass), 
           "jyjl" varchar(50) COLLATE "pg_catalog"."default", 
           "wbjyh" varchar(50) COLLATE "pg_catalog"."default", 
           "cjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jyly" varchar(50) COLLATE "pg_catalog"."default", 
           "jyzt" varchar(50) COLLATE "pg_catalog"."default", 
           "gfid" varchar(50) COLLATE "pg_catalog"."default", 
           "gfdlh" varchar(50) COLLATE "pg_catalog"."default", 
           "gfxm" varchar(50) COLLATE "pg_catalog"."default", 
           "gfnc" varchar(50) COLLATE "pg_catalog"."default", 
           "sfid" varchar(50) COLLATE "pg_catalog"."default", 
           "sfdlh" varchar(50) COLLATE "pg_catalog"."default", 
           "sfxm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfnc" varchar(50) COLLATE "pg_catalog"."default", 
           "jyspmc" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" numeric(22,2), 
           "jyfs" varchar(50) COLLATE "pg_catalog"."default", 
           "jycjip" varchar(50) COLLATE "pg_catalog"."default", 
           "jyfkip" varchar(50) COLLATE "pg_catalog"."default", 
           "qrship" varchar(50) COLLATE "pg_catalog"."default", 
           "gffkrq" varchar(50) COLLATE "pg_catalog"."default", 
           "qrfkrq" varchar(50) COLLATE "pg_catalog"."default", 
           "shrxm" varchar(50) COLLATE "pg_catalog"."default", 
           "shsj" varchar(20) COLLATE "pg_catalog"."default", 
           "shgh" varchar(20) COLLATE "pg_catalog"."default", 
           "shdz" varchar(100) COLLATE "pg_catalog"."default", 
           "ajid" int8 NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying, 
           "sjlyid" int4, 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying, 
           "batch" int4, 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying 
         ) 
         ; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyjl" IS '交易号'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."wbjyh" IS '外部交易号'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."cjrq" IS '创建日期'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyly" IS '交易来源'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyzt" IS '交易状态'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."gfid" IS '买家ID'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."gfdlh" IS '买家登录号'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."gfxm" IS '买家姓名'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."gfnc" IS '买家昵称'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sfid" IS '卖家ID'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sfdlh" IS '卖家登录号'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sfxm" IS '卖家姓名'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sfnc" IS '卖家昵称'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyspmc" IS '交易商品名称'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyfs" IS '交易方式'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jycjip" IS '交易创建IP'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."jyfkip" IS '交易付款IP'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."qrship" IS '确认收货IP'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."gffkrq" IS '买家付款日期'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."qrfkrq" IS '确认付款日期'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."shrxm" IS '收货人姓名'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."shsj" IS '收货手机'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."shgh" IS '收货固话'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."shdz" IS '收货地址'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sjlyid" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_dsf_jyjl"."sjlx" IS '数据类型'; 
         COMMENT ON TABLE "gas_dsf_jyjl" IS '第三方交易记录'; 
          
         -- ---------------------------- 
         -- Table structure for gas_dsf_records 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_dsf_records" CASCADE; 
         CREATE TABLE "gas_dsf_records" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_dsf_records_shard_id_seq'::regclass), 
           "jyzh" varchar(50) COLLATE "pg_catalog"."default", 
           "dfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "dfdlzh" varchar(50) COLLATE "pg_catalog"."default", 
           "dfmc" varchar(50) COLLATE "pg_catalog"."default", 
           "xfbt" varchar(100) COLLATE "pg_catalog"."default", 
           "jyje" numeric(22,2), 
           "fwfy" numeric(22,2), 
           "zffs" varchar(50) COLLATE "pg_catalog"."default", 
           "bz" varchar(50) COLLATE "pg_catalog"."default", 
           "zjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "xfly" varchar(50) COLLATE "pg_catalog"."default", 
           "ywlx" varchar(50) COLLATE "pg_catalog"."default", 
           "ywlxms" varchar(300) COLLATE "pg_catalog"."default", 
           "nblsh" varchar(60) COLLATE "pg_catalog"."default", 
           "wblsh" varchar(60) COLLATE "pg_catalog"."default", 
           "kzxx" varchar(60) COLLATE "pg_catalog"."default", 
           "ywzt" varchar(20) COLLATE "pg_catalog"."default", 
           "ywztms" varchar(50) COLLATE "pg_catalog"."default", 
           "xfjlcjsj" varchar(50) COLLATE "pg_catalog"."default", 
           "xfjlxgsj" varchar(50) COLLATE "pg_catalog"."default", 
           "fkfkh" varchar(60) COLLATE "pg_catalog"."default", 
           "fkfyh" varchar(80) COLLATE "pg_catalog"."default", 
           "skfkh" varchar(60) COLLATE "pg_catalog"."default", 
           "skfyh" varchar(80) COLLATE "pg_catalog"."default", 
           "ajid" int8 NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying, 
           "sjlyid" int4, 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying, 
           "batch" int4, 
           "sjlx" varchar(20)
          COLLATE "pg_catalog"."default", 
           "jyye" numeric(22,2) 
         ) 
         ; 
         COMMENT ON COLUMN "gas_dsf_records"."jyzh" IS '交易账号'; 
         COMMENT ON COLUMN "gas_dsf_records"."dfzh" IS '对手账号'; 
         COMMENT ON COLUMN "gas_dsf_records"."dfdlzh" IS '对手登录账号'; 
         COMMENT ON COLUMN "gas_dsf_records"."dfmc" IS '对方名称'; 
         COMMENT ON COLUMN "gas_dsf_records"."xfbt" IS '消费标题'; 
         COMMENT ON COLUMN "gas_dsf_records"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_dsf_records"."fwfy" IS '服务费用'; 
         COMMENT ON COLUMN "gas_dsf_records"."zffs" IS '支付方式'; 
         COMMENT ON COLUMN "gas_dsf_records"."bz" IS '币种'; 
         COMMENT ON COLUMN "gas_dsf_records"."zjlx" IS '资金流向'; 
         COMMENT ON COLUMN "gas_dsf_records"."xfly" IS '消费来源'; 
         COMMENT ON COLUMN "gas_dsf_records"."ywlx" IS '业务类型'; 
         COMMENT ON COLUMN "gas_dsf_records"."ywlxms" IS '业务类型描述'; 
         COMMENT ON COLUMN "gas_dsf_records"."nblsh" IS '内部流水号'; 
         COMMENT ON COLUMN "gas_dsf_records"."wblsh" IS '外部流水号'; 
         COMMENT ON COLUMN "gas_dsf_records"."kzxx" IS '扩展信息'; 
         COMMENT ON COLUMN "gas_dsf_records"."ywzt" IS '业务状态'; 
         COMMENT ON COLUMN "gas_dsf_records"."ywztms" IS '业务状态描述'; 
         COMMENT ON COLUMN "gas_dsf_records"."xfjlcjsj" IS '消费记录创建时间'; 
         COMMENT ON COLUMN "gas_dsf_records"."xfjlxgsj" IS '消费记录修改时间'; 
         COMMENT ON COLUMN "gas_dsf_records"."fkfkh" IS '付款方银行卡号'; 
         COMMENT ON COLUMN "gas_dsf_records"."fkfyh" IS '付款方银行'; 
         COMMENT ON COLUMN "gas_dsf_records"."skfkh" IS '收款方银行卡号'; 
         COMMENT ON COLUMN "gas_dsf_records"."skfyh" IS '收款方银行'; 
         COMMENT ON COLUMN "gas_dsf_records"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_dsf_records"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_dsf_records"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_dsf_records"."sjlyid" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_dsf_records"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_dsf_records"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_dsf_records"."sjlx" IS '数据类型'; 
         COMMENT ON COLUMN "gas_dsf_records"."jyye" IS '交易余额'; 
         COMMENT ON TABLE "gas_dsf_records" IS '第三方交易明细信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_im_msg 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_im_msg" CASCADE; 
         CREATE TABLE "gas_im_msg" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_im_msg_shard_id_seq'::regclass), 
           "imltjlid" int8 NOT NULL DEFAULT nextval('gas_im_msg_imltjlid_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "fsfip" varchar(20) COLLATE "pg_catalog"."default", 
           "jsfgsd" varchar(20) COLLATE "pg_catalog"."default", 
           "fssj" varchar(32) COLLATE "pg_catalog"."default", 
           "sjlx" varchar(4) COLLATE "pg_catalog"."default", 
           "zjfimh" varchar(50) COLLATE "pg_catalog"."default", 
           "beiz" varchar(100) COLLATE "pg_catalog"."default", 
           "lywx" varchar(100) COLLATE "pg_catalog"."default", 
           "ltnr" varchar(5000) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "bjfimh" varchar(100) COLLATE "pg_catalog"."default", 
           "bjfimhid" varchar(100) COLLATE "pg_catalog"."default", 
           "bjfxm" varchar(20) COLLATE "pg_catalog"."default", 
           "bjfnc" varchar(20) COLLATE "pg_catalog"."default", 
           "fsfgsd" varchar(20) COLLATE "pg_catalog"."default", 
           "zjfimhid" varchar(100) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "jsfip" varchar(100) COLLATE "pg_catalog"."default", 
           "zjfxm" varchar(100) COLLATE "pg_catalog"."default", 
           "zjfnc" varchar(100) COLLATE "pg_catalog"."default", 
           "sfydj" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_im_msg"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_im_msg"."imltjlid" IS 'ID'; 
         COMMENT ON COLUMN "gas_im_msg"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_im_msg"."fsfip" IS '发送方IP'; 
         COMMENT ON COLUMN "gas_im_msg"."jsfgsd" IS '接收方归属地'; 
         COMMENT ON COLUMN "gas_im_msg"."fssj" IS '发送（接收）时间'; 
         COMMENT ON COLUMN "gas_im_msg"."sjlx" IS '数据类型，0：QQ 1：微信 2：MailBox 3:微博 4:其它'; 
         COMMENT ON COLUMN "gas_im_msg"."zjfimh" IS '主叫方IM号'; 
         COMMENT ON COLUMN "gas_im_msg"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_im_msg"."lywx" IS '来源IM号'; 
         COMMENT ON COLUMN "gas_im_msg"."ltnr" IS '聊天内容'; 
         COMMENT ON COLUMN "gas_im_msg"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_im_msg"."bjfimh" IS '被叫方IM号'; 
         COMMENT ON COLUMN "gas_im_msg"."bjfimhid" IS '被叫方IM号ID'; 
         COMMENT ON COLUMN "gas_im_msg"."bjfxm" IS '被叫方姓名'; 
         COMMENT ON COLUMN "gas_im_msg"."bjfnc" IS '被叫方昵称'; 
         COMMENT ON COLUMN "gas_im_msg"."fsfgsd" IS '发送方归属地'; 
         COMMENT ON COLUMN "gas_im_msg"."zjfimhid" IS '主叫方IM号ID'; 
         COMMENT ON COLUMN "gas_im_msg"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_im_msg"."jsfip" IS '接收方IP'; 
         COMMENT ON COLUMN "gas_im_msg"."zjfxm" IS '主叫方姓名'; 
         COMMENT ON COLUMN "gas_im_msg"."zjfnc" IS '主叫方昵称'; 
         COMMENT ON COLUMN "gas_im_msg"."sfydj" IS '是否已调集'; 
         COMMENT ON COLUMN "gas_im_msg"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_im_msg"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_im_msg"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_im_msg"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_im_msg"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_im_msg" IS '资金分析即时通讯明细信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_jass_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_jass_info" CASCADE; 
         CREATE TABLE "gas_jass_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_jass_info_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "jykh" varchar(255) COLLATE "pg_catalog"."default", 
           "ksx" varchar(255) COLLATE "pg_catalog"."default", 
           "ssfkyxjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "ssfkyx" varchar(255) COLLATE "pg_catalog"."default", 
           "jyrq" varchar(50) COLLATE "pg_catalog"."default", 
           "jygj" varchar(255) COLLATE "pg_catalog"."default", 
           "jydd" varchar(255) COLLATE "pg_catalog"."default", 
           "shdm" varchar(255) COLLATE "pg_catalog"."default", 
           "shmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jyqd" varchar(255) COLLATE "pg_catalog"."default", 
           "zdh" varchar(255) COLLATE "pg_catalog"."default", 
           "jylx" varchar(255) COLLATE "pg_catalog"."default", 
           "sljgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "sljgmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jyje" numeric(32), 
           "jysfcg" varchar(255) COLLATE "pg_catalog"."default", 
           "zrkh" varchar(255) COLLATE "pg_catalog"."default", 
           "zrkssyxjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "zrkssyx" varchar(255) COLLATE "pg_catalog"."default", 
           "zckh" varchar(255) COLLATE "pg_catalog"."default", 
           "zckssyxjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "zckssyx" varchar(255) COLLATE "pg_catalog"."default", 
           "jyjz" varchar(255) COLLATE "pg_catalog"."default", 
           "fsjgbsm" varchar(255) COLLATE "pg_catalog"."default", 
           "fsjgmc" varchar(255) COLLATE "pg_catalog"."default", 
           "xtgzh" varchar(255) COLLATE "pg_catalog"."default", 
           "jsckh" varchar(255) COLLATE "pg_catalog"."default", 
           "sjlyid" int8 NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_jass_info"."shard_id" IS '自动ID'; 
         COMMENT ON COLUMN "gas_jass_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_jass_info"."jykh" IS '交易卡号'; 
         COMMENT ON COLUMN "gas_jass_info"."ksx" IS '卡属性'; 
         COMMENT ON COLUMN "gas_jass_info"."ssfkyxjgdm" IS '所属发卡银行机构代码'; 
         COMMENT ON COLUMN "gas_jass_info"."ssfkyx" IS '所属发卡银行'; 
         COMMENT ON COLUMN "gas_jass_info"."jyrq" IS '交易日期'; 
         COMMENT ON COLUMN "gas_jass_info"."jygj" IS '交易国家'; 
         COMMENT ON COLUMN "gas_jass_info"."jydd" IS '交易地点'; 
         COMMENT ON COLUMN "gas_jass_info"."shdm" IS '商户代码'; 
         COMMENT ON COLUMN "gas_jass_info"."shmc" IS '商户名称'; 
         COMMENT ON COLUMN "gas_jass_info"."jyqd" IS '交易渠道'; 
         COMMENT ON COLUMN "gas_jass_info"."zdh" IS '终端号'; 
         COMMENT ON COLUMN "gas_jass_info"."jylx" IS '交易类型'; 
         COMMENT ON COLUMN "gas_jass_info"."sljgdm" IS '受理机构代码'; 
         COMMENT ON COLUMN "gas_jass_info"."sljgmc" IS '受理机构名称'; 
         COMMENT ON COLUMN "gas_jass_info"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_jass_info"."jysfcg" IS '交易是否成功'; 
         COMMENT ON COLUMN "gas_jass_info"."zrkh" IS '转入卡号（转账类交易）'; 
         COMMENT ON COLUMN "gas_jass_info"."zrkssyxjgdm" IS ' 转入卡所属银行机构代码'; 
         COMMENT ON COLUMN "gas_jass_info"."zrkssyx" IS ' 转入卡所属银行'; 
         COMMENT ON COLUMN "gas_jass_info"."zckh" IS '转出卡号（转账类交易）'; 
         COMMENT ON COLUMN "gas_jass_info"."zckssyxjgdm" IS '转出卡所属银行机构代码'; 
         COMMENT ON COLUMN "gas_jass_info"."zckssyx" IS '转出卡所属银行'; 
         COMMENT ON COLUMN "gas_jass_info"."jyjz" IS '交易介质'; 
         COMMENT ON COLUMN "gas_jass_info"."fsjgbsm" IS '发送机构标识码'; 
         COMMENT ON COLUMN "gas_jass_info"."fsjgmc" IS '发送机构名称'; 
         COMMENT ON COLUMN "gas_jass_info"."xtgzh" IS '系统跟踪号'; 
         COMMENT ON COLUMN "gas_jass_info"."jsckh" IS '检索参考号'; 
         COMMENT ON COLUMN "gas_jass_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_jass_info"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_jass_info"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_jass_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_jass_info"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_jass_info" IS 'JASS交易商户数据'; 
          
         -- ---------------------------- 
         -- Table structure for gas_jstxhy_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_jstxhy_info" CASCADE; 
         CREATE TABLE "gas_jstxhy_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_jstxhy_info_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "id" int8 NOT NULL DEFAULT nextval('gas_jstxhy_info_id_seq'::regclass), 
           "hync" varchar(255) COLLATE "pg_catalog"."default", 
           "hyfz" varchar(255) COLLATE "pg_catalog"."default", 
           "zh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhmc" varchar(255) COLLATE "pg_catalog"."default", 
           "sjlx" varchar(10) COLLATE "pg_catalog"."default", 
           "hysr" varchar(255) COLLATE "pg_catalog"."default", 
           "zhzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "hyxb" varchar(255) COLLATE "pg_catalog"."default", 
           "lxfs" varchar(255) COLLATE "pg_catalog"."default", 
           "by2" varchar(255) COLLATE "pg_catalog"."default", 
           "by1" varchar(255) COLLATE "pg_catalog"."default", 
           "ybaglms" varchar(255) COLLATE "pg_catalog"."default", 
           "hyzh" varchar(100) COLLATE "pg_catalog"."default", 
           "hybzmc" varchar(255) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_jstxhy_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hync" IS '好友昵称'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hyfz" IS '好友分组'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."zh" IS '账号'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."zhmc" IS '账号名称'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."sjlx" IS '账号类型 0：QQ 1：微信 2：MailBox 3:微博 4:其它'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hysr" IS '生日'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."zhzjhm" IS '账号证件号码'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hyxb" IS '性别'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."lxfs" IS '联系方式'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."by2" IS '备用2'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."by1" IS '备用1'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."ybaglms" IS '与本案关联描述'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hyzh" IS '好友账号'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."hybzmc" IS '好友备注名称'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_jstxhy_info"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_jstxhy_info" IS '即时通讯好友表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_logistics_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_logistics_info" CASCADE; 
         CREATE TABLE "gas_logistics_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_logistics_info_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" int8 NOT NULL DEFAULT nextval('gas_logistics_info_id_seq'::regclass), 
           "sjrajjs" varchar(200) COLLATE "pg_catalog"."default", 
           "hwbz" varchar(100) COLLATE "pg_catalog"."default", 
           "lrrbh" varchar(100) COLLATE "pg_catalog"."default", 
           "hwsl" numeric(20), 
           "fhgs" varchar(200) COLLATE "pg_catalog"."default", 
           "fhcs" varchar(200) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(32) COLLATE "pg_catalog"."default", 
           "fhrdz" varchar(300) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "ydh" varchar(100) COLLATE "pg_catalog"."default", 
           "fjrajjs" varchar(200) COLLATE "pg_catalog"."default", 
           "pjy" varchar(200) COLLATE "pg_catalog"."default", 
           "sjksj" varchar(32) COLLATE "pg_catalog"."default", 
           "fhrq" varchar(32) COLLATE "pg_catalog"."default", 
           "shcs" varchar(200) COLLATE "pg_catalog"."default", 
           "hwzl" numeric(20,6), 
           "shgs" varchar(200) COLLATE "pg_catalog"."default", 
           "fhrdh" varchar(100) COLLATE "pg_catalog"."default", 
           "wlgs" varchar(200) COLLATE "pg_catalog"."default", 
           "code2" varchar(12) COLLATE "pg_catalog"."default", 
           "fhrssid" varchar(100) COLLATE "pg_catalog"."default", 
           "dshkje" varchar(200) COLLATE "pg_catalog"."default", 
           "code1" varchar(12) COLLATE "pg_catalog"."default", 
           "code3" varchar(12) COLLATE "pg_catalog"."default", 
           "shrssid" varchar(100) COLLATE "pg_catalog"."default", 
           "hwbh" varchar(100) COLLATE "pg_catalog"."default", 
           "fhrxm" varchar(200) COLLATE "pg_catalog"."default", 
           "shrdz" varchar(300) COLLATE "pg_catalog"."default", 
           "hwmc" varchar(1000) COLLATE "pg_catalog"."default", 
           "zgsmc" varchar(100) COLLATE "pg_catalog"."default", 
           "unitcode" varchar(12) COLLATE "pg_catalog"."default", 
           "shrzjmc" varchar(200) COLLATE "pg_catalog"."default", 
           "ysfs" varchar(200) COLLATE "pg_catalog"."default", 
           "wlzxdm" varchar(100) COLLATE "pg_catalog"."default", 
           "shrdh" varchar(100) COLLATE "pg_catalog"."default", 
           "remark" varchar(200) COLLATE "pg_catalog"."default", 
           "pfkhbm" varchar(200) COLLATE "pg_catalog"."default", 
           "shrxm" varchar(200) COLLATE "pg_catalog"."default", 
           "fhfkhbm" varchar(200) COLLATE "pg_catalog"."default", 
           "sjy" varchar(200) COLLATE "pg_catalog"."default", 
           "wlgslrsj" varchar(32) COLLATE "pg_catalog"."default", 
           "thfs" varchar(200) COLLATE "pg_catalog"."default", 
           "hwtj" numeric(20,6), 
           "fhrzjmc" varchar(200) COLLATE "pg_catalog"."default", 
           "remark1" varchar(200) COLLATE "pg_catalog"."default", 
           "remark3" varchar(200) COLLATE "pg_catalog"."default", 
           "remark2" varchar(200) COLLATE "pg_catalog"."default", 
           "shrq" varchar(32) COLLATE "pg_catalog"."default", 
           "fkfs" varchar(200) COLLATE "pg_catalog"."default", 
           "hwdj" numeric(20,6), 
           "fhrzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "sjrksj" varchar(32) COLLATE "pg_catalog"."default", 
           "shrzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "hwyf" numeric(20,6), 
           "sjdrbh" varchar(32) COLLATE "pg_catalog"."default", 
           "lrsj" varchar(32) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "qqdh" varchar(36) COLLATE "pg_catalog"."default", 
           "requestid" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_logistics_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."id" IS '主键ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjrajjs" IS '收件人案件角色'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwbz" IS '货物外包装'; 
         COMMENT ON COLUMN "gas_logistics_info"."lrrbh" IS '录入人编号'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwsl" IS '货物数量'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhgs" IS '发货公司'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhcs" IS '发货城市'; 
         COMMENT ON COLUMN "gas_logistics_info"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrdz" IS '发货人地址'; 
         COMMENT ON COLUMN "gas_logistics_info"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."ydh" IS '运单号'; 
         COMMENT ON COLUMN "gas_logistics_info"."fjrajjs" IS '寄件人案件角色'; 
         COMMENT ON COLUMN "gas_logistics_info"."pjy" IS '派件员'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjksj" IS '数据库时间'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrq" IS '发货日期'; 
         COMMENT ON COLUMN "gas_logistics_info"."shcs" IS '收货城市'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwzl" IS '货物重量'; 
         COMMENT ON COLUMN "gas_logistics_info"."shgs" IS '收货公司'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrdh" IS '发货人电话'; 
         COMMENT ON COLUMN "gas_logistics_info"."wlgs" IS '物流公司'; 
         COMMENT ON COLUMN "gas_logistics_info"."code2" IS 'CODE2'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrssid" IS '发货人所属人员ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."dshkje" IS '代收货款金额'; 
         COMMENT ON COLUMN "gas_logistics_info"."code1" IS 'CODE1'; 
         COMMENT ON COLUMN "gas_logistics_info"."code3" IS 'CODE3'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrssid" IS '收货人所属人员ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwbh" IS '货物编号'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrxm" IS '发货人姓名'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrdz" IS '收货人地址'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwmc" IS '货物名称'; 
         COMMENT ON COLUMN "gas_logistics_info"."zgsmc" IS '子公司名称'; 
         COMMENT ON COLUMN "gas_logistics_info"."unitcode" IS 'UNITCODE'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrzjmc" IS '收货人证件名称'; 
         COMMENT ON COLUMN "gas_logistics_info"."ysfs" IS '运输方式'; 
         COMMENT ON COLUMN "gas_logistics_info"."wlzxdm" IS '物流中心代码'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrdh" IS '收货人电话'; 
         COMMENT ON COLUMN "gas_logistics_info"."remark" IS '是否已经抽取'; 
         COMMENT ON COLUMN "gas_logistics_info"."pfkhbm" IS '派方客户编码'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrxm" IS '收货人名称'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhfkhbm" IS '发货方客户编码'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjy" IS '收件员'; 
         COMMENT ON COLUMN "gas_logistics_info"."wlgslrsj" IS '物流公司录入时间'; 
         COMMENT ON COLUMN "gas_logistics_info"."thfs" IS '提货方式'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwtj" IS '货物体积'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrzjmc" IS '发货人证件名称'; 
         COMMENT ON COLUMN "gas_logistics_info"."remark1" IS 'REMARK1'; 
         COMMENT ON COLUMN "gas_logistics_info"."remark3" IS 'REMARK3'; 
         COMMENT ON COLUMN "gas_logistics_info"."remark2" IS 'REMARK2'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrq" IS '收货日期'; 
         COMMENT ON COLUMN "gas_logistics_info"."fkfs" IS '付款方式'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwdj" IS '运费单价'; 
         COMMENT ON COLUMN "gas_logistics_info"."fhrzjhm" IS '发货人证件号码'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjrksj" IS '数据入库时间'; 
         COMMENT ON COLUMN "gas_logistics_info"."shrzjhm" IS '收货人证件号码'; 
         COMMENT ON COLUMN "gas_logistics_info"."hwyf" IS '货物运费'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjdrbh" IS '数据导入编号'; 
         COMMENT ON COLUMN "gas_logistics_info"."lrsj" IS '录入时间'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_logistics_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_logistics_info"."requestid" IS '任务唯一编号'; 
         COMMENT ON COLUMN "gas_logistics_info"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_logistics_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_logistics_info"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_logistics_info" IS '资金分析物流信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_person 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person" CASCADE; 
         CREATE TABLE "gas_person" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_shard_id_seq'::regclass), 
           "ryid" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int8 NOT NULL, 
           "zzlx" varchar(30) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhm" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "khmc" varchar(200) COLLATE "pg_catalog"."default", 
           "cym" varchar(50) COLLATE "pg_catalog"."default", 
           "xb" varchar(20) COLLATE "pg_catalog"."default", 
           "mz" varchar(20) COLLATE "pg_catalog"."default", 
           "gj" varchar(20) COLLATE "pg_catalog"."default", 
           "hyzk" varchar(20) COLLATE "pg_catalog"."default", 
           "xl" varchar(20) COLLATE "pg_catalog"."default", 
           "csrq" varchar(50) COLLATE "pg_catalog"."default", 
           "xx" varchar(20) COLLATE "pg_catalog"."default", 
           "jgssx" varchar(100) COLLATE "pg_catalog"."default", 
           "hjdzxzqh" varchar(100) COLLATE "pg_catalog"."default", 
           "hjdzqhnxxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "zzmm" varchar(20) COLLATE "pg_catalog"."default", 
           "gszchm" varchar(50) COLLATE "pg_catalog"."default", 
           "yyzzhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jrjgdm" varchar(50) COLLATE "pg_catalog"."default", 
           "wwmc" varchar(150) COLLATE "pg_catalog"."default", 
           "gjhdq" varchar(20) COLLATE "pg_catalog"."default", 
           "zcdzdm" varchar(20) COLLATE "pg_catalog"."default", 
           "zcdz" varchar(50) COLLATE "pg_catalog"."default", 
           "frdbxm" varchar(100) COLLATE "pg_catalog"."default", 
           "frdbzjlx" varchar(10) COLLATE "pg_catalog"."default", 
           "frdbzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "zgbmmc" varchar(100) COLLATE "pg_catalog"."default", 
           "yyksqx" varchar(20) COLLATE "pg_catalog"."default", 
           "yyjsqx" varchar(20) COLLATE "pg_catalog"."default", 
           "zczb" varchar(20) COLLATE "pg_catalog"."default", 
           "gdczqk" varchar(1000) COLLATE "pg_catalog"."default", 
           "dwlx" varchar(20) COLLATE "pg_catalog"."default", 
           "xxdz" varchar(200) COLLATE "pg_catalog"."default", 
           "clrq" varchar(20) COLLATE "pg_catalog"."default", 
           "jyfw" varchar(1000) COLLATE "pg_catalog"."default", 
           "djjg" varchar(100) COLLATE "pg_catalog"."default", 
           "dwzt" varchar(20) COLLATE "pg_catalog"."default", 
           "gsdjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "dsdjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "fdwid" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int8 NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "zzjgdm" varchar(30) COLLATE "pg_catalog"."default", 
           "dwmc" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzh" varchar(30) COLLATE "pg_catalog"."default", 
           "khyhmc" varchar(50) COLLATE "pg_catalog"."default", 
           "lxdh" varchar(30) COLLATE "pg_catalog"."default", 
           "jyd_xzqhdm" varchar(20) COLLATE "pg_catalog"."default", 
           "jyd" varchar(100) COLLATE "pg_catalog"."default", 
           "jyd_qhnxxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "cxfkjgyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "lxsj" varchar(20) COLLATE "pg_catalog"."default", 
           "dbrxm" varchar(100) COLLATE "pg_catalog"."default", 
           "dwdz" varchar(100) COLLATE "pg_catalog"."default", 
           "dsnsh" varchar(21) COLLATE "pg_catalog"."default", 
           "xzzxzqh" varchar(100) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(30) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(36) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(30) COLLATE "pg_catalog"."default", 
           "gzdw" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(15) COLLATE "pg_catalog"."default", 
           "frdb" varchar(60) COLLATE "pg_catalog"."default", 
           "dwdh" varchar(30) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "gsnsh" varchar(20) COLLATE "pg_catalog"."default", 
           "khgszzhm" varchar(18) COLLATE "pg_catalog"."default", 
           "zzdh" varchar(30) COLLATE "pg_catalog"."default", 
           "cxfkjg" varchar(60) COLLATE "pg_catalog"."default", 
           "yxdz" varchar(60) COLLATE "pg_catalog"."default", 
           "zw" varchar(50) COLLATE "pg_catalog"."default", 
           "zj" varchar(50) COLLATE "pg_catalog"."default", 
           "nl" int8, 
           "zzlxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "rybh" varchar(50) COLLATE "pg_catalog"."default", 
           "xycd" varchar(50) COLLATE "pg_catalog"."default", 
           "sfdd" char(1) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8, 
           "maxid" int4, 
           "mark" varchar(2048) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_person"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_person"."ryid" IS '人员编号'; 
         COMMENT ON COLUMN "gas_person"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_person"."zzlx" IS '证照类型'; 
         COMMENT ON COLUMN "gas_person"."zzhm" IS '证照号??'; 
         COMMENT ON COLUMN "gas_person"."sjlx" IS '数据类型(DM) 嫌疑人1 
         被调查人2 
         证人3 
         受害人4 
         律师5 
         报案人6 
         嫌疑单位7 
         受害单位8 
         从业人员9 
         易感人员10 
         洗钱企业11 
         传销企业12 
         传销人员13 
         非法集资人员14 
         非法集资企业15 
         假发票人员16 
         侵犯知识产权17 
         洗钱人员18 
         银行卡19 
         其他20 
         法人23 
         查控单位98查控人员99 
         '; 
         COMMENT ON COLUMN "gas_person"."khmc" IS '开户名称'; 
         COMMENT ON COLUMN "gas_person"."cym" IS '曾用名'; 
         COMMENT ON COLUMN "gas_person"."xb" IS '性别代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."mz" IS '民族代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."gj" IS '国籍代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."hyzk" IS '婚姻状况代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."xl" IS '学历代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_person"."xx" IS '血型代码'; 
         COMMENT ON COLUMN "gas_person"."jgssx" IS '籍贯省市县代码(DM)'; 
         COMMENT ON COLUMN "gas_person"."hjdzxzqh" IS '户籍行政区划码(DM)'; 
         COMMENT ON COLUMN "gas_person"."hjdzqhnxxdz" IS '户籍区划内详细地址'; 
         COMMENT ON COLUMN "gas_person"."zzmm" IS '政治面貌(DM)'; 
         COMMENT ON COLUMN "gas_person"."gszchm" IS '工商注册号码'; 
         COMMENT ON COLUMN "gas_person"."yyzzhm" IS '营业执照号码'; 
         COMMENT ON COLUMN "gas_person"."jrjgdm" IS '金融机构代码'; 
         COMMENT ON COLUMN "gas_person"."wwmc" IS '外文名称'; 
         COMMENT ON COLUMN "gas_person"."gjhdq" IS '所属国家地区(DM)'; 
         COMMENT ON COLUMN "gas_person"."zcdzdm" IS '注册地(DM)'; 
         COMMENT ON COLUMN "gas_person"."zcdz" IS '注册地名称'; 
         COMMENT ON COLUMN "gas_person"."frdbxm" IS '法人代表姓名'; 
         COMMENT ON COLUMN "gas_person"."frdbzjlx" IS '法人代表证件类型'; 
         COMMENT ON COLUMN "gas_person"."frdbzjhm" IS '法人代表证件号码'; 
         COMMENT ON COLUMN "gas_person"."zgbmmc" IS '主管部门名称'; 
         COMMENT ON COLUMN "gas_person"."yyksqx" IS '营业开始期限'; 
         COMMENT ON COLUMN "gas_person"."yyjsqx" IS '营业结束期限'; 
         COMMENT ON COLUMN "gas_person"."zczb" IS '注册资本(万元)'; 
         COMMENT ON COLUMN "gas_person"."gdczqk" IS '股东出资情况'; 
         COMMENT ON COLUMN "gas_person"."dwlx" IS '单位类型(DM)'; 
         COMMENT ON COLUMN "gas_person"."xxdz" IS '详细地址'; 
         COMMENT ON COLUMN "gas_person"."clrq" IS '成立日期'; 
         COMMENT ON COLUMN "gas_person"."jyfw" IS '经营范围'; 
         COMMENT ON COLUMN "gas_person"."djjg" IS '登记机关'; 
         COMMENT ON COLUMN "gas_person"."dwzt" IS '单位状态(DM)'; 
         COMMENT ON COLUMN "gas_person"."gsdjhm" IS '国税登记号码'; 
         COMMENT ON COLUMN "gas_person"."dsdjhm" IS '地税登记号码'; 
         COMMENT ON COLUMN "gas_person"."fdwid" IS '父单位编号'; 
         COMMENT ON COLUMN "gas_person"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_person"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_person"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_person"."zzjgdm" IS '组织机构代码'; 
         COMMENT ON COLUMN "gas_person"."dwmc" IS '单位名称'; 
         COMMENT ON COLUMN "gas_person"."yhzh" IS '银行账号'; 
         COMMENT ON COLUMN "gas_person"."khyhmc" IS '开户银行名称'; 
         COMMENT ON COLUMN "gas_person"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_person"."jyd_xzqhdm" IS '经营地区划'; 
         COMMENT ON COLUMN "gas_person"."jyd" IS '经营地'; 
         COMMENT ON COLUMN "gas_person"."jyd_qhnxxdz" IS '经营地区划内详址'; 
         COMMENT ON COLUMN "gas_person"."cxfkjgyy" IS '查询反馈结果原因'; 
         COMMENT ON COLUMN "gas_person"."lxsj" IS '联系手机'; 
         COMMENT ON COLUMN "gas_person"."dbrxm" IS '代办人姓名'; 
         COMMENT ON COLUMN "gas_person"."dwdz" IS '单位地址'; 
         COMMENT ON COLUMN "gas_person"."dsnsh" IS '地税纳税号'; 
         COMMENT ON COLUMN "gas_person"."xzzxzqh" IS '住宅地址'; 
         COMMENT ON COLUMN "gas_person"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_person"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_person"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_person"."qqdh" IS '请求单标识'; 
         COMMENT ON COLUMN "gas_person"."gzdw" IS '工作单位'; 
         COMMENT ON COLUMN "gas_person"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_person"."frdb" IS '法人代表'; 
         COMMENT ON COLUMN "gas_person"."dwdh" IS '单位电话'; 
         COMMENT ON COLUMN "gas_person"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_person"."gsnsh" IS '国税纳税号'; 
         COMMENT ON COLUMN "gas_person"."khgszzhm" IS '客户工商执照号码'; 
         COMMENT ON COLUMN "gas_person"."zzdh" IS '住宅电话'; 
         COMMENT ON COLUMN "gas_person"."cxfkjg" IS '查询反馈结果'; 
         COMMENT ON COLUMN "gas_person"."yxdz" IS '邮箱地址'; 
         COMMENT ON COLUMN "gas_person"."zw" IS '职务'; 
         COMMENT ON COLUMN "gas_person"."zj" IS '职级'; 
         COMMENT ON COLUMN "gas_person"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_person"."zzlxmc" IS '证照类型名称'; 
         COMMENT ON COLUMN "gas_person"."rybh" IS '原系统嫌疑人编号'; 
         COMMENT ON COLUMN "gas_person"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_person"."sfdd" IS '是否调单（1已调单）'; 
         COMMENT ON COLUMN "gas_person"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_person"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_person"."mark" IS '标签'; 
         COMMENT ON TABLE "gas_person" IS '案件-人员单位信息,分析用,带案件信息'; 
          
         -- ----------------
         ------------ 
         -- Table structure for gas_person_chakong 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person_chakong" CASCADE; 
         CREATE TABLE "gas_person_chakong" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_chakong_shard_id_seq'::regclass), 
           "ryid" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "qqdh" varchar(30) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int8 NOT NULL, 
           "zzlx" varchar(30) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhm" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "khmc" varchar(200) COLLATE "pg_catalog"."default", 
           "cym" varchar(50) COLLATE "pg_catalog"."default", 
           "xb" varchar(20) COLLATE "pg_catalog"."default", 
           "mz" varchar(20) COLLATE "pg_catalog"."default", 
           "gj" varchar(20) COLLATE "pg_catalog"."default", 
           "hyzk" varchar(20) COLLATE "pg_catalog"."default", 
           "xl" varchar(20) COLLATE "pg_catalog"."default", 
           "csrq" varchar(50) COLLATE "pg_catalog"."default", 
           "xx" varchar(20) COLLATE "pg_catalog"."default", 
           "jgssx" varchar(100) COLLATE "pg_catalog"."default", 
           "hjdzxzqh" varchar(100) COLLATE "pg_catalog"."default", 
           "hjdzqhnxxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "zzmm" varchar(20) COLLATE "pg_catalog"."default", 
           "gszchm" varchar(50) COLLATE "pg_catalog"."default", 
           "yyzzhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jrjgdm" varchar(50) COLLATE "pg_catalog"."default", 
           "wwmc" varchar(150) COLLATE "pg_catalog"."default", 
           "gjhdq" varchar(20) COLLATE "pg_catalog"."default", 
           "zcdzdm" varchar(20) COLLATE "pg_catalog"."default", 
           "zcdz" varchar(50) COLLATE "pg_catalog"."default", 
           "frdbxm" varchar(100) COLLATE "pg_catalog"."default", 
           "frdbzjlx" varchar(10) COLLATE "pg_catalog"."default", 
           "frdbzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "zgbmmc" varchar(100) COLLATE "pg_catalog"."default", 
           "yyksqx" varchar(20) COLLATE "pg_catalog"."default", 
           "yyjsqx" varchar(20) COLLATE "pg_catalog"."default", 
           "zczb" varchar(20) COLLATE "pg_catalog"."default", 
           "gdczqk" varchar(1000) COLLATE "pg_catalog"."default", 
           "dwlx" varchar(20) COLLATE "pg_catalog"."default", 
           "xxdz" varchar(200) COLLATE "pg_catalog"."default", 
           "clrq" varchar(20) COLLATE "pg_catalog"."default", 
           "jyfw" varchar(1000) COLLATE "pg_catalog"."default", 
           "djjg" varchar(100) COLLATE "pg_catalog"."default", 
           "dwzt" varchar(20) COLLATE "pg_catalog"."default", 
           "gsdjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "dsdjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "fdwid" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "zzjgdm" varchar(30) COLLATE "pg_catalog"."default", 
           "dwmc" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzh" varchar(30) COLLATE "pg_catalog"."default", 
           "khyhmc" varchar(50) COLLATE "pg_catalog"."default", 
           "lxdh" varchar(30) COLLATE "pg_catalog"."default", 
           "jyd_xzqhdm" varchar(20) COLLATE "pg_catalog"."default", 
           "jyd" varchar(100) COLLATE "pg_catalog"."default", 
           "jyd_qhnxxdz" varchar(100) COLLATE "pg_catalog"."default", 
           "cxfkjgyy" varchar(1000) COLLATE "pg_catalog"."default", 
           "lxsj" varchar(20) COLLATE "pg_catalog"."default", 
           "dbrxm" varchar(100) COLLATE "pg_catalog"."default", 
           "dwdz" varchar(100) COLLATE "pg_catalog"."default", 
           "dsnsh" varchar(21) COLLATE "pg_catalog"."default", 
           "xzzxzqh" varchar(100) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(30) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(36) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(2) COLLATE "pg_catalog"."default", 
           "gzdw" varchar(100) COLLATE "pg_catalog"."default", 
           "dbrzjlx" varchar(15) COLLATE "pg_catalog"."default", 
           "frdb" varchar(60) COLLATE "pg_catalog"."default", 
           "dwdh" varchar(30) COLLATE "pg_catalog"."default", 
           "dbrzjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "gsnsh" varchar(20) COLLATE "pg_catalog"."default", 
           "khgszzhm" varchar(18) COLLATE "pg_catalog"."default", 
           "zzdh" varchar(30) COLLATE "pg_catalog"."default", 
           "cxfkjg" varchar(60) COLLATE "pg_catalog"."default", 
           "yxdz" varchar(60) COLLATE "pg_catalog"."default", 
           "zw" varchar(50) COLLATE "pg_catalog"."default", 
           "zj" varchar(50) COLLATE "pg_catalog"."default", 
           "nl" int8, 
           "zzlxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "xycd" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "gas_person_chakong"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_person_chakong"."ryid" IS '人员编号'; 
         COMMENT ON COLUMN "gas_person_chakong"."qqdh" IS '请求单标识'; 
         COMMENT ON COLUMN "gas_person_chakong"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzlx" IS '证照类型'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzhm" IS '证照号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."khmc" IS '开户名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."cym" IS '曾用名'; 
         COMMENT ON COLUMN "gas_person_chakong"."xb" IS '性别代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."mz" IS '民族代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."gj" IS '国籍代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."hyzk" IS '婚姻状况代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."xl" IS '学历代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_person_chakong"."xx" IS '血型代码'; 
         COMMENT ON COLUMN "gas_person_chakong"."jgssx" IS '籍贯省市县代码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."hjdzxzqh" IS '户籍行政区划码(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."hjdzqhnxxdz" IS '户籍区划内详细地址'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzmm" IS '政治面貌(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."gszchm" IS '工商注册号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."yyzzhm" IS '营业执照号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."jrjgdm" IS '金融机构代码'; 
         COMMENT ON COLUMN "gas_person_chakong"."wwmc" IS '外文名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."gjhdq" IS '所属国家地区(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."zcdzdm" IS '注册地(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."zcdz" IS '注册地名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."frdbxm" IS '法人代表姓名'; 
         COMMENT ON COLUMN "gas_person_chakong"."frdbzjlx" IS '法人代表证件类型'; 
         COMMENT ON COLUMN "gas_person_chakong"."frdbzjhm" IS '法人代表证件号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."zgbmmc" IS '主管部门名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."yyksqx" IS '营业开始期限'; 
         COMMENT ON COLUMN "gas_person_chakong"."yyjsqx" IS '营业结束期限'; 
         COMMENT ON COLUMN "gas_person_chakong"."zczb" IS '注册资本(万元)'; 
         COMMENT ON COLUMN "gas_person_chakong"."gdczqk" IS '股东出资情况'; 
         COMMENT ON COLUMN "gas_person_chakong"."dwlx" IS '单位类型(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."xxdz" IS '详细地址'; 
         COMMENT ON COLUMN "gas_person_chakong"."clrq" IS '成立日期'; 
         COMMENT ON COLUMN "gas_person_chakong"."jyfw" IS '经营范围'; 
         COMMENT ON COLUMN "gas_person_chakong"."djjg" IS '登记机关'; 
         COMMENT ON COLUMN "gas_person_chakong"."dwzt" IS '单位状态(DM)'; 
         COMMENT ON COLUMN "gas_person_chakong"."gsdjhm" IS '国税登记号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."dsdjhm" IS '地税登记号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."fdwid" IS '父单位编号'; 
         COMMENT ON COLUMN "gas_person_chakong"."sjlx" IS '数据类型(DM) 嫌疑人1 
         被调查人2 
         证人3 
         受害人4 
         律师5 
         报案人6 
         嫌疑单位7 
         受害单位8 
         从业人员9 
         易感人员10 
         洗钱企业11 
         传销企业12 
         传销人员13 
         非法集资人员14 
         非法集资企业15 
         假发票人员16 
         侵犯知识产权17 
         洗钱人员18 
         银行卡19 
         其他20 
         '; COMMENT ON COLUMN "gas_person_chakong"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_person_chakong"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_person_chakong"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzjgdm" IS '组织机构代码'; 
         COMMENT ON COLUMN "gas_person_chakong"."dwmc" IS '单位名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."yhzh" IS '银行账号'; 
         COMMENT ON COLUMN "gas_person_chakong"."khyhmc" IS '开户银行名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_person_chakong"."jyd_xzqhdm" IS '经营地区划'; 
         COMMENT ON COLUMN "gas_person_chakong"."jyd" IS '经营地'; 
         COMMENT ON COLUMN "gas_person_chakong"."jyd_qhnxxdz" IS '经营地区划内详址'; 
         COMMENT ON COLUMN "gas_person_chakong"."cxfkjgyy" IS '查询反馈结果原因'; 
         COMMENT ON COLUMN "gas_person_chakong"."lxsj" IS '联系手机'; 
         COMMENT ON COLUMN "gas_person_chakong"."dbrxm" IS '代办人姓名'; 
         COMMENT ON COLUMN "gas_person_chakong"."dwdz" IS '单位地址'; 
         COMMENT ON COLUMN "gas_person_chakong"."dsnsh" IS '地税纳税号'; 
         COMMENT ON COLUMN "gas_person_chakong"."xzzxzqh" IS '住宅地址'; 
         COMMENT ON COLUMN "gas_person_chakong"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_person_chakong"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_person_chakong"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_person_chakong"."gzdw" IS '工作单位'; 
         COMMENT ON COLUMN "gas_person_chakong"."dbrzjlx" IS '代办人证件类型'; 
         COMMENT ON COLUMN "gas_person_chakong"."frdb" IS '法人代表'; 
         COMMENT ON COLUMN "gas_person_chakong"."dwdh" IS '单位电话'; 
         COMMENT ON COLUMN "gas_person_chakong"."dbrzjhm" IS '代办人证件号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."gsnsh" IS '国税纳税号'; 
         COMMENT ON COLUMN "gas_person_chakong"."khgszzhm" IS '客户工商执照号码'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzdh" IS '住宅电话'; 
         COMMENT ON COLUMN "gas_person_chakong"."cxfkjg" IS '查询反馈结果'; 
         COMMENT ON COLUMN "gas_person_chakong"."yxdz" IS '邮箱地址'; 
         COMMENT ON COLUMN "gas_person_chakong"."zw" IS '职务'; 
         COMMENT ON COLUMN "gas_person_chakong"."zj" IS '职级'; 
         COMMENT ON COLUMN "gas_person_chakong"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_person_chakong"."zzlxmc" IS '证照类型名称'; 
         COMMENT ON COLUMN "gas_person_chakong"."xycd" IS '嫌疑程度'; 
         COMMENT ON COLUMN "gas_person_chakong"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_person_chakong" IS '人员单位信息(查控返回数据)'; 
          
         -- ---------------------------- 
         -- Table structure for gas_person_glzzh 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person_glzzh" CASCADE; 
         CREATE TABLE "gas_person_glzzh" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_glzzh_shard_id_seq'::regclass), 
           "ajid" int8, 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "beiz" varchar(50) COLLATE "pg_catalog"."default", 
           "bz" varchar(50) COLLATE "pg_catalog"."default", 
           "glzhhm" varchar(50) COLLATE "pg_catalog"."default", 
           "glzhlb" varchar(50) COLLATE "pg_catalog"."default", 
           "khzh" varchar(50) COLLATE "pg_catalog"."default", 
           "kyye" numeric(24,2), 
           "ye" numeric(24,2), 
           "zjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "zhrxm" varchar(50) COLLATE "pg_catalog"."default", 
           "bankcode" varchar(50) COLLATE "pg_catalog"."default", 
           "ccxh" varchar(50) COLLATE "pg_catalog"."default", 
           "xh" int8, 
           "qqdh" varchar(50) COLLATE "pg_catalog"."default", 
           "chbz" varchar(50) COLLATE "pg_catalog"."default", 
           "zhzt" varchar(50) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjly_id" int8, 
           "ckztlb" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int4 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "gas_person_glzzh"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_person_glzzh"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_person_glzzh"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_person_glzzh"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_person_glzzh"."bz" IS '币种'; 
         COMMENT ON COLUMN "gas_person_glzzh"."glzhhm" IS '关联账户户名'; 
         COMMENT ON COLUMN "gas_person_glzzh"."glzhlb" IS '关联账户类别'; 
         COMMENT ON COLUMN "gas_person_glzzh"."khzh" IS '开户账户'; 
         COMMENT ON COLUMN "gas_person_glzzh"."ye" IS '余额'; 
         COMMENT ON COLUMN "gas_person_glzzh"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_person_glzzh"."zhrxm" IS '账户人员姓名'; 
         COMMENT ON COLUMN "gas_person_glzzh"."bankcode" IS '银行代码'; 
         COMMENT ON COLUMN "gas_person_glzzh"."ccxh" IS '查询卡号'; 
         COMMENT ON COLUMN "gas_person_glzzh"."xh" IS '序号'; 
         COMMENT ON COLUMN "gas_person_glzzh"."qqdh" 
         IS '请求单号'; 
         COMMENT ON COLUMN "gas_person_glzzh"."chbz" IS '查询币种'; 
         COMMENT ON COLUMN "gas_person_glzzh"."zhzt" IS '账户主体'; 
         COMMENT ON COLUMN "gas_person_glzzh"."sjly_id" IS '数据类型ID'; 
         COMMENT ON COLUMN "gas_person_glzzh"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_person_glzzh"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_person_glzzh"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_person_glzzh" IS '关联子帐号'; 
          
         -- ---------------------------- 
         -- Table structure for gas_person_gyyxq 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person_gyyxq" CASCADE; 
         CREATE TABLE "gas_person_gyyxq" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_gyyxq_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "qlrlxfs" varchar(100) COLLATE "pg_catalog"."default", 
           "qllx" varchar(100) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(100) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(100) COLLATE "pg_catalog"."default", 
           "khzh" varchar(100) COLLATE "pg_catalog"."default", 
           "beiz" varchar(100) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(100) COLLATE "pg_catalog"."default", 
           "zh" varchar(100) COLLATE "pg_catalog"."default", 
           "zhrxm" varchar(100) COLLATE "pg_catalog"."default", 
           "ccxh" int8, 
           "zzhm" varchar(100) COLLATE "pg_catalog"."default", 
           "xh" int8, 
           "crrq" varchar(100) COLLATE "pg_catalog"."default", 
           "sjly_id" int8, 
           "qlje" float8, 
           "qlrdz" varchar(100) COLLATE "pg_catalog"."default", 
           "bankcode" varchar(100) COLLATE "pg_catalog"."default", 
           "qlrxm" varchar(100) COLLATE "pg_catalog"."default", 
           "qlr" varchar(100) COLLATE "pg_catalog"."default", 
           "zzlxdm" varchar(100) COLLATE "pg_catalog"."default", 
           "cxsqid" int8, 
           "zjhm" varchar(100) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_person_gyyxq"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qlrlxfs" IS '权利人联系方式'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qllx" IS '权利类型'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."khzh" IS '开户账号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."zh" IS '账号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."zhrxm" IS '账户人姓名'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."ccxh" IS '账户序号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."zzhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."xh" IS '序号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."sjly_id" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qlje" IS '权利金额'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qlrdz" IS '权利人通讯地址'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."bankcode" IS '反馈数据用户代码'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qlrxm" IS '权利人姓名'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."qlr" IS '权利人'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."zzlxdm" IS '证件类型代码'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."cxsqid" IS '申请号'; 
         COMMENT ON COLUMN "gas_person_gyyxq"."zjhm" IS '账户人证件号'; 
         COMMENT ON TABLE "gas_person_gyyxq" IS '涉案对象查询-共有优先权'; 
          
         -- ---------------------------- 
         -- Table structure for gas_person_pic 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person_pic" CASCADE; 
         CREATE TABLE "gas_person_pic" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_pic_shard_id_seq'::regclass), 
           "ryid" varchar(50) COLLATE "pg_catalog"."default", 
           "picture" bytea, 
           "sjlyid" int4 NOT NULL, 
           "ajid" int4 NOT NULL 
         ) 
         ; 
         COMMENT ON TABLE "gas_person_pic" IS '人员信息-附件图片'; 
          
         -- ---------------------------- 
         -- Table structure for gas_person_qzcs 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_person_qzcs" CASCADE; 
         CREATE TABLE "gas_person_qzcs" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_person_qzcs_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "djje" float8, 
           "qqdh" varchar(100) COLLATE "pg_catalog"."default", 
           "djjgmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ckztlb" varchar(100) COLLATE "pg_catalog"."default", 
           "djjzrq" varchar(100) COLLATE "pg_catalog"."default", 
           "beiz" varchar(100) COLLATE "pg_catalog"."default", 
           "hzsj" varchar(100) COLLATE "pg_catalog"."default", 
           "zh" varchar(100) COLLATE "pg_catalog"."default", 
           "rwlsh" varchar(100) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "djksrq" varchar(100) COLLATE "pg_catalog"."default", "sjly_id" int8, 
           "bankcode" varchar(100) COLLATE "pg_catalog"."default", 
           "djcslx" varchar(100) COLLATE "pg_catalog"."default", 
           "csxh" varchar(100) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_person_qzcs"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_person_qzcs"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_person_qzcs"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_person_qzcs"."djje" IS '冻结金额'; 
         COMMENT ON COLUMN "gas_person_qzcs"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_person_qzcs"."djjgmc" IS '动机机关名称'; 
         COMMENT ON COLUMN "gas_person_qzcs"."ckztlb" IS '查控主体类别'; 
         COMMENT ON COLUMN "gas_person_qzcs"."djjzrq" IS '冻结截止日期'; 
         COMMENT ON COLUMN "gas_person_qzcs"."beiz" IS '备注'; 
         COMMENT ON COLUMN "gas_person_qzcs"."hzsj" IS '回执时间'; 
         COMMENT ON COLUMN "gas_person_qzcs"."zh" IS '账号'; 
         COMMENT ON COLUMN "gas_person_qzcs"."rwlsh" IS '任务流水号'; 
         COMMENT ON COLUMN "gas_person_qzcs"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_person_qzcs"."djksrq" IS '冻结开始日期'; 
         COMMENT ON COLUMN "gas_person_qzcs"."sjly_id" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_person_qzcs"."bankcode" IS '银行编号'; 
         COMMENT ON COLUMN "gas_person_qzcs"."djcslx" IS '冻结措施类型'; 
         COMMENT ON COLUMN "gas_person_qzcs"."csxh" IS '措施序号'; 
         COMMENT ON TABLE "gas_person_qzcs" IS '强制措施'; 
          
         -- ---------------------------- 
         -- Table structure for gas_phone_call_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_phone_call_info" CASCADE; 
         CREATE TABLE "gas_phone_call_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_phone_call_info_shard_id_seq'::regclass), 
           "thjlid" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4 NOT NULL, 
           "ddfzsxm" varchar(100) COLLATE "pg_catalog"."default", 
           "ddfdhgsd" varchar(100) COLLATE "pg_catalog"."default", 
           "sfsc" char(2) COLLATE "pg_catalog"."default", 
           "thjlbh" varchar(100) COLLATE "pg_catalog"."default", 
           "dfimei" varchar(100) COLLATE "pg_catalog"."default", 
           "ddfdhthd" varchar(100) COLLATE "pg_catalog"."default", 
           "ddfzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "dfthd" varchar(100) COLLATE "pg_catalog"."default", 
           "fx" varchar(50) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(32) COLLATE "pg_catalog"."default", 
           "cxsj" int4, 
           "ddfhm" varchar(20) COLLATE "pg_catalog"."default", 
           "dfhm" varchar(20) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "hjrq" varchar(32) COLLATE "pg_catalog"."default", 
           "ddfimei" varchar(100) COLLATE "pg_catalog"."default", 
           "thlx" varchar(50) COLLATE "pg_catalog"."default", 
           "dfdhgsd" varchar(100) COLLATE "pg_catalog"."default", 
           "thsj" varchar(32) COLLATE "pg_catalog"."default", 
           "ddfimsi" varchar(100) COLLATE "pg_catalog"."default", 
           "hjsj" varchar(32) COLLATE "pg_catalog"."default", 
           "dxnr" varchar(1000) COLLATE "pg_catalog"."default", 
           "dfzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "dfimsi" varchar(100) COLLATE "pg_catalog"."default", 
           "dfzsxm" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "qqdh" varchar(36) COLLATE "pg_catalog"."default", 
           "requestid" varchar(50) COLLATE "pg_catalog"."default", 
           "privodercode" varchar(10) COLLATE "pg_catalog"."default", 
           "serveidentifier" varchar(10) COLLATE "pg_catalog"."default", 
           "serveidentifiermc" varchar(100) COLLATE "pg_catalog"."default", 
           "operateresult" varchar(5) COLLATE "pg_catalog"."default", 
           "calltype" varchar(20) COLLATE "pg_catalog"."default", 
           "calltypemc" varchar(50) COLLATE "pg_catalog"."default", 
           "othernumber" varchar(20) COLLATE "pg_catalog"."default", 
           "lac" varchar(100) COLLATE "pg_catalog"."default", 
           "ci" varchar(100) COLLATE "pg_catalog"."default", 
           "rlgtime" varchar(30) COLLATE "pg_catalog"."default", 
           "cause" varchar(200) COLLATE "pg_catalog"."default", 
           "oldlaititude" varchar(50) COLLATE "pg_catalog"."default", 
           "addr" varchar(500) COLLATE "pg_catalog"."default", 
           "oldlongitude" varchar(50) COLLATE "pg_catalog"."default", 
           "longitude" varchar(50) COLLATE "pg_catalog"."default", 
           "latitude" varchar(50) COLLATE "pg_catalog"."default", 
           "cgi" varchar(100) COLLATE "pg_catalog"."default", 
           "spcode" varchar(100) COLLATE "pg_catalog"."default", 
           "disconnecttime" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "sjlyid" numeric(32), 
           "crrq" timestamp(0), 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "ddfdhgsdzw" varchar(100) COLLATE "pg_catalog"."default", 
           "dfdhgsdzw" varchar(100) COLLATE "pg_catalog"."default", 
           "ddfdhthdzw" varchar(100) COLLATE "pg_catalog"."default", 
           "dfthdzw" varchar(100) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_phone_call_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_phone_call_info"."thjlid" IS '通话记录ID'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfzsxm" IS '调单方真实姓名'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfdhgsd" IS '调单方电话归属地'; 
         COMMENT ON COLUMN "gas_phone_call_info"."sfsc" IS '是否删除，0没删，1已删'; 
         COMMENT ON COLUMN "gas_phone_call_info"."thjlbh" IS '通话记录编号'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfimei" IS '对方IMEI'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfdhthd" IS '调单方电话通话地'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfzjhm" IS '调单方证件号码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfthd" IS '对方通话地'; 
         COMMENT ON COLUMN "gas_phone_call_info"."fx" IS '通话（短信）方向'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_phone_call_info"."cxsj" IS '通话的持续时间'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfhm" IS '调单方电话号码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfhm" IS '对方电话号码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_phone_call_info"."hjrq" IS '呼叫日期'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfimei" IS '调单方IMEI'; 
         COMMENT ON COLUMN "gas_phone_call_info"."thlx" IS '通话的类型'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfdhgsd" IS '对方电话归属地'; 
         COMMENT ON COLUMN "gas_phone_call_info"."thsj" IS '通话（短信）时间'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfimsi" IS '调单方IMSI'; 
         COMMENT ON COLUMN "gas_phone_call_info"."hjsj" IS '呼叫时间'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dxnr" IS '短信的具体内容'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfzjhm" IS '对方证件号码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfimsi" IS '对方IMSI'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfzsxm" IS '对方真实姓名'; 
         COMMENT ON COLUMN "gas_phone_call_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取，查控技侦)'; 
         COMMENT ON COLUMN "gas_phone_call_info"."qqdh" IS '请求单号'; 
         COMMENT ON COLUMN "gas_phone_call_info"."requestid" IS '任务唯一编号'; 
         COMMENT ON COLUMN "gas_phone_call_info"."privodercode" IS '运营商标识'; 
         COMMENT ON COLUMN "gas_phone_call_info"."serveidentifier" IS '业务标识'; 
         COMMENT ON COLUMN "gas_phone_call_info"."serveidentifiermc" IS '业务标识名称'; 
         COMMENT ON COLUMN "gas_phone_call_info"."operateresult" IS '操作结果'; 
         COMMENT ON COLUMN "gas_phone_call_info"."calltype" IS '呼叫类型代码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."calltypemc" IS '呼叫类型名称'; 
         COMMENT ON COLUMN "gas_phone_call_info"."othernumber" IS '第三方号码'; 
         COMMENT ON COLUMN "gas_phone_call_info"."lac" IS '大区'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ci" IS '小区'; 
         COMMENT ON COLUMN "gas_phone_call_info"."rlgtime" IS '释放时间'; 
         COMMENT ON COLUMN "gas_phone_call_info"."cause" IS '释放原因'; 
         COMMENT ON COLUMN "gas_phone_call_info"."oldlaititude" IS '上一个基站纬度'; 
         COMMENT ON COLUMN "gas_phone_call_info"."addr" IS '地址'; 
         COMMENT ON COLUMN "gas_phone_call_info"."oldlongitude" IS '上一个基站经度'; 
         COMMENT ON COLUMN "gas_phone_call_info"."longitude" IS '经度'; 
         COMMENT ON COLUMN "gas_phone_call_info"."latitude" IS '纬度'; 
         COMMENT ON COLUMN "gas_phone_call_info"."cgi" IS 'cgi'; 
         COMMENT ON COLUMN "gas_phone_call_info"."spcode" IS '运营商'; 
         COMMENT ON
          COLUMN "gas_phone_call_info"."disconnecttime" IS '挂段时间'; 
         COMMENT ON COLUMN "gas_phone_call_info"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_phone_call_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_phone_call_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_phone_call_info"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfdhgsdzw" IS '调单方电话归属地(中文)'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfdhgsdzw" IS '对方电话归属地(中文)'; 
         COMMENT ON COLUMN "gas_phone_call_info"."ddfdhthdzw" IS '调单方电话通话地(中文)'; 
         COMMENT ON COLUMN "gas_phone_call_info"."dfthdzw" IS '对方电话通话地(中文)'; 
         COMMENT ON TABLE "gas_phone_call_info" IS '资金分析通话记录表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_safe_trading 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_safe_trading" CASCADE; 
         CREATE TABLE "gas_safe_trading" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_safe_trading_shard_id_seq'::regclass), 
           "ajid" int4, 
           "sfbz" varchar(2) COLLATE "pg_catalog"."default", 
           "xjbz" char(1) COLLATE "pg_catalog"."default", 
           "sfkrq" varchar(50) COLLATE "pg_catalog"."default", 
           "ztmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ztlx" varchar(2) COLLATE "pg_catalog"."default", 
           "sfkrzzjgdm" varchar(100) COLLATE "pg_catalog"."default", 
           "sfkrkhhjrjgmc" varchar(100) COLLATE "pg_catalog"."default", 
           "sfkrczgjdm" varchar(10) COLLATE "pg_catalog"."default", 
           "sfkrgjzwqc" varchar(100) COLLATE "pg_catalog"."default", 
           "sfkrwhzh" varchar(100) COLLATE "pg_catalog"."default", 
           "dfsfkrmc" varchar(200) COLLATE "pg_catalog"."default", 
           "dfsfkrlx" varchar(2) COLLATE "pg_catalog"."default", 
           "dfsfkrzzjgdm" varchar(100) COLLATE "pg_catalog"."default", 
           "dfsfkrkhhjrjgmc" varchar(100) COLLATE "pg_catalog"."default", 
           "dfsfkrczgjdm" varchar(10) COLLATE "pg_catalog"."default", 
           "dfsfkrgjzwmc" varchar(100) COLLATE "pg_catalog"."default", 
           "dfsfkrwhzh" varchar(100) COLLATE "pg_catalog"."default", 
           "jybm" varchar(100) COLLATE "pg_catalog"."default", 
           "jyje" numeric(22,2), 
           "jyjezmy" numeric(22,2), 
           "jybzdm" varchar(5) COLLATE "pg_catalog"."default", 
           "hbms" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfy" varchar(3000) COLLATE "pg_catalog"."default", 
           "whjmc" varchar(100) COLLATE "pg_catalog"."default", 
           "yhywbh" varchar(100) COLLATE "pg_catalog"."default", 
           "sbtbrmc" varchar(100) COLLATE "pg_catalog"."default", 
           "sbtbrdh" varchar(25) COLLATE "pg_catalog"."default", 
           "sbrq" varchar(50) COLLATE "pg_catalog"."default", 
           "gjszztlxms" varchar(200) COLLATE "pg_catalog"."default", 
           "jyms" varchar(200) COLLATE "pg_catalog"."default", 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "jylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_safe_trading"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_safe_trading"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfbz" IS '收付标志 
          收，付'; 
         COMMENT ON COLUMN "gas_safe_trading"."xjbz" IS '现金标志'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrq" IS '收付款日期'; 
         COMMENT ON COLUMN "gas_safe_trading"."ztmc" IS '主体名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."ztlx" IS '主体类型 
         对公：1 
         对私：2'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrzzjgdm" IS '收付款人组织机构代码'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrkhhjrjgmc" IS '收付款人开户行金融机构名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrczgjdm" IS '收付款人常驻国家（地区）代码'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrgjzwqc" IS '收付款人国家（地区）中文全称'; 
         COMMENT ON COLUMN "gas_safe_trading"."sfkrwhzh" IS '收付款人外汇账号'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrmc" IS '对方收付款人名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrlx" IS '对方收付款人类型'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrzzjgdm" IS '对方收付款人组织机构代码'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrkhhjrjgmc" IS '对方收付款人开户行金融机构名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrczgjdm" IS '对方收付款人常驻国家（地区）代码'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrgjzwmc" IS '对方收付款人国家（地区）中文全称'; 
         COMMENT ON COLUMN "gas_safe_trading"."dfsfkrwhzh" IS '对方收付款人外汇账号'; 
         COMMENT ON COLUMN "gas_safe_trading"."jybm" IS '交易编码'; 
         COMMENT ON COLUMN "gas_safe_trading"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_safe_trading"."jyjezmy" IS '交易金额（折美元）'; 
         COMMENT ON COLUMN "gas_safe_trading"."jybzdm" IS '交易币种代码'; 
         COMMENT ON COLUMN "gas_safe_trading"."hbms" IS '货币描述'; 
         COMMENT ON COLUMN "gas_safe_trading"."jyfy" IS '交易附言'; 
         COMMENT ON COLUMN "gas_safe_trading"."whjmc" IS '外汇局名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."yhywbh" IS '银行业务编号'; 
         COMMENT ON COLUMN "gas_safe_trading"."sbtbrmc" IS '申报填报人名称'; 
         COMMENT ON COLUMN "gas_safe_trading"."sbtbrdh" IS '申报填报人电话'; 
         COMMENT ON COLUMN "gas_safe_trading"."sbrq" IS '申报日期'; 
         COMMENT ON COLUMN "gas_safe_trading"."gjszztlxms" IS '国际收支主体类型描述'; 
         COMMENT ON COLUMN "gas_safe_trading"."jyms" IS '交易描述'; 
         COMMENT ON COLUMN "gas_safe_trading"."sjlx" IS '数据类型 
         对公收款：1 
         对公付款：2 
         对私收款：3 
         对私付款：4'; 
         COMMENT ON COLUMN "gas_safe_trading"."jylx" IS '交易类型 
         对公收款：1 
         对公付款：2 
         对私收款：3 
         对私付款：4'; 
         COMMENT ON COLUMN "gas_safe_trading"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_safe_trading"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_safe_trading"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_safe_trading"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_safe_trading"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_safe_trading" IS '外管交易表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_sjdx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_sjdx" CASCADE; 
         CREATE TABLE "gas_sjdx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_sjdx_shard_id_seq'::regclass), 
           "ajid" int4, 
           "ch_id" int8 NOT NULL DEFAULT nextval('gas_sjdx_ch_id_seq'::regclass), 
           "rybh" varchar(32) COLLATE "pg_catalog"."default", 
           "person_name" varchar(60) COLLATE "pg_catalog"."default", 
           "idcard" varchar(18) COLLATE "pg_catalog"."default", 
           "content" varchar(2000) COLLATE "pg_catalog"."default" NOT NULL, 
           "telephone_y" varchar(60) COLLATE "pg_catalog"."default", 
           "time" varchar(30) COLLATE "pg_catalog"."default", 
           "isdel" varchar(10) COLLATE "pg_catalog"."default", 
           "adddatatime" varchar(20) COLLATE "pg_catalog"."default", 
           "lrr" varchar(60) COLLATE "pg_catalog"."default", 
           "lrdw" varchar(100) COLLATE "pg_catalog"."default", 
           "lrsj" varchar(30) COLLATE "pg_catalog"."default", 
           "telphone" varchar(50) COLLATE "pg_catalog"."default", 
           "status" varchar(10) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "jsfsjh" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_sjdx"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_sjdx"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_sjdx"."ch_id" IS '主键'; 
         COMMENT ON COLUMN "gas_sjdx"."rybh" IS '采集编号'; 
         COMMENT ON COLUMN "gas_sjdx"."person_name" IS '姓名'; 
         COMMENT ON COLUMN "gas_sjdx"."idcard" IS '身份证号'; 
         COMMENT ON COLUMN "gas_sjdx"."content" IS '短信内容'; 
         COMMENT ON COLUMN "gas_sjdx"."telephone_y" IS '姓名'; 
         COMMENT ON COLUMN "gas_sjdx"."time" IS '时间'; 
         COMMENT ON COLUMN "gas_sjdx"."isdel" IS '是否删除'; 
         COMMENT ON COLUMN "gas_sjdx"."adddatatime" IS '录入日期'; 
         COMMENT ON COLUMN "gas_sjdx"."lrr" IS '录入人'; 
         COMMENT ON COLUMN "gas_sjdx"."lrdw" IS '录入单位'; 
         COMMENT ON COLUMN "gas_sjdx"."lrsj" IS '录入时间'; 
         COMMENT ON COLUMN "gas_sjdx"."telphone" IS '电话号码'; 
         COMMENT ON COLUMN "gas_sjdx"."status" IS '短信收件箱关键字：收件箱，发件箱，已发件箱，草稿箱，存档箱分别为：‘收件箱’，‘发件箱’，‘已发件箱’，‘草稿箱’，‘存档箱’'; 
         COMMENT ON COLUMN "gas_sjdx"."sjlylx" IS '数据来源类型(手工
         录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_sjdx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_sjdx"."jsfsjh" IS '接收方手机号'; 
         COMMENT ON COLUMN "gas_sjdx"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_sjdx"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_sjdx"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_sjdx" IS '手机短信'; 
          
         -- ---------------------------- 
         -- Table structure for gas_sjtxl 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_sjtxl" CASCADE; 
         CREATE TABLE "gas_sjtxl" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_sjtxl_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "id" int8 NOT NULL DEFAULT nextval('gas_sjtxl_id_seq'::regclass), 
           "lymc" varchar(100) COLLATE "pg_catalog"."default", 
           "lydh" varchar(50) COLLATE "pg_catalog"."default", 
           "lyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "lxrmc" varchar(100) COLLATE "pg_catalog"."default"
         , 
           "lxrzsxm" varchar(100) COLLATE "pg_catalog"."default", 
           "lxrdhhm" varchar(100) COLLATE "pg_catalog"."default", 
           "lxrgs" varchar(100) COLLATE "pg_catalog"."default", 
           "lxrjsms" varchar(100) COLLATE "pg_catalog"."default", 
           "rybh" varchar(128) COLLATE "pg_catalog"."default", 
           "shch" varchar(100) COLLATE "pg_catalog"."default", 
           "addrtype" varchar(200) COLLATE "pg_catalog"."default", 
           "lrr" varchar(50) COLLATE "pg_catalog"."default", 
           "lrdw" varchar(12) COLLATE "pg_catalog"."default", 
           "lrsj" varchar(100) COLLATE "pg_catalog"."default", 
           "isdel" char(10) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_sjtxl"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_sjtxl"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_sjtxl"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_sjtxl"."lymc" IS '来源名称'; 
         COMMENT ON COLUMN "gas_sjtxl"."lydh" IS '来源电话'; 
         COMMENT ON COLUMN "gas_sjtxl"."lyzjhm" IS '来源证件号码'; 
         COMMENT ON COLUMN "gas_sjtxl"."lxrmc" IS '联系人名称'; 
         COMMENT ON COLUMN "gas_sjtxl"."lxrzsxm" IS '联系人真实姓名'; 
         COMMENT ON COLUMN "gas_sjtxl"."lxrdhhm" IS '联系人电话号码'; 
         COMMENT ON COLUMN "gas_sjtxl"."lxrgs" IS '联系人公司'; 
         COMMENT ON COLUMN "gas_sjtxl"."lxrjsms" IS '联系人角色描述'; 
         COMMENT ON COLUMN "gas_sjtxl"."rybh" IS '采集编号'; 
         COMMENT ON COLUMN "gas_sjtxl"."shch" IS '用户IMEI码'; 
         COMMENT ON COLUMN "gas_sjtxl"."addrtype" IS '通讯录关键字：手机为：''''CELL'''' SIM卡为：’SIM‘'; 
         COMMENT ON COLUMN "gas_sjtxl"."lrr" IS '录入人'; 
         COMMENT ON COLUMN "gas_sjtxl"."lrdw" IS '录入单位'; 
         COMMENT ON COLUMN "gas_sjtxl"."lrsj" IS '录入时间'; 
         COMMENT ON COLUMN "gas_sjtxl"."isdel" IS '是否删除'; 
         COMMENT ON COLUMN "gas_sjtxl"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_sjtxl"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_sjtxl"."batch" IS '批次ID'; 
         COMMENT ON COLUMN "gas_sjtxl"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_sjtxl"."maxid" IS '最大ID'; 
         COMMENT ON TABLE "gas_sjtxl" IS '手机通讯录'; 
          
         -- ---------------------------- 
         -- Table structure for gas_taobao_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_taobao_info" CASCADE; 
         CREATE TABLE "gas_taobao_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_taobao_info_shard_id_seq'::regclass), 
           "id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "cardstatus" varchar(100) COLLATE "pg_catalog"."default", 
           "dh" varchar(100) COLLATE "pg_catalog"."default", 
           "tbkid" varchar(100) COLLATE "pg_catalog"."default", 
           "yb" varchar(100) COLLATE "pg_catalog"."default", 
           "decdlsf" varchar(10) COLLATE "pg_catalog"."default", 
           "sjkzryid" numeric(32) DEFAULT NULL::numeric, 
           "ajcjrq" varchar(100) COLLATE "pg_catalog"."default", 
           "sf" varchar(10) COLLATE "pg_catalog"."default", 
           "tbzhid" varchar(100) COLLATE "pg_catalog"."default", 
           "dz" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzccs" varchar(10) COLLATE "pg_catalog"."default", 
           "dlzdsfcs" numeric(10) DEFAULT NULL::numeric, 
           "ssryid" numeric(32) DEFAULT NULL::numeric, 
           "dlcs" numeric(10) DEFAULT NULL::numeric, 
           "bz" varchar(100) COLLATE "pg_catalog"."default", 
           "ajid" numeric(32) DEFAULT NULL::numeric, 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "cardphonestatus" varchar(100) COLLATE "pg_catalog"."default", 
           "sfydj" varchar(1) COLLATE "pg_catalog"."default", 
           "yx" varchar(100) COLLATE "pg_catalog"."default", 
           "dllssfs" numeric(10) DEFAULT NULL::numeric, 
           "cardno" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzcip" varchar(100) COLLATE "pg_catalog"."default", 
           "cardapplystatus" varchar(100) COLLATE "pg_catalog"."default", 
           "zhdlsf" varchar(10) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(30) COLLATE "pg_catalog"."default", 
           "dlts" numeric(10) DEFAULT NULL::numeric, 
           "zhdlsj" varchar(100) COLLATE "pg_catalog"."default", 
           "dlzdsf" varchar(10) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
         
           "statusmodify" varchar(100) COLLATE "pg_catalog"."default", 
           "xb" varchar(100) COLLATE "pg_catalog"."default", 
           "dlslsf" varchar(100) COLLATE "pg_catalog"."default", 
           "cardemailstatus" varchar(100) COLLATE "pg_catalog"."default", 
           "company" varchar(100) COLLATE "pg_catalog"."default", 
           "cs" varchar(10) COLLATE "pg_catalog"."default", 
           "crrq" varchar(100) COLLATE "pg_catalog"."default", 
           "yhzcsf" varchar(10) COLLATE "pg_catalog"."default", 
           "nc" varchar(100) COLLATE "pg_catalog"."default", 
           "xm" varchar(100) COLLATE "pg_catalog"."default", 
           "sjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "tbzh" varchar(100) COLLATE "pg_catalog"."default", 
           "cardtype" varchar(100) COLLATE "pg_catalog"."default", 
           "nl" varchar(10) COLLATE "pg_catalog"."default", 
           "dycdlsf" varchar(10) COLLATE "pg_catalog"."default", 
           "pwdstatus" varchar(100) COLLATE "pg_catalog"."default", 
           "zjllx" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "gsmc" varchar(50) COLLATE "pg_catalog"."default", 
           "hykhyh" varchar(50) COLLATE "pg_catalog"."default", 
           "txkh" varchar(50) COLLATE "pg_catalog"."default", 
           "zhye" float8, 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_taobao_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardstatus" IS '卡状态'; 
         COMMENT ON COLUMN "gas_taobao_info"."dh" IS '电话'; 
         COMMENT ON COLUMN "gas_taobao_info"."tbkid" IS '淘宝真实卡ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."yb" IS '余号'; 
         COMMENT ON COLUMN "gas_taobao_info"."decdlsf" IS '第二次登录省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."sjkzryid" IS '实际控制人员ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_taobao_info"."sf" IS '省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."tbzhid" IS 'ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."dz" IS '地址'; 
         COMMENT ON COLUMN "gas_taobao_info"."yhzccs" IS '用户注册城市'; 
         COMMENT ON COLUMN "gas_taobao_info"."dlzdsfcs" IS '登录最多省份的登录次数'; 
         COMMENT ON COLUMN "gas_taobao_info"."ssryid" IS '所属人员ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."dlcs" IS '登录次数'; 
         COMMENT ON COLUMN "gas_taobao_info"."bz" IS '备注'; 
         COMMENT ON COLUMN "gas_taobao_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardphonestatus" IS '卡电话状态'; 
         COMMENT ON COLUMN "gas_taobao_info"."sfydj" IS '是否已调集'; 
         COMMENT ON COLUMN "gas_taobao_info"."yx" IS '邮箱'; 
         COMMENT ON COLUMN "gas_taobao_info"."dllssfs" IS '登录历史省份数'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardno" IS '卡号'; 
         COMMENT ON COLUMN "gas_taobao_info"."yhzcip" IS '用户注册IP'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardapplystatus" IS '卡申请状态'; 
         COMMENT ON COLUMN "gas_taobao_info"."zhdlsf" IS '最后一次登录省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."sfzh" IS '身份证号'; 
         COMMENT ON COLUMN "gas_taobao_info"."dlts" IS '登录天数'; 
         COMMENT ON COLUMN "gas_taobao_info"."zhdlsj" IS '最后登录时间'; 
         COMMENT ON COLUMN "gas_taobao_info"."dlzdsf" IS '登录最多的省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_taobao_info"."statusmodify" IS '状态修改'; 
         COMMENT ON COLUMN "gas_taobao_info"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_taobao_info"."dlslsf" IS '登陆历史省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardemailstatus" IS '卡邮件状态'; 
         COMMENT ON COLUMN "gas_taobao_info"."company" IS '公司名称'; 
         COMMENT ON COLUMN "gas_taobao_info"."cs" IS '城市'; 
         COMMENT ON COLUMN "gas_taobao_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_taobao_info"."yhzcsf" IS '用户注册省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."nc" IS '昵称'; 
         COMMENT ON COLUMN "gas_taobao_info"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_taobao_info"."sjhm" IS '手机号码'; 
         COMMENT ON COLUMN "gas_taobao_info"."tbzh" IS '淘宝账号'; 
         COMMENT ON COLUMN "gas_taobao_info"."cardtype" IS '卡类型'; 
         COMMENT ON COLUMN "gas_taobao_info"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_taobao_info"."dycdlsf" IS '第一次登录省份'; 
         COMMENT ON COLUMN "gas_taobao_info"."pwdstatus" IS '密码状态'; 
         COMMENT ON COLUMN "gas_taobao_info"."zjllx" IS '证件类型'; 
         COMMENT ON COLUMN "gas_taobao_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_taobao_info"."gsmc" IS '公司名称'; 
         COMMENT ON COLUMN "gas_taobao_info"."hykhyh" IS '会员开户银行'; 
         COMMENT ON COLUMN "gas_taobao_info"."txkh" IS '最近一次提现卡号'; 
         COMMENT ON COLUMN "gas_taobao_info"."zhye" IS '日切账户余额信息'; 
         COMMENT ON COLUMN "gas_taobao_info"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_taobao_info" IS '资金分析淘宝账户信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_taobao_log 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_taobao_log" CASCADE; 
         CREATE TABLE "gas_taobao_log" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_taobao_log_shard_id_seq'::regclass), 
           "id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "tbdlrzid" varchar(100) COLLATE "pg_catalog"."default", 
           "xm" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "ajid" int8, 
           "ajcjsj" varchar(50) COLLATE "pg_catalog"."default", 
           "tbyhid" varchar(50) COLLATE "pg_catalog"."default", 
           "tbzh" varchar(100) COLLATE "pg_catalog"."default", 
           "ssdqid" numeric(32) DEFAULT NULL::numeric, 
           "yhip" varchar(80) COLLATE "pg_catalog"."default", 
           "dlsj" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_taobao_log"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_taobao_log"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_taobao_log"."crrq" IS '查询日期'; 
         COMMENT ON COLUMN "gas_taobao_log"."tbdlrzid" IS '淘宝登录日志id'; 
         COMMENT ON COLUMN "gas_taobao_log"."xm" IS '用户名字'; 
         COMMENT ON COLUMN "gas_taobao_log"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_taobao_log"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_taobao_log"."ajcjsj" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_taobao_log"."tbyhid" IS '淘宝用户id'; 
         COMMENT ON COLUMN "gas_taobao_log"."tbzh" IS '淘宝登录账号'; 
         COMMENT ON COLUMN "gas_taobao_log"."ssdqid" IS '所属地区id'; 
         COMMENT ON COLUMN "gas_taobao_log"."yhip" IS '用户ip'; 
         COMMENT ON COLUMN "gas_taobao_log"."dlsj" IS '登录时间'; 
         COMMENT ON COLUMN "gas_taobao_log"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_taobao_log"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_taobao_log" IS '资金分析淘宝登录日志信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_taobao_trade_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_taobao_trade_info" CASCADE; 
         CREATE TABLE "gas_taobao_trade_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_taobao_trade_info_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "bjtbzhid" varchar(100) COLLATE "pg_catalog"."default", 
           "bjdldh" varchar(100) COLLATE "pg_catalog"."default", 
           "wbjyh" varchar(50) COLLATE "pg_catalog"."default", 
           "zhxgsj" varchar(100) COLLATE "pg_catalog"."default", 
           "sksj" text COLLATE "pg_catalog"."default", 
           "shdz" text COLLATE "pg_catalog"."default", 
           "hzid" varchar(50) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(100) COLLATE "pg_catalog"."default", 
           "mxlx" varchar(1) COLLATE "pg_catalog"."default", 
           "spmc" text COLLATE "pg_catalog"."default", 
           "lyd" varchar(20) COLLATE "pg_catalog"."default", 
           "tbjyjlid" varchar(100) COLLATE "pg_catalog"."default", 
           "bjxx" varchar(200) COLLATE "pg_catalog"."default", 
           "jyh" varchar(100) COLLATE "pg_catalog"."default", 
           "shlxdh" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int8, 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "cjsj" varchar(100) COLLATE "pg_catalog"."default", 
           "bjxm" varchar(200) COLLATE "pg_catalog"."default", 
           "bjnc" varchar(100) COLLATE "pg_catalog"."default", 
           "shlxr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjzh" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "jyje" numeric(20) DEFAULT NULL::numeric, 
           "bjzh" varchar(100) COLLATE "pg_catalog"."default", 
           "sjxm" varchar(200) COLLATE "pg_catalog"."default", 
           "sjnc" varchar(100) COLLATE "pg_catalog"."default", 
           "sjdlyx" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzt" varchar(50) COLLATE "pg_catalog"."default", 
           "sjxx" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjdldh" varchar(50) COLLATE "pg_catalog"."default", 
           "jylx" varchar(20) COLLATE "pg_catalog"."default", 
           "bjdlyx" varchar(100) COLLATE "pg_catalog"."default", 
           "sjtbzhid" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjtbzhid" IS '买家淘宝账号ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjdldh" IS '买家登录电话'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."wbjyh" IS '外部交易号'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."zhxgsj" IS '最后修改时间'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sksj" IS '收款时间'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."shdz" IS '收货地址'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."hzid" IS '合作编号'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."mxlx" IS '明细类型，0为买家，1为卖家'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."spmc" IS '商品名称'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."lyd" IS '来源地'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."tbjyjlid" IS 'ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjxx" IS '买家信息'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."jyh" IS '交易号'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."shlxdh" IS '收货联系电话'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."cjsj" IS '创建时间'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjxm" IS '买家姓名'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjnc" IS '买家昵称'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."shlxr" IS '收货联系人'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjzh" IS '卖家账号'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjzh" IS '买家账号'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjxm" IS '卖家姓名'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjnc" IS '卖家昵称'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjdlyx" IS '卖家登录邮箱'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."jyzt" IS '交易状态'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjxx" IS '卖家信息'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjdldh" IS '卖家登录电话'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."jylx" IS '交易类型'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."bjdlyx" IS '买家登录邮箱'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjtbzhid" IS '卖家淘宝账号ID'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_taobao_trade_info"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_taobao_trade_info" IS '资金分析淘宝交易明细信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_bgd 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_bgd" CASCADE; 
         CREATE TABLE "gas_tax_bgd" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_bgd_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "jzxhgbh" varchar(50) COLLATE "pg_catalog"."default", 
           "jzxh" varchar(50) COLLATE "pg_catalog"."default", 
           "bdghgbh" varchar(50) COLLATE "pg_catalog"."default", 
           "jckbz" varchar(10) COLLATE "pg_catalog"."default", 
           "jckadm" varchar(50) COLLATE "pg_catalog"."default", 
           "jckrq" varchar(20) COLLATE "pg_catalog"."default", 
           "sbrq" varchar(20) COLLATE "pg_catalog"."default", 
           "zyg" varchar(50) COLLATE "pg_catalog"."default", 
           "ysgjmc" varchar(50) COLLATE "pg_catalog"."default", 
           "ysgjhbch" varchar(50) COLLATE "pg_catalog"."default", 
           "ysfsdm" varchar(50) COLLATE "pg_catalog"."default", 
           "jydwbh" varchar(50) COLLATE "pg_catalog"."default", 
           "jydwmc" varchar(50) COLLATE "pg_catalog"."default", 
           "hzdwdqdm" varchar(20) COLLATE "pg_catalog"."default", 
           "hzdwdm" varchar(20) COLLATE "pg_catalog"."default", 
           "hzdwmc" varchar(50) COLLATE "pg_catalog"."default", 
           "sbdwdm" varchar(50) COLLATE "pg_catalog"."default", 
           "sbdwmc" varchar(50) COLLATE "pg_catalog"."default", 
           "tydhm" varchar(50) COLLATE "pg_catalog"."default", 
           "mygb" varchar(50) COLLATE "pg_catalog"."default", 
           "jgfs" varchar(50) COLLATE "pg_catalog"."default", 
           "jzxbzxs" float4, 
           "js" float4, 
           "mz" float4, 
           "jz" float4, 
           "bzzl" varchar(10) COLLATE "pg_catalog"."default", 
           "xkzh" varchar(50) COLLATE "pg_catalog"."default", 
           "jhzh" varchar(50) COLLATE "pg_catalog"."default", 
           "bz" varchar(50) COLLATE "pg_catalog"."default", 
           "xgcs" float4, 
           "sbfsvz" varchar(50) COLLATE "pg_catalog"."default", 
           "sjgms" varchar(50) COLLATE "pg_catalog"."default", 
           "mtdm" varchar(50) COLLATE "pg_catalog"."default", 
           "spxh" varchar(50) COLLATE "pg_catalog"."default", 
           "spbh" varchar(50) COLLATE "pg_catalog"."default", 
           "spmc" varchar(50) COLLATE "pg_catalog"."default", 
           "spgg" varchar(500) COLLATE "pg_catalog"."default", 
           "ccg" varchar(50) COLLATE "pg_catalog"."default", 
           "cjbz" varchar(50) COLLATE "pg_catalog"."default", 
           "bjbzhl" varchar(50) COLLATE "pg_catalog"."default", 
           "sbdw" float4, 
           "sbzj" float4, 
           "sbsl" float4, 
           "sbjldw" varchar(10) COLLATE "pg_catalog"."default", 
           "dysl" varchar(10) COLLATE "pg_catalog"."default", 
           "dyjldw" varchar(50) COLLATE "pg_catalog"."default", 
           "drsl" float4, 
           "drjldw" varchar(30) COLLATE "pg_catalog"."default", 
           "cjzj" float4, 
           "tjmyj" float4, 
           "gsj" float4, 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_bgd"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_bgd"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_bgd"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jzxhgbh" IS 'jzx海关编号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jzxh" IS '集装箱号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."bdghgbh" IS 'bgd.海关编号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jckbz" IS '进出口标志'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jckadm" IS '进出口岸代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jckrq" IS '进出口日期'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbrq" IS '申报日期'; 
         COMMENT ON COLUMN "gas_tax_bgd"."zyg" IS '指运港(抵运港)'; 
         COMMENT ON COLUMN "gas_tax_bgd"."ysgjmc" IS '运输工具名称'; 
         COMMENT ON COLUMN "gas_tax_bgd"."ysgjhbch" IS '运输工具航次(班)号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."ysfsdm" IS '运输方式代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jydwbh" IS '经营单位编号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jydwmc" IS '经营单位名称'; 
         COMMENT ON COLUMN "gas_tax_bgd"."hzdwdqdm" IS '货主单位地区代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."hzdwdm" IS '货主单位代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."hzdwmc" IS '货主单位名称'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbdwdm" IS '申报单位代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbdwmc" IS '申报单位名称'; 
         COMMENT ON COLUMN "gas_tax_bgd"."tydhm" IS '提运单号码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."mygb" IS '贸易国别（起/抵运地)'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jgfs" IS '监管方式'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jzxbzxs" IS '集装箱标准箱数'; 
         COMMENT ON COLUMN "gas_tax_bgd"."js" IS '件数'; 
         COMMENT ON COLUMN "gas_tax_bgd"."mz" IS '毛重'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jz" IS '净重'; 
         COMMENT ON COLUMN "gas_tax_bgd"."bzzl" IS '包装种类'; 
         COMMENT ON COLUMN "gas_tax_bgd"."xkzh" IS '许可证编号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."jhzh" IS '结汇证号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."bz" IS '备注'; 
         COMMENT ON COLUMN "gas_tax_bgd"."xgcs" IS '修改次数'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbfsvz" IS '申报方式标志'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sjgms" IS '审核（状态字）结果描述'; 
         COMMENT ON COLUMN "gas_tax_bgd"."mtdm" IS '码头/货场代码'; 
         COMMENT ON COLUMN "gas_tax_bgd"."spxh" IS '商品序号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."spbh" IS '商品编号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."spmc" IS '商品名称'; 
         COMMENT ON COLUMN "gas_tax_bgd"."spgg" IS '商品规格、型号'; 
         COMMENT ON COLUMN "gas_tax_bgd"."ccg" IS '产销国'; 
         COMMENT ON COLUMN "gas_tax_bgd"."cjbz" IS '成交币制'; 
         COMMENT ON COLUMN "gas_tax_bgd"."bjbzhl" IS '成交币制汇率'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbdw" IS '申报单价'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbzj" IS '申报总价'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbsl" IS '申报数量'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sbjldw" IS '申报计量单位'; 
         COMMENT ON COLUMN "gas_tax_bgd"."dysl" IS '第一（法定）数量'; 
         COMMENT ON COLUMN "gas_tax_bgd"."dyjldw" IS '第一(法定)计量单位'; 
         COMMENT ON COLUMN "gas_tax_bgd"."drsl" IS '第二数量'; 
         COMMENT ON COLUMN "gas_tax_bgd"."drjldw" IS '第二计量单位'; 
         COMMENT ON COLUMN "gas_tax_bgd"."cjzj" IS '成交总价'; 
         COMMENT ON COLUMN "gas_tax_bgd"."tjmyj" IS '统计美元价'; 
         COMMENT ON COLUMN "gas_tax_bgd"."gsj" IS '关税完税价'; 
         COMMENT ON COLUMN "gas_tax_bgd"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_bgd"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_bgd"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_bgd"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_bgd"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_bgd" IS '报关单'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_bgh 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_bgh" CASCADE; 
         CREATE TABLE "gas_tax_bgh" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_bgh_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "qyzch" varchar(50) COLLATE "pg_catalog"."default", 
           "qyzcmc" varchar(255) COLLATE "pg_catalog"."default", 
           "zchgdm" varchar(32) COLLATE "pg_catalog"."default", 
           "qyjb" varchar(10) COLLATE "pg_catalog"."default", 
           "yxrq" varchar(20) COLLATE "pg_catalog"."default", 
           "khyh" varchar(50) COLLATE "pg_catalog"."default", 
           "khzh" varchar(50) COLLATE "pg_catalog"."default", 
           "zcrq" varchar(20) COLLATE "pg_catalog"."default", 
           "yyzzh" varchar(32) COLLATE "pg_catalog"."default", 
           "qyzwdz" varchar(255) COLLATE "pg_catalog"."default", 
           "lxr" varchar(50) COLLATE "pg_catalog"."default", 
           "lxrdh" varchar(20) COLLATE "pg_catalog"."default", 
           "frdb" varchar(50) COLLATE "pg_catalog"."default", 
           "frdh" varchar(50) COLLATE "pg_catalog"."default", 
           "tzze" numeric(24), 
           "jlzhm" varchar(50) COLLATE "pg_catalog"."default", 
           "zczb" float4, 
           "zczjbz" varchar(50) COLLATE "pg_catalog"."default", 
           "swdjh" varchar(50) COLLATE "pg_catalog"."default", 
           "nsrq" varchar(20) COLLATE "pg_catalog"."default", 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_bgh"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_bgh"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_bgh"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_bgh"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_bgh"."qyzch" IS '企业注册号?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."qyzcmc" IS '企业注册名称(全)'; 
         COMMENT ON COLUMN "gas_tax_bgh"."zchgdm" IS '注册海关代码?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."qyjb" IS '企业级别?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."yxrq" IS '有效日期?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."khyh" IS '开户银行?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."khzh" IS '开户帐号?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."zcrq" IS '注册日期?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."yyzzh" IS '营业执照号?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."qyzwdz" IS '企业中文地址?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."lxr" IS '联系人?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."lxrdh" IS '联系人电话?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."frdb" IS '法人代表?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."frdh" IS '法人电话?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."tzze" IS '投资总额?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."jlzhm" IS '居留证号码?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."zczb" IS '注册资本(万)'; 
         COMMENT ON COLUMN "gas_tax_bgh"."zczjbz" IS '注册资金币制?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."swdjh" IS '税务登记号?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."nsrq" IS '年审日期?'; 
         COMMENT ON COLUMN "gas_tax_bgh"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_bgh"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_bgh"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_bgh"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_bgh"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_bgh"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_bgh" IS '报关行'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_hgjkshbd 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_hgjkshbd" CASCADE; 
         CREATE TABLE "gas_tax_hgjkshbd" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_hgjkshbd_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "jkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hzdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "sbdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hgjksh" varchar(32) COLLATE "pg_catalog"."default", 
           "dkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "skje" numeric(24), 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."jkdwmc" IS '缴款单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."hzdwmc" IS '货主单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."jydwmc" IS '经营单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."sbdwmc" IS '申报单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."hgjksh" IS '海关缴款书号'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."dkdwmc" IS '抵扣单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."skje" IS '税款金额'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_hgjkshbd"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_hgjkshbd" IS '海关和国税通过海关缴款书号比对表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_hgjkshxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_hgjkshxx" CASCADE; 
         CREATE TABLE "gas_tax_hgjkshxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_hgjkshxx_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "jkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hzdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "sbdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hgjksh" varchar(32) COLLATE "pg_catalog"."default", 
           "skje" numeric(24), 
           "tjrmbj" numeric(24), 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."jkdwmc" IS '缴款单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."hzdwmc" IS '货主单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."jydwmc" IS '经营单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."sbdwmc" IS '申报单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."hgjksh" IS '海关缴款书号'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."skje" IS '税款金额'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."tjrmbj" IS '统计人民币价'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_hgjkshxx"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_hgjkshxx" IS '海关缴款书号信息表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_hgjkzzs 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_hgjkzzs" CASCADE; 
         CREATE TABLE "gas_tax_hgjkzzs" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_hgjkzzs_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "jkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hzdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "sbdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "dkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "hgjksh" varchar(32) COLLATE "pg_catalog"."default", 
           "szsk" numeric(24), 
           "skje" numeric(24), 
           "tjrmbj" numeric(24), 
           "bsrq" varchar(20) COLLATE "pg_catalog"."default", 
           "jkkamc" varchar(255) COLLATE "pg_catalog"."default", 
           "dkdwsbh" varchar(32) COLLATE "pg_catalog"."default", 
           "jhjg" varchar(255) COLLATE "pg_catalog"."default", 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."jkdwmc" IS '缴款单位名称-Customs '; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."hzdwmc" IS '货主单位名称-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."jydwmc" IS '经营单位名称-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."sbdwmc" IS '申报单位名称-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."dkdwmc" IS '抵扣单位名称-Tax'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."hgjksh" IS '海关缴款书号-Both'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."szsk" IS '实征税款-Tax'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."skje" IS '税款金额-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."tjrmbj" IS '统计人民币价-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."bsrq" IS '报送日期-Tax'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."jkkamc" IS '进口口岸名称-Customs'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."dkdwsbh" IS '抵扣单位识别号-Tax'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."jhjg" IS '稽核结果-Tax'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_hgjkzzs"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_hgjkzzs" IS '海关进口增值税'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_hgwspzjhbd 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_hgwspzjhbd" CASCADE; 
         CREATE TABLE "gas_tax_hgwspzjhbd" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_hgwspzjhbd_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "hgjks" varchar(50) COLLATE "pg_catalog"."default", 
           "jkkamc" varchar(255) COLLATE "pg_catalog"."default", 
           "dkdwsbh" varchar(50) COLLATE "pg_catalog"."default", 
           "dkdwmc" varchar(255) COLLATE "pg_catalog"."default", 
           "skje" numeric(24), 
           "bsrq" varchar(20) COLLATE "pg_catalog"."default", 
           "jhjg" varchar(10) COLLATE "pg_catalog"."default", 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(20) COLLATE "pg_catalog"."default", 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "batch" int8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."hgjks" IS '海关缴款书'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."jkkamc" IS '进口口岸名称'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."dkdwsbh" IS '抵扣单位识别号'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."dkdwmc" IS '抵扣单位名称'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."skje" IS '税款金额'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."bsrq" IS '报送日期'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."jhjg" IS '稽核结果'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_tax_hgwspzjhbd"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_tax_hgwspzjhbd" IS '国家税务局海关完税凭证稽核比对数据表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_records 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_records" CASCADE; 
         CREATE TABLE "gas_tax_records" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_records_shard_id_seq'::regclass), 
           "ajid" int4, 
           "batch" int4, 
           "swmxid" varchar(50) COLLATE "pg_catalog"."default", 
           "bh" numeric(32), 
           "gfsh" varchar(100) COLLATE "pg_catalog"."default", 
           "gfgsmc" varchar(255) COLLATE "pg_catalog"."default", 
           "gfyhzh" varchar(200) COLLATE "pg_catalog"."default", 
           "gfyhmc" varchar(255) COLLATE "pg_catalog"."default", 
           "gfshsssf" varchar(150) COLLATE "pg_catalog"."default", 
           "gfshsscs" varchar(255) COLLATE "pg_catalog"."default", 
           "gfshssdq" varchar(255) COLLATE "pg_catalog"."default", 
           "gfdzdh" varchar(255) COLLATE "pg_catalog"."default", 
           "je" numeric(32,2), 
           "dj" numeric(32,2), 
           "se" numeric(32,2), 
           "sl" numeric(32,2), 
           "jshj" numeric(32,2), 
           "zs" numeric(22), 
           "kpyf" varchar(50) COLLATE "pg_catalog"."default", 
           "kpr" varchar(30) COLLATE "pg_catalog"."default", 
           "fphm" varchar(50) COLLATE "pg_catalog"."default", 
           "fpdm" varchar(50) COLLATE "pg_catalog"."default", 
           "hwsl" float8, 
           "hwmc" varchar(500) COLLATE "pg_catalog"."default", 
           "hwxh" varchar(50) COLLATE "pg_catalog"."default", 
           "xfsh" varchar(50) COLLATE "pg_catalog"."default", 
           "xfgsmc" varchar(200) COLLATE "pg_catalog"."default", 
           "xfyhzh" varchar(200) COLLATE "pg_catalog"."default", 
           "xfyhmc" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshsssf" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshsscs" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshssdq" varchar(200) COLLATE "pg_catalog"."default", 
           "xfdzdh" varchar(100) COLLATE "pg_catalog"."default", 
           "dw" varchar(50) COLLATE "pg_catalog"."default", 
           "cyrsbh" varchar(100) COLLATE "pg_catalog"."default", 
           "cyrmc" varchar(100) COLLATE "pg_catalog"."default", 
           "qdbz" varchar(10) COLLATE "pg_catalog"."default", 
           "zfbz" varchar(10) COLLATE "pg_catalog"."default", 
           "swlx" char(2) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "lytype" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "md5" varchar(32) COLLATE "pg_catalog"."default", 
           "sfzf" char(2) COLLATE "pg_catalog"."default", 
           "fplx" char(2) COLLATE "pg_catalog"."default", 
           "kprq" varchar(50) COLLATE "pg_catalog"."default", 
           "ip" varchar(40) COLLATE "pg_catalog"."default", 
           "mac" varchar(100) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_records"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_tax_records"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_tax_records"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_tax_records"."swmxid" IS '税务明细ID'; 
         COMMENT ON COLUMN "gas_tax_records"."bh" IS '编号'; 
         COMMENT ON COLUMN "gas_tax_records"."gfsh" IS '购方税号'; 
         COMMENT ON COLUMN "gas_tax_records"."gfgsmc" IS '购方公司名称'; 
         COMMENT ON COLUMN "gas_tax_records"."gfyhzh" IS '购方银行账号'; 
         COMMENT ON COLUMN "gas_tax_records"."gfyhmc" IS '购方银行名称'; 
         COMMENT ON COLUMN "gas_tax_records"."gfshsssf" IS '购方税号所属省份'; 
         COMMENT ON COLUMN "gas_tax_records"."gfshsscs" IS '购方税号所属城市'; 
         COMMENT ON COLUMN "gas_tax_records"."gfshssdq" IS '购方税号所属地区'; 
         COMMENT ON COLUMN "gas_tax_records"."gfdzdh" IS '购方地址电话'; 
         COMMENT ON COLUMN "gas_tax_records"."je" IS '金额'; 
         COMMENT ON COLUMN "gas_tax_records"."dj" IS '单价'; 
         COMMENT ON COLUMN "gas_tax_records"."se" IS '税额'; 
         COMMENT ON COLUMN "gas_tax_records"."sl" IS '税率'; 
         COMMENT ON COLUMN "gas_tax_records"."jshj" IS '价税合计'; 
         COMMENT ON COLUMN "gas_tax_records"."zs" IS '张数'; 
         COMMENT ON COLUMN "gas_tax_records"."kpyf" IS '开票月份'; 
         COMMENT ON COLUMN "gas_tax_records"."kpr" IS '开票人'; 
         COMMENT ON COLUMN "gas_tax_records"."fphm" IS '发票号码'; 
         COMMENT ON COLUMN "gas_tax_records"."fpdm" IS '发票代码'; 
         COMMENT ON COLUMN "gas_tax_records"."hwsl" IS '货物数量'; 
         COMMENT ON COLUMN "gas_tax_records"."hwmc" IS '货物名称'; 
         COMMENT ON COLUMN "gas_tax_records"."hwxh" IS '货物序号'; 
         COMMENT ON COLUMN "gas_tax_records"."xfsh" IS '销方税号'; 
         COMMENT ON COLUMN "gas_tax_records"."xfgsmc" IS '销方公司名称'; 
         COMMENT ON COLUMN "gas_tax_records"."xfyhzh" IS '销方银行账号'; 
         COMMENT ON COLUMN "gas_tax_records"."xfyhmc" IS '销方银行名称'; 
         COMMENT ON COLUMN "gas_tax_records"."xfshsssf" IS '销方税号所属省份'; 
         COMMENT ON COLUMN "gas_tax_records"."xfshsscs" IS '销方税号所属城市'; 
         COMMENT ON COLUMN "gas_tax_records"."xfshssdq" IS '销方税号所属地区'; 
         COMMENT ON COLUMN "gas_tax_records"."xfdzdh" IS '销房地址电话'; 
         COMMENT ON COLUMN "gas_tax_records"."dw" IS '单位'; 
         COMMENT ON COLUMN "gas_tax_records"."cyrsbh" IS '承运人识别号'; 
         COMMENT ON COLUMN "gas_tax_records"."cyrmc" IS '承运人名称'; 
         COMMENT ON COLUMN "gas_tax_records"."qdbz" IS '清单标志'; 
         COMMENT ON COLUMN "gas_tax_records"."zfbz" IS '作废标志'; 
         COMMENT ON COLUMN "gas_tax_records"."swlx" IS '税务类型,进项税0,销项税1'; 
         COMMENT ON COLUMN "gas_tax_records"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_tax_records"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_tax_records"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_records"."lytype" IS '来源类型'; 
         COMMENT ON COLUMN "gas_tax_records"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_records"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_records"."md5" IS '文件名的MD5加密'; 
         COMMENT ON COLUMN "gas_tax_records"."sfzf" IS '是否作废'; 
         COMMENT ON COLUMN "gas_tax_records"."fplx" IS '发票类型'; 
         COMMENT ON COLUMN "gas_tax_records"."kprq" IS '开票日期'; 
         COMMENT ON COLUMN "gas_tax_records"."ip" IS 'IP'; 
         COMMENT ON COLUMN "gas_tax_records"."mac" IS 'MAC'; 
         COMMENT ON TABLE "gas_tax_records" IS '资金分析税务明细表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_records_source 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_records_source" CASCADE; 
         CREATE TABLE "gas_tax_records_source" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_records_source_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "batch" int4, 
           "swmxid" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "bh" numeric(32), 
           "gfsh" varchar(100) COLLATE "pg_catalog"."default", 
           "gfgsmc" varchar(200) COLLATE "pg_catalog"."default", 
           "gfyhzh" varchar(200) COLLATE "pg_catalog"."default", 
           "gfyhmc" varchar(200) COLLATE "pg_catalog"."default", 
           "gfshsssf" varchar(150) COLLATE "pg_catalog"."default", 
           "gfshsscs" varchar(150) COLLATE "pg_catalog"."default", 
           "gfshssdq" varchar(150) COLLATE "pg_catalog"."default", 
           "gfdzdh" varchar(200) COLLATE "pg_catalog"."default", 
           "je" numeric(32), 
           "dj" numeric(32), 
           "se" numeric(32), 
           "sl" numeric(32), 
           "jshj" numeric(32), 
           "zs" numeric(32), 
           "kpyf" varchar(50) COLLATE "pg_catalog"."default", 
           "kpr" varchar(30) COLLATE "pg_catalog"."default", 
           "fphm" varchar(50) COLLATE "pg_catalog"."default", 
           "fpdm" varchar(50) COLLATE "pg_catalog"."default", 
           "hwsl" float8, 
           "hwmc" varchar(500) COLLATE "pg_catalog"."default", 
           "hwxh" varchar(50) COLLATE "pg_catalog"."default", 
           "xfsh" varchar(50) COLLATE "pg_catalog"."default", 
           "xfgsmc" varchar(200) COLLATE "pg_catalog"."default", 
           "xfyhzh" varchar(200) COLLATE "pg_catalog"."default", 
           "xfyhmc" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshsssf" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshsscs" varchar(200) COLLATE "pg_catalog"."default", 
           "xfshssdq" varchar(200) COLLATE "pg_catalog"."default", 
           "xfdzdh" varchar(100) COLLATE "pg_catalog"."default", 
           "dw" varchar(50) COLLATE "pg_catalog"."default", 
           "cyrsbh" varchar(100) COLLATE "pg_catalog"."default", 
           "cyrmc" varchar(100) COLLATE "pg_catalog"."default", 
           "qdbz" varchar(10) COLLATE "pg_catalog"."default", 
           "zfbz" varchar(10) COLLATE "pg_catalog"."default", 
           "swlx" char(2) COLLATE "pg_catalog"."default", 
           "ajcjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(6) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "lytype" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "md5" varchar(32) COLLATE "pg_catalog"."default", 
           "sfzf" char(2) COLLATE "pg_catalog"."default", 
           "fplx" char(2) COLLATE "pg_catalog"."default", 
           "kprq" varchar(50) COLLATE "pg_catalog"."default", 
           "ip" varchar(40) COLLATE "pg_catalog"."default", 
           "mac" varchar(100) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_records_source"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_tax_records_source"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_tax_records_source"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_tax_records_source"."swmxid" IS '税务明细ID'; 
         COMMENT ON COLUMN "gas_tax_records_source"."bh" IS '编号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfsh" IS '购方税号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfgsmc" IS '购方公司名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfyhzh" IS '购方银行账号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfyhmc" IS '购方银行名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfshsssf" IS '购方税号所属省份'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfshsscs" IS '购方税号所属城市'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfshssdq" IS '购方税号所属地区'; 
         COMMENT ON COLUMN "gas_tax_records_source"."gfdzdh" IS '购方地址电话'; 
         COMMENT ON COLUMN "gas_tax_records_source"."je" IS '金额'; 
         COMMENT ON COLUMN "gas_tax_records_source"."dj" IS '单价'; 
         COMMENT ON COLUMN "gas_tax_records_source"."se" IS '税额'; 
         COMMENT ON COLUMN "gas_tax_records_source"."sl" IS '税率'; 
         COMMENT ON COLUMN "gas_tax_records_source"."jshj" IS '价税合计'; 
         COMMENT ON COLUMN "gas_tax_records_source"."zs" IS '张数'; 
         COMMENT ON COLUMN "gas_tax_records_source"."kpyf" IS '开票月份'; 
         COMMENT ON COLUMN "gas_tax_records_source"."kpr" IS '开票人'; 
         COMMENT ON COLUMN "gas_tax_records_source"."fphm" IS '发票号码'; 
         COMMENT ON COLUMN "gas_tax_records_source"."fpdm" IS '发票代码'; 
         COMMENT ON COLUMN "gas_tax_records_source"."hwsl" IS '货物数量'; 
         COMMENT ON COLUMN "gas_tax_records_source"."hwmc" IS '货物名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."hwxh" IS '货物序号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfsh" IS '销方税号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfgsmc" IS '销方公司名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfyhzh" IS '销方银行账号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfyhmc" IS '销方银行名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfshsssf" IS '销方税号所属省份'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfshsscs" IS '销方税号所属城市'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfshssdq" IS '销方税号所属地区'; 
         COMMENT ON COLUMN "gas_tax_records_source"."xfdzdh" IS '销房地址电话'; 
         COMMENT ON COLUMN "gas_tax_records_source"."dw" IS '单位'; 
         COMMENT ON COLUMN "gas_tax_records_source"."cyrsbh" IS '承运人识别号'; 
         COMMENT ON COLUMN "gas_tax_records_source"."cyrmc" IS '承运人名称'; 
         COMMENT ON COLUMN "gas_tax_records_source"."qdbz" IS '清单标志'; 
         COMMENT ON COLUMN "gas_tax_records_source"."zfbz" IS '作废标志'; 
         COMMENT ON COLUMN "gas_tax_records_source"."swlx" IS '税务类型,进项税0,销项税1'; 
         COMMENT ON COLUMN "gas_tax_records_source"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_tax_records_source"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_tax_records_source"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_records_source"."lytype" IS '来源类型'; 
         COMMENT ON COLUMN "gas_tax_records_source"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_records_source"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_records_source"."md5" IS '文件名的MD5加密'; 
         COMMENT ON COLUMN "gas_tax_records_source"."sfzf" IS '是否作废'; 
         COMMENT ON COLUMN "gas_tax_records_source"."fplx" IS '发票类型'; 
         COMMENT ON COLUMN "gas_tax_records_source"."kprq" IS '开票日期'; 
         COMMENT ON COLUMN "gas_tax_records_source"."ip" IS 'IP'; 
         COMMENT ON COLUMN "gas_tax_records_source"."mac" IS 'MAC'; 
         COMMENT ON TABLE "gas_tax_records_source" IS '资金分析税务明细表'; 
          
         -- ---------------------------- 
         -- Table structure for gas_tax_swdj 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_tax_swdj" CASCADE; 
         CREATE TABLE "gas_tax_swdj" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_tax_swdj_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "ajid" int4, 
           "batch" int4, 
           "sjly" varchar(30) COLLATE "pg_catalog"."default", 
           "nssbh" varchar(50) COLLATE "pg_catalog"."default", 
           "nsrmc" varchar(50) COLLATE "pg_catalog"."default", 
           "djzclxdm" varchar(50) COLLATE "pg_catalog"."default", 
           "nsrztdm" varchar(50) COLLATE "pg_catalog"."default", 
           "hydm" varchar(50) COLLATE "pg_catalog"."default", 
           "zgswjdm" varchar(50) COLLATE "pg_catalog"."default", 
           "gsdjdz" varchar(100) COLLATE "pg_catalog"."default", 
           "gsdjdh" varchar(30) COLLATE "pg_catalog"."default", 
           "zcdyzbm" varchar(10) COLLATE "pg_catalog"."default", 
           "scjydz" varchar(100) COLLATE "pg_catalog"."default", 
           "scjydzxzqhdm" varchar(10) COLLATE "pg_catalog"."default", 
           "scjydlxdh" varchar(30) COLLATE "pg_catalog"."default", 
           "tzze" float4, 
           "fddbrmc" varchar(200) COLLATE "pg_catalog"."default", 
           "fddbrsfzh" varchar(30) COLLATE "pg_catalog"."default", 
           "frlxfs" varchar(100) COLLATE "pg_catalog"."default", 
           "skjip" varchar(20) COLLATE "pg_catalog"."default", 
           "zczb" varchar(20) COLLATE "pg_catalog"."default", 
           "cwxm" varchar(200) COLLATE "pg_catalog"."default", 
           "cwsfzh" varchar(30) COLLATE "pg_catalog"."default", 
           "cwlxfs" varchar(100) COLLATE "pg_catalog"."default", 
           "bsrxm" varchar(200) COLLATE "pg_catalog"."default", 
           "bsrsfzh" varchar(30) COLLATE "pg_catalog"."default", 
           "bsrlxfs" varchar(30) COLLATE "pg_catalog"."default", 
           "jyfw" varchar(500) COLLATE "pg_catalog"."default", 
           "qtdjxx" varchar(200) COLLATE "pg_catalog"."default", 
           "crr" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "rdfzcrq" varchar(100) COLLATE "pg_catalog"."default", 
           "zxrq" varchar(100) COLLATE "pg_catalog"."default", 
           "djrq" varchar(50) COLLATE "pg_catalog"."default", 
           "djxh" varchar(100) COLLATE "pg_catalog"."default", 
           "shxydm" varchar(100) COLLATE "pg_catalog"."default", 
           "kyslrq" varchar(100) COLLATE "pg_catalog"."default", 
           "xgrq" varchar(50) COLLATE "pg_catalog"."default", 
           "yxbz" char(2) COLLATE "pg_catalog"."default", 
           "tyrq" varchar(50) COLLATE "pg_catalog"."default", 
           "fddbrzjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "fddbrgddh" varchar(20) COLLATE "pg_catalog"."default", 
           "cwfzrzjlx" char(20) COLLATE "pg_catalog"."default", 
           "cwfzrgddh" varchar(50) COLLATE "pg_catalog"."default", 
           "bsrzjlx" varchar(50) COLLATE "pg_catalog"."default", 
           "bsrgddh" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sl" float8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_tax_swdj"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_tax_swdj"."id" IS '主键'; 
         COMMENT ON COLUMN "gas_tax_swdj"."ajid" IS '线索ID'; 
         COMMENT ON COLUMN "gas_tax_swdj"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_tax_swdj"."sjly" IS '数据来源'; 
         COMMENT ON COLUMN "gas_tax_swdj"."nssbh" IS '纳税识别号'; 
         COMMENT ON COLUMN "gas_tax_swdj"."nsrmc" IS '纳税人名称'; 
         COMMENT ON COLUMN "gas_tax_swdj"."djzclxdm" IS '登记注册类型代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."nsrztdm" IS '纳税人状态代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."hydm"
          IS '行业代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."zgswjdm" IS '主管税务局代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."gsdjdz" IS '公司登记地址'; 
         COMMENT ON COLUMN "gas_tax_swdj"."gsdjdh" IS '公司登记电话'; 
         COMMENT ON COLUMN "gas_tax_swdj"."zcdyzbm" IS '注册地邮政编码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."scjydz" IS '生产经营地址'; 
         COMMENT ON COLUMN "gas_tax_swdj"."scjydzxzqhdm" IS '生产经营地址行政区划代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."scjydlxdh" IS '生产经营地联系电话'; 
         COMMENT ON COLUMN "gas_tax_swdj"."tzze" IS '投资总额'; 
         COMMENT ON COLUMN "gas_tax_swdj"."fddbrmc" IS '法定代表人姓名'; 
         COMMENT ON COLUMN "gas_tax_swdj"."fddbrsfzh" IS '法定代表人身份证号'; 
         COMMENT ON COLUMN "gas_tax_swdj"."frlxfs" IS '法人联系方式'; 
         COMMENT ON COLUMN "gas_tax_swdj"."skjip" IS '税控机IP地址'; 
         COMMENT ON COLUMN "gas_tax_swdj"."zczb" IS '注册资本'; 
         COMMENT ON COLUMN "gas_tax_swdj"."cwxm" IS '财务姓名'; 
         COMMENT ON COLUMN "gas_tax_swdj"."cwsfzh" IS '财务身份证号'; 
         COMMENT ON COLUMN "gas_tax_swdj"."cwlxfs" IS '财务联系方式'; 
         COMMENT ON COLUMN "gas_tax_swdj"."bsrxm" IS '报税人姓名'; 
         COMMENT ON COLUMN "gas_tax_swdj"."bsrsfzh" IS '报税人身份证号'; 
         COMMENT ON COLUMN "gas_tax_swdj"."bsrlxfs" IS '报税人联系方式'; 
         COMMENT ON COLUMN "gas_tax_swdj"."jyfw" IS '经营范围'; 
         COMMENT ON COLUMN "gas_tax_swdj"."qtdjxx" IS '其他登记人员姓名、身份证号、联系方式'; 
         COMMENT ON COLUMN "gas_tax_swdj"."crr" IS '插入人'; 
         COMMENT ON COLUMN "gas_tax_swdj"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_tax_swdj"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_tax_swdj"."rdfzcrq" IS '认定非正常日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."zxrq" IS '注销日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."djrq" IS '登记日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."djxh" IS '登记序号'; 
         COMMENT ON COLUMN "gas_tax_swdj"."shxydm" IS '社会信用代码'; 
         COMMENT ON COLUMN "gas_tax_swdj"."kyslrq" IS '开业设立日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."xgrq" IS '修改日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."yxbz" IS '有效标志'; 
         COMMENT ON COLUMN "gas_tax_swdj"."tyrq" IS '停业日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."fddbrzjlx" IS '法定代表人证件类型'; 
         COMMENT ON COLUMN "gas_tax_swdj"."fddbrgddh" IS '法定代表人固定电话'; 
         COMMENT ON COLUMN "gas_tax_swdj"."cwfzrzjlx" IS '财务负责人证件类型'; 
         COMMENT ON COLUMN "gas_tax_swdj"."cwfzrgddh" IS '财务负责人固定电话'; 
         COMMENT ON COLUMN "gas_tax_swdj"."bsrzjlx" IS '报税人证件类型'; 
         COMMENT ON COLUMN "gas_tax_swdj"."bsrgddh" IS '报税人固定电话'; 
         COMMENT ON COLUMN "gas_tax_swdj"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_tax_swdj"."sl" IS '税率'; 
         COMMENT ON TABLE "gas_tax_swdj" IS '企业税务登记'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_crjjl 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_crjjl" CASCADE; 
         CREATE TABLE "gas_ys_crjjl" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_crjjl_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "xm" varchar(100) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(100) COLLATE "pg_catalog"."default", 
           "zjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "gj" varchar(30) COLLATE "pg_catalog"."default", 
           "crka" varchar(100) COLLATE "pg_catalog"."default", 
           "crsj" timestamp(0), 
           "jtfs" varchar(50) COLLATE "pg_catalog"."default", 
           "rylb" varchar(100) COLLATE "pg_catalog"."default", 
           "qwgj" varchar(100) COLLATE "pg_catalog"."default", 
           "crjsy" varchar(1000) COLLATE "pg_catalog"."default", 
           "xb" varchar(2) COLLATE "pg_catalog"."default", 
           "csrq" timestamp(0), 
           "sjlyid" int4, 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_crjjl_id_seq'::regclass), 
           "nl" varchar(20) COLLATE "pg_catalog"."default", 
           "qfrq" varchar(50) COLLATE "pg_catalog"."default", 
           "spjg" varchar(50) COLLATE "pg_catalog"."default", 
           "yxq" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0), 
           "batch" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "maxid" int4, 
           "ccrq" timestamp(6) 
         ) 
         ;
          
         COMMENT ON COLUMN "gas_ys_crjjl"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."sfzh" IS '公民身份证号'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."zjlx" IS '证件类型'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."gj" IS '国籍'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."crka" IS '出入口岸'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."crsj" IS '出入时间'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."jtfs" IS '交通方式'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."rylb" IS '人员类别'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."qwgj" IS '前往国家或地区'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."crjsy" IS '出(入)境事由'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."qfrq" IS '签发日期'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."spjg" IS '审批机关'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."yxq" IS '有效期至'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."sjlylx" IS '数据来源类型'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_ys_crjjl"."ccrq" IS '出入日期'; 
         COMMENT ON TABLE "gas_ys_crjjl" IS '云搜-分析模型大情报出入境记录'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_dbq_ldzs 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_dbq_ldzs" CASCADE; 
         CREATE TABLE "gas_ys_dbq_ldzs" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_dbq_ldzs_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "xm" varchar(50) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "zydy" varchar(100) COLLATE "pg_catalog"."default", 
           "lzsj" varchar(50) COLLATE "pg_catalog"."default", 
           "lzfh" varchar(20) COLLATE "pg_catalog"."default", 
           "tfsj" varchar(50) COLLATE "pg_catalog"."default", 
           "lgdzqhmc" varchar(50) COLLATE "pg_catalog"."default", 
           "lgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "lgdz" varchar(200) COLLATE "pg_catalog"."default", 
           "xb" varchar(4) COLLATE "pg_catalog"."default", 
           "csrq" varchar(50) COLLATE "pg_catalog"."default", 
           "mz" varchar(20) COLLATE "pg_catalog"."default", 
           "lkbh" varchar(50) COLLATE "pg_catalog"."default", 
           "lgbm" varchar(50) COLLATE "pg_catalog"."default", 
           "ldxz" varchar(50) COLLATE "pg_catalog"."default", 
           "cyzjdm" varchar(50) COLLATE "pg_catalog"."default", 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_dbq_ldzs_id_seq'::regclass), 
           "crrq" timestamp(0), 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."zydy" IS '资源地域'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lzsj" IS '入住时间'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lzfh" IS '入住房号'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."tfsj" IS '退房时间'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lgdzqhmc" IS '旅馆地址区划名称'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lgmc" IS '旅馆名称'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lgdz" IS '旅馆地址'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."mz" IS '民族'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lkbh" IS '旅客编号'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."lgbm" IS '旅馆编码'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."ldxz" IS '旅店详细地址'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."cyzjdm" IS '证件类型'; 
         COMMENT ON COLUMN "gas_ys_dbq_ldzs"."id" IS '
         ID'; 
         COMMENT ON TABLE "gas_ys_dbq_ldzs" IS '云搜-分析模型旅店住宿'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_hyzk 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_hyzk" CASCADE; 
         CREATE TABLE "gas_ys_hyzk" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_hyzk_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_hyzk_id_seq'::regclass), 
           "ajid" int4, 
           "nfxm" varchar(20) COLLATE "pg_catalog"."default", 
           "nfgmsfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "nvxm" varchar(20) COLLATE "pg_catalog"."default", 
           "nvgmsfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "djrq" varchar(50) COLLATE "pg_catalog"."default", 
           "djlx" varchar(20) COLLATE "pg_catalog"."default", 
           "ngj" varchar(20) COLLATE "pg_catalog"."default", 
           "nmz" varchar(20) COLLATE "pg_catalog"."default", 
           "nvgj" varchar(20) COLLATE "pg_catalog"."default", 
           "nvmz" varchar(20) COLLATE "pg_catalog"."default", 
           "djjgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "djjgqh" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_hyzk"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nfxm" IS '男方姓名'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nfgmsfzh" IS '男方公民身份号码'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nvxm" IS '女方姓名'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nvgmsfzh" IS '女方公民身份号码'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."djrq" IS '登记日期'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."djlx" IS '登记类型'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."ngj" IS '男方国籍'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nmz" IS '男方民族'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nvgj" IS '女方国籍'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."nvmz" IS '女方民族'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."djjgmc" IS '登记机关名称'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."djjgqh" IS '登记机关区划'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_hyzk"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON TABLE "gas_ys_hyzk" IS '云搜-婚姻状况'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_jsr 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_jsr" CASCADE; 
         CREATE TABLE "gas_ys_jsr" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_jsr_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_jsr_id_seq'::regclass), 
           "ajid" int4, 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sfzmmc" varchar(20) COLLATE "pg_catalog"."default", 
           "sfzmhm" varchar(50) COLLATE "pg_catalog"."default", 
           "xm" varchar(20) COLLATE "pg_catalog"."default", 
           "xb" varchar(20) COLLATE "pg_catalog"."default", 
           "csrq" varchar(50) COLLATE "pg_catalog"."default", 
           "gj" varchar(20) COLLATE "pg_catalog"."default", 
           "zjcx" varchar(20) COLLATE "pg_catalog"."default", 
           "cclzrq" varchar(50) COLLATE "pg_catalog"."default", 
           "fzjg" varchar(20) COLLATE "pg_catalog"."default", 
           "yxqsrq" varchar(50) COLLATE "pg_catalog"."default", 
           "yxq" varchar(50) COLLATE "pg_catalog"."default", 
           "jszzt" varchar(20) COLLATE "pg_catalog"."default", 
           "yzjcx" varchar(20) COLLATE "pg_catalog"."default", 
           "djzsxz" varchar(100) COLLATE "pg_catalog"."default", 
           "lxzsxz" varchar(100) COLLATE "pg_catalog"."default", 
           "lxdh" varchar(20) COLLATE "pg_catalog"."default", 
           "ljjf" varchar(20) COLLATE "pg_catalog"."default", 
           "cfqr" varchar(50) COLLATE "pg_catalog"."default", 
           "dabh" varchar(50) COLLATE "pg_catalog"."default", 
           "jzzzzm" varchar(100) COLLATE "pg_catalog"."default", 
           "sgcs" varchar(20) COLLATE "pg_catalog"."default", 
           "jzqx" varchar(20) COLLATE "pg_catalog"."default", 
           "xzqh" varchar(50) COLLATE "pg_catalog"."default",
          
           "sfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_jsr"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_jsr"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_jsr"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_jsr"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sfzmmc" IS '身份证明名称'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sfzmhm" IS '身份证明号码'; 
         COMMENT ON COLUMN "gas_ys_jsr"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_jsr"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_jsr"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."gj" IS '国籍'; 
         COMMENT ON COLUMN "gas_ys_jsr"."zjcx" IS '准驾车型'; 
         COMMENT ON COLUMN "gas_ys_jsr"."cclzrq" IS '初次领证日期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."fzjg" IS '发证机关'; 
         COMMENT ON COLUMN "gas_ys_jsr"."yxqsrq" IS '有效起始日期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."yxq" IS '有效期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."jszzt" IS '驾驶证状态'; 
         COMMENT ON COLUMN "gas_ys_jsr"."yzjcx" IS '原准驾车型'; 
         COMMENT ON COLUMN "gas_ys_jsr"."djzsxz" IS '登记住所详细地址'; 
         COMMENT ON COLUMN "gas_ys_jsr"."lxzsxz" IS '联系住所详细地址'; 
         COMMENT ON COLUMN "gas_ys_jsr"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_ys_jsr"."ljjf" IS '累计积分'; 
         COMMENT ON COLUMN "gas_ys_jsr"."cfqr" IS '超分日期'; 
         COMMENT ON COLUMN "gas_ys_jsr"."dabh" IS '档案编号'; 
         COMMENT ON COLUMN "gas_ys_jsr"."jzzzzm" IS '居住暂住证明'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sgcs" IS '事故次数'; 
         COMMENT ON COLUMN "gas_ys_jsr"."jzqx" IS '驾证期限'; 
         COMMENT ON COLUMN "gas_ys_jsr"."xzqh" IS '行政区划'; 
         COMMENT ON COLUMN "gas_ys_jsr"."sfzh" IS '身份证号'; 
         COMMENT ON TABLE "gas_ys_jsr" IS '云搜-全国驾驶人'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_jyxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_jyxx" CASCADE; 
         CREATE TABLE "gas_ys_jyxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_jyxx_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "xm" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "xb" varchar(10) COLLATE "pg_catalog"."default", 
           "nl" int4, 
           "mz" varchar(50) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "zj" varchar(20) COLLATE "pg_catalog"."default", 
           "jh" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "zw" varchar(20) COLLATE "pg_catalog"."default", 
           "hjszd" varchar(50) COLLATE "pg_catalog"."default", 
           "dwmc" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int4 NOT NULL, 
           "sjlyid" int4 NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_jyxx"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."mz" IS '民族'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."sfzh" IS '身份证号'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."zj" IS '职级'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."jh" IS '警号'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."zw" IS '职务'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."hjszd" IS '户籍所在地'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."dwmc" IS '单位名称'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_jyxx"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "gas_ys_jyxx" IS '云搜-警员信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_mhlg 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_mhlg" CASCADE; 
         CREATE TABLE "gas_ys_mhlg" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_mhlg_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "zwxm" varchar(50) COLLATE "pg_catalog"."default", 
           "ywxm" varchar(100) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(100) COLLATE "pg_catalog"."default", 
           "zjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(30) COLLATE "pg_catalog"."default", 
           "xb" varchar(30) COLLATE "pg_catalog"."default", 
           "cyhkgs" varchar(50) COLLATE "pg_catalog"."default", 
           "hbh" varchar(30) COLLATE "pg_catalog"."default", 
           "lgsj" varchar(50) COLLATE "pg_catalog"."default", 
           "qfhz" varchar(50) COLLATE "pg_catalog"."default", 
           "jgsj" varchar(50) COLLATE "pg_catalog"."default", 
           "ddhz" varchar(50) COLLATE "pg_catalog"."default", 
           "lkzwxx" varchar(30) COLLATE "pg_catalog"."default", 
           "xlh" varchar(30) COLLATE "pg_catalog"."default", 
           "lkcrjbs" varchar(100) COLLATE "pg_catalog"."default", 
           "hkgszzjgdm" varchar(30) COLLATE "pg_catalog"."default", 
           "hbhz" varchar(20) COLLATE "pg_catalog"."default", 
           "hbrq" varchar(20) COLLATE "pg_catalog"."default", 
           "qfhzszdm" varchar(30) COLLATE "pg_catalog"."default", 
           "dahzszdm" varchar(30) COLLATE "pg_catalog"."default", 
           "lkx" varchar(50) COLLATE "pg_catalog"."default", 
           "lkzjm" varchar(30) COLLATE "pg_catalog"."default", 
           "lkm" varchar(100) COLLATE "pg_catalog"."default", 
           "csrq" varchar(30) COLLATE "pg_catalog"."default", 
           "csdgjhdqdm" varchar(100) COLLATE "pg_catalog"."default", 
           "gqrq" varchar(30) COLLATE "pg_catalog"."default", 
           "fzrq" varchar(30) COLLATE "pg_catalog"."default", 
           "fzgjhdqdm" varchar(50) COLLATE "pg_catalog"."default", 
           "lkgjhdqdm" varchar(30) COLLATE "pg_catalog"."default", 
           "icszjlxx" varchar(100) COLLATE "pg_catalog"."default", 
           "zxlkczzdh" varchar(30) COLLATE "pg_catalog"."default", 
           "zxzjczbgs" varchar(30) COLLATE "pg_catalog"."default", 
           "zxzjdlh" varchar(30) COLLATE "pg_catalog"."default", 
           "zxzjrq" varchar(30) COLLATE "pg_catalog"."default", 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_mhlg_id_seq'::regclass), 
           "nl" varchar(20) COLLATE "pg_catalog"."default", 
           "mz" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlyid" int4, 
           "sjlylx" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0), 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_mhlg"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zwxm" IS '中文姓名'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."ywxm" IS '英文姓名'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."sfzh" IS '公民身份证号'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zjlx" IS '证件类型'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."cyhkgs" IS '承运航空公司'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."hbh" IS '航班号'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lgsj" IS '离港时间'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."qfhz" IS '起飞航站'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."jgsj" IS '进港时间'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."ddhz" IS '到达航站'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkzwxx" IS '旅客座位信息'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."xlh" IS '序列号'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkcrjbs" IS '旅客出入境标识'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."hkgszzjgdm" IS '航空公司代码'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."hbhz" IS '航班后缀'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."hbrq" IS '航班日期'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."qfhzszdm" IS '起飞航站三字代码'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."dahzszdm" IS '到达航站三字代码'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkx" IS '旅客姓'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkzjm" IS '旅客中间名'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkm" IS '旅客名'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."csrq" IS '出生日期'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."csdgjhdqdm" IS '出生地'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."gqrq" IS '过期日期'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."fzrq" IS '发证日起期'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."fzgjhdqdm" IS '发证国家或城市'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."lkgjhdqdm" IS '旅客国家代码'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."icszjlxx" IS 'ICS中记录信息'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zxlkczzdh" IS '执行旅客操作的终端号'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zxzjczbgs" IS '执行执机操作的办公室'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zxzjdlh" IS '执行执机的代理号'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."zxzjrq" IS '执行执机时间信息'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."mz" IS '民族'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."sjlx" IS '数据类型(民航订票、民航离岗)'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_mhlg"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON TABLE "gas_ys_mhlg" IS '云搜-分析模型民航离港
         '; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_qgjdc 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_qgjdc" CASCADE; 
         CREATE TABLE "gas_ys_qgjdc" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_qgjdc_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_qgjdc_id_seq'::regclass), 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "hdzr" varchar(20) COLLATE "pg_catalog"."default", 
           "ccrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sfzmmc" varchar(20) COLLATE "pg_catalog"."default", 
           "sfzmhm" varchar(50) COLLATE "pg_catalog"."default", 
           "zzjzzm" varchar(100) COLLATE "pg_catalog"."default", 
           "xzgh" varchar(20) COLLATE "pg_catalog"."default", 
           "dabh" varchar(20) COLLATE "pg_catalog"."default", 
           "zzl" varchar(20) COLLATE "pg_catalog"."default", 
           "zqyzzl" varchar(20) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4, 
           "jdcsyr" varchar(50) COLLATE "pg_catalog"."default", 
           "sfzhm" varchar(50) COLLATE "pg_catalog"."default", 
           "hphm" varchar(50) COLLATE "pg_catalog"."default", 
           "clpp" varchar(50) COLLATE "pg_catalog"."default", 
           "cpzl" varchar(50) COLLATE "pg_catalog"."default", 
           "csys" varchar(50) COLLATE "pg_catalog"."default", 
           "clsbdh" varchar(50) COLLATE "pg_catalog"."default", 
           "fdjh" varchar(50) COLLATE "pg_catalog"."default", 
           "jdczt" varchar(50) COLLATE "pg_catalog"."default", 
           "cllx" varchar(50) COLLATE "pg_catalog"."default", 
           "ccdjrq" varchar(50) COLLATE "pg_catalog"."default", 
           "fzjg" varchar(50) COLLATE "pg_catalog"."default", 
           "zsxz" varchar(100) COLLATE "pg_catalog"."default", 
           "lxdh" varchar(50) COLLATE "pg_catalog"."default", 
           "zzxz" varchar(100) COLLATE "pg_catalog"."default", 
           "dybj" varchar(50) COLLATE "pg_catalog"."default", 
           "fdjxh" varchar(50) COLLATE "pg_catalog"."default", 
           "rlzl" varchar(50) COLLATE "pg_catalog"."default", 
           "pl" varchar(50) COLLATE "pg_catalog"."default", 
           "gl" varchar(50) COLLATE "pg_catalog"."default", 
           "hdzzl" varchar(50) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."hdzr" IS '核定载客'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."ccrq" IS '出厂日期'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."sfzmmc" IS '身份证明名称'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."sfzmhm" IS '身份证明号码'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."zzjzzm" IS '暂住居住证明'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."xzgh" IS '行政区划'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."dabh" IS '档案编号'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."zzl" IS '总质量'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."zqyzzl" IS '准牵引总质量'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."jdcsyr" IS '机动车所有人'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."sfzhm" IS '身份证号码'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."hphm" IS '号牌号码'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."clpp" IS '车辆品牌'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."cpzl" IS '号牌种类'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."csys" IS '车身颜色'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."clsbdh" IS '车辆识别代号'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."fdjh" IS '发动机号'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."jdczt" IS '机动车状态'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."cllx" IS '车辆类型'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."ccdjrq" IS '初次登记日期'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."fzjg" IS '发证机关'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."zsxz" IS '住所详细地址'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."zzxz" IS '暂住详细地址'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."dybj" IS '抵押标记'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."fdjxh" IS '发动机型号'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."rlzl" IS '燃料种类'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."pl" IS '排量'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."gl" IS '功率'; 
         COMMENT ON COLUMN "gas_ys_qgjdc"."hdzzl" IS '核定载质量'; 
         COMMENT ON TABLE "gas_ys_qgjdc" IS '云搜-全国机动车'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_qgjdcwzxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_qgjdcwzxx" CASCADE; 
         CREATE TABLE "gas_ys_qgjdcwzxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_qgjdcwzxx_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_qgjdcwzxx_id_seq'::regclass), 
           "xm" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "xb" varchar(10) COLLATE "pg_catalog"."default", 
           "nl" int4, 
           "mz" varchar(50) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "jszh" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "hphm" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "hpzl" varchar(20) COLLATE "pg_catalog"."default", 
           "wfsj" varchar(20) COLLATE "pg_catalog"."default", 
           "wfdd" varchar(100) COLLATE "pg_catalog"."default", 
           "clsj" varchar(50) COLLATE "pg_catalog"."default", 
           "cljgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "ajid" int4 NOT NULL, 
           "sjlyid" int4 NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."mz" IS '民族'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."sfzh" IS '身份证号'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."jszh" IS '驾驶证号'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."hphm" IS '号牌号码'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."hpzl" IS '号牌种类'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."wfsj" IS '违法时间'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."wfdd" IS '违法地点'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."clsj" IS '处理时间'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."cljgmc" IS '处理机关名称'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_qgjdcwzxx"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "gas_ys_qgjdcwzxx" IS '云搜-全国机动车违章信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_sjhb 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_sjhb" CASCADE; 
         CREATE TABLE "gas_ys_sjhb" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_sjhb_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_sjhb_id_seq'::regclass), 
           "sjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "ypdxmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ypdxzjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "xm" varchar(100) COLLATE "pg_catalog"."default", 
           "lkywx" varchar(100) COLLATE "pg_catalog"."default", 
           "lkywm" varchar(100) COLLATE "pg_catalog"."default", 
           "lkywxm" varchar(100) COLLATE "pg_catalog"."default", 
           "xb" varchar(8) COLLATE "pg_catalog"."default", 
           "nl" int4, 
           "zjlx" varchar(100) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "mz" varchar(100) COLLATE "pg_catalog"."default", 
           "zzhi" varchar(100) COLLATE "pg_catalog"."default", 
           "fwcs" varchar(100) COLLATE "pg_catalog"."default", 
           "xzqh" varchar(100) COLLATE "pg_catalog"."default", 
           "cs" varchar(20) COLLATE "pg_catalog"."default", 
           "jg" varchar(100) COLLATE "pg_catalog"."default", 
           "hkszd" varchar(100) COLLATE "pg_catalog"."default", 
           "bjmc" varchar(100) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "sjlyid" int4, 
           "djjgmc" varchar(50) COLLATE "pg_catalog"."default", 
           "djrq" varchar(25) COLLATE "pg_catalog"."default", 
           "djlx" varchar(20) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0), 
           "del" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "maxid" int4, 
           "batch" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_sjhb"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."id" IS '自增ID'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."sjlx" IS '类别 
         0:婚姻 
         1:邻居 
         2:民航同订票 
         3:民航同换票 
         4:铁路同乘车 
         5:同车违章 
         6:同乘机 
         7:同出入境 
         8:同住址 
         9：分布式 
         10:同机构'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."ypdxmc" IS '研判对象名称'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."ypdxzjhm" IS '研判对象证件号码'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."lkywx" IS '旅客英文姓'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."lkywm" IS '旅客英文名'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."lkywxm" IS '旅客英文姓名 '; 
         COMMENT ON COLUMN "gas_ys_sjhb"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."zjlx" IS '证件类型'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."mz" IS '民族'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."zzhi" IS '住址'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."fwcs" IS '服务处所'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."xzqh" IS '行政区划'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."cs" IS '次数'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."jg" IS '籍贯'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."hkszd" IS '户口所在地'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."bjmc" IS '背景名称'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."djjgmc" IS '登记机关名称'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."djrq" IS '登记日期'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."djlx" IS '登记类型'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."sfzh" IS '公民身份证号'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."del" IS '删除标记'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."maxid" IS '最大ID'; 
         COMMENT ON COLUMN "gas_ys_sjhb"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_ys_sjhb" IS '云搜-云搜数据合并'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_sxrxx 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_sxrxx" CASCADE; 
         CREATE TABLE "gas_ys_sxrxx" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_sxrxx_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_sxrxx_id_seq'::regclass), 
           "ajbh" varchar(50) COLLATE "pg_catalog"."default", 
           "xm" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "zzhm" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "qyfrmc" varchar(20) COLLATE "pg_catalog"."default", 
           "fymc" varchar(50) COLLATE "pg_catalog"."default", 
           "ssdy" varchar(20) COLLATE "pg_catalog"."default", 
           "dyid" varchar(20) COLLATE "pg_catalog"."default", 
           "bsxm" varchar(20) COLLATE "pg_catalog"."default", 
           "zxyjws" varchar(50) COLLATE "pg_catalog"."default", 
           "zxdw" varchar(50) COLLATE "pg_catalog"."default", 
           "lxqk" varchar(50) COLLATE "pg_catalog"."default", 
           "jtqk" varchar(50) COLLATE "pg_catalog"."default", 
           "fbrq" varchar(50) COLLATE "pg_catalog"."default", 
           "larq" varchar(50) COLLATE "pg_catalog"."default", 
           "ylxbf" varchar(50) COLLATE "pg_catalog"."default", 
           "wlxbf" varchar(50) COLLATE "pg_catalog"."default", 
           "rksj" varchar(50) COLLATE "pg_catalog"."default", 
           "xh" varchar(20) COLLATE "pg_catalog"."default", 
           "yxbs" varchar(10) COLLATE "pg_catalog"."default", 
           "flyw" varchar(500) COLLATE "pg_catalog"."default", 
           "ajid" int4 NOT NULL, 
           "sjlyid" int4 NOT NULL, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "crrq" timestamp(0), 
           "nl" int4, 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."ajbh" IS '案件编号'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."zzhm" IS '身份证号码／组织机构代码'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."qyfrmc" IS '企业法人名称'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."fymc" IS '法院名称'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."ssdy" IS '所属地域'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."dyid" IS '地域ID'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."bsxm" IS '标识姓名'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."zxyjws" IS '执行依据文书'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."zxdw" IS '执行单位'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."lxqk" IS '被执行人履行情况'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."jtqk" IS '失信被执行人行为具体情况'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."fbrq" IS '发布日期'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."larq" IS '立案日期'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."ylxbf" IS '已履行部分'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."wlxbf" IS '未履行部分'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."rksj" IS '入库时间'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."xh" IS '序号'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."yxbs" IS '有效标识'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."flyw" IS '法律义务'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_sxrxx"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON TABLE "gas_ys_sxrxx" IS '失信被执行人信息'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_tlsp 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_tlsp" CASCADE; 
         CREATE TABLE "gas_ys_tlsp" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_tlsp_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_tlsp_id_seq'::regclass), 
           "xm" varchar(20) COLLATE "pg_catalog"."default", 
           "xb" varchar(20) COLLATE "pg_catalog"."default", 
           "nl" varchar(20) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "cc" varchar(20) COLLATE "pg_catalog"."default", 
           "cx" varchar(20) COLLATE "pg_catalog"."default", 
           "zt" varchar(20) COLLATE "pg_catalog"."default", 
           "fz" varchar(20) COLLATE "pg_catalog"."default", 
           "dz" varchar(20) COLLATE "pg_catalog"."default", 
           "zjlx" varchar(20) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "ccrq" varchar(50) COLLATE "pg_catalog"."default", 
           "ph" varchar(20) COLLATE "pg_catalog"."default", 
           "zw" varchar(20) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_tlsp"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."sfzh" IS '身份号码'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."cc" IS '车次'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."cx" IS '车厢'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."zt" IS '状态'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."fz" IS '发站'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."dz" IS '到站'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."zjlx" IS '证件类型'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."ccrq" IS '乘车日期'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."ph" IS '票号'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."zw" IS '座位'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_tlsp"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "gas_ys_tlsp" IS '全国铁路售票(云搜)'; 
          
         -- ---------------------------- 
         -- Table structure for gas_ys_yhhc 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_ys_yhhc" CASCADE; 
         CREATE TABLE "gas_ys_yhhc" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_ys_yhhc_shard_id_seq'::regclass), 
           "id" int8 NOT NULL DEFAULT nextval('gas_ys_yhhc_id_seq'::regclass), 
           "xm" varchar(20) COLLATE "pg_catalog"."default", 
           "xb" varchar(20) COLLATE "pg_catalog"."default", 
           "nl" varchar(20) COLLATE "pg_catalog"."default", 
           "sfzh" varchar(50) COLLATE "pg_catalog"."default", 
           "hcsj" varchar(50) COLLATE "pg_catalog"."default", 
           "hcjg" varchar(100) COLLATE "pg_catalog"."default", 
           "yhjgdm" varchar(50) COLLATE "pg_catalog"."default", 
           "yhmc" varchar(50) COLLATE "pg_catalog"."default", 
           "yhszd" varchar(100) COLLATE "pg_catalog"."default", 
           "lxdh" varchar(20) COLLATE "pg_catalog"."default", 
           "ywlx" varchar(20) COLLATE "pg_catalog"."default", 
           "ajid" int4, 
           "sjlyid" int4, 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "batch" int4, 
           "maxid" int4 
         ) 
         ; 
         COMMENT ON COLUMN "gas_ys_yhhc"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."id" IS 'ID'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."xm" IS '姓名'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."xb" IS '性别'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."nl" IS '年龄'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."sfzh" IS '身份证号'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."hcsj" IS '核查时间'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."hcjg" IS '核查结果'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."yhjgdm" IS '银行机构代码'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."yhmc" IS '银行名称'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."yhszd" IS '银行所在地'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."lxdh" IS '联系电话'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."ywlx" IS '业务类型'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_ys_yhhc"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "gas_ys_yhhc" IS '全国银行核查(云搜)'; 
          
         -- ---------------------------- 
         -- Table structure for gas_zhifubao_trade 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_zhifubao_trade" CASCADE; 
         CREATE TABLE "gas_zhifubao_trade" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_zhifubao_trade_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "lsh" varchar(100) COLLATE "pg_catalog"."default", 
           "yhclrq" varchar(100) COLLATE "pg_catalog"."default", 
           "ywlx" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfx" varchar(100) COLLATE "pg_catalog"."default", 
           "jyddh" varchar(100) COLLATE "pg_catalog"."default", 
           "jyje" float8, 
           "zhxm" varchar(100) COLLATE "pg_catalog"."default", 
           "jyrq" varchar(100) COLLATE "pg_catalog"."default", 
           "yhmc" varchar(100) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "ajcjrq" varchar(100) COLLATE "pg_catalog"."default", 
           "sendaddress" varchar(100) COLLATE "pg_catalog"."default", 
           "jyfsd" varchar(100) COLLATE "pg_catalog"."default", 
           "bz" varchar(100) COLLATE "pg_catalog"."default", 
           "jyye" float8, 
           "ajid" int8, 
           "ssdqid" varchar(100) COLLATE "pg_catalog"."default", 
           "dszh" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzh" varchar(100) COLLATE "pg_catalog"."default", 
           "zjhm" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" varchar(30) COLLATE "pg_catalog"."default", 
           "dkje" float8, 
           "jkje" float8 
         ) 
         ; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."id" IS 'id'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."lsh" IS '流水号'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."yhclrq" IS '银行处理日期'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."ywlx" IS '业务类型'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyfx" IS '交易方向'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyddh" IS '交易订单号/外部流水号'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."zhxm" IS '真实姓名'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyrq" IS '交易发生日期'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."yhmc" IS '银行名称'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."sendaddress" IS '发送地址'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyfsd" IS '交易发生地'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."bz" IS '备注'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyye" IS '交易余额'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."ssdqid" IS '所属地区ID'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."dszh" IS '对手账号'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jyzh" IS '交易账号'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."zjhm" IS '证件号码'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."dkje" IS '贷款金额'; 
         COMMENT ON COLUMN "gas_zhifubao_trade"."jkje" IS '借款金额'; 
         COMMENT ON TABLE "gas_zhifubao_trade" IS '淘宝-支付宝账户'; 
          
         -- ---------------------------- 
         -- Table structure for gas_zhifubao_transfer 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_zhifubao_transfer" CASCADE; 
         CREATE TABLE "gas_zhifubao_transfer" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_zhifubao_transfer_shard_id_seq'::regclass), 
           "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL, 
           "orginname" varchar(100) COLLATE "pg_catalog"."default", 
           "crrq" varchar(100) COLLATE "pg_catalog"."default", 
           "sjly_id" int8, 
           "ajcjrq" varchar(100) COLLATE "pg_catalog"."default", 
           "makeaccount" varchar(100) COLLATE "pg_catalog"."default", 
           "sendersourcename" varchar(100) COLLATE "pg_catalog"."default", 
           "transfer" float8, 
           "areaname" varchar(100) COLLATE "pg_catalog"."default", 
           "receiversourcename" varchar(100) COLLATE "pg_catalog"."default", 
           "ajid" int8, 
           "transoutorderno" varchar(100) COLLATE "pg_catalog"."default", 
           "cashno" varchar(100) COLLATE "pg_catalog"."default", 
           "ssdqid" varchar(100) COLLATE "pg_catalog"."default", 
           "remark" varchar(100) COLLATE "pg_catalog"."default", 
           "payaccount" varchar(100) COLLATE "pg_catalog"."default", 
           "paytime" varchar(100) COLLATE "pg_catalog"."default", 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "zzcpmc" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" int8, 
           "batch" varchar(30) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."id" IS 'id'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."orginname" IS '收款机构'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."sjly_id" IS '数据来源id'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."ajcjrq" IS '案件创建日期'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."makeaccount" IS '收款账户'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."sendersourcename" IS '付款协查账号多个以英文“,”分隔'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."transfer" IS '转账金额'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."areaname" IS '交易发生地'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."receiversourcename" IS '收款协查账号多个以英文“,”分隔'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."ajid" IS '案件id'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."transoutorderno" IS '流水号'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."cashno" IS '提现流水号'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."ssdqid" IS '提现流水号'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."remark" IS '备注'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."payaccount" IS '付款账户'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."paytime" IS '付款时间(时间毫秒数)'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."zzcpmc" IS '转账产品名称'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."sjlyid" IS '数据来源ID'; 
         COMMENT ON COLUMN "gas_zhifubao_transfer"."batch" IS '批次'; 
         COMMENT ON TABLE "gas_zhifubao_transfer" IS '淘宝-支付宝转账'; 
          
         -- ---------------------------- 
         -- Table structure for mark_detail 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "mark_detail" CASCADE; 
         CREATE TABLE "mark_detail" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('mark_detail_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "role_hm" varchar(100) COLLATE "pg_catalog"."default", 
           "role_mc" varchar(50) COLLATE "pg_catalog"."default", 
           "info_id" int8, 
           "mark_content" varchar(255) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "state" char(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "mark_detail"."userid" IS '用户警号'; 
         COMMENT ON COLUMN "mark_detail"."caseid" IS '案件id'; 
         COMMENT ON COLUMN "mark_detail"."rid" IS '模型结果id'; 
         COMMENT ON COLUMN "mark_detail"
         ."role_hm" IS '标签号码'; 
         COMMENT ON COLUMN "mark_detail"."role_mc" IS '标签对象名称'; 
         COMMENT ON COLUMN "mark_detail"."info_id" IS '标签id'; 
         COMMENT ON COLUMN "mark_detail"."mark_content" IS '标签说明'; 
         COMMENT ON COLUMN "mark_detail"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "mark_detail"."state" IS '1有效，0已被移除'; 
         COMMENT ON TABLE "mark_detail" IS '标签明细表'; 
          
         -- ---------------------------- 
         -- Table structure for mark_dm_entity 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "mark_dm_entity" CASCADE; 
         CREATE TABLE "mark_dm_entity" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('mark_dm_entity_shard_id_seq'::regclass), 
           "entity_dm" varchar(20) COLLATE "pg_catalog"."default", 
           "entity_name" varchar(100) COLLATE "pg_catalog"."default", 
           "entity_content" varchar(50) COLLATE "pg_catalog"."default", 
           "entity_yxbz" varchar(10) COLLATE "pg_catalog"."default", 
           "entity_thesort" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "entity_color" varchar(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "mark_dm_entity"."shard_id" IS '标签ID'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_dm" IS '实体代码'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_name" IS '实体名称'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_content" IS '实体描述'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_yxbz" IS '有效标志'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_thesort" IS '排序列'; 
         COMMENT ON COLUMN "mark_dm_entity"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "mark_dm_entity"."entity_color" IS '实体颜色'; 
         COMMENT ON TABLE "mark_dm_entity" IS '标签实体代码表'; 
          
         -- ---------------------------- 
         -- Records of mark_dm_entity 
         -- ---------------------------- 
         BEGIN; 
         INSERT INTO "mark_dm_entity" VALUES (1, '01', '人员类', NULL, NULL, NULL, NULL, '#FF078B07'); 
         INSERT INTO "mark_dm_entity" VALUES (3, '03', '账户类', NULL, NULL, NULL, NULL, '#FF0F18CD'); 
         INSERT INTO "mark_dm_entity" VALUES (2, '02', '企业类', NULL, NULL, NULL, NULL, '#FF90B7EB'); 
         COMMIT; 
          
         -- ---------------------------- 
         -- Table structure for mark_group_detail 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "mark_group_detail" CASCADE; 
         CREATE TABLE "mark_group_detail" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('mark_group_detail_shard_id_seq'::regclass), 
           "ajid" int4 NOT NULL, 
           "tablename" varchar(255) COLLATE "pg_catalog"."default", 
           "tablecolumn" varchar(255) COLLATE "pg_catalog"."default", 
           "groupname" varchar(255) COLLATE "pg_catalog"."default", 
           "groupmember" varchar(255) COLLATE "pg_catalog"."default", 
           "groupmembercount" int4 
         ) 
         ; 
         COMMENT ON COLUMN "mark_group_detail"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "mark_group_detail"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "mark_group_detail"."tablename" IS '数据库表名'; 
         COMMENT ON COLUMN "mark_group_detail"."tablecolumn" IS '数据库列'; 
         COMMENT ON COLUMN "mark_group_detail"."groupname" IS '组名'; 
         COMMENT ON COLUMN "mark_group_detail"."groupmember" IS '组成员'; 
         COMMENT ON COLUMN "mark_group_detail"."groupmembercount" IS '组成员数'; 
         COMMENT ON TABLE "mark_group_detail" IS '分组明细表'; 
          
         -- ---------------------------- 
         -- Table structure for mark_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "mark_info" CASCADE; 
         CREATE TABLE "mark_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('mark_info_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "entity_id" int8, 
           "entity_dm" varchar(20) COLLATE "pg_catalog"."default", 
           "entity_name" varchar(100) COLLATE "pg_catalog"."default", 
           "mark_name" varchar(100) COLLATE "pg_catalog"."default", 
           "mark_is_system" varchar(50) COLLATE "pg_catalog"."default", 
           "mark_modelid" varchar(50) COLLATE "pg_catalog"."default", 
           "mark_color" varchar(10) COLLATE "pg_catalog"."default", 
           "mark_content" varchar(200) COLLATE "pg_catalog"."default", 
           "mark_sslz" varchar(100) COLLATE "pg_catalog"."default", 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "modelpara" text COLLATE "pg_catalog"."default", 
           "mark_num" int4, 
           "mark_field" varchar(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "mark_info"."shard_id" IS '标签ID'; 
         COMMENT ON COLUMN "mark_info"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "mark_info"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "mark_info"."entity_id" IS '实体ID'; 
         COMMENT ON COLUMN "mark_info"."entity_dm" IS '实体代码'; 
         COMMENT ON COLUMN "mark_info"."entity_name" IS '实体名称'; 
         COMMENT ON COLUMN "mark_info"."mark_name" IS '标签名称'; 
         COMMENT ON COLUMN "mark_info"."mark_is_system" IS '是否为系统标签(1:是 0:否)'; 
         COMMENT ON COLUMN "mark_info"."mark_modelid" IS '运行的模型id'; 
         COMMENT ON COLUMN "mark_info"."mark_color" IS '标签颜色'; 
         COMMENT ON COLUMN "mark_info"."mark_content" IS '标签描述'; 
         COMMENT ON COLUMN "mark_info"."mark_sslz" IS '所属类罪'; 
         COMMENT ON COLUMN "mark_info"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "mark_info"."modelpara" IS '模型参数'; 
         COMMENT ON COLUMN "mark_info"."mark_num" IS '标签主体数量'; 
         COMMENT ON COLUMN "mark_info"."mark_field" IS '输出标签主体字段'; 
         COMMENT ON TABLE "mark_info" IS '标签信息表'; 
          
         -- ---------------------------- 
         -- Records of mark_info 
         -- ---------------------------- 
         BEGIN; 
         INSERT INTO "mark_info" VALUES (4, '00000000', 0, 1, '01', '个人类', '重点交易个人', '1', '203', '#FF5cb85c', '重点交易个人', '1', '2018-07-13', '11,12', NULL, 'JYZJHM,JYMC;JYDFZJHM,JYDFMC'); 
         INSERT INTO "mark_info" VALUES (6, '00000000', 0, 3, '03', '账户类', '重点交易账号', '1', '202', '#FF5cb85c', '重点交易账号', '1', '2018-07-13', '11,12', 0, 'JYZJHM,CXKH;JYDFZJHM,JYDFZKH'); 
         INSERT INTO "mark_info" VALUES (7, '00000000', 0, 2, '02', '企业类', '重点交易单位', '1', '203', '#FF5cb85c', '重点交易单位', '1', '2018-07-13', '11,12', 0, 'JYZJHM,JYMC;JYDFZJHM,JYDFMC'); 
         INSERT INTO "mark_info" VALUES (8, '00000000', 0, 2, '02', '企业类', '可疑空壳公司', '1', '7041,7042', '#FF5cb85c', '同一注册地点、同一报税人、同一财务负责人的公司疑为空壳企业。', '2', '2018-07-11', '18,19,20,28', 0, 'NSSBH,NSRMC'); 
         INSERT INTO "mark_info" VALUES (5, '00000000', 0, 2, '02', '企业类', '可疑暴力虚开', '1', '705', '#FF5cb85c', '通过对税务明细数据分析，找出存在暴力虚开的可疑企业。测试一下执行效果', '2', '2018-07-13', '27', 0, 'SH,GSMC'); 
         COMMIT; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_antimoney_core 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_antimoney_core" CASCADE; 
         CREATE TABLE "result_gas_antimoney_core" ( 
           "id" varchar(255) COLLATE "pg_catalog"."default", 
           "stepindex" int4, 
           "sqlindex" int4, 
           "jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "hxzs" int4, 
           "fcs" varchar(255) COLLATE "pg_catalog"."default", 
           "scs" varchar(255) COLLATE "pg_catalog"."default", 
           "jyzcs" varchar(255) COLLATE "pg_catalog"."default", 
           "jczcsb" varchar(255) COLLATE "pg_catalog"."default", 
           "fje" varchar(255) COLLATE "pg_catalog"."default", 
           "sje" varchar(255) COLLATE "pg_catalog"."default", 
           "sfzje" varchar(255) COLLATE "pg_catalog"."default", 
           "sfjeb" varchar(255) COLLATE "pg_catalog"."default", 
           "tdqk" varchar(255) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "acc_per" varchar(255) COLLATE "pg_catalog"."default", 
           "ttl" varchar(255) COLLATE "pg_catalog"."default", 
           "pm" int4 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."id" IS '批次'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."stepindex" IS '步骤'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."sqlindex" IS 'sql索引'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jydfmc" IS '交易对方名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jydfzjhm" IS '交易对方证件号码'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."hxzs" IS '核心指数'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."fcs" IS '付次数'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."scs" IS '收次数'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jyzcs" IS '交易总次数'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jczcsb" IS '进出总次数比'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."fje" IS '付金额'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."sje" IS '收金额'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."sfzje" IS '收付总金额'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."sfjeb" IS '收付金额比'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."tdqk" IS '调单情况'; 
         COMMENT ON COLUMN "result_gas_antimoney_core"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON TABLE "result_gas_antimoney_core" IS '反洗钱核心指数'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_antimoney_loop 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_antimoney_loop" CASCADE; 
         CREATE TABLE "result_gas_antimoney_loop" ( 
           "batchid" varchar(50) COLLATE "pg_catalog"."default", 
           "stepid" int2, 
           "jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jyrq" varchar(255) COLLATE "pg_catalog"."default", 
           "jyje" varchar(255) COLLATE "pg_catalog"."default", 
           "hl" varchar(255) COLLATE "pg_catalog"."default", 
           "ztmc" varchar(255) COLLATE "pg_catalog"."default", 
           "dfsfkrmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jyjezmy" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "wb_jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "wb_jydfmc" varchar(255) COLLATE "pg_catalog"."default", 
           "wb_jyje" varchar(255) COLLATE "pg_catalog"."default", 
           "wb_jyrq" varchar(255) COLLATE "pg_catalog"."default", 
           "bwb_rate" varchar(255) COLLATE "pg_catalog"."default", 
           "bzcs" varchar(255) COLLATE "pg_catalog"."default", 
           "sfkrzzjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "dfsfkrkhhjrjgmc" varchar(255) COLLATE "pg_catalog"."default", 
           "dfsfkrzzjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "wb_jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "bb_jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "bb_jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "gdzhmc" varchar(255) COLLATE "pg_catalog"."default", 
           "gdzhzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(100) COLLATE "pg_catalog"."default", 
           "sfkrwhzh" varchar(100) COLLATE "pg_catalog"."default", 
           "dfsfkrwhzh" varchar(100) COLLATE "pg_catalog"."default", 
           "ifsaved" int2 DEFAULT 0, 
           "gd_jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "gd_jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "gd_jyzkh" varchar(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_antimoney_loop"."batchid" IS '闭环查找批次ID'; 
         COMMENT ON COLUMN "result_gas_antimoney_loop"."stepid" IS '步骤ID'; 
         COMMENT ON TABLE "result_gas_antimoney_loop" IS '反洗钱闭环查找工具'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_antimoney_person 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_antimoney_person" CASCADE; 
         CREATE TABLE "result_gas_antimoney_person" ( 
           "batchid" varchar(50) COLLATE "pg_catalog"."default", 
           "stepid" int2, 
           "jymc" varchar(255) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(255) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(255) COLLATE "pg_catalog"."default", 
           "zch" varchar(255) COLLATE "pg_catalog"."default", 
           "gsmc" varchar(255) COLLATE "pg_catalog"."default", 
           "dwzt" varchar(255) COLLATE "pg_catalog"."default", 
           "zczb" varchar(255) COLLATE "pg_catalog"."default", 
           "sjzb" varchar(255) COLLATE "pg_catalog"."default", 
           "clrq" varchar(255) COLLATE "pg_catalog"."default", 
           "zzjgdm" varchar(255) COLLATE "pg_catalog"."default", 
           "frxm" varchar(255) COLLATE "pg_catalog"."default", 
           "gdxm" varchar(255) COLLATE "pg_catalog"."default", 
           "zycy" varchar(255) COLLATE "pg_catalog"."default", 
           "zwxx" varchar(255) COLLATE "pg_catalog"."default", 
           "ssdq" varchar(255) COLLATE "pg_catalog"."default", 
           "xxdz" varchar(255) COLLATE "pg_catalog"."default", 
           "tdqk" varchar(255) COLLATE "pg_catalog"."default", 
           "ifsaved" int2 DEFAULT 0, 
           "jykhh" varchar(500) COLLATE "pg_catalog"."default", 
           "jydfzhkhh" varchar(500) COLLATE "pg_catalog"."default", 
           "ifjyf" int2, 
           "dqdm" varchar(1000) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."batchid" IS '穿透编号'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."stepid" IS '步骤号'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jydfzjhm" IS '交易对方证件号码'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jydfmc" IS '交易对方名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."zch" IS '注册号'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."gsmc" IS '公司名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."dwzt" IS '企业状态'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."zczb" IS '注册资本'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."sjzb" IS '实缴资本'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."clrq" IS '注册日期'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."zzjgdm" IS '组织机构代码'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."frxm" IS '法人姓名'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."gdxm" IS '股东姓名'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."zycy" IS '主要成员'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."zwxx" IS '职务信息'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."ssdq" IS '所属地区'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."xxdz" IS '详细地址'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."tdqk" IS '调单情况'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."ifsaved" IS '是否保存'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jykhh" IS '交易开户行'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."jydfzhkhh" IS '交易对方账户开户行'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."ifjyf" IS '是否交易方数据 0:交易方 1:交易对手方'; 
         COMMENT ON COLUMN "result_gas_antimoney_person"."dqdm" IS '所在地区代码'; 
         COMMENT ON TABLE "result_gas_antimoney_person" IS '反洗钱人企穿透表'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_antimoney_point 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_antimoney_point" CASCADE; 
         CREATE TABLE "result_gas_antimoney_point" ( 
           "batchid" varchar(50) COLLATE "pg_catalog"."default", 
           "stepid" int2, 
           "roundid" int8, 
           "dfsfkrmc" varchar(255) COLLATE "pg_catalog"."default", 
           "jymcnum" int8, 
           "dfsfkrzzjgdm" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 0, 
           "ifsaved" int2 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."batchid" IS '点爆编号'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."stepid" IS '步骤号'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."roundid" IS '轮数'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."dfsfkrmc" IS '交易对方名称'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."jymcnum" IS '共同收付汇公司个数'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."dfsfkrzzjgdm" IS '对方收付款人组织机构代码'; 
         COMMENT ON COLUMN "result_gas_antimoney_point"."ifsaved" IS '是否保存'; 
         COMMENT ON TABLE "result_gas_antimoney_point" IS '反洗钱点爆算法'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_model_xs_info 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_model_xs_info" CASCADE; 
         CREATE TABLE "result_gas_model_xs_info" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_gas_model_xs_info_shard_id_seq'::regclass), 
           "userid" int4, 
           "caseid" int4, 
           "rid" int4, 
           "batchid" varchar(50) COLLATE "pg_catalog"."default", 
           "historyid" int4, 
           "mid" int4, 
           "modelname" varchar(100) COLLATE "pg_catalog"."default", 
           "parentid" int4, 
           "lbdm" int4, 
           "zbdm" int4, 
           "zzhm" varchar(100) COLLATE "pg_catalog"."default", 
           "mc" varchar(100) COLLATE "pg_catalog"."default", 
           "ztlx" varchar(2) COLLATE "pg_catalog"."default", 
           "roleid" int4, 
           "role" varchar(100) COLLATE "pg_catalog"."default", 
           "ssdq" varchar(100) COLLATE "pg_catalog"."default", 
           "score" float4, 
           "zhsl" int8, 
           "zsl" int8, 
           "zje" numeric(22,2), 
           "jysjd" varchar(100) COLLATE "pg_catalog"."default", 
           "xsgs" varchar(500) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(6), 
           "runstatus" varchar(2) COLLATE "pg_catalog"."default", 
           "zbljgx" varchar(2) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."rid" IS '结果ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."batchid" IS '批次ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."historyid" IS '历史ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."mid" IS '模型ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."modelname" IS '模型名称'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."parentid" IS '模型父类ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."lbdm" IS '类别代码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zbdm" IS '指标代码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zzhm" IS '证照号码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."mc" IS '主体名称'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."ztlx" IS '主体类型(01个人 02公司 )'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."roleid" IS '角色ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."role" IS '角色'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."ssdq" IS '所属地区'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."score" IS '分值'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zhsl" IS '账户数量'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zsl" IS '总次数'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zje" IS '总金额'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."jysjd" IS '交易时间段'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."xsgs" IS '线索概述'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."crrq" IS '插入时间'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."runstatus" IS '运行状态'; 
         COMMENT ON COLUMN "result_gas_model_xs_info"."zbljgx" IS '指标逻辑关系'; 
         COMMENT ON TABLE "result_gas_model_xs_info" IS '上游模型指标线索结果表'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_model_xs_info_tmp 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_model_xs_info_tmp" CASCADE; 
         CREATE TABLE "result_gas_model_xs_info_tmp" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_gas_model_xs_info_tmp_shard_id_seq'::regclass), 
           "userid" int4, 
           "caseid" int4, 
           "rid" int4, 
           "batchid" varchar(50) COLLATE "pg_catalog"."default", 
           "historyid" int4, 
           "mid" int4, 
           "modelname" varchar(100) COLLATE "pg_catalog"."default", 
           "parentid" int4, 
           "lbdm" int4, 
           "zbdm" int4, 
           "zzhm" varchar(100) COLLATE "pg_catalog"."default", 
           "mc" varchar(100) COLLATE "pg_catalog"."default", 
           "ztlx" varchar(2) COLLATE "pg_catalog"."default", 
           "roleid" int4, 
           "role" varchar(100) COLLATE "pg_catalog"."default", 
           "ssdq" varchar(100) COLLATE "pg_catalog"."default", 
           "score" float4, 
           "zhsl" int8, 
           "zsl" int8, 
           "zje" numeric(22,2), 
           "jysjd" varchar(100) COLLATE "pg_catalog"."default", 
           "xsgs" varchar(500) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(6), 
           "runstatus" varchar(2) COLLATE "pg_catalog"."default", 
           "zbljgx" varchar(2) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."rid" IS '结果ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."batchid" IS '批次ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."historyid" IS '历史ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."mid" IS '模型ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."modelname" IS '模型名称'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."parentid" IS '模型父类ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."lbdm" IS '类别代码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zbdm" IS '指标代码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zzhm" IS '证照号码'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."mc" IS '主体名称'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."ztlx" IS '主体类型(01个人 02公司 )'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."roleid" IS '角色ID'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."role" IS '角色'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."ssdq" IS '所属地区'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."score" IS '分值'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zhsl" IS '账户数量'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zsl" IS '总次数'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zje" IS '总金额'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."jysjd" IS '交易时间段'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."xsgs" IS '线索概述'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."crrq" IS '插入时间'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."runstatus" IS '运行状态'; 
         COMMENT ON COLUMN "result_gas_model_xs_info_tmp"."zbljgx" IS '指标逻辑关系'; 
         COMMENT ON TABLE "result_gas_model_xs_info_tmp" IS '上游模型指标线索结果临时表'; 
          
         -- ---------------------------- 
         -- Table structure for result_gas_phone_call_info_model_tmp 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_gas_phone_call_info_model_tmp" CASCADE; 
         CREATE TABLE "result_gas_phone_call_info_model_tmp" ( 
           "dhhm" varchar(255) COLLATE "pg_catalog"."default", 
           "zsxm" varchar(255) COLLATE "pg_catalog"."default", 
           "zzthsj" varchar(255) COLLATE "pg_catalog"."default", 
           "zwthsj" varchar(255) COLLATE "pg_catalog"."default", 
           "thd" varchar(255) COLLATE "pg_catalog"."default", 
           "thzcs" varchar(255) COLLATE "pg_catalog"."default", 
           "sjjg" varchar(255) COLLATE "pg_catalog"."default" 
         ) 
         ; 
         COMMENT ON TABLE "result_gas_phone_call_info_model_tmp" IS '话单分析结果临时表'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqz 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqz" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqz" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqz_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(50) COLLATE "pg_catalog"."default", 
           "relation_id" int4, 
           "role1" varchar(100) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(300) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."relation_id" IS '类别'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."role1" IS '主体角色'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."sfgs" IS '线索概述'; 
         COMMENT ON COLUMN "result_model_fxq_dxqz"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqz" IS '地下钱庄嫌疑账户'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzcjzh_1 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzcjzh_1" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzcjzh_1" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzcjzh_1_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(100) COLLATE "pg_catalog"."default", 
           "jdbz" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jdbz" IS '借贷标志'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jydfmc" IS '对手名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."jydfzjhm" IS '对手证件号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzcjzh_1"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzcjzh_1" IS '出入金帐户'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzhxzh_1 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzhxzh_1" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzhxzh_1" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzhxzh_1_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(100) COLLATE "pg_catalog"."default", 
           "jyye" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "type" int4, 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jyye" IS '交易余额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jydfmc" IS '对手名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."jydfzjhm" IS '对手证件号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."type" IS '类别'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_1"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzhxzh_1" IS '1交易具有规律性、2外币收款、3测试交易痕迹、4沉淀周期、5活跃度、6交易时间集中、7账户关联度'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzhxzh_2 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzhxzh_2" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzhxzh_2" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzhxzh_2_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "xxdz" varchar(200) COLLATE "pg_catalog"."default", 
           "dz" varchar(200) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."xxdz" IS '详细地址'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."dz" IS '地址'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzhxzh_2"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzhxzh_2" IS '与钱庄核心住址相近'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzjylzh_1 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzjylzh_1" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzjylzh_1" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzjylzh_1_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jsj" varchar(50) COLLATE "pg_catalog"."default", 
           "jje" varchar(100) COLLATE "pg_catalog"."default", 
           "jdfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jdfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jdfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "csj" varchar(50) COLLATE "pg_catalog"."default", 
           "cje" varchar(100) COLLATE "pg_catalog"."default", 
           "cdfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "cdfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "cdfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_1"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzjylzh_1" IS '即进即出交易账户'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzjylzh_2 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzjylzh_2" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzjylzh_2" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzjylzh_2_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "type" int4, 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jydfmc" IS '对手名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."jydfzjhm" IS '对手证件号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzjylzh_2"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzjylzh_2" IS '1外币特征、2账户周期性、3余额过小、4换汇、5交易痕迹'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzkhzh 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzkhzh" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzkhzh" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzkhzh_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jydfmc" IS '对手名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."jydfzjhm" IS '对手证件号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzkhzh"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzkhzh" IS '客户账户'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzqzzh 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzqzzh" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzqzzh" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzqzzh_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzqzzh"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzqzzh" IS '整理钱庄账户'; 
          
         -- ---------------------------- 
         -- Table structure for result_model_fxq_dxqzrjzh_1 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "result_model_fxq_dxqzrjzh_1" CASCADE; 
         CREATE TABLE "result_model_fxq_dxqzrjzh_1" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('result_model_fxq_dxqzrjzh_1_shard_id_seq'::regclass), 
           "userid" varchar(50) COLLATE "pg_catalog"."default", 
           "caseid" int4, 
           "rid" int4, 
           "historyid" varchar(100) COLLATE "pg_catalog"."default", 
           "cxkh" varchar(50) COLLATE "pg_catalog"."default", 
           "jymc" varchar(100) COLLATE "pg_catalog"."default", 
           "jyzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "jysj" varchar(50) COLLATE "pg_catalog"."default", 
           "jyje" varchar(100) COLLATE "pg_catalog"."default", 
           "jdbz" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzkh" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfmc" varchar(100) COLLATE "pg_catalog"."default", 
           "jydfzjhm" varchar(50) COLLATE "pg_catalog"."default", 
           "sfgs" varchar(200) COLLATE "pg_catalog"."default", 
           "crrq" timestamp(0) 
         ) 
         ; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."shard_id" IS '分片id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."userid" IS '用户ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."caseid" IS '案件ID'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."rid" IS '结果id'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."cxkh" IS '交易账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jymc" IS '交易名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jyzjhm" IS '交易证件号码'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jysj" IS '交易时间'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jyje" IS '交易金额'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jdbz" IS '借贷标志'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jydfzkh" IS '对手账号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jydfmc" IS '对手名称'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."jydfzjhm" IS '对手证件号'; 
         COMMENT ON COLUMN "result_model_fxq_dxqzrjzh_1"."crrq" IS '插入日期'; 
         COMMENT ON TABLE "result_model_fxq_dxqzrjzh_1" IS '入出金帐户'; 
          
         -- ---------------------------- 
         -- Table structure for t_model_antimoney_param 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "t_model_antimoney_param" CASCADE; 
         CREATE TABLE "t_model_antimoney_param" ( 
           "batchid" varchar(255) COLLATE "pg_catalog"."default" NOT NULL, 
           "modelid" varchar(20) COLLATE "pg_catalog"."default" NOT NULL, 
           "modelparam" varchar(1000) COLLATE "pg_catalog"."default", 
           "modelname" varchar(255) COLLATE "pg_catalog"."default", 
           "isdefault" int2 DEFAULT 0 
         ) 
         ; 
         COMMENT ON COLUMN "t_model_antimoney_param"."batchid" IS '批次id（前1000存储默认值）'; 
         COMMENT ON COLUMN "t_model_antimoney_param"."modelid" IS '模型id'; 
         COMMENT ON COLUMN "t_model_antimoney_param"."modelparam" IS '模型参数'; 
         COMMENT ON COLUMN "t_model_antimoney_param"."modelname" IS '模型名称'; 
         COMMENT ON COLUMN "t_model_antimoney_param"."isdefault" IS '是否默认值(0:是，1：否)'; 
         COMMENT ON TABLE "t_model_antimoney_param" IS '反洗钱参数表'; 
          
         -- ---------------------------- 
         -- Records of t_model_antimoney_param 
         -- ---------------------------- 
         BEGIN; 
         INSERT INTO "t_model_antimoney_param" VALUES ('7', '2013', '[{paraName:"zrjybs",paraText:"转出笔数是转入笔数的（倍数）",paraValue:"0.9",paraTitle:"分散转入集中转出",paratips:"账户交易具有分散转入集中转出的特点。",paraType:"int"}]', '集中转入分散转出(收款)', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('8', '2014', '[{paraName:"zrjybs",paraText:"转入笔数是转出笔数的（倍数）",paraValue:"0.9",paraTitle:"集中转入分散转出",paratips:"账户交易具有集中转入分散转出的特点。",paraType:"int"}]', '分散转入集中转出(付款)', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('18', '2053', NULL, '公司账户', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('19', '2054', NULL, '个人账户', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('17', '2052', '[{paraName:"JYZJE",paraText:"交易总金额",paraValue:"100000"}, 
         {paraName:"JYZBS",paraText:"交易总笔数",paraValue:"2"}, 
         {paraName:"JYDSS",paraText:"交易对手数",paraValue:"1"}]', '研判客户账户', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('10', '2101', '[{paraName:"JYBS",paraText:"交易次数",paraValue:"20"}, 
         {paraName:"JYGL",paraText:"金额规律",paraValue:"100000"}]', '交易金额具有规律性', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('11', '2102', '[{paraName:"dzrmb",paraText:"美金（元）",paraValue:"10000",paraTitle:"外币收款特征",paratips:"单笔外汇交易美元大于一万美元"}]', '外币收款特征', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('12', '2103', '[{paraName:"lxts",paraText:"连续交易天数",paraValue:"3",paraType:"int"}, 
         {paraName:"zdzcbs",paraText:"最低单日交易次数",paraValue:"1",paraType:"int"}, 
         {paraName:"zsjyje",paraText:"交易金额小于100元",paraValue:"100"}]', '测试交易痕迹', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('13', '2104', '[{paraName:"cdts",paraText:"沉淀天数",paraValue:"3",paraTitle:"账户交易量巨大（个人）",paratips:"所采集数据中，账户交易进出累计总交易额。",paraType:"int"}, 
         {paraName:"zsye",paraText:"最少余额(元)",paraValue:"5000000"}]', '沉淀周期大(余额巨大)', 0); 
         INSERT INTO "t_model_antimoney_param" 
         VALUES ('14', '2105', '[{paraName:"HYQ",paraText:"账户活跃时间(月)",paraValue:"6"}, 
         {paraName:"DYB",paraText:"第一笔交易金额（元）",paraValue:"100000"}, 
         {paraName:"ZHYB",paraText:"最后一笔交易金额（元）",paraValue:"100000"}]', '账户活跃度', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('15', '2106', '[{paraName:"ZXJYSJ",paraText:"最小交易时间（时）",paraValue:"0"}, 
         {paraName:"ZDJYSJ",paraText:"最大交易时间（时）",paraValue:"4"}, 
         {paraName:"JYSJGZ",paraText:"最近交易（月）",paraValue:"3"}, 
         {paraName:"ts",paraText:"发生天数（天）",paraValue:"3"}, 
         {paraName:"rate",paraText:"交易集中比",paraValue:"0.75"}]', '交易时间集中', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('16', '2107', '[{paraName:"WDDJYCS",paraText:"与调单交易次数大于（次）",paraValue:"10"}]', '账户与调单账户关联度', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('0', '1', '[{paraName:"JYSJQJ",paraText:"交易时间区间(小时)",paraValue:"24",paraTitle:"即进即出",paratips:"所采集数据中，交易账户有两小时内转入金额与转出金额比例在20%~110%之间的交易特征。",paraType:"int"}, 
         {paraName:"ZXJYJE",paraText:"最小交易金额(元)",paraValue:"10000",paraType:"int"}, 
         {paraName:"CJBZXZ",paraText:"出进比最小比例",paraValue:"0.9",paraType:"int"}, 
         {paraName:"CJBZDZ",paraText:"出进比最大比例",paraValue:"1",paraType:"int"}, 
         {paraName:"CS",paraText:"即进即出交易大于（次）",paraValue:"5",paraType:"int"}]', '模型1', NULL); 
         INSERT INTO "t_model_antimoney_param" VALUES ('17', '2002', '[{paraName:"JYZJE",paraText:"交易总金额",paraValue:"100000000"}, 
         {paraName:"JYZBS",paraText:"交易总笔数",paraValue:"300"}, 
         {paraName:"JYDSS",paraText:"交易对手数",paraValue:"10"}]', '整理钱庄账户', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('1', '2007', '[{paraName:"JYSJQJ",paraText:"交易时间区间(小时)",paraValue:"24",paraTitle:"即进即出",paratips:"所采集数据中，交易账户有两小时内转入金额与转出金额比例在20%~110%之间的交易特征。",paraType:"int"}, 
         {paraName:"ZXJYJE",paraText:"最小交易金额(元)",paraValue:"10000",paraType:"int"}, 
         {paraName:"CJBZXZ",paraText:"出进比最小比例",paraValue:"0.9",paraType:"int"}, 
         {paraName:"CJBZDZ",paraText:"出进比最大比例",paraValue:"1",paraType:"int"}, 
         {paraName:"CS",paraText:"即进即出交易大于（次）",paraValue:"5",paraType:"int"}]', '即进即出交易账户', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('2', '2008', '[{paraName:"dzrmb",paraText:"美金（元）",paraValue:"50000",paraTitle:"外币收款特征",paratips:"单笔外汇交易美元大于一万美元"}]', '外币交易特征', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('3', '2009', '[{paraName:"HYTS",paraText:"交易活跃天数(天)",paraValue:"30",paraType:"int"}, 
         {paraName:"CMTS",paraText:"账户沉默天数(天)",paraValue:"180",paraType:"int"}, 
         {paraName:"JYBS",paraText:"交易笔数(笔)",paraValue:"25",paraType:"int"}]', '账户具有周期性', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('4', '2010', '[{paraName:"zdye",paraText:"最大余额（元）",paraValue:"1000",paraTitle:"当次交易后剩余余额小",paratips:"账户当次交易后剩余余额小于所定金额。"}]', '余额过小', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('5', '2011', NULL, '有换汇交易', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('6', '2012', '[{paraName:"lxts",paraText:"连续交易天数",paraValue:"3",paraType:"int"}, 
         {paraName:"zdzcbs",paraText:"最低单日交易次数",paraValue:"1",paraType:"int"}, 
         {paraName:"zsjyje",paraText:"交易金额小于100元",paraValue:"100"}]', '测试交易痕迹', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('22', '3025', NULL, '进销项货物无关联', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('23', '3026', NULL, '票面与企业经营范围不符', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('24', '3027', NULL, '顶额开票', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('25', '3028', NULL, '被税务标记高危', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('21', '3024', '[{"Modeld":"3024","ModelName":"有销项无进项","ParaName":"RATE","ParaText":"进销项总金额比例","ParaValue":"0.98"}]', '有销项无进项', 0); 
         INSERT INTO "t_model_antimoney_param" VALUES ('26', '504', '[{"Modeld":"504","ModelName":"绝对闭环","ParaName":"JYRQ","ParaText":"?
         灰兹掌?,"MinValue":"","MaxValue":"","ParaType":"date","IfMMValues":true}, 
         {"Modeld":"504","ModelName":"绝对闭环","ParaName":"RCZ","ParaText":"容  错  值","MinValue":"-0.5","MaxValue":"0.5","ParaType":"comb","IfMMValues":true,"ComboxItems":[{"ItemKey":"0.5","ItemValue":"0.5"},{"ItemKey":"0.4","ItemValue":"0.4"},{"ItemKey":"0.3","ItemValue":"0.3"},{"ItemKey":"0.2","ItemValue":"0.2"},{"ItemKey":"0.1","ItemValue":"0.1"},{"ItemKey":"0","ItemValue":"0"},{"ItemKey":"-0.1","ItemValue":"-0.1"},{"ItemKey":"-0.2","ItemValue":"-0.2"},{"ItemKey":"-0.3","ItemValue":"-0.3"},{"ItemKey":"-0.4","ItemValue":"-0.4"},{"ItemKey":"-0.5","ItemValue":"-0.5"}]}]', '闭环查找', 0); 
         COMMIT; 
          
          
          
         -- ---------------------------- 
         -- Table structure for gas_rmb_exrate_midprice 
         -- ---------------------------- 
         DROP TABLE IF EXISTS "gas_rmb_exrate_midprice"; 
         CREATE TABLE "gas_rmb_exrate_midprice" ( 
           "shard_id" int8 NOT NULL DEFAULT nextval('gas_rmb_exrate_midprice_shard_id_seq'::regclass), 
           "ajid" int8 NOT NULL, 
           "rq" varchar(20) COLLATE "pg_catalog"."default", 
           "my" numeric(22,4), 
           "oy" numeric(22,4), 
           "ry" numeric(22,4), 
           "gy" numeric(22,4), 
           "yb" numeric(22,4), 
           "ljt" numeric(22,4), 
           "lb" numeric(22,4), 
           "lt" numeric(22,4), 
           "hy" numeric(22,4), 
           "dlm" numeric(22,4), 
           "lye" numeric(22,4), 
           "fl" numeric(22,4), 
           "clt" numeric(22,4), 
           "dmkl" numeric(22,4), 
           "rdkl" numeric(22,4), 
           "lwkl" numeric(22,4), 
           "ll" numeric(22,4), 
           "bs" numeric(22,4), 
           "tz" numeric(22,4), 
           "ay" numeric(22,4), 
           "jy" numeric(22,4), 
           "xxly" numeric(22,4), 
           "xjpy" numeric(22,4), 
           "rsfl" numeric(22,4), 
           "sjlylx" varchar(20) COLLATE "pg_catalog"."default", 
           "batch" int8, 
           "crrq" varchar(50) COLLATE "pg_catalog"."default", 
           "sjlyid" numeric(32) NOT NULL DEFAULT NULL::numeric 
         ) 
         ; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."shard_id" IS '分片ID'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."ajid" IS '案件ID'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."rq" IS '日期'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."my" IS '美元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."oy" IS '欧元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."ry" IS '日元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."gy" IS '港元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."yb" IS '英镑'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."ljt" IS '林吉特'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."lb" IS '卢布'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."lt" IS '兰特'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."hy" IS '韩元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."dlm" IS '迪拉姆'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."lye" IS '里亚尔'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."fl" IS '福林'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."clt" IS '兹罗提'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."dmkl" IS '丹麦克朗'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."rdkl" IS '瑞典克朗'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."lwkl" IS '挪威克朗'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."ll" IS '里拉'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."bs" IS '比索'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."tz" IS '泰铢'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."ay" IS '澳元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."jy" IS '加元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."xxly" IS '新西兰元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."xjpy" IS '新加坡元'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."rsfl" IS '瑞士法郎'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."sjlylx" IS '数据来源类型(手工录入,采集录入,数据抽取)'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."batch" IS '批次'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."crrq" IS '插入日期'; 
         COMMENT ON COLUMN "gas_rmb_exrate_midprice"."sjlyid" IS '数据来源id'; 
         COMMENT ON TABLE "gas_rmb_exrate_midprice" IS '人民币汇率中间价表'; 
          
          
          
          
          
         -- ---------------------------- 
         -- Alter sequences owned by 
         -- ---------------------------- 
         ALTER SEQUENCE "bk_fk_dtcx_shard_id_seq" 
         OWNED BY "bk_fk_dtcx"."shard_id"; 
         SELECT setval('"bk_fk_dtcx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "bk_fk_dtcxsj_shard_id_seq" 
         OWNED BY "bk_fk_dtcxsj"."shard_id"; 
         SELECT setval('"bk_fk_dtcxsj_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "bk_fk_gyyxq_shard_id_seq" 
         OWNED BY "bk_fk_gyyxq"."shard_id"; 
         SELECT setval('"bk_fk_gyyxq_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_accesorry_id_seq" 
         OWNED BY "ck_cbrc_accesorry"."id"; 
         SELECT setval('"ck_cbrc_accesorry_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_account_id_seq" 
         OWNED BY "ck_cbrc_account"."id"; 
         SELECT setval('"ck_cbrc_account_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_object_id_seq" 
         OWNED BY "ck_cbrc_object"."id"; 
         SELECT setval('"ck_cbrc_object_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_dj_detail_id_seq" 
         OWNED BY "ck_cbrc_return_dj_detail"."id"; 
         SELECT setval('"ck_cbrc_return_dj_detail_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_dj_id_seq" 
         OWNED BY "ck_cbrc_return_dj"."id"; 
         SELECT setval('"ck_cbrc_return_dj_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_end_id_seq" 
         OWNED BY "ck_cbrc_return_end"."id"; 
         SELECT setval('"ck_cbrc_return_end_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_info_id_seq" 
         OWNED BY "ck_cbrc_return_info"."id"; 
         SELECT setval('"ck_cbrc_return_info_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_jjzf_detail_id_seq" 
         OWNED BY "ck_cbrc_return_jjzf_detail"."id"; 
         SELECT setval('"ck_cbrc_return_jjzf_detail_id_seq"', 3, false); 
         ALTER SEQUENCE "ck_cbrc_return_jjzf_id_seq" 
         OWNED BY "ck_cbrc_return_jjzf"."id"; 
         SELECT setval('"ck_cbrc_return_jjzf_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_account_info_chakong_shard_id_seq" 
         OWNED BY "gas_account_info_chakong"."shard_id"; 
         SELECT setval('"gas_account_info_chakong_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_account_info_shard_id_seq" 
         OWNED BY "gas_account_info"."shard_id"; 
         SELECT setval('"gas_account_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_analysis_record_id_seq" 
         OWNED BY "gas_analysis_record"."id"; 
         SELECT setval('"gas_analysis_record_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_analysis_record_visual_id_seq" 
         OWNED BY "gas_analysis_record_visual"."id"; 
         SELECT setval('"gas_analysis_record_visual_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_awaittask_id_seq" 
         OWNED BY "gas_awaittask"."id"; 
         SELECT setval('"gas_awaittask_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_bank_records_shard_id_seq" 
         OWNED BY "gas_bank_records"."shard_id"; 
         SELECT setval('"gas_bank_records_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_bank_records_source_shard_id_seq" 
         OWNED BY "gas_bank_records_source"."shard_id"; 
         SELECT setval('"gas_bank_records_source_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_cft_accountinfo_shard_id_seq" 
         OWNED BY "gas_cft_accountinfo"."shard_id"; 
         SELECT setval('"gas_cft_accountinfo_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_cft_zjxx_shard_id_seq" 
         OWNED BY "gas_cft_zjxx"."shard_id"; 
         SELECT setval('"gas_cft_zjxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_dsf_dlip_shard_id_seq" 
         OWNED BY "gas_dsf_dlip"."shard_id"; 
         SELECT setval('"gas_dsf_dlip_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_dsf_jbxx_shard_id_seq" 
         OWNED BY "gas_dsf_jbxx"."shard_id"; 
         SELECT setval('"gas_dsf_jbxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_dsf_jyjl_shard_id_seq" 
         OWNED BY "gas_dsf_jyjl"."shard_id"; 
         SELECT setval('"gas_dsf_jyjl_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_dsf_records_shard_id_seq" 
         OWNED BY "gas_dsf_records"."shard_id"; 
         SELECT setval('"gas_dsf_records_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_im_msg_imltjlid_seq" 
         OWNED BY "gas_im_msg"."imltjlid"; 
         SELECT setval('"gas_im_msg_imltjlid_seq"', 3, false); 
         ALTER SEQUENCE "gas_im_msg_shard_id_seq" 
         OWNED BY "gas_im_msg"."shard_id"; 
         SELECT setval('"gas_im_msg_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_jass_info_shard_id_seq" 
         OWNED BY "gas_jass_info"."shard_id"; 
         SELECT setval('"gas_jass_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_jstxhy_info_id_seq" 
         OWNED BY "gas_jstxhy_info"."id"; 
         SELECT setval('"gas_jstxhy_info_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_jstxhy_info_shard_id_seq" 
         OWNED BY "gas_jstxhy_info"."shard_id"; 
         SELECT setval('"gas_jstxhy_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_logistics_info_id_seq" 
         OWNED BY "gas_logistics_info"."id"; 
         SELECT setval('"gas_logistics_info_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_logistics_info_shard_id_seq" 
         OWNED BY "gas_logistics_info"."shard_id"; 
         SELECT setval('"gas_logistics_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_chakong_shard_id_seq" 
         OWNED BY "gas_person_chakong"."shard_id"; 
         SELECT setval('"gas_person_chakong_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_glzzh_shard_id_seq" 
         OWNED BY "gas_person_glzzh"."shard_id"; 
         SELECT setval('"gas_person_glzzh_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_gyyxq_shard_id_seq" 
         OWNED BY "gas_person_gyyxq"."shard_id"; 
         SELECT setval('"gas_person_gyyxq_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_pic_shard_id_seq" 
         OWNED BY "gas_person_pic"."shard_id"; 
         SELECT setval('"gas_person_pic_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_qzcs_shard_id_seq" 
         OWNED BY "gas_person_qzcs"."shard_id"; 
         SELECT setval('"gas_person_qzcs_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_person_shard_id_seq" 
         OWNED BY "gas_person"."shard_id"; 
         SELECT setval('"gas_person_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_phone_call_info_shard_id_seq" 
         OWNED BY "gas_phone_call_info"."shard_id"; 
         SELECT setval('"gas_phone_call_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_safe_trading_shard_id_seq" 
         OWNED BY "gas_safe_trading"."shard_id"; 
         SELECT setval('"gas_safe_trading_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_sjdx_ch_id_seq" 
         OWNED BY "gas_sjdx"."ch_id"; 
         SELECT setval('"gas_sjdx_ch_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_sjdx_shard_id_seq" 
         OWNED BY "gas_sjdx"."shard_id"; 
         SELECT setval('"gas_sjdx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_sjtxl_id_seq" 
         OWNED BY "gas_sjtxl"."id"; 
         SELECT setval('"gas_sjtxl_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_sjtxl_shard_id_seq" 
         OWNED BY "gas_sjtxl"."shard_id"; 
         SELECT setval('"gas_sjtxl_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_taobao_info_shard_id_seq" 
         OWNED BY "gas_taobao_info"."shard_id"; 
         SELECT setval('"gas_taobao_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_taobao_log_shard_id_seq" 
         OWNED BY "gas_taobao_log"."shard_id"; 
         SELECT setval('"gas_taobao_log_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_taobao_trade_info_shard_id_seq" 
         OWNED BY "gas_taobao_trade_info"."shard_id"; 
         SELECT setval('"gas_taobao_trade_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_bgd_shard_id_seq" 
         OWNED BY "gas_tax_bgd"."shard_id"; 
         SELECT setval('"gas_tax_bgd_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_bgh_shard_id_seq" 
         OWNED BY "gas_tax_bgh"."shard_id"; 
         SELECT setval('"gas_tax_bgh_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_hgjkshbd_shard_id_seq" 
         OWNED BY "gas_tax_hgjkshbd"."shard_id"; 
         SELECT setval('"gas_tax_hgjkshbd_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_hgjkshxx_shard_id_seq" 
         OWNED BY "gas_tax_hgjkshxx"."shard_id"; 
         SELECT setval('"gas_tax_hgjkshxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_hgjkzzs_shard_id_seq" 
         OWNED BY "gas_tax_hgjkzzs"."shard_id"; 
         SELECT setval('"gas_tax_hgjkzzs_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_hgwspzjhbd_shard_id_seq" 
         OWNED BY "gas_tax_hgwspzjhbd"."shard_id"; 
         SELECT setval('"gas_tax_hgwspzjhbd_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_records_shard_id_seq" 
         OWNED BY "gas_tax_records"."shard_id"; 
         SELECT setval('"gas_tax_records_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_records_source_shard_id_seq" 
         OWNED BY "gas_tax_records_source"."shard_id"; 
         SELECT setval('"gas_tax_records_source_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_tax_swdj_shard_id_seq" 
         OWNED BY "gas_tax_swdj"."shard_id"; 
         SELECT setval('"gas_tax_swdj_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_crjjl_id_seq" 
         OWNED BY "gas_ys_crjjl"."id"; 
         SELECT setval('"gas_ys_crjjl_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_crjjl_shard_id_seq" 
         OWNED BY "gas_ys_crjjl"."shard_id"; 
         SELECT setval('"gas_ys_crjjl_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_dbq_ldzs_id_seq" 
         OWNED BY "gas_ys_dbq_ldzs"."id"; 
         SELECT setval('"gas_ys_dbq_ldzs_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_dbq_ldzs_shard_id_seq" 
         OWNED BY "gas_ys_dbq_ldzs"."shard_id"; 
         SELECT setval('"gas_ys_dbq_ldzs_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_hyzk_id_seq" 
         OWNED BY "gas_ys_hyzk"."id"; 
         SELECT setval('"gas_ys_hyzk_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_hyzk_shard_id_seq" 
         OWNED BY "gas_ys_hyzk"."shard_id"; 
         SELECT setval('"gas_ys_hyzk_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_jsr_id_seq" 
         OWNED BY "gas_ys_jsr"."id"; 
         SELECT setval('"gas_ys_jsr_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_jsr_shard_id_seq" 
         OWNED BY "gas_ys_jsr"."shard_id"; 
         SELECT setval('"gas_ys_jsr_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_jyxx_shard_id_seq" 
         OWNED BY "gas_ys_jyxx"."shard_id"; 
         SELECT setval('"gas_ys_jyxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_mhlg_id_seq" 
         OWNED BY "gas_ys_mhlg"."id"; 
         SELECT setval('"gas_ys_mhlg_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_mhlg_shard_id_seq" 
         OWNED BY "gas_ys_mhlg"."shard_id"; 
         SELECT setval('"gas_ys_mhlg_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_qgjdc_id_seq" 
         OWNED BY "gas_ys_qgjdc"."id"; 
         SELECT setval('"gas_ys_qgjdc_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_qgjdc_shard_id_seq" 
         OWNED BY "gas_ys_qgjdc"."shard_id"; 
         SELECT setval('"gas_ys_qgjdc_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_qgjdcwzxx_id_seq" 
         OWNED BY "gas_ys_qgjdcwzxx"."id"; 
         SELECT setval('"gas_ys_qgjdcwzxx_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_qgjdcwzxx_shard_id_seq" 
         OWNED BY "gas_ys_qgjdcwzxx"."shard_id"; 
         SELECT setval('"gas_ys_qgjdcwzxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_sjhb_id_seq" 
         OWNED BY "gas_ys_sjhb"."id"; 
         SELECT setval('"gas_ys_sjhb_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_sjhb_shard_id_seq" 
         OWNED BY "gas_ys_sjhb"."shard_id"; 
         SELECT setval('"gas_ys_sjhb_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_sxrxx_id_seq" 
         OWNED BY "gas_ys_sxrxx"."id"; 
         SELECT setval('"gas_ys_sxrxx_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_sxrxx_shard_id_seq" 
         OWNED BY "gas_ys_sxrxx"."shard_id"; 
         SELECT setval('"gas_ys_sxrxx_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_tlsp_id_seq" 
         OWNED BY "gas_ys_tlsp"."id"; 
         SELECT setval('"gas_ys_tlsp_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_tlsp_shard_id_seq" 
         OWNED BY "gas_ys_tlsp"."shard_id"; 
         SELECT setval('"gas_ys_tlsp_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_yhhc_id_seq" 
         OWNED BY "gas_ys_yhhc"."id"; 
         SELECT setval('"gas_ys_yhhc_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_ys_yhhc_shard_id_seq" 
         OWNED BY "gas_ys_yhhc"."shard_id"; 
         SELECT setval('"gas_ys_yhhc_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_zhifubao_trade_shard_id_seq" 
         OWNED BY "gas_zhifubao_trade"."shard_id"; 
         SELECT setval('"gas_zhifubao_trade_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_zhifubao_transfer_shard_id_seq" 
         OWNED BY "gas_zhifubao_transfer"."shard_id"; 
         SELECT setval('"gas_zhifubao_transfer_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "mark_detail_shard_id_seq" 
         OWNED BY "mark_detail"."shard_id"; 
         SELECT setval('"mark_detail_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "mark_dm_entity_shard_id_seq" 
         OWNED BY "mark_dm_entity"."shard_id"; 
         SELECT setval('"mark_dm_entity_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "mark_group_detail_shard_id_seq" 
         OWNED BY "mark_group_detail"."shard_id"; 
         SELECT setval('"mark_group_detail_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "mark_info_shard_id_seq" 
         OWNED BY "mark_info"."shard_id"; 
         SELECT setval('"mark_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_gas_model_xs_info_shard_id_seq" 
         OWNED BY "result_gas_model_xs_info"."shard_id"; 
         SELECT setval('"result_gas_model_xs_info_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_gas_model_xs_info_tmp_shard_id_seq" 
         OWNED BY "result_gas_model_xs_info_tmp"."shard_id"; 
         SELECT setval('"result_gas_model_xs_info_tmp_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqz_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqz"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqz_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzcjzh_1_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzcjzh_1"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzcjzh_1_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzhxzh_1_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzhxzh_1"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzhxzh_1_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzhxzh_2_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzhxzh_2"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzhxzh_2_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzjylzh_1_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzjylzh_1"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzjylzh_1_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzjylzh_2_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzjylzh_2"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzjylzh_2_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzkhzh_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzkhzh"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzkhzh_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzqzzh_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzqzzh"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzqzzh_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "result_model_fxq_dxqzrjzh_1_shard_id_seq" 
         OWNED BY "result_model_fxq_dxqzrjzh_1"."shard_id"; 
         SELECT setval('"result_model_fxq_dxqzrjzh_1_shard_id_seq"', 3, false); 
         ALTER SEQUENCE "gas_rmb_exrate_midprice_shard_id_seq" 
         OWNED BY "gas_rmb_exrate_midprice"."shard_id"; 
         SELECT setval('"gas_rmb_exrate_midprice_shard_id_seq"', 3, false); 
          
         -- ---------------------------- 
         -- Indexes structure for table bk_fk_dtcx 
         -- ---------------------------- 
         CREATE INDEX "bk_fk_dtcx_index" ON "bk_fk_dtcx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table bk_fk_dtcxsj 
         -- ---------------------------- 
         CREATE INDEX "bk_fk_dtcxsj_index" ON "bk_fk_dtcxsj" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table bk_fk_gyyxq 
         -- ---------------------------- 
         CREATE INDEX "bk_fk_gyyxq_index" ON "bk_fk_gyyxq" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_accesorry 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_accesorry_index" ON "ck_cbrc_accesorry" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_account 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_account_index" ON "ck_cbrc_account" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_object 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_object_index" ON "ck_cbrc_object" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_dj 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_dj_index" ON "ck_cbrc_return_dj" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_dj_detail 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_dj_detail_index" ON "ck_cbrc_return_dj_detail" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_end 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_end_index" ON "ck_cbrc_return_end" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_info 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_info_index" ON "ck_cbrc_return_info" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_jjzf 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_jjzf_index" ON "ck_cbrc_return_jjzf" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table ck_cbrc_return_jjzf_detail 
         -- ---------------------------- 
         CREATE INDEX "ck_cbrc_return_jjzf_detail_index" ON "ck_cbrc_return_jjzf_detail" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_account_info 
         -- ---------------------------- 
         CREATE INDEX "gas_account_info_ajid_index" ON "gas_account_info" USING btree ( 
           "ajid" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
         CREATE INDEX "gas_account_info_index" ON "gas_account_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------
         -- Indexes structure for table gas_account_info_chakong 
         -- ---------------------------- 
         CREATE INDEX "gas_account_info_chakong_index" ON "gas_account_info_chakong" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_analysis_record 
         -- ---------------------------- 
         CREATE INDEX "gas_analysis_record_index" ON "gas_analysis_record" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_analysis_record_visual 
         -- ---------------------------- 
         CREATE INDEX "gas_analysis_record_visual_index" ON "gas_analysis_record_visual" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_awaittask 
         -- ---------------------------- 
         CREATE INDEX "gas_awaittask_index" ON "gas_awaittask" USING btree ( 
           "id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_bank_records 
         -- ---------------------------- 
         CREATE INDEX "gas_bank_records_collection_index" ON "gas_bank_records" USING btree ( 
           "ajid" "pg_catalog"."int4_ops" ASC NULLS LAST, 
           "batch" "pg_catalog"."int4_ops" ASC NULLS LAST, 
           "sjlyid" "pg_catalog"."numeric_ops" ASC NULLS LAST 
         ); 
         CREATE INDEX "gas_bank_records_index" ON "gas_bank_records" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_bank_records_source 
         -- ---------------------------- 
         CREATE INDEX "gas_bank_records_collection_source_index" ON "gas_bank_records_source" USING btree ( 
           "ajid" "pg_catalog"."int4_ops" ASC NULLS LAST, 
           "batch" "pg_catalog"."int4_ops" ASC NULLS LAST, 
           "sjlyid" "pg_catalog"."numeric_ops" ASC NULLS LAST 
         ); 
         CREATE INDEX "gas_bank_records_source_index" ON "gas_bank_records_source" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_cft_accountinfo 
         -- ---------------------------- 
         CREATE INDEX "gas_cft_accountinfo_index" ON "gas_cft_accountinfo" USING btree ( 
           "ajid" "pg_catalog"."int4_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_cft_zjxx 
         -- ---------------------------- 
         CREATE INDEX "gas_cft_zjxx_index" ON "gas_cft_zjxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_dsf_dlip 
         -- ---------------------------- 
         CREATE INDEX "gas_dsf_dlip_index" ON "gas_dsf_dlip" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_dsf_dlip 
         -- ---------------------------- 
         ALTER TABLE "gas_dsf_dlip" ADD CONSTRAINT "gas_dsf_dlip_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_dsf_jbxx 
         -- ---------------------------- 
         CREATE INDEX "gas_dsf_jbxx_index" ON "gas_dsf_jbxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_dsf_jbxx 
         -- ---------------------------- 
         ALTER TABLE "gas_dsf_jbxx" ADD CONSTRAINT "gas_dsf_jbxx_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_dsf_jyjl 
         -- ---------------------------- 
         CREATE INDEX "gas_dsf_jyjl_index" ON "gas_dsf_jyjl" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_dsf_jyjl 
         -- ---------------------------- 
         ALTER TABLE "gas_dsf_jyjl" ADD CONSTRAINT "gas_dsf_jyjl_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_dsf_records 
         -- ---------------------------- 
         CREATE INDEX "gas_dsf_records_index" ON "gas_dsf_records" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- -----------------
         ----------- 
         -- Primary Key structure for table gas_dsf_records 
         -- ---------------------------- 
         ALTER TABLE "gas_dsf_records" ADD CONSTRAINT "gas_dsf_records_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_im_msg 
         -- ---------------------------- 
         CREATE INDEX "gas_im_msg_index" ON "gas_im_msg" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_jass_info 
         -- ---------------------------- 
         CREATE INDEX "gas_jass_info_index" ON "gas_jass_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_jass_info 
         -- ---------------------------- 
         ALTER TABLE "gas_jass_info" ADD CONSTRAINT "gas_jass_info_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_jstxhy_info 
         -- ---------------------------- 
         CREATE INDEX "gas_jstxhy_info_index" ON "gas_jstxhy_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_jstxhy_info 
         -- ---------------------------- 
         ALTER TABLE "gas_jstxhy_info" ADD CONSTRAINT "gas_jstxhy_info_pkey" PRIMARY KEY ("id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_logistics_info 
         -- ---------------------------- 
         CREATE INDEX "gas_logistics_info_index" ON "gas_logistics_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_logistics_info 
         -- ---------------------------- 
         ALTER TABLE "gas_logistics_info" ADD CONSTRAINT "gas_logistics_info_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person 
         -- ---------------------------- 
         CREATE INDEX "gas_person_ajid_index" ON "gas_person" USING btree ( 
           "ajid" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
         CREATE INDEX "gas_person_index" ON "gas_person" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person_chakong 
         -- ---------------------------- 
         CREATE INDEX "gas_person_chakong_index" ON "gas_person_chakong" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person_glzzh 
         -- ---------------------------- 
         CREATE INDEX "gas_person_glzzh_index" ON "gas_person_glzzh" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person_gyyxq 
         -- ---------------------------- 
         CREATE INDEX "gas_person_gyyxq_index" ON "gas_person_gyyxq" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person_pic 
         -- ---------------------------- 
         CREATE INDEX "gas_person_pic_index" ON "gas_person_pic" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_person_pic 
         -- ---------------------------- 
         ALTER TABLE "gas_person_pic" ADD CONSTRAINT "gas_person_pic_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_person_qzcs 
         -- ---------------------------- 
         CREATE INDEX "gas_person_qzcs_index" ON "gas_person_qzcs" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_phone_call_info 
         -- ---------------------------- 
         CREATE INDEX "gas_phone_call_info_index" ON "gas_phone_call_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_safe_trading 
         -- ---------------------------- 
         CREATE INDEX "gas_safe_trading_index" ON "gas_safe_trading" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_sjdx 
         -- ---------------------------- 
         CREATE INDEX "gas_sjdx_index" ON "gas_sjdx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_sjdx 
         -- ---------------------------- 
         ALTER TABLE "gas_sjdx" ADD CONSTRAINT "gas_sjdx_pkey" PRIMARY KEY ("ch_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_sjtxl 
         -- ---------------------------- 
         CREATE INDEX "gas_sjtxl_index" ON "gas_sjtxl" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Primary Key structure for table gas_sjtxl 
         -- ---------------------------- 
         ALTER TABLE "gas_sjtxl" ADD CONSTRAINT "gas_sjtxl_pkey" PRIMARY KEY ("shard_id"); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_taobao_info 
         -- ---------------------------- 
         CREATE INDEX "gas_taobao_info_index" ON "gas_taobao_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_taobao_log 
         -- ---------------------------- 
         CREATE INDEX "gas_taobao_log_index" ON "gas_taobao_log" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_taobao_trade_info 
         -- ---------------------------- 
         CREATE INDEX "gas_taobao_trade_info_index" ON "gas_taobao_trade_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_bgd 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_bgd_index" ON "gas_tax_bgd" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_bgh 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_bgh_index" ON "gas_tax_bgh" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_hgjkshbd 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_hgjkshbd_index" ON "gas_tax_hgjkshbd" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_hgjkshxx 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_hgjkshxx_index" ON "gas_tax_hgjkshxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_hgjkzzs 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_hgjkzzs_index" ON "gas_tax_hgjkzzs" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_hgwspzjhbd 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_hgwspzjhbd_index" ON "gas_tax_hgwspzjhbd" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_records 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_records_index" ON "gas_tax_records" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_records_source 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_records_source_index" ON "gas_tax_records_source" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_tax_swdj 
         -- ---------------------------- 
         CREATE INDEX "gas_tax_swdj_index" ON "gas_tax_swdj" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_crjjl 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_crjjl_index" ON "gas_ys_crjjl" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------
         ------------------- 
         -- Indexes structure for table gas_ys_dbq_ldzs 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_dbq_ldzs_index" ON "gas_ys_dbq_ldzs" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_hyzk 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_hyzk_index" ON "gas_ys_hyzk" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_jsr 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_jsr_index" ON "gas_ys_jsr" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_jyxx 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_jyxx_index" ON "gas_ys_jyxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_mhlg 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_mhlg_index" ON "gas_ys_mhlg" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_qgjdc 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_qgjdc_index" ON "gas_ys_qgjdc" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_qgjdcwzxx 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_qgjdcwzxx_index" ON "gas_ys_qgjdcwzxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_sjhb 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_sjhb_index" ON "gas_ys_sjhb" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_sxrxx 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_sxrxx_index" ON "gas_ys_sxrxx" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_tlsp 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_tlsp_index" ON "gas_ys_tlsp" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_ys_yhhc 
         -- ---------------------------- 
         CREATE INDEX "gas_ys_yhhc_index" ON "gas_ys_yhhc" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_zhifubao_trade 
         -- ---------------------------- 
         CREATE INDEX "gas_zhifubao_trade_index" ON "gas_zhifubao_trade" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table gas_zhifubao_transfer 
         -- ---------------------------- 
         CREATE INDEX "gas_zhifubao_transfer_index" ON "gas_zhifubao_transfer" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table mark_detail 
         -- ---------------------------- 
         CREATE INDEX "mark_detail_index" ON "mark_detail" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table mark_dm_entity 
         -- ---------------------------- 
         CREATE INDEX "mark_dm_entity_index" ON "mark_dm_entity" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table mark_group_detail 
         -- ---------------------------- 
         CREATE INDEX "mark_group_detail_index" ON "mark_group_detail" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table mark_info 
         -- ---------------------------- 
         CREATE INDEX "mark_info_index" ON "mark_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- --------------------
         -------- 
         -- Indexes structure for table result_gas_antimoney_core 
         -- ---------------------------- 
         CREATE INDEX "result_gas_antimoney_core_index" ON "result_gas_antimoney_core" USING btree ( 
           "id" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_antimoney_loop 
         -- ---------------------------- 
         CREATE INDEX "result_gas_antimoney_loop_index" ON "result_gas_antimoney_loop" USING btree ( 
           "batchid" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_antimoney_person 
         -- ---------------------------- 
         CREATE INDEX "result_gas_antimoney_person_index" ON "result_gas_antimoney_person" USING btree ( 
           "batchid" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_antimoney_point 
         -- ---------------------------- 
         CREATE INDEX "result_gas_antimoney_point_index" ON "result_gas_antimoney_point" USING btree ( 
           "batchid" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_model_xs_info 
         -- ---------------------------- 
         CREATE INDEX "result_gas_model_xs_info_index" ON "result_gas_model_xs_info" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_model_xs_info_tmp 
         -- ---------------------------- 
         CREATE INDEX "result_gas_model_xs_info_tmp_index" ON "result_gas_model_xs_info_tmp" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_gas_phone_call_info_model_tmp 
         -- ---------------------------- 
         CREATE INDEX "result_gas_phone_call_info_model_tmp_index" ON "result_gas_phone_call_info_model_tmp" USING btree ( 
           "dhhm" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqz 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqz_index" ON "result_model_fxq_dxqz" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzcjzh_1 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzcjzh_1_index" ON "result_model_fxq_dxqzcjzh_1" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzhxzh_1 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzhxzh_1_index" ON "result_model_fxq_dxqzhxzh_1" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzhxzh_2 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzhxzh_2_index" ON "result_model_fxq_dxqzhxzh_2" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzjylzh_1 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzjylzh_1_index" ON "result_model_fxq_dxqzjylzh_1" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzjylzh_2 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzjylzh_2_index" ON "result_model_fxq_dxqzjylzh_2" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzkhzh 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzkhzh_index" ON "result_model_fxq_dxqzkhzh" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ------------------
         ---------- 
         -- Indexes structure for table result_model_fxq_dxqzqzzh 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzqzzh_index" ON "result_model_fxq_dxqzqzzh" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table result_model_fxq_dxqzrjzh_1 
         -- ---------------------------- 
         CREATE INDEX "result_model_fxq_dxqzrjzh_1_index" ON "result_model_fxq_dxqzrjzh_1" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          
         -- ---------------------------- 
         -- Indexes structure for table t_model_antimoney_param 
         -- ---------------------------- 
         CREATE INDEX "t_model_antimoney_param_index" ON "t_model_antimoney_param" USING btree ( 
           "batchid" COLLATE "pg_catalog"."default" "pg_catalog"."varchar_ops" ASC NULLS LAST 
         ); 
          
          
         -- ---------------------------- 
         -- Indexes structure for table gas_rmb_exrate_midprice 
         -- ---------------------------- 
         CREATE INDEX "gas_rmb_exrate_midprice_index" ON "gas_rmb_exrate_midprice" USING btree ( 
           "shard_id" "pg_catalog"."int8_ops" ASC NULLS LAST 
         ); 
          `;
        await this.SwitchCase(client, ajid);
        await client.query(content);
        let params = [
          ajid,
          ajbh,
          ajmc,
          ajlb,
          ajlbmc,
          zcjddm,
          zcjdmc,
          cjsj,
          jjsj,
          xgsj,
          asjfsddxzqhdm,
          asjfsddxzqmc,
          jyaq,
          zhaq,
          cjr,
          sfsc,
          sfbdwkj,
          sjlx,
        ];
        let paramsArray = [];
        for (let i = 1; i <= params.length; i++) {
          paramsArray.push(`$${i}`);
        }
        let paramsString = paramsArray.join(",");
        let sql = `INSERT INTO icap_base.st_case(AJID,AJBH,AJMC,AJLB,AJLBMC,ZCJDDM,ZCJDMC,CJSJ,JJSJ,XGSJ,ASJFSDDXZQHDM,ASJFSDDXZQMC,JYAQ,ZHAQ,CJR,SFSC,SFBDWKJ,SJLX) VALUES(${paramsString})`;
        await client.query(sql, params);
      } else {
        log.error("exist");
      }
      return true;
    } finally {
      client.release();
    }
  },
  // 获取实体数量
  QueryEntityCount: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await this.SwitchCase(client, ajid);
      let sql = `select sum(count)::int 
      from ( 
         SELECT count(*) FROM  gas_person  WHERE (ckztlb='02' OR ZZLX='dz1') AND ajid = ${ajid}    
         union all 
         SELECT count(*) FROM  gas_person  WHERE (ckztlb='01' OR ZZLX='z1') AND ajid = ${ajid}      
          ) 
       as gas_person_ 
     `;
      const res = await client.query(sql);
      return res.rows[0].sum;
    } finally {
      client.release();
    }
  },
  // 获取批次数量
  QueryBatchCount: async function(ajid) {
    const client = await global.pool.connect();
    try {
      let sql = `select count( DISTINCT batch)::int count from icap_base.st_data_source where ajid=${ajid}`;
      const res = await client.query(sql);
      return res.rows[0].count;
    } finally {
      client.release();
    }
  },
  // 获取调单数量
  QueryAwaitTaskCount: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await this.SwitchCase(client, ajid);
      let sql = `select count(id)::int count from gas_awaittask`;
      const res = await client.query(sql);
      return res.rows[0].count;
    } finally {
      client.release();
    }
  },
  // 查询数据中心列表信息
  QueryDataCenterTableInfo: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await this.SwitchCase(client, ajid);
      let sql = ` with m as 
         ( 
         SELECT a.* FROM icap_base.layout_table_info AS a join(select distinct relname from pg_class where relkind = 'r' and relnamespace in (select oid from pg_namespace where nspname in ('icap_${ajid}', 'icap_base'))) pc on pc.relname = a.tablename and a.isenable::bool=true 
         ), n as 
         ( 
         select* from icap_base.layout_table_info as b where b.tid in (select parentid from m) 
         union all 
         select* from m 
         ) 
         select* from n as lt 
         LEFT JOIN icap_base.layout_menu_model AS lm  ON lt.tid =lm.menu_tid and lm.product_code='200' ORDER BY tid,title`;
      let dataSum = 0;
      const res = await client.query(sql);
      console.log(sql);
      let list = [];
      for (let item of res.rows) {
        if (
          item.tid === "30" ||
          item.parentid === "30" ||
          item.tid === "40" ||
          item.parentid === "40"
        ) {
          continue;
        }
        let obj;
        if (item.parentid !== "-1") {
          let sql = "";
          if (item.tid === "1") {
            sql = `select count(1)::int count from ${item.tablename} where 1=1  AND (ckztlb='01' OR ZZLX='z1')`;
          } else if (item.tid === "2") {
            sql = `select count(1)::int count from ${item.tablename} where 1=1 AND (ckztlb='02' OR ZZLX='dz1') `;
          } else {
            sql = `select count(1)::int count from ${item.tablename} where 1=1`;
          }
          const res = await client.query(sql);
          if (res.rows.length > 0) {
            dataSum += res.rows[0].count;
          }
          obj = {
            parentid: parseInt(item.parentid),
            count: parseInt(res.rows[0].count),
            tid: parseInt(item.tid),
            tablename: item.tablename,
            title: item.title,
          };
        } else {
          obj = {
            parentid: parseInt(item.parentid),
            tid: parseInt(item.tid),
            tablename: item.tablename,
            title: item.title,
          };
        }
        list.push(obj);
      }
      return { list, dataSum };
    } finally {
      client.release();
    }
  },

  // 查询当前tid对应的模型库model_mids , product_code（不同产品进行区分模型）
  QueryModelmidsByTid: async function(tid) {
    const client = await global.pool.connect();
    try {
      let sql = ` SELECT model_mids,product_code FROM icap_base.layout_menu_model where length(model_mids)>0 and menu_tid='${tid}'`;
      const res = await client.query(sql);
      return res.rows.length > 0 ? res.rows[0].model_mids : "";
    } finally {
      client.release();
    }
  },

  // 根据模型库获取标名称
};
