const log = require("electron-log");
// const { remote } = require("electron");
// const path = require("path");
log.transports.file.level = true;
log.transports.console.level = true;
// let logPath = path.join(remote.getGlobal("configPath"), "analysis.log");
// log.info(logPath);
// log.transports.file.file = logPath;

module.exports = log;
