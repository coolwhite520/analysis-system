import aes from "../aes";
import {machineId} from 'node-machine-id';

const path = require("path");
const fs = require("fs");
const electron = require("electron");
const md5 = require("md5-node")
const moment = require('moment')
const regedit = require('regedit')
const promisifiedRegedit = regedit.promisified
const regLicensePath = "HKCU\\SOFTWARE\\fund-analysis";
const regLicenseKeyName = "license"


const AppID = "@My_TrAnSLaTe_sErVeR"

const vbsDirectory = path.join(path.dirname(electron.remote.app.getPath('exe')), 'resources/regedit/vbs');
regedit.setExternalVBSLocation(vbsDirectory);

/**
 * 解析导入的授权文件
 * @param filePath
 * @returns {Promise<{data: null, success: boolean}|{data, success: boolean}>}
 */
async function parseLicenseByPath(filePath) {
    let ret = {success: true, data: null,}
    try {
        if (!fs.existsSync(filePath)) {
            ret.success = false;
            ret.data = "找不到授权文件"
        } else {
            const localSn = await machineId();
            const content = fs.readFileSync(filePath, "utf-8")
            let key = md5(localSn + AppID)
            let data = aes.decrypt256ByKey(content, key)
            data = JSON.parse(data)
            const {use_time_span, user_name, created_at, mark, sn} = data;
            if (
                typeof use_time_span == 'undefined' ||
                typeof user_name == 'undefined' ||
                typeof created_at == 'undefined' ||
                typeof mark == 'undefined' ||
                typeof sn == 'undefined'
            ) {
                ret.success = false;
                ret.data = "授权文件字段错误，请联系管理员重新授权"
            } else {
                if (isExpiredLicense(data)) {
                    ret.success = false;
                    ret.data = "授权已过期";
                } else {
                    ret.success = true;
                    ret.data = data;
                }
            }
        }
        return ret;
    } catch (e) {
        return {
            success: false,
            data: e.message
        }
    }
}


function isExpiredLicense(obj) {
    return obj.created_at + obj.use_time_span < moment().valueOf() / 1000
}


function isTryUseVersion(obj) {
    const { use_time_span } = obj;
    return use_time_span < moment.duration(1, "years").asSeconds();
}
/**
 * 本地的授权是否是有效的,如果有效返回授权对象，否则返回失效原因
 * @returns {Promise<{data: string, success: boolean}>}
 */
async function getRegLicense() {
    if (process.platform === "win32") {
        let obj = await readLicenseFromReg();
        if (!obj.success) {
            return obj;
        }
        return obj;
    } else {
        return {
            success: true,
            data: "not win32 system, do not check."
        };
    }
}

/**
 * 读取注册表并返回解密的数据对象
 * @returns {Promise<{data: string, success: boolean}|{data: any, success: boolean}|{data, success: boolean}>}
 */
async function readLicenseFromReg() {
    try {
        let ret = await getRegKeyValueSync(regLicensePath, regLicenseKeyName)
        if (ret.success) {
            const localSn = await machineId();
            let content = ret.data
            let key = md5(localSn + AppID)
            let data = await aes.decrypt256ByKey(content, key)
            data = JSON.parse(data);
            return {
                success: true,
                data
            }
        } else {
            return {
                success: false,
                data: "当前产品未激活，请发送机器码给授权方，然后导入授权文件进行激活."
            };
        }
    } catch (e) {
        return {
            success: false,
            data: e.message,
        };
    }
}

async function existRegKeyPath(regKeyPath) {
    return new Promise((resolve, reject) => {
        regedit.list([regKeyPath], (err, ret) => {
            if (err) {
                reject({
                    success: false,
                    data: err,
                })
            } else {
                if (!ret[regKeyPath].exists) {
                    resolve({
                        success: false,
                        data: 'success'
                    })
                } else {
                    resolve({
                        success: true,
                        data: 'success'
                    })
                }

            }
        })
    })
}

async function createRegKeySync(regKeyPath) {
    return new Promise((resolve, reject) => {
        regedit.createKey([regKeyPath], (err) => {
            if (err) {
                reject({
                    success: false,
                    data: err,
                })
            } else {
                resolve({
                    success: true,
                    data: 'success'
                })
            }
        })
    })
}

async function createRegKeyValueSync(regKeyPath, regKeyName, content) {
    return new Promise((resolve, reject) => {
        let value = {[regKeyPath]: {[regKeyName]: {value: content, type: 'REG_SZ'}},}
        regedit.putValue(value, (err) => {
            if (err) {
                reject({
                    success: false,
                    data: err,
                })
            } else {
                resolve({
                    success: true,
                    data: 'success'
                })
            }
        })
    })
}

async function getRegKeyValueSync(regKeyPath, regKeyValueName) {
    return new Promise((resolve, reject) => {
        regedit.list([regKeyPath], (err, ret) => {
            if (err) {
                reject({
                    success: false,
                    data: err,
                })
            } else {
                if (!ret[regKeyPath].exists || typeof ret[regKeyPath].values[regKeyValueName] === 'undefined') {
                    resolve({
                        success: false,
                        data: 'success'
                    })
                } else {
                    resolve({
                        success: true,
                        data: ret[regKeyPath].values[regKeyValueName].value
                    })
                }

            }
        })
    })
}


/**
 * 将授权信息的对象写入注册表
 * @param obj
 * @returns {Promise<Object>}
 */
async function writeLicenseToReg(obj) {
    try {
        let {data: existLicense, success: exist} = await getRegLicense();
        if (exist) {
            if (obj.sn === existLicense.sn && obj.created_at === existLicense.created_at) {
                return {
                    success: false,
                    data: "无法导入相同的授权."
                }
            }
        }
        let ret = await existRegKeyPath(regLicensePath)
        if (!ret.success) {
            await createRegKeySync(regLicensePath)
        }
        const localSn = await machineId();
        obj.activate_at = new Date().getTime() / 1000
        let data = JSON.stringify(obj);
        let key = md5(localSn + AppID)
        let content = aes.encrypt256ByKey(data, key)
        await createRegKeyValueSync(regLicensePath, regLicenseKeyName, content)
        return {
            success: true,
            data: obj,
        }
    } catch (e) {
        return {
            success: false,
            data: e.message,
        };
    }
}

async function getLocalMachineSn() {
    return await machineId();
}

export default {getLocalMachineSn, getRegLicense, parseLicenseByPath, writeLicenseToReg, isExpiredLicense, isTryUseVersion};
