import aes from "../aes";
const path = require("path");
const fs = require("fs");
const electron = require("electron");
import { machineId } from 'node-machine-id';
const md5 = require("md5-node")
const moment = require('moment')

const AppID = "@My_TrAnSLaTe_sErVeR"

/**
 * 
 * @returns 获取本机机器码
 */
async function getLocalMachineSn() {
    return await machineId();
}

/**
 * 生成
 * @param {*} obj 
 * @returns 
 */
async function generateLicense(obj) {
    let jsonStr = JSON.stringify(obj)
    return aes.encrypt(jsonStr)
}


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
                ret.success = true;
                ret.data = data;
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

function formatLicense(data) {
    const { use_time_span, user_name, created_at, mark, sn } = data;
    let month = moment.duration(parseInt(use_time_span), "seconds").asMonths().toFixed()
    if (use_time_span >= 3600 * 24 * 30 * 12) {
        data.version = '正式版'
    } else {
        data.version = '测试版'
    }
    data.use_time_span = month > 240 ? `永久` : `${month} 个月`
    data.activate_at = moment().format("YYYY-MM-DD HH:mm:ss")
    data.created_at = moment(created_at * 1000).format("YYYY-MM-DD HH:mm:ss")
    data.expired_at = moment((created_at + use_time_span) * 1000).format("YYYY-MM-DD HH:mm:ss")
    return data;
}

async function parseLicense() {
    let ret = { success: true, data: null, }
    try {
        let sn = await getLocalMachineSn()
        const basePath = path.dirname(electron.remote.app.getPath("exe"))
        const filename = "license.txt"
        const licenseFilePath = path.resolve(basePath, filename)
        console.log(licenseFilePath)
        if (!fs.existsSync(licenseFilePath)) {
            ret.success = false;
            ret.data = "本地授权文件缺失，请导入授权文件."
        } else {
            const content = fs.readFileSync(licenseFilePath)
            let key = md5(sn + AppID)
            let data = aes.decrypt256ByKey(content, key)
            // 是否是本机器的授权码
            if (data.sn != sn) {
                ret.success = false
                ret.data = "此授权码不属于本机器."
            }
            // 判断授权是否过期
            else if (data.expireTime < new Date().getTime()) {
                ret.success = false
                ret.data = "授权已经过期."
            } else {
                ret.data = JSON.parse(data)
            }
        }
        return ret;
    } catch (e) {
        return {
            success: false,
            data: "授权文件错误"
        }
    }
}



async function writeIntoReg(obj) {

}

export default { generateLicense, getLocalMachineSn, parseLicense, parseLicenseByPath, formatLicense };
