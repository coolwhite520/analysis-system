import fs from "fs";
import aes from "../aes";
import path from "path";
import { remote } from "electron";
const log = require("@/utils/log");
const DB_FILE_NAME = "dbconfig.cfg";
const OTHER_FILE_NAME = "others.cfg";
class DbConfig {
  constructor(configPath) {
    this.configFilePath = path.join(configPath, DB_FILE_NAME);
    log.info(this.configFilePath);
    if (!fs.existsSync(this.configFilePath)) {
      let obj = {
        user: "", //"postgres",
        host: "127.0.0.1",
        database: "",
        password: "",
        port: 5432, //5432,
        max: 1000,
      };
      this.writeDbConfig(obj);
    }
  }
  /**
   * 读取数据库链接配置
   */
  readDbConfig() {
    if (fs.existsSync(this.configFilePath)) {
      let content = fs.readFileSync(this.configFilePath, "utf-8");
      let decodeContent = aes.decrypt(content);
      let configObj = JSON.parse(decodeContent);
      return configObj;
    } else {
      log.error("not find cfg file.");
      return null;
    }
  }
  // 写入配置
  writeDbConfig(configObj) {
    try {
      configObj.max = 1000;
      let content = aes.encrypt(JSON.stringify(configObj));
      fs.writeFileSync(this.configFilePath, content);
      return { success: true };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  }
}

export { DbConfig };
