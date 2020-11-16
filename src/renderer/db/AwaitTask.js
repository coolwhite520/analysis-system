export default {
  queryAwaitTaskInfo: async function(ajid) {
    const client = await global.pool.connect();
    try {
      await this.SwitchCase(client, ajid);
      let sql = `SELECT * FROM  gas_awaittask awaitTask  WHERE  awaitTask.ajid = '${ajid}'`;
      const res = await client.query(sql);
      return { success: true, rows: res.rows };
    } catch (e) {
      return { success: false, rows: [], msg: e.message };
    } finally {
      client.release();
    }
  },
};
