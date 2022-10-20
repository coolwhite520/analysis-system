import aes from "../aes";
const path = require("path");
const fs = require("fs");
const electron = require("electron");
import { machineId } from 'node-machine-id';

/**
 * 
 * @returns 获取本机机器码
 */
async function getLocalMachineSn() {
    return await machineId();
}

async function parseLicenseByPath(filePath) {
    let ret = {
        success: true,
        data: null,
    }
    try {
        if (!fs.existsSync(filePath)) {
            ret.success = false;
            ret.data = "找不到授权文件"
        } else {
            const content = fs.readFileSync(filePath, "utf-8")
            console.log(content)
            let data = aes.decrypt(content)
            ret.data = JSON.parse(data)
        }
        return ret;
    } catch (e) {
        return {
            success: false,
            data: e.message
        }
    }
}
async function generateLicense(obj) {
    let jsonStr = JSON.stringify(obj)
    return aes.encrypt(jsonStr)
}

async function parseLicense() {
    let sn = await getLocalMachineSn()
    let ret = {
        success: true,
        data: null,
    }
    try {
        const basePath = path.dirname(electron.remote.app.getPath("exe"))
        const filename = "license.txt"
        const licenseFilePath = path.resolve(basePath, filename)
        console.log(licenseFilePath)
        if (!fs.existsSync(licenseFilePath)) {
            ret.success = false;
            ret.data = "本地授权文件缺失，请导入授权文件."
        } else {
            const content = fs.readFileSync(licenseFilePath)
            let data = aes.decrypt(content)
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

export default { generateLicense, getLocalMachineSn, parseLicense, parseLicenseByPath };
