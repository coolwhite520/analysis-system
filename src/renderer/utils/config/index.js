import fs from "fs";
import aes from "../aes";
import path from "path";
import { remote } from "electron";
const FILE_NAME = "dbconfig.cfg";

class DbConfig {
  constructor() {
    let configPath = remote.getGlobal("configPath");
    this.configFilePath = path.join(configPath, FILE_NAME);
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
      throw new Error("not find cfg file.");
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
      console.log(e);
      return { success: false, msg: e.message };
    }
  }
}

export { DbConfig };
