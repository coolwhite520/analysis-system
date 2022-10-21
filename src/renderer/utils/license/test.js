const crypto = require("crypto")
const { machineId, machineIdSync } = require('node-machine-id');
const md5 = require("md5-node")

const AppID = "@My_TrAnSLaTe_sErVeR"


function decrypt256ByKey(crypted, key) {
    crypted = Buffer.from(crypted, "base64").toString("binary");
    let decipher = crypto.createDecipheriv("aes-256-cbc", key, key.substr(0, 16));
    let decoded = decipher.update(crypted, "binary", "utf8");
    decoded += decipher.final("utf8");
    return decoded;
}



let sn = machineIdSync()
console.log(sn)

let key = md5(sn + AppID)
console.log(key)


let content = "HVwhRrMXP9agF9vjR+TC/Z9LrIszZPq0mtMZhCG1p5N5m9qh2AeQ22e27taCl06YUMRVFq170FldE/LN76ghpBoZT+vrqvbjyHqScozOkMgPstobIBRTxYidQkJBXybhnn/tIOvVweWhMwNAtEXOKC/3kabqZPl1e2dDxtuuLzuonCVPOqRTZ6L7tAg7UKBtWe7jpatnWUiuYezOC/fFw9VURfrDDBzHJ+p6b+iEOV8="
let s = decrypt256ByKey(content, key)
console.log(s)