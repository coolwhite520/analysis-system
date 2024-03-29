import Default from "./Default";
import dbBase from "../../db/Base";
import Aes from "../aes";

const LinkPathType = {
    link: 1,
    circle: 2,
    end2end: 3,
};
const DataItemType = {
    Detail: 0,
    Sum: 1,
    Diff: 2,
};
const VisualKind = {
    Original: 0,
    Custom: 1,
};
const SearchType = {
    kh: 0,
    zjhm: 1,
    mc: 2,
};

//string转时间戳
function stringToTime(string) {
    let f = string.split(" ", 2);
    let d = (f[0] ? f[0] : "").split("-", 3);
    let t = (f[1] ? f[1] : "").split(":", 3);
    return new Date(
        parseInt(d[0], 10) || null,
        (parseInt(d[1], 10) || 1) - 1,
        parseInt(d[2], 10) || null,
        parseInt(t[0], 10) || null,
        parseInt(t[1], 10) || null,
        parseInt(t[2], 10) || null
    ).getTime();
}

//计算时间差 （秒）
function dateDiff(date1, date2) {
    let type1 = typeof date1,
        type2 = typeof date2;
    if (type1 === "string") date1 = stringToTime(date1);
    else if (date1.getTime) date1 = date1.getTime();
    if (type2 === "string") date2 = stringToTime(date2);
    else if (date2.getTime) date2 = date2.getTime();
    return (date1 - date2) / 1000; //结果是秒
}

function createProvider(paras) {
    let result;
    if (paras.DataItemType === DataItemType.Detail) {
        // 详情
        result = new DetailDataProvider();
    } else if (paras.DataItemType === DataItemType.Sum) {
        // 汇总
        result = new SumDataProvider();
    } else {
        // 差额
        result = new DiffDataProvider();
    }
    result.init(paras);
    return result;
}

async function GetVisualModelData(linkParameters, VisualParameters, Cond) {
    let res;
    let filter = VisualParameters.TradeMoney + "," + VisualParameters.TradeCount;
    if (VisualParameters.VisualType === 0) {
        if (VisualParameters.GroupVisiual) {
            res = await dbBase.GetModelSql(205);
        } else {
            res = await dbBase.GetModelSql(202);
        }
    } else if (linkParameters.VisualType === 1) {
        if (linkParameters.GroupVisiual) {
            res = await dbBase.GetModelSql(206);
        } else {
            res = await dbBase.GetModelSql(204);
        }
    } else if (linkParameters.VisualType === 2) {
        if (linkParameters.GroupVisiual) {
            res = await dbBase.GetModelSql(207);
        } else {
            res = await dbBase.GetModelSql(203);
        }
    }
    let encodedSql = res["gpsqltemplate"];
    let orderBy = res["orderby"];
    let sql = GetAnalysisOtherTable(
        Aes.decrypt(encodedSql),
        orderBy,
        linkParameters.Ajid,
        Cond,
        filter
    );
    if (sql !== undefined && sql !== null && sql !== "") {
        return await dbBase.QueryCustom(sql, linkParameters.Ajid);
    }
    return null;
}

//模型sql格式化（资金穿透） condtion:过滤页面选择的时间，filter:TradeMoney + "," + TradeCount;或者MinPhoneNum+ "," + MinPhoneTime;
function GetAnalysisOtherTable(itemSql, sql_OrderBy, caseId, condtion = "", filter = "") {
    try {
        let array2 = filter.replace(/，/g, ",").split(",");
        return itemSql
            .replace(
                /\$MODEL_FILTER_GROUP\$/g,
                Default.GetBankDetailTableSql("mz_bank_records")
            )
            .replace(
                /\$MODEL_FILTER_GROUP_SUM\$/g,
                Default.GetBankDetailTableSumSql("mz_bank_records")
            )
            .replace(/\$AJID\$/g, caseId)
            .replace(/\$ZXJYJE_CONDITION\$/g, "")
            .replace(/\$JYBS_CONDITION\$/g, "")
            .replace(/\$MODEL_FILTER\$/g, condtion)
            .replace(/\$JYZJE\$/g, ">= " + array2[0])
            .replace(/\$ZXJYZCS\$/g, ">= " + array2[1])
            .replace(/\$ZXKPFS\$/g, ">= " + array2[1])
            .replace(/\$JYZCS\$/g, ">= " + array2[1])
            .replace(/\$ZXJSHJ\$/g, ">= " + array2[0])
            .replace(/\$THZSC\$/g, ">= " + array2[1])
            .replace(/\$THZCS\$/g, ">= " + array2[0])
            .replace(/\$MODEL_FILTER_CHILD\$/g, "")
            .replace(/\$SQLORDERBY\$/g, sql_OrderBy);
    } catch (e) {
        return null;
    }
}

class ShowWindowParameter {
    constructor() {
        this.VisualType = null
        this.IsHuiZhong = true;
        this.TradeCount = null;
        this.TradeMoney = null;
        this.GroupVisiual = null;
        this.VisualKind = null;
    }
}

class Node{
    constructor(dat, kh, zjhm, mc) {
        this.data = dat;
        this.kh = kh;
        this.zjhm = zjhm;
        this.mc = mc;
    }
}


class RowData {
    constructor(fx, jyf, dsf, row) {
        this.FX = fx;
        this.Time = Default.GetTimeType(row["jysj"]) === Default.DataType.STR ? "0001-01-01 00:00:00" : row["jysj"];
        this.Money = isNaN(parseFloat(row["jyje"])) ? 0.0 : parseFloat(row["jyje"]);
        this.Count = isNaN(parseInt(row["jybs"])) ? 0 : parseInt(row["jybs"]);
        this.IDS = row["ids"];
        this.IsDownFlow = this.FX === "xy"; // 下游
        if (this.IsDownFlow) {
            this.FromKey = jyf;
            this.FromNode = new Node(row[jyf], row["cxkh"], row["jyzjhm"], row["jymc"]);
            this.ToKey = dsf;
            this.ToNode = new Node(row[dsf], row["jydfzkh"], row["jydfzjhm"], row["jydfmc"]);
        } else {
            this.ToKey = jyf;
            this.ToNode = new Node(row[jyf], row["cxkh"], row["jyzjhm"], row["jymc"]);
            this.FromKey = dsf;
            this.FromNode = new Node(row[dsf], row["jydfzkh"], row["jydfzjhm"], row["jydfmc"]
            );
        }
        this.ToKeyValue = this.ToNode.data;
        this.FromKeyValue = this.FromNode.data;
        this.list = []
    }

    toString() {
        return `${this.FromKeyValue} -> ${this.ToKeyValue}, ${this.Money}`;
    }

    getGroupItems() {
        return this.list;
    };

    addToGroup(data) {
        this.list.push(data);
    };

}

class LinkParameters {
    constructor(
        LinkType,
        VisualType,
        DataItemType_,
        GroupVisiual,
        Fx,
        Depth,
        Mindepth,
        Source,
        Target,
        StartTime,
        EndTime,
        MinJyje,
        TradeCount,
        IntervalTime,
        MinRatio,
        MaxRatio,
        Condtion,
        Ajid) {
        this.LinkType = LinkType;
        this.VisualType = VisualType; //查询类型0卡号，1证件号，2名称
        this.CxType = "kh";
        if (this.VisualType === 0) {
            this.CxType = "kh";
        } else if (this.VisualType === 1) {
            this.CxType = "zjhm";
        } else if (this.VisualType === 2) {
            this.CxType = "mc";
        }
        this.Fx = Fx;
        this.Depth = Depth;
        this.Source = Source;
        this.Target = Target;
        this.StartTime = StartTime;
        this.EndTime = EndTime;
        this.MinJyje = MinJyje;
        this.TradeMoney = MinJyje;
        this.TradeCount = TradeCount;
        this.IntervalTime = IntervalTime;
        this.MinRatio = MinRatio;
        this.MaxRatio = MaxRatio;
        this.Condtion = Condtion;
        this.Ajid = Ajid;
        this.Mindepth = Mindepth;
        this.DataItemType = DataItemType_;
        this.GroupVisiual = GroupVisiual;
        this.IsDownDirection = this.Fx === "xy";
    }

    init() {
        this.Condtion = "";
    };
}

////////////////////////////BaseDataProvider///////////////////////////////////////////////////////
class BaseDataProvider {
    constructor() {
        this.Paras = null; //LinkParameters Paras
        this.JYF = ""; //string
        this.DSF = ""; //string
    }

    init(paras) {
        this.Paras = paras;
        if (this.Paras.CxType === "kh") {
            this.JYF = "cxkh";
            this.DSF = "jydfzkh";
        } else if (this.Paras.CxType === "mc") {
            this.JYF = "jymc";
            this.DSF = "jydfmc";
        } else {
            this.JYF = "jyzjhm";
            this.DSF = "jydfzjhm";
        }
        return;
    };

    GetDateTimeFilter() {
        let text =
            " and " +
            Default.BackFiltrateCondtion_DateTime(
                Default.FiltrateLogicID.NotEmpty,
                this.Paras.StartTime,
                "JYSJ",
                Default.DataType.DATATIME_1
            );
        if (!Default.IsNullOrEmpty(this.Paras.StartTime)) {
            text =
                " and " +
                Default.BackFiltrateCondtion_DateTime(
                    Default.FiltrateLogicID.GreaterOrEqual,
                    this.Paras.StartTime,
                    "JYSJ",
                    Default.DataType.DATATIME_1
                );
        }
        if (!Default.IsNullOrEmpty(this.Paras.EndTime)) {
            text =
                text +
                " and " +
                Default.BackFiltrateCondtion_DateTime(
                    Default.FiltrateLogicID.LessOrEqual,
                    this.Paras.EndTime,
                    "JYSJ",
                    Default.DataType.DATATIME_1
                );
        }
        return text;
    };
}

class DetailDataProvider {
    constructor() {
        this.base = null
    }
    init(paras) {
        this.base = new BaseDataProvider();
        this.base.init(paras);
    }
    GetGroupSqlTemplate() {
        return (
            "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkhgroup else jydfzkhgroup end cxkh, case when jdbz = '出' then jymcgroup else jydfmcgroup end jymc, case WHEN jdbz = '出' THEN jyzjhmgroup ELSE jydfzjhmgroup END jyzjhm, case when jdbz = '出' then jydfzkhgroup else cxkhgroup end jydfzkh, case when jdbz = '出' then jydfmcgroup else jymcgroup end jydfmc, case WHEN jdbz = '出' THEN jydfzjhmgroup ELSE jyzjhmgroup END jydfzjhm from " +
            Default.GetBankDetailTableSumSql("mz_bank_records") +
            " where ajid = " +
            this.base.Paras.Ajid +
            " and jysj is not null $parm2$ $parm2$ $parm4$ ORDER BY jymc"
        ).replace(/\$AJID\$/g, this.base.Paras.Ajid);
    }
    GetSqlTemplate() {
        return (
            "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkh else jydfzkh end cxkh, case when jdbz = '出' then jymc else jydfmc end jymc, case WHEN jdbz = '出' THEN jyzjhm ELSE jydfzjhm END jyzjhm, case when jdbz = '出' then jydfzkh else cxkh end jydfzkh, case when jdbz = '出' then jydfmc else jymc end jydfmc, case WHEN jdbz = '出' THEN jydfzjhm ELSE jyzjhm END jydfzjhm from mz_bank_records  where ajid = " +
            this.base.Paras.Ajid +
            " and jysj is not null $parm2$ $parm3$ $parm4$ ORDER BY jymc "
        );
    };
    async GetDataTableInternal() {
        let arg_E0_0 = this.base.Paras.GroupVisiual
            ? this.GetGroupSqlTemplate()
            : this.GetSqlTemplate();
        let text = "";
        let text2 = "";
        let dateTimeFilter = this.base.GetDateTimeFilter();
        if (this.base.Paras.MinJyje !== undefined && this.base.Paras.MinJyje > 0.0) {
            text = "and jyje>=" + this.base.Paras.MinJyje;
        }
        if (this.base.Paras.CxType === "kh") {
            text2 = "and COALESCE(cxkh,'')!='' and COALESCE(jydfzkh,'')!=''";
        } else if (this.base.Paras.CxType === "mc") {
            text2 = "and COALESCE(jymc,'')!='' and COALESCE(jydfmc,'')!=''";
        } else if (this.base.Paras.CxType === "zjhm") {
            text2 = "and COALESCE(jyzjhm,'')!='' and COALESCE(jydfzjhm,'')!=''";
        }
        let sql = arg_E0_0
            .replace(/\$parm2\$/g, dateTimeFilter)
            .replace(/\$parm3\$/g, text)
            .replace(/\$parm4\$/g, text2);
        if (!Default.IsNullOrEmpty(sql)) {
            return await dbBase.QueryCustom(sql, this.base.Paras.Ajid);
        }
    }
    RowsToDict(rows) {
        let dict = {};
        for (let i = 0; i < rows.length; i++) {
            let rowData = new RowData(
                this.base.Paras.Fx,
                this.base.JYF,
                this.base.DSF,
                rows[i]
            );
            if (dict.hasOwnProperty(rowData.FromKeyValue)) {
                dict[rowData.FromKeyValue].addToGroup(rowData);
            } else {
                dict[rowData.FromKeyValue] = rowData;
            }
        }
        return dict;
    };
}

class BaseSumOrDiffDataProvider {
    constructor() {
        this.base = null
    }
    init(paras) {
        this.base = new BaseDataProvider();
        this.base.init(paras);
    }
    CreateShowWindowParameter() {
        let showWindowParameter = new ShowWindowParameter();
        if (this.base.Paras.CxType === "kh") {
            showWindowParameter.VisualType = 0;
        } else if (this.base.Paras.CxType === "mc") {
            showWindowParameter.VisualType = 2;
        } else {
            showWindowParameter.VisualType = 1;
        }
        showWindowParameter.GroupVisiual = this.base.Paras.GroupVisiual;
        showWindowParameter.TradeMoney = this.base.Paras.MinJyje;
        showWindowParameter.TradeCount = this.base.Paras.TradeCount;
        return showWindowParameter;
    }
    async GetDataTableInternal() {
        let visualParameters = this.CreateShowWindowParameter();
        let dateTimeFilter = this.base.GetDateTimeFilter();

        return await GetVisualModelData(
            this.base.Paras,
            visualParameters,
            dateTimeFilter
        );
    }
    GetItem(dataRow_0, string_2) {
        if (!dataRow_0.hasOwnProperty(string_2)) {
            return "";
        }
        if (dataRow_0[string_2] === null || dataRow_0[string_2] === undefined) {
            return "";
        }
        return dataRow_0[string_2];
    };
    SetRowData(sumordiffDBRow, needRevert, jyje, tradeCount, ids) {
        let outRow = {
            jdbz: "",
            jysj: "",
            jyje: "",
            cxkh: "",
            jymc: "",
            jyzjhm: "",
            jydfzkh: "",
            jydfmc: "",
            jydfzjhm: "",
            istrue: "",
            jybs: "",
            ids: "",
        };
        let array = ["cxkh", "jymc", "jyzjhm"];
        let array2 = ["jydfzkh", "jydfmc", "jydfzjhm"];
        let num = -1;
        if (this.base.Paras.GroupVisiual) {
            if (this.base.Paras.CxType === "kh") {
                num = 0;
            } else if (this.base.Paras.CxType === "mc") {
                num = 1;
            } else {
                num = 2;
            }
        }
        outRow["jyje"] = jyje;
        outRow["jysj"] = "0001-01-01 00:00:00";
        outRow["jybs"] = tradeCount;
        outRow["ids"] = ids;
        for (let i = 0; i < array.length; i++) {
            let text = needRevert ? array2[i] : array[i];
            if (i === num) {
                text += "group";
            }
            outRow[array[i]] = this.GetItem(sumordiffDBRow, text);
        }
        for (let j = 0; j < array2.length; j++) {
            let text2 = needRevert ? array[j] : array2[j];
            if (j === num) {
                text2 += "group";
            }
            outRow[array2[j]] = this.GetItem(sumordiffDBRow, text2);
        }
        return outRow;
    };
}

class SumDataProvider {
    constructor() {
        this.base = null
    }

    init(paras) {
        this.base = new BaseSumOrDiffDataProvider();
        this.base.init(paras);
    }

    async GetDataTableInternal() {
        return await this.base.GetDataTableInternal();
    }

    RowsToDict(dt) {
        let dict = {}; //new Default.Dictionary();//{string, RowData}
        for (let i = 0; i < dt.length; i++) {
            let dataRow = dt[i];
            let list = [];
            let valueOrDefault = parseFloat(dataRow["czje"]);
            let valueOrDefault2 = parseFloat(dataRow["jzje"]);
            let ids = "";
            if (!isNaN(valueOrDefault) && valueOrDefault !== 0.0) {
                ids = dataRow["cids"];
                let dataRow2 = this.base.SetRowData(
                    dataRow,
                    false,
                    valueOrDefault,
                    parseInt(dataRow["czbs"]),
                    ids
                );
                list.push(dataRow2);
            }
            if (!isNaN(valueOrDefault2) && valueOrDefault2 !== 0.0) {
                ids = dataRow["jids"];
                let dataRow3 = this.base.SetRowData(
                    dataRow,
                    true,
                    valueOrDefault2,
                    parseInt(dataRow["jzbs"]),
                    ids
                );
                list.push(dataRow3);
            }
            for (let i = 0; i < list.length; i++) {
                let rowData = new RowData(
                    this.base.base.Paras.Fx,
                    this.base.base.JYF,
                    this.base.base.DSF,
                    list[i]
                );
                if (dict.hasOwnProperty(rowData.FromKeyValue)) {
                    dict[rowData.FromKeyValue].addToGroup(rowData);
                } else {
                    dict[rowData.FromKeyValue] = rowData;
                }
            }
        }
        return dict;
    };
}

class DiffDataProvider {
    constructor() {
        this.base = null
    }
    init = function (paras) {
        this.base = new BaseSumOrDiffDataProvider();
        this.base.init(paras);
    }
    async GetDataTableInternal() {
        return await this.base.GetDataTableInternal();
    };
    RowsToDict(dt) {
        let dictionary = {};
        for (let i = 0; i < dt.length; i++) {
            let dataRow = dt[i];
            let valueOrDefault = parseFloat(dataRow["jczce"]);
            if (!isNaN(valueOrDefault) && valueOrDefault !== 0.0) {
                let valueOrDefault2 = parseInt(dataRow["czbs"]);
                let valueOrDefault3 = parseInt(dataRow["jzbs"]);
                let text = dataRow["cids"];
                if (Default.IsNullOrEmpty(text)) {
                    text += dataRow["jids"];
                } else {
                    text += Default.IsNullOrEmpty(dataRow["jids"]) ? "" : "," + dataRow["jids"];
                }
                let dataRow2 = this.base.SetRowData(
                    dataRow,
                    valueOrDefault > 0.0,
                    Math.abs(valueOrDefault),
                    Math.abs(valueOrDefault2 + valueOrDefault3),
                    text
                );
                let rowData = new RowData(
                    this.base.base.Paras.Fx,
                    this.base.base.JYF,
                    this.base.base.DSF,
                    dataRow2
                );
                if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
                    dictionary[rowData.FromKeyValue].addToGroup(rowData);
                } else {
                    dictionary[rowData.FromKeyValue] = rowData;
                }
            }
        }
        return dictionary;
    };
}

class BasePathFinder {
    constructor(paras) {
        this.Paras = paras;
    }

    Run(dict) {
        let source = this.Paras.Source;
        let instance = this.factory(source, dict);
        return instance.doWork()
    };

    factory(source, dict) {
        let instance;
        if (this.Paras.LinkType === LinkPathType.link) {
            instance = new LinkChildModel(source, dict, this.Paras);
        } else {
            instance = new CircleOrEnd2endChildModel(source, dict, this.Paras);
        }
        return instance;
    };
}

////////////////////////////internal class BaseChildModel///////////////////////////////////////////////////////
class NodeModelCollection {
    constructor() {
        this.Items = {};
    }

    Count() {
        return Object.keys(this.Items).length;
    };

    Add(node) {
        if (!this.Items.hasOwnProperty(node.getUniqueKey())) {
            this.Items[node.getUniqueKey()] = node;
        }
    };

    containsKey(key) {
        return this.Items.hasOwnProperty(key);
    };
}

class LinkModelCollection {
    constructor() {
        this.Items = {};
    }

    Count() {
        return Object.keys(this.Items).length;
    }

    Add(link) {
        if (!this.Items.hasOwnProperty(link.getUniqueKey())) {
            this.Items[link.getUniqueKey()] = link;
        }
    }

    Remove(link) {
        if (this.Items.hasOwnProperty(link.getUniqueKey())) {
            delete this.Items[link.getUniqueKey()];
        }
    }

    containsKey(key) {
        return this.Items.hasOwnProperty(key);
    }

    Set(validLinks) {
        this.Items = validLinks;
    };
}

class BaseChildModel {
    constructor() {
        this.linkParameters = null
        this.nodeModelCollection = null
        this.linkModelCollection = null
        this.dictionary = null
        this.Root = null
    }

    init(source, dict, params) {
        this.nodeModelCollection = new NodeModelCollection();
        this.linkModelCollection = new LinkModelCollection();
        this.linkParameters = params;
        this.dictionary = dict;
    }

    addNodeModelToCollection(nodeModel) {
        this.nodeModelCollection.Add(nodeModel);
    }

    makeFromNodeModel(rowData) {
        let fromKeyValue = rowData.FromKeyValue;
        let nodeModel;
        if (this.nodeModelCollection.containsKey(fromKeyValue)) {
            nodeModel = this.nodeModelCollection.Items[fromKeyValue];
        } else {
            nodeModel = new NodeModel();
            nodeModel.CardNo = rowData.FromNode.kh;
            nodeModel.Username = rowData.FromNode.mc;
            nodeModel.IdentityNo = rowData.FromNode.zjhm;
            nodeModel.FieldName = rowData.FromKey;
            nodeModel.UniqueKey = rowData.FromKeyValue;
        }
        return nodeModel;
    }

    makeToNodeModel(toRowData) {
        let toKeyValue = toRowData.ToKeyValue;
        let nodeModel;
        if (this.nodeModelCollection.containsKey(toKeyValue)) {
            nodeModel = this.nodeModelCollection.Items[toKeyValue];
        } else {
            nodeModel = new NodeModel();
            nodeModel.CardNo = toRowData.ToNode.kh;
            nodeModel.Username = toRowData.ToNode.mc;
            nodeModel.IdentityNo = toRowData.ToNode.zjhm;
            nodeModel.FieldName = toRowData.ToKey;
            nodeModel.UniqueKey = toRowData.ToKeyValue;
        }
        return nodeModel;
    }

    isInLinkModelCollection(string_0) {
        return this.linkModelCollection.containsKey(string_0);
    }

    generateInOutLinks(linkModel) {
        let from = linkModel.From;
        let to = linkModel.To;
        from.OutLinks.Add(linkModel);
        to.InLinks.Add(linkModel);
        this.linkModelCollection.Add(linkModel);
    }

    isValidateLinkModel(linkModel_0, linkModel_1) {
        if (this.linkParameters.DataItemType !== DataItemType.Detail) {
            return true;
        }
        if (this.linkParameters.IntervalTime > 0) {
            let timeSpan = this.linkParameters.IsDownDirection
                ? dateDiff(linkModel_1.TradeTime, linkModel_0.TradeTime)
                : dateDiff(linkModel_0.TradeTime, linkModel_1.TradeTime);
            let TotalHours = timeSpan / 3600;
            if (TotalHours < 0.0 || TotalHours > this.linkParameters.IntervalTime) {
                return false;
            }
        }
        let tradeMoney;
        let tradeMoney2;
        if (this.linkParameters.IsDownDirection) {
            tradeMoney = linkModel_0.TradeMoney;
            tradeMoney2 = linkModel_1.TradeMoney;
        } else {
            tradeMoney = linkModel_0.TradeMoney;
            tradeMoney2 = linkModel_1.TradeMoney;
        }
        return (
            (this.linkParameters.MinRatio <= 0.0 || tradeMoney / tradeMoney2 >= this.linkParameters.MinRatio) &&
            (this.linkParameters.MaxRatio <= 0.0 || tradeMoney / tradeMoney2 <= this.linkParameters.MaxRatio)
        );
    }
}

////////////////////////////childclass LinkChildModel///////////////////////////////////////////////////////
class LinkChildModel {
    constructor(source, dict, params) {
        this.base = new BaseChildModel();
        this.base.init(source, dict, params);
    }

    doWork() {
        this.generateNetwork(this.base.linkParameters.Source);
        this.checkMinDepth();
        return this.generateResultData();
    };

    generateNetwork(source) {
        if (!this.base.dictionary.hasOwnProperty(source)) {
            return;
        }
        // 将起始点（卡号、账号、身份）作为root
        let nodeModel = this.base.makeFromNodeModel(this.base.dictionary[source]);
        // 设置标记为TRUE
        nodeModel.IsRoot = true;
        this.base.Root = nodeModel;
        this.base.addNodeModelToCollection(nodeModel);
        // 使用stack控制迭代层数
        let stack = new Default.Stack();
        let hashSet = [];
        this.iteratorGenerator(nodeModel, stack, hashSet);
    };

    iteratorGenerator(nodeModel, stack, hashSet) {
        let count = stack.size();
        // 当下次迭代的时候如果找到了root，那么就停止。说明找到了交易闭环
        if (count > 0 && nodeModel.IsRoot) {
            return;
        }
        // 当迭代的深度大于等于设置的深度也要停止
        if (this.base.linkParameters.Depth > 0 && count >= this.base.linkParameters.Depth) {
            return;
        }
        if (!this.base.dictionary.hasOwnProperty(nodeModel.getUniqueKey())) {
            return;
        }
        let stackTopLinkModel = count === 0 ? null : stack.peek();
        // 获取某个账号、卡号、身份证所关联的所有交易并生成线条
        let links = this.generateLinkModelList(nodeModel, stackTopLinkModel);
        for (let current of links) {
            if (!hashSet.includes(current.getUniqueKey())) {
                hashSet.push(current.getUniqueKey());
                stack.push(current);
                this.iteratorGenerator(current.To, stack, hashSet);
                stack.pop();
                let index = hashSet.indexOf(current.getUniqueKey());
                if (index >= 0) {
                    hashSet.splice(index, 1);
                }
            }
        }
    };

    checkMinDepth() {
        if (this.base.Root === undefined || this.base.Root === null) {
            return;
        }
        let stack = new Default.Stack();
        stack.push(this.base.Root);
        this.iteratorCheckDepth(this.base.Root, stack);
        stack.pop();
    };

    iteratorCheckDepth(nodeModel, stack) {
        let num = stack.size() - 1;
        if (num > 0 && nodeModel.IsRoot) {
            if (num >= this.base.linkParameters.Mindepth && num <= this.base.linkParameters.Depth) {
                for (let i = 0; i < stack.size(); i++) {
                    stack.data[i].IsMinDepth = true;
                }
            }
            return;
        }
        if (num >= this.base.linkParameters.Depth) {
            for (let i = 0; i < stack.size(); i++) {
                stack.data[i].IsMinDepth = true;
            }
            return;
        }
        if (nodeModel.OutLinks.Count() === 0) {
            if (num >= this.base.linkParameters.Mindepth) {
                for (let i = 0; i < stack.size(); i++) {
                    stack.data[i].IsMinDepth = true;
                }
            }
            return;
        }

        let hashSet = {}; //NodeModel
        for (let k of Object.keys(nodeModel.OutLinks.Items)) {
            console.log({k})
            console.log({nodeModel})
            let current = nodeModel.OutLinks.Items[k];
            console.log({current})
            hashSet[current.To.getUniqueKey()] = current.To;
        }
        for (let k in hashSet) {
            let current = hashSet[k];
            if (stack.data.findIndex((node) => node.getUniqueKey() === current.getUniqueKey()) < 0) {
                stack.push(current);
                this.iteratorCheckDepth(current, stack);
                stack.pop();
            }
        }
    };

    generateLinkModelList(nodeModel, linkModel) {
        let items = this.base.dictionary[nodeModel.getUniqueKey()].getGroupItems();
        let list = [];
        for (let current of items) {
            let linkedKey = generateLinkedKey(
                this.base.linkParameters,
                nodeModel.getUniqueKey(),
                current.ToKeyValue,
                current.Time,
                current.Money
            );
            if (!this.base.isInLinkModelCollection(linkedKey)) {
                let netlinkModel = new LinkModel(this.base.linkParameters);
                netlinkModel.From = nodeModel;
                netlinkModel.To = this.base.makeToNodeModel(current);
                netlinkModel.TradeMoney = current.Money;
                netlinkModel.TradeTime = current.Time;
                netlinkModel.TradeCount = current.Count;
                netlinkModel.IDS = current.IDS;
                netlinkModel.UniqueKey = linkedKey;
                let flag = linkModel === undefined || linkModel === null || this.base.isValidateLinkModel(linkModel, netlinkModel);
                if (flag) {
                    this.base.addNodeModelToCollection(netlinkModel.To);
                    this.base.generateInOutLinks(netlinkModel);
                    list.push(netlinkModel);
                }
            }
        }
        return list;
    };

    generateResultData() {
        let nodeDict = {};
        let linkDict = {};
        let tempLinkDict = {};
        for (let i of Object.keys( this.base.nodeModelCollection.Items)) {
            let value = this.base.nodeModelCollection.Items[i];
            if (value.IsMinDepth) {
                if (!nodeDict.hasOwnProperty(value.getUniqueKey())) {
                    nodeDict[value.getUniqueKey()] = value;
                }
                for (let j of Object.keys(value.InLinks.Items)) {
                    if (!tempLinkDict.hasOwnProperty(j)) {
                        tempLinkDict[j] = value.InLinks.Items[j];
                    }
                }
                for (let k of Object.keys(value.OutLinks.Items)) {
                    if (!tempLinkDict.hasOwnProperty(k)) {
                        tempLinkDict[k] = value.OutLinks.Items[k];
                    }
                }
            }
        }
        for (let i in tempLinkDict) {
            if (!linkDict.hasOwnProperty(i)) {
                let value2 = tempLinkDict[i];
                if (
                    nodeDict.hasOwnProperty(value2.From.getUniqueKey()) &&
                    nodeDict.hasOwnProperty(value2.To.getUniqueKey())
                ) {
                    linkDict[value2.getUniqueKey()] = value2;
                }
            }
        }
        return {Nodedictionary: nodeDict, Linkdictionary: linkDict};
    };
}

////////////////////////////childclass CircleOrEnd2endChildModel///////////////////////////////////////////////////////
class CircleOrEnd2endChildModel {
    constructor(source, dict, params) {
        this.base = new BaseChildModel();
        this.base.init(source, dict, params);
    }

    doWork() {
        this.generateNetwork(this.base.linkParameters.Source);
        this.checkMinDepth();
        return this.generateResultData();
    };

    generateNetwork(source) {
        if (!this.base.dictionary.hasOwnProperty(source)) {
            return;
        }
        let nodeModel = this.base.makeFromNodeModel(this.base.dictionary[source]);
        nodeModel.IsRoot = true;
        this.base.Root = nodeModel;
        this.base.addNodeModelToCollection(nodeModel);
        let stack = new Default.Stack();
        let hashSet = [];
        let endPoint = this.base.linkParameters.LinkType === LinkPathType.circle ? source : this.base.linkParameters.Target;
        this.iteratorGenerator(nodeModel, endPoint, stack, hashSet);
    };

    iteratorGenerator(nodeModel, endPoint, stack, hashSet) {
        let count = stack.size();
        if (count > 0) {
            if (nodeModel.getUniqueKey() === endPoint) {
                if (count >= this.base.linkParameters.Mindepth && count <= this.base.linkParameters.Depth) {
                    for (let i = 0; i < count; i++) {
                        stack.data[i].From.IsToTarget = true;
                        stack.data[i].To.IsToTarget = true;
                        stack.data[i].IsTargetValid = true;
                    }
                }
                return;
            }
            if (nodeModel.IsRoot) {
                return;
            }
        }
        if (this.base.linkParameters.Depth > 0 && count >= this.base.linkParameters.Depth) {
            return;
        }
        if (!this.base.dictionary.hasOwnProperty(nodeModel.getUniqueKey())) {
            return;
        }
        let stackTopLinkModel = count === 0 ? null : stack.peek();
        let links = this.generateLinkModelList(nodeModel, stackTopLinkModel);
        for (let current of links) {
            if (!hashSet.includes(current.getUniqueKey())) {
                hashSet.push(current.getUniqueKey());
                stack.push(current);
                this.iteratorGenerator(current.To, endPoint, stack, hashSet);
                stack.pop();
                let index = hashSet.indexOf(current.getUniqueKey());
                if (index >= 0) {
                    hashSet.splice(index, 1);
                }
            }
        }
    };

    checkMinDepth() {
        if (this.base.Root === undefined || this.base.Root === null) {
            return;
        }
        let stack = new Default.Stack();
        stack.push(this.base.Root);
        this.iteratorCheckDepth(this.base.Root, stack);
        stack.pop();
    };

    iteratorCheckDepth(nodeModel, stack) {
        let num = stack.size() - 1;
        if (num > 0 && nodeModel.IsRoot) {
            if (num >= this.base.linkParameters.Mindepth && num <= this.base.linkParameters.Depth) {
                for (let i = 0; i < stack.size(); i++) {
                    stack.data[i].IsMinDepth = true;
                }
            }
            return;
        }
        if (num >= this.base.linkParameters.Depth) {
            for (let i = 0; i < stack.size(); i++) {
                stack.data[i].IsMinDepth = true;
            }
            return;
        }
        if (nodeModel.OutLinks.Count() === 0) {
            if (num >= this.base.linkParameters.Mindepth) {
                for (let i = 0; i < stack.size(); i++) {
                    stack.data[i].IsMinDepth = true;
                }
            }
            return;
        }
        let hashSet = {}; //NodeModel
        for (let k of Object.keys(nodeModel.OutLinks.Items)) {
            let current = nodeModel.OutLinks.Items[k];
            if (current.IsTargetValid) {
                hashSet[current.To.getUniqueKey()] = current.To;
            }
        }
        for (let k in hashSet) {
            let current = hashSet[k];
            if (current.IsRoot) {
                if (num < this.base.linkParameters.Mindepth || num > this.base.linkParameters.Depth) {
                    continue;
                }
                for (let j = 0; j < stack.size(); j++) {
                    stack.data[j].IsMinDepth = true;
                }
                continue;
            }
            if (stack.data.findIndex((node) => node.getUniqueKey() === current.getUniqueKey()) < 0) {
                stack.push(current);
                this.iteratorCheckDepth(current, stack);
                stack.pop();
            }
        }
    };

    generateLinkModelList(nodeModel, linkModel) {
        let items = this.base.dictionary[nodeModel.getUniqueKey()].getGroupItems();
        let list = [];
        for (let current of items) {
            let text = generateLinkedKey(
                this.base.linkParameters,
                nodeModel.getUniqueKey(),
                current.ToKeyValue,
                current.Time,
                current.Money
            );
            if (!this.base.isInLinkModelCollection(text)) {
                let newLinkModel = new LinkModel(this.base.linkParameters);
                newLinkModel.From = nodeModel;
                newLinkModel.To = this.base.makeToNodeModel(current);
                newLinkModel.TradeMoney = current.Money;
                newLinkModel.TradeTime = current.Time;
                newLinkModel.TradeCount = current.Count;
                newLinkModel.IDS = current.IDS;
                newLinkModel.UniqueKey = text;
                let flag = !linkModel || this.base.isValidateLinkModel(linkModel, newLinkModel);
                if (flag) {
                    this.base.addNodeModelToCollection(newLinkModel.To);
                    this.base.generateInOutLinks(newLinkModel);
                    list.push(newLinkModel);
                }
            }
        }
        return list;
    };

    generateResultData() {
        let nodeDict = {}; //NodeModel
        let linkDict = {}; //LinkModel
        let tempLinkDict = {}; //LinkModel
        for (let i of Object.keys(this.base.nodeModelCollection.Items)) {
            let item = this.base.nodeModelCollection.Items[i];
            if (item.IsMinDepth && item.IsToTarget) {
                if (!nodeDict.hasOwnProperty(item.getUniqueKey())) {
                    nodeDict[item.getUniqueKey()] = item;
                }
                for (let j of Object.keys(item.InLinks.Items)) {
                    let current = item.InLinks.Items[j];
                    if (current.IsTargetValid && !tempLinkDict.hasOwnProperty(j)) {
                        tempLinkDict[j] = current;
                    }
                }
                for (let k of Object.keys(item.OutLinks.Items)) {
                    let current = item.OutLinks.Items[k];
                    if (current.IsTargetValid && !tempLinkDict.hasOwnProperty(k)) {
                        tempLinkDict[k] = current;
                    }
                }
            }
        }
        for (let k in tempLinkDict) {
            if (!linkDict.hasOwnProperty(k)) {
                let item = tempLinkDict[k];
                if (nodeDict.hasOwnProperty(item.From.getUniqueKey()) && nodeDict.hasOwnProperty(item.To.getUniqueKey())) {
                    linkDict[item.getUniqueKey()] = item;
                }
            }
        }
        return {Nodedictionary: nodeDict, Linkdictionary: linkDict};
    };
}


function generateLinkedKey(params, fromKey, toKey, tradeTime, tradeMoney) {
    let result = "";
    if (params.DataItemType === DataItemType.Detail) {
        result = fromKey + "_" + toKey + "_" + tradeTime;
    } else if (
        params.DataItemType === DataItemType.Diff || params.DataItemType === DataItemType.Sum) {
        result = fromKey + "_" + toKey;
    }
    return result;
}

////////////////////////////NodeModel///////////////////////////////////////////////
class NodeModel {
    constructor() {
        this.IsToTarget = "";
        this.IsMinDepth = false;
        this.UniqueKey = "";
        this.FieldName = "";
        this.CardNo = "";
        this.Username = "";
        this.IdentityNo = "";
        this.InLinks = new LinkModelCollection();
        this.OutLinks = new LinkModelCollection();
        this.IsCutted = false;
        this.IsRoot = false;
    }

    getUniqueKey() {
        return this.UniqueKey;
    }

    toString() {
        return this.UniqueKey + "(" + this.Username + ")";
    }

    data() {
        return this.UniqueKey;
    }

    zjhm() {
        return this.IdentityNo;
    }

    mc() {
        return this.Username;
    }
}

////////////////////////////LinkModel///////////////////////////////////////////////////////
class LinkModel {
    constructor(linkParameters) {
        this.IDS = "";
        this.From = null;
        this.To = null;
        this.TradeMoney = 0;
        this.TradeTime = "";
        this.TradeCount = 0;
        this.UniqueKey = "";
        this.linkParameters = linkParameters;
    }

    setUniqueKey() {
        this.UniqueKey = generateLinkedKey(
            this.linkParameters,
            this.From.getUniqueKey(),
            this.To.getUniqueKey(),
            this.TradeTime,
            this.TradeMoney
        );
    }

    getUniqueKey() {
        if (Default.IsNullOrEmpty(this.UniqueKey)) {
            this.setUniqueKey();
        }
        return this.UniqueKey;
    };

    toString() {
        return (
            this.From.toString() +
            "->" +
            this.To.toString() +
            this.dataTime() +
            " " +
            this.TradeMoney
        );
    }

    fromId() {
        return this.From.UniqueKey;
    }

    toId() {
        return this.To.UniqueKey;
    }

    dataTime() {
        if (this.linkParameters.DataItemType === DataItemType.Detail) {
            return this.TradeTime;
        }
        return this.TradeCount + "笔交易";
    }
}

async function StartComputeInternal(Paras) {
    let baseDataProvider = createProvider(Paras);
    let ret = await baseDataProvider.GetDataTableInternal();
    let dict = baseDataProvider.RowsToDict(ret.rows);

    let basePathFinder = new BasePathFinder(Paras);
    let res = basePathFinder.Run(dict);

    let links = [];
    let nodes = [];
    for (let k of Object.keys(res.Nodedictionary)) {
        let current = res.Nodedictionary[k];
        nodes.push({
            CardNo: k,
            FieldName: current.FieldName,
            IdentityNo: current.IdentityNo,
            IsRoot: current.IsRoot,
            UniqueKey: current.UniqueKey,
            Username: current.Username,
        });
    }
    for (let k of Object.keys(res.Linkdictionary)) {
        let current = res.Linkdictionary[k];
        links.push({
            dataType: Paras.DataItemType,
            source: current.From.UniqueKey,
            target: current.To.UniqueKey,
            tradeMoney: current.TradeMoney,
            tradeTime: current.TradeTime,
            tradeCount: current.TradeCount,
        });
    }
    return {links, nodes};
}

export default {
    /**
     * @param linkType 模型类型：包括链路、环路、两端
     * @param weiDuType 维度类型
     * @param searchType 查询类型
     * @param isGroup
     * @param directrion
     * @param searchMaxCeng
     * @param searchMinCeng
     * @param beginPoint
     * @param endPoint
     * @param beginDate
     * @param endDate
     * @param minJyje
     * @param minBs
     * @param timeSpan
     * @param minJcb
     * @param maxJcb
     * @param condition
     * @param ajid
     */
    async getCapitalPenetration(
        linkType,
        searchType,
        weiDuType,
        isGroup,
        directrion,
        searchMaxCeng,
        searchMinCeng,
        beginPoint,
        endPoint,
        beginDate,
        endDate,
        minJyje,
        minBs,
        timeSpan,
        minJcb,
        maxJcb,
        condition,
        ajid
    ) {
        let linkParameters = new LinkParameters(
            linkType,
            searchType,
            weiDuType,
            isGroup,
            directrion,
            searchMaxCeng,
            searchMinCeng,
            beginPoint,
            endPoint,
            beginDate,
            endDate,
            minJyje,
            minBs,
            timeSpan,
            minJcb,
            maxJcb,
            condition,
            ajid
        );
        return await StartComputeInternal(linkParameters);
    },
};
