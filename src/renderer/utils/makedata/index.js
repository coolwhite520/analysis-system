import Default from "@/utils/sql/Default.js";

const swithLineColor = false;

function makeData(tableData) {
    // 数据可视化
    let data;
    if (tableData.tableType === "dataVisible") {
        data = makeDataVisible(tableData);
    } else if (tableData.tableType === "zjctGraph") {
        // 资金透视模型图
        data = makeDataZjCt(tableData);
    } else {
        // 其他发现模型
        data = makeDataNormal(tableData);
    }
    return data;
}

function calculateLineColorByJinE(tableData, jinE) {
    if (!swithLineColor) {
        return "black";
    }
    let moneyList = Default.graphicMoneySectionList;
    for (let i = 0; i < moneyList.length; i++) {
        let item = moneyList[i];
        let value = item.value * 10000;
        if (item.id === "1") {
            if (jinE < value) {
                return item.selected ? item.color : "";
            }
        } else if (item.id === "4") {
            if (jinE > value) {
                return item.selected ? item.color : "";
            }
        } else {
            let preItem = moneyList[i - 1];
            let nextItem = moneyList[i + 1];
            let preValue = preItem.value * 10000;
            let nextValue = nextItem.value * 10000;
            if (jinE >= preValue && jinE <= value) {
                return item.selected ? item.color : "";
            }
            if (jinE >= value && jinE <= nextValue) {
                return nextItem.selected ? nextItem.color : "";
            }
        }
    }
}

function makeDataZjCt(tableData) {
    let nodes = tableData.originGraphData.nodes.map((node) => {
        let {
            CardNo,
            FieldName,
            IdentityNo,
            IsRoot,
            UniqueKey,
            Username,
        } = node;
        return {
            key: UniqueKey,
            kh: CardNo,
            name: Username,
            text: CardNo + "\n" + Username,
        };
    });
    let links = [];
    tableData.originGraphData.links.forEach((link) => {
        let {
            source,
            target,
            tradeMoney,
            tradeTime,
            tradeCount,
            dataType,
        } = link;
        let lineColor = calculateLineColorByJinE(tableData, tradeMoney);
        if (lineColor !== "") {
            links.push({
                dataType,
                from: source,
                to: target,
                je: tradeMoney,
                bs: parseInt(tradeCount),
                rq: tradeTime,
                text:
                    dataType === 0
                        ? `${tradeMoney}元（${tradeTime}）`
                        : `${tradeMoney}元（${tradeCount}笔）`,

                stroke: lineColor,
            });
        }
    });

    return { nodes, links };
}

function makeDataNormal(tableData) {
    switch (tableData.tid) {
        case 202:
            return makeData202(tableData);
            break;
        case 203:
            return makeData203(tableData);
            break;
        case 213:
            return makeData213(tableData);
            break;
        case 218:
            return makeData218(tableData);
            break;
        default:
            return { nodes: [], links: [] };
            break;
    }
}
function makeData218(tableData) {
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let acxkh = row["acxkh"];
        let ajyje = parseFloat(row["ajyje"]);
        let ajymc = row["ajymc"];
        let ajysj = row["ajysj"];

        let bcxkh = row["bcxkh"];
        let bjyje = parseFloat(row["bjyje"]);
        let bjymc = row["bjymc"];
        let bjysj = row["bjysj"];

        let ccxkh = row["ccxkh"];
        let cjymc = row["cjymc"];

        let data1 = {
            key: jymc,
            kh: jymc,
            name: jymc,
            text: jymc,
            tid: tableData.tid, //tableid
        };
        let data2 = {
            key: jydfmc,
            kh: jydfmc,
            name: jydfmc,
            text: jydfmc,
            tid: tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);
    });
    return { nodes, links };
}
function makeData213(tableData) {
    // 重点交易对手团伙发现：参数 金额，笔数。参数可设置团伙分类 以 主体名称（JYMCGROUP），证件号码（JYZJHMGROUP），卡号（CXKHGROUP） 划分
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let jymc =
            row[
            `${tableData.selectCondition.SelectThType.ThId.toLowerCase()}`
            ];
        let jydfmc =
            row[
            `${tableData.selectCondition.SelectThType.DsThId.toLowerCase()}`
            ];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
            key: jymc,
            name: jymc,
            text: jymc,
            tid: tableData.tid, //tableid
        };
        let data2 = {
            key: jydfmc,
            name: jydfmc,
            text: jydfmc,
            tid: tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let templinks = [];
        if (czje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, czje);
            let link1 = {
                tid: tableData.tid,
                from: jymc,
                to: jydfmc,
                je: czje,
                bs: czbs,
                text: `${czje}元（${czbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, jzje);
            let link2 = {
                tid: tableData.tid,
                from: jydfmc,
                to: jymc,
                je: jzje,
                bs: jzbs,
                text: `${jzje}元（${jzbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
            links.push(...templinks);
        }
    });
    return { nodes, links };
}
function makeData203(tableData) {
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
            key: jymc,
            kh: jymc,
            name: jymc,
            text: jymc,
            tid: tableData.tid, //tableid
        };
        let data2 = {
            key: jydfmc,
            kh: jydfmc,
            name: jydfmc,
            text: jydfmc,
            tid: tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let templinks = [];
        if (czje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, czje);
            let link1 = {
                tid: tableData.tid,
                from: jymc,
                to: jydfmc,
                je: czje,
                bs: czbs,
                text: `${czje}元（${czbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, jzje);
            let link2 = {
                tid: tableData.tid,
                from: jydfmc,
                to: jymc,
                je: jzje,
                bs: jzbs,
                text: `${jzje}元（${jzbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
            links.push(...templinks);
        }
    });

    return { nodes, links };
}
function makeData202(tableData) {
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let cxkh = row["cxkh"];
        let jymc = row["jymc"];
        let jydfzkh = row["jydfzkh"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
            tid: tableData.tid,
            key: cxkh + "\n" + jymc,
            kh: cxkh,
            name: jymc,
            text: cxkh + "\n" + jymc,
        };
        let data2 = {
            tid: tableData.tid,
            key: jydfzkh + "\n" + jydfmc,
            kh: jydfzkh,
            name: jydfmc,
            text: jydfzkh + "\n" + jydfmc,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);

        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);
        // 画线
        let templinks = [];
        if (czje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, czje);
            let link1 = {
                tid: tableData.tid,
                from: cxkh + "\n" + jymc,
                to: jydfzkh + "\n" + jydfmc,
                je: czje,
                bs: czbs,
                text: `${czje}元（${czbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
            let lineColor = calculateLineColorByJinE(tableData, jzje);
            let link2 = {
                tid: tableData.tid,
                from: jydfzkh + "\n" + jydfmc,
                to: cxkh + "\n" + jymc,
                je: jzje,
                bs: jzbs,
                text: `${jzje}元（${jzbs}笔）`,
                stroke: lineColor,
            };
            if (lineColor !== "") templinks.push(link2);
        }
        links.push(...templinks);
    });
    return { nodes, links };
}


function makeDataVisible(tableData) {
    switch (tableData.tid) {
        case 202:
            return makeDataVisible202(tableData);
            break;
        case 203:
            return makeDataVisible203(tableData);
            break;
        case 204:
            return makeDataVisible204(tableData);
            break;
        default:
            return { nodes: [], links: [] };
    }
}
function makeDataVisible204(tableData) {
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let jyzjhm = row["jyzjhm"];
        let jydfzjhm = row["jydfzjhm"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let jczce = parseFloat(row["jczce"]);
        let data1 = {
            key: (jymc + "\n" + jyzjhm).trim(),
            name: jymc,
            text: (jymc + "\n" + jyzjhm).trim(),
            tid: tableData.tid, //tableid
        };
        let data2 = {
            key: (jydfmc + "\n" + jydfzjhm).trim(),
            name: jydfmc,
            text: (jydfmc + "\n" + jydfzjhm).trim(),
            tid: tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let tempEdges = [];
        if (tableData.selectShowTypeValue === "1") {
            if (czje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, czje);
                let link1 = {
                    tid: tableData.tid,
                    from: (jymc + "\n" + jyzjhm).trim(),
                    to: (jydfmc + "\n" + jydfzjhm).trim(),
                    je: czje,
                    bs: czbs,
                    text: `${czje}元（${czbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link1);
            }
            if (jzje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, jzje);
                let link2 = {
                    tid: tableData.tid,
                    from: (jydfmc + "\n" + jydfzjhm).trim(),
                    to: (jymc + "\n" + jyzjhm).trim(),
                    je: jzje,
                    bs: jzbs,
                    text: `${jzje}元（${jzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link2);
            }
        } else {
            if (jczce !== 0) {
                let lineColor = calculateLineColorByJinE(tableData, jczce);
                let link2 = {
                    tid: tableData.tid,
                    from: (jydfmc + "\n" + jydfzjhm).trim(),
                    to: (jymc + "\n" + jyzjhm).trim(),
                    je: jczce,
                    bs: jyzbs,
                    text: `净${jczce}元（${jyzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link2);
            }
        }

        if (tempEdges.length > 0) {
            links.push(...tempEdges);
        }
    });
    return { nodes, links };
}
function makeDataVisible203(tableData) {
    let nodes = [];
    let links = [];
    tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let jczce = parseFloat(row["jczce"]); // 进出帐差额
        let data1 = {
            key: jymc,
            kh: jymc,
            name: jymc,
            text: jymc,
            tid: tableData.tid, //tableid
        };
        let data2 = {
            key: jydfmc,
            kh: jydfmc,
            name: jydfmc,
            text: jydfmc,
            tid: tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let tempEdges = [];
        if (tableData.selectShowTypeValue === "1") {
            if (czje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, czje);
                let link1 = {
                    tid: tableData.tid,
                    from: jymc,
                    to: jydfmc,
                    je: czje,
                    bs: czbs,
                    text: `${czje}元（${czbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link1);
            }
            if (jzje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, jzje);
                let link2 = {
                    tid: tableData.tid,
                    from: jydfmc,
                    to: jymc,
                    je: jzje,
                    bs: jzbs,
                    text: `${jzje}元（${jzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link2);
            }
        } else {
            if (jczce !== 0) {
                let lineColor = calculateLineColorByJinE(tableData, jczce);
                let link2 = {
                    tid: tableData.tid,
                    from: jydfmc,
                    to: jymc,
                    je: jczce,
                    bs: jyzbs,
                    label: `净${jczce}元（${jyzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link2);
            }
        }

        if (tempEdges.length > 0) {
            links.push(...tempEdges);
        }
    });
    return { nodes, links };
}
function makeDataVisible202(tableData) {
    let nodes = [];
    let links = [];
    // 汇总
    tableData.allrows.forEach((row) => {
        let cxkh = row["cxkh"];
        let jymc = row["jymc"];
        let jydfzkh = row["jydfzkh"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let jczce = parseFloat(row["jczce"]); // 进出帐差额
        let data1 = {
            tid: tableData.tid,
            key: (cxkh + "\n" + jymc).trim(),
            kh: cxkh,
            name: jymc,
            text: (cxkh + "\n" + jymc).trim(),
        };
        let data2 = {
            tid: tableData.tid,
            key: (jydfzkh + "\n" + jydfmc).trim(),
            kh: jydfzkh,
            name: jydfmc,
            text: (jydfzkh + "\n" + jydfmc).trim(),
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
            if (item.key === data1.key) {
                bFindData1 = true;
                break;
            }
        }
        if (!bFindData1) nodes.push(data1);

        for (let item of nodes) {
            if (item.key === data2.key) {
                bFindData2 = true;
                break;
            }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        // 汇总
        let tempEdges = [];

        if (tableData.selectShowTypeValue === "1") {
            if (czje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, czje);
                let link1 = {
                    tid: tableData.tid,
                    from: (cxkh + "\n" + jymc).trim(),
                    to: (jydfzkh + "\n" + jydfmc).trim(),
                    je: czje,
                    bs: czbs,
                    text: `${czje}元（${czbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link1);
            }
            if (jzje > 0) {
                let lineColor = calculateLineColorByJinE(tableData, jzje);
                let link2 = {
                    tid: tableData.tid,
                    from: (jydfzkh + "\n" + jydfmc).trim(),
                    to: (cxkh + "\n" + jymc).trim(),
                    je: jzje,
                    bs: jzbs,
                    text: `${jzje}元（${jzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link2);
            }
        } else {
            if (jczce !== 0) {
                let lineColor = calculateLineColorByJinE(tableData, jczce);
                let link1 = {
                    tid: tableData.tid,
                    from: (cxkh + "\n" + jymc).trim(),
                    to: (jydfzkh + "\n" + jydfmc).trim(),
                    je: jczce,
                    bs: jyzbs,
                    text: `净${jczce}元（${jyzbs}笔）`,
                    stroke: lineColor,
                };
                if (lineColor !== "") tempEdges.push(link1);
            }
        }
        links.push(...tempEdges);
    });
    return { nodes, links };
}

export default { makeData };