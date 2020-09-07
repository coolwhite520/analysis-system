const fs = require("fs");
// 小写字母转换设定快捷键 cmd+alt+s
// 获取案件相关的内容
export default {
  // 切换Schema， 一个schema 可以认为是一个案件
  SwitchCase: async function(ajid) {
    let sql = `SET search_path TO icap_${ajid}`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.command === "SET" ? true : false;
  },
  SwitchDefaultCase: async function() {
    let sql = `SET search_path TO icap_base`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.command === "SET" ? true : false;
  },
  CreateNewCaseSchema: async function(ajid, userName) {
    let scheamName = `icap_${ajid}`;
    let sql = `create SCHEMA if not exists ${scheamName} AUTHORIZATION ${userName}`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.command === "CREATE" ? scheamName : "";
  },
  // 删除案件
  DropCaseByID: async function(ajid) {
    try {
      await this.SwitchCase(ajid);
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
      let res = await global.db.query(sql);
      console.log(sql, res);
      await this.SwitchDefaultCase();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  // 查询案件状态列表下拉信息
  QueryCaseState: async function() {
    await this.SwitchDefaultCase();
    let sql = `SELECT ID::int, ITEM_CODE, ITEM_NAME, DESCN FROM st_dictionary WHERE PARENT_ID = 5  ORDER BY thesort; `;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows; // id, item_code, item_name,
  },
  // 获取案件类别下拉信息
  QueryCaseCategory: async function() {
    await this.SwitchDefaultCase();
    let sql = `SELECT chargeid::int, parent_id::int, leaf_flag::int, chargename FROM st_charge ORDER BY thesort DESC `;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows;
  },
  // 获取已经存在的case
  QueryExistCases: async function() {
    await this.SwitchDefaultCase();
    let sql = `SELECT * FROM st_case WHERE CJR in('00000000','00000000') AND SFSC='0'  ORDER  BY AJID DESC `;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows;
  },
  // 根据id获取案件详细信息
  QueryCaseDetailByID: async function(ajid) {
    await this.SwitchDefaultCase();
    let sql = `SELECT * FROM st_case WHERE CJR in('00000000','00000000') AND SFSC='0' AND AJID=${ajid}  ORDER  BY AJID DESC `;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows[0];
  },
  //根据子案件id获取父案件的id
  QueryParentAjidByChildID: async function(childAjid) {
    await this.SwitchDefaultCase();
    let sql = `SELECT parent_id::int FROM st_charge where chargeid=${childAjid}`;
    const res = await global.db.query(sql);
    console.log(sql, res.rows[0]);
    return res.rows[0].parent_id;
  },
  // 查询最大案件编号
  QueryCaseMaxCount: async function() {
    await this.SwitchDefaultCase();
    let sql = `SELECT MAX(AJID)::int FROM st_case`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows[0].max === null ? 0 : res.rows[0].max;
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
    try {
      await this.SwitchDefaultCase();
      let sql = `UPDATE st_case SET
      AJBH=$1, AJMC=$2, AJLB=$3, AJLBMC=$4, ZCJDDM=$5, ZCJDMC=$6, CJSJ=$7, JJSJ=$8, XGSJ=$9,
      ASJFSDDXZQHDM=$10,ASJFSDDXZQMC=$11,JYAQ=$12,ZHAQ=$13,CJR=$14,SFSC=$15,SFBDWKJ=$16,SJLX=$17 where AJID=${ajid};`;
      let res = await global.db.query(sql, params);
      console.log(sql, res);
      return true;
    } catch (e) {
      console.log(e);
      return false;
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
    try {
      let ajid = (await this.QueryCaseMaxCount()) + 1;
      let scheamName = await this.CreateNewCaseSchema(ajid, "baiyang");
      if (scheamName) {
        let content = fs.readFileSync("./static/createNewCase.sql", "utf-8");
        await this.SwitchCase(ajid);
        await global.db.query(content);
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
        let sql = `INSERT INTO st_case(AJID,AJBH,AJMC,AJLB,AJLBMC,ZCJDDM,ZCJDMC,CJSJ,JJSJ,XGSJ,ASJFSDDXZQHDM,ASJFSDDXZQMC,JYAQ,ZHAQ,CJR,SFSC,SFBDWKJ,SJLX) VALUES(${paramsString})`;
        await this.SwitchDefaultCase();
        console.log(params);
        let res = await global.db.query(sql, params);
        console.log(sql, res);
      } else {
        console.log("exist");
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  // 获取实体数量
  QueryEntityCount: async function(ajid) {
    await this.SwitchCase(ajid);
    let sql = `select sum(count)::int 
    from ( 
       SELECT count(*) FROM  gas_person  WHERE (ckztlb='02' OR ZZLX='dz1') AND ajid = ${ajid}    
       union all 
       SELECT count(*) FROM  gas_person  WHERE (ckztlb='01' OR ZZLX='z1') AND ajid = ${ajid}      
        ) 
     as gas_person_ 
   `;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows[0].sum;
  },
  // 获取批次数量
  QueryBatchCount: async function(ajid) {
    let sql = `select count( DISTINCT batch)::int count from st_data_source where ajid=${ajid}`;
    await this.SwitchDefaultCase();
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows[0].count;
  },
  // 获取调单数量
  QueryAwaitTaskCount: async function(ajid) {
    await this.SwitchCase(ajid);
    let sql = `select count(id)::int count from gas_awaittask`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows[0].count;
  },
  // 查询数据中心列表信息
  QueryDataCenterTableInfo: async function(ajid) {
    try {
      await this.SwitchCase(ajid);
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
      console.log(sql);
      const res = await global.db.query(sql);
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
          const res = await global.db.query(sql);
          if (res.rows.length > 0) {
            dataSum += res.rows[0].count;
          }
          obj = {
            parentid: item.parentid,
            count: res.rows[0].count,
            tid: item.tid,
            tablename: item.tablename,
            title: item.title,
          };
        } else {
          obj = {
            parentid: item.parentid,
            tid: item.tid,
            tablename: item.tablename,
            title: item.title,
          };
        }
        list.push(obj);
      }
      return { list, dataSum };
    } catch (e) {
      console.log(e);
    }
  },

  // 查询当前tid对应的模型库model_mids , product_code（不同产品进行区分模型）
  QueryModelmidsByTid: async function(tid) {
    await this.SwitchDefaultCase();
    let sql = ` SELECT model_mids,product_code FROM layout_menu_model where length(model_mids)>0 and menu_tid='${tid}'`;
    const res = await global.db.query(sql);
    console.log(sql, res);
    return res.rows.length > 0 ? res.rows[0].model_mids : "";
  },

  // 根据模型库获取标名称
};
