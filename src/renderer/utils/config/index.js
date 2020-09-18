import fs from "fs";
import aes from "../aes";
import path from "path";
import { remote } from "electron";
const log = require("@/utils/log");
const DB_FILE_NAME = "dbconfig.cfg";
const OTHER_FILE_NAME = "others.cfg";
class DbConfig {
  constructor() {
    let configPath = remote.getGlobal("configPath");
    this.configFilePath = path.join(configPath, DB_FILE_NAME);
    if (!fs.existsSync(this.configFilePath)) {
      this.writeDbConfig("", "127.0.0.1", "gas_data", "", 5432);
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
    }
  }
  // 写入配置
  writeDbConfig(user, host, database, password, port) {
    try {
      let configObj = { user, host, database, password, port };
      let content = aes.encrypt(JSON.stringify(configObj));
      fs.writeFileSync(this.configFilePath, content);
      return { success: true };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  }
}

class OtherConfig {
  constructor() {
    try {
      let configPath = remote.getGlobal("configPath");
      this.configFilePath = path.join(configPath, OTHER_FILE_NAME);
      if (!fs.existsSync(this.configFilePath)) {
        this.writeConfig({});
      }
    } catch (e) {
      log.error(e);
    }
  }
  async addKeyValue(key, value) {
    try {
      let obj = await this.readConfig(this.configFilePath);
      obj[key] = value;
      await this.writeConfig(obj);
    } catch (e) {
      log.error(e);
    }
  }
  readConfig() {
    try {
      if (fs.existsSync(this.configFilePath)) {
        let content = fs.readFileSync(this.configFilePath, "utf-8");
        let decodeContent = aes.decrypt(content);
        let configObj = JSON.parse(decodeContent);
        return configObj;
      } else {
        log.error("not find cfg file.");
      }
    } catch (e) {
      log.error(e);
    }
  }
  // 写入配置
  writeConfig(obj) {
    try {
      let content = aes.encrypt(JSON.stringify(obj));
      fs.writeFileSync(this.configFilePath, content);
      return { success: true };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  }
}

export { DbConfig, OtherConfig };
