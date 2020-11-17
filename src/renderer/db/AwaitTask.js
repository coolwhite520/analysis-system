import Cases from "./Cases";
export default {
  QueryAwaitTaskInfo: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      let sql = `SELECT * FROM  gas_awaittask awaitTask  WHERE  awaitTask.ajid = '${ajid}'`;
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } finally {
      client.release();
    }
  },
  // 个人：CKZJLXPERSON 单位：CKZJLXUNIT
  QueryZzTypeList: async function(typeStr) {
    const client = await global.pool.connect();
    try {
      await Cases.SwitchDefaultCase(client);
      let sql = `SELECT PARENT_ID,ENABLED,ITEM_CODE,ITEM_NAME FROM st_dictionary t WHERE t.PARENT_ID in (select ID from st_dictionary WHERE ITEM_CODE='${typeStr}') `;
      console.log(sql);
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } finally {
      client.release();
    }
  },
  QueryHaveSameInfo: async function(
    ajid,
    zz_code,
    zz_name,
    jyhm,
    task_type,
    yh_name,
    cxzh,
    zh_ztlb_name
  ) {
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      let sql;
      if (task_type === "1" || task_type === "2") {
        sql = `SELECT COUNT(*)::int count FROM gas_awaittask WHERE zz_code='${zz_code}'and zz_name='${zz_name}' and jyhm='${jyhm}' and task_type='${task_type}' `;
      } else {
        sql = `SELECT COUNT(*)::int count FROM gas_awaittask WHERE yh_name='${yh_name}'and cxzh='${cxzh}' and zh_ztlb_name='${zh_ztlb_name}' and task_type='账卡号'`;
      }
      console.log(sql);
      const res = await client.query(sql);
      return { success: true, havesame: res.rows[0].count > 0 };
    } finally {
      client.release();
    }
  },
  DeleteAwaitTask: async function(ajid, ids) {
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      let sql;
      sql = `DELETE FROM gas_awaittask WHERE ID in (${ids})`;
      console.log(sql);
      const res = await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },
  InsertNewAwaitTask: async function(
    ajid,
    zz_code,
    zz_name,
    jyhm,
    task_type,
    yh_name,
    cxzh,
    zh_ztlb_name
  ) {
    let sql;
    if (task_type === "1") {
      sql = ` INSERT INTO gas_awaittask(ajid, yh_name, zz_code, zz_name, zh_ztlb, zh_ztlb_name, tjsj, tjrw, task_type, type_id, jyhm, target, xgsj) 
      VALUES(
      '${ajid}',
      '请选择银行...', 
      '${zz_code}', 
      '${zz_name}',
      '01', 
      '人员', 
      '${new Date().Format("yyyy-MM-dd hh:mm:ss")}',
      '00000000',
      '1',
      '01', 
      '${jyhm}',
      '人员信息',
      '${new Date().Format("yyyy-MM-dd hh:mm:ss")}'
      ); `;
    } else if (task_type === "2") {
      sql = ` INSERT INTO gas_awaittask(ajid, yh_name, zz_code, zz_name, zh_ztlb, zh_ztlb_name, tjsj, tjrw, task_type, type_id, jyhm, target, xgsj) 
      VALUES(
      '${ajid}',
      '请选择银行...', 
      '${zz_code}', 
      '${zz_name}',
      '02', 
      '单位', 
      '${new Date().Format("yyyy-MM-dd hh:mm:ss")}',
      '00000000',
      '2',
      '02', 
      '${jyhm}',
      '单位信息',
      '${new Date().Format("yyyy-MM-dd hh:mm:ss")}'
      ); `;
    } else {
      let zh_ztlb = zh_ztlb_name === "个人" ? "01" : "02";
      let target = zh_ztlb + yh_name;
      sql = `INSERT INTO gas_awaittask(ajid, cxzh, yh_code, yh_name,zh_ztlb, zh_ztlb_name, tjsj, tjrw, task_type, type_id, jyhm, target, xgsj) 
      VALUES(
        '${ajid}',
        '${cxzh}',  
        '',  
        '${yh_name}', 
        '${zh_ztlb}',
        '${zh_ztlb_name}', 
        '${new Date().Format("yyyy-MM-dd hh:mm:ss")}',
        '00000000',
        '账卡号',
        '3', 
        '${jyhm}',
        '${target}',
        '${new Date().Format("yyyy-MM-dd hh:mm:ss")}');  `;
    }
    console.log(sql);
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },

  UpdateAwaitTaskById: async function(
    id,
    ajid,
    zz_code,
    zz_name,
    jyhm,
    task_type,
    yh_name,
    cxzh,
    zh_ztlb_name
  ) {
    let sql;
    if (task_type === "1") {
      sql = `UPDATE gas_awaittask SET zz_code = '${zz_code}',zz_name = '${zz_name}',tjrw = '00000000', jyhm = '${jyhm}', xgsj = '${new Date().Format(
        "yyyy-MM-dd hh:mm:ss"
      )}' WHERE id = ${id};`;
    } else if (task_type === "2") {
      sql = `UPDATE gas_awaittask SET zz_code = '${zz_code}',zz_name = '${zz_name}',tjrw = '00000000', jyhm = '${jyhm}', xgsj = '${new Date().Format(
        "yyyy-MM-dd hh:mm:ss"
      )}' WHERE id = ${id};`;
    } else {
      let zh_ztlb = zh_ztlb_name === "个人" ? "01" : "02";
      let target = zh_ztlb + yh_name;
      sql = `UPDATE gas_awaittask 
      SET cxzh = '${cxzh}',
      yh_name = '${yh_name}',
      zh_ztlb = '${zh_ztlb}',
      zh_ztlb_name='${zh_ztlb_name}',
      tjrw = '00000000',
      jyhm = '${jyhm}',
      xgsj = '${new Date().Format("yyyy-MM-dd hh:mm:ss")}',
      target= '${target}',
      WHERE id = ${id};`;
    }
    console.log(sql);
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },
  // 在待调单模型库的表中点击 【添加待调单】
  QueryHaveSameInfoInModelTable: async function(ajid, cxzh) {
    let sql = `SELECT COUNT(*)::int count FROM gas_awaittask
     WHERE ajid=${ajid} and type_id=3 AND CXZH ='${cxzh}'`;
    console.log(sql);
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      let res = await client.query(sql);
      return { success: true, havesame: res.rows[0].count > 0 };
    } finally {
      client.release();
    }
  },
  // 在待调单模型库的表中点击 【添加待调单】
  InsertNewAwaitTaskToTable: async function(ajid, cxzh, jyhm, tid) {
    let sql;
    switch (tid) {
      case "251":
        sql = `INSERT INTO gas_awaittask (ajid, CXZH, YH_CODE, YH_NAME, ZZ_CODE, ZZ_NAME,ZH_ZTLB,ZH_ZTLB_NAME, TJSJ,XGSJ, TJRW,TASK_TYPE,TYPE_ID, JYHM, TARGET)
        VALUES ('${ajid}','${cxzh}','','','','','01','个人','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','00000000','账卡号','3','${jyhm}','主要人员未调单对手账户'); `;
        break;
      case "252":
        sql = `INSERT INTO gas_awaittask (ajid, CXZH, YH_CODE, YH_NAME, ZZ_CODE, ZZ_NAME,ZH_ZTLB,ZH_ZTLB_NAME, TJSJ,XGSJ, TJRW,TASK_TYPE,TYPE_ID, JYHM, TARGET) 
        VALUES ('${ajid}','${cxzh}','','','','','01','个人','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','00000000','账卡号','3','${jyhm}','大额交易对手未调单账户'); `;
        break;
      case "253":
        sql = `INSERT INTO gas_awaittask (ajid, CXZH, YH_CODE, YH_NAME, ZZ_CODE, ZZ_NAME,ZH_ZTLB,ZH_ZTLB_NAME, TJSJ,XGSJ, TJRW,TASK_TYPE,TYPE_ID, JYHM, TARGET) 
        VALUES ('${ajid}','${cxzh}','','','','','02','单位','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','00000000','账卡号','3','${jyhm}','大额获利对手未调单账户'); `;
        break;
      case "254":
        sql = `INSERT INTO gas_awaittask (ajid, CXZH, YH_CODE, YH_NAME, ZZ_CODE, ZZ_NAME,ZH_ZTLB,ZH_ZTLB_NAME, TJSJ,XGSJ, TJRW,TASK_TYPE,TYPE_ID, JYHM, TARGET) 
        VALUES ('${ajid}','${cxzh}','','','','','01','个人','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','00000000','账卡号','3','${jyhm}','主要关联对手未调单账户'); `;
        break;
      case "255":
        sql = `INSERT INTO gas_awaittask (ajid, CXZH, YH_CODE, YH_NAME, ZZ_CODE, ZZ_NAME,ZH_ZTLB,ZH_ZTLB_NAME, TJSJ,XGSJ, TJRW,TASK_TYPE,TYPE_ID, JYHM, TARGET)
         VALUES ('${ajid}','${cxzh}','','','','','02','单位','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','${new Date().Format(
          "yyyy-MM-dd hh:mm:ss"
        )}','00000000','账卡号','3','${jyhm}','即进即出对手未调单账户'); `;
        break;
    }
    const client = await global.pool.connect();
    try {
      await Cases.SwitchCase(client, ajid);
      let res = await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },
};
