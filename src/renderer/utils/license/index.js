import aes from "../aes";
import {machineId} from 'node-machine-id';
const path = require("path");
const fs = require("fs");
const electron = require("electron");
const md5 = require("md5-node")
const moment = require('moment')
const regedit = require('regedit').promisified

const vbsDirectory = path.join(path.dirname(electron.remote.app.getPath("exe")), "resources/regedit/vbs");
regedit.setExternalVBSLocation(vbsDirectory);

const regLicensePath = "HKLM\\SOFTWARE\\fund-analysis\\license";
const regLicenseKeyName = "content"

const AppID = "@My_TrAnSLaTe_sErVeR"

/**
 *
 * @returns 获取本机机器码
 */
async function getLocalMachineSn() {
    return await machineId();
}

/**
 * 解析导入的授权文件
 * @param filePath
 * @returns {Promise<{data: null, success: boolean}|{data, success: boolean}>}
 */
async function parseLicenseByPath(filePath) {
    let ret = { success: true, data: null, }
    try {
        let localSn = await getLocalMachineSn()
        if (!fs.existsSync(filePath)) {
            ret.success = false;
            ret.data = "找不到授权文件"
        } else {
            const content = fs.readFileSync(filePath, "utf-8")
            let key = md5(localSn + AppID)
            let data = aes.decrypt256ByKey(content, key)
            data = JSON.parse(data)
            const { use_time_span, user_name, created_at, mark, sn } = data;
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
                if( isExpiredLicense(data)) {
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

/**
 * 本地的授权是否是有效的
 * @returns {Promise<{data: string, success: boolean}>}
 */
async function validateLicense() {
    if (process.platform === "win32") {
        let obj = await readLicenseFromReg();
        if (!obj.success) {
            return obj;
        }
        if(isExpiredLicense(data)) {
           return {
               success: true,
               data: "授权已经过期",
           }
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
        let ret = await regedit.list(regLicensePath);
        if (ret) {
            let content = ret[regLicensePath].values[regLicenseKeyName].value;
            let localSn = await getLocalMachineSn()
            let key = md5(localSn + AppID)
            let data = await aes.decrypt256ByKey(content, key)
            return {
                success: true,
                data: JSON.parse(data)
            }
        } else {
            return {
                success: false,
                data: "not found."
            };
        }
    } catch (e) {
        return {
            success: false,
            data: e.message,
        };
    }
}

/**
 * 将授权信息的对象写入注册表
 * @param obj
 * @returns {Promise<Object>}
 */
async function writeLicenseToReg(obj) {
    try {
        obj.activate_at = moment().format("YYYY-MM-DD HH:mm:ss")
        let data = JSON.stringify(obj);
        let localSn = await getLocalMachineSn()
        let key = md5(localSn + AppID)
        let content = await aes.encrypt256ByKey(data, key)
        await regedit.createKey([regLicensePath])
        await regedit.putValue({
            [regLicensePath]: { [regLicenseKeyName]: { value: content, type: 'REG_SZ'} },
        })
        return {
            success: true,
            data: "success"
        };
    } catch (e) {
        return {
            success: false,
            data: e.message,
        };
    }

}


export default { getLocalMachineSn, validateLicense, parseLicenseByPath, writeLicenseToReg };
