const regedit = require('regedit')

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
    return new Promise( (resolve, reject) => {
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
    return new Promise( (resolve, reject) => {
        let value = {[regKeyPath]: { [regKeyName]: { value: content, type: 'REG_SZ'} },}
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

(async () => {
    try {
        let regPath = "HKCU\\SOFTWARE\\fund-analysis"
        let ret = await existRegKeyPath(regPath)
        if (ret.success) {
            console.log("exist")
        } else {
            console.log("not exist")
            let ret = await createRegKeySync(regPath)
            console.log(ret)
        }
        ret = await createRegKeyValueSync(regPath, 'license', "hahahaha")
        console.log(ret)
    } catch (e) {
        console.log(e)
    }

})()