import Default from "./Default";
import dbbase from "../../db/Base";
import Aes from "../aes";

const LinkPathType = {
    link: 1,
    // Token: 0x04000CF6 RID: 3318
    circle: 2,
    // Token: 0x04000CF7 RID: 3319
    endtoend: 3,
    // Token: 0x04000CF8 RID: 3320
    allpath: 4,
    // Token: 0x04000CF9 RID: 3321
    shortestpath: 5,
};
const DataItemType = {
    Detail: 0,
    Sum: 1,
    Diff: 2,
};
const VisualKind = {
    Original: 0,
    // Token: 0x040007A0 RID: 1952
    Custom: 1,
};
const SearchType = {
    kh: 0,
    zjhm: 1,
    mc: 2,
};

//string转时间
function stringToTime(string) {
    var f = string.split(" ", 2);
    var d = (f[0] ? f[0] : "").split("-", 3);
    var t = (f[1] ? f[1] : "").split(":", 3);
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
    var type1 = typeof date1,
        type2 = typeof date2;
    if (type1 == "string") date1 = stringToTime(date1);
    else if (date1.getTime) date1 = date1.getTime();
    if (type2 == "string") date2 = stringToTime(date2);
    else if (date2.getTime) date2 = date2.getTime();
    return (date1 - date2) / 1000; //结果是秒
}

function CreateProvider(paras) {
    let result;
    if (paras.DataItemType == DataItemType.Detail) {
        // 详情
        result = new DetailDataProvider();
    } else if (paras.DataItemType == DataItemType.Sum) {
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
    if (VisualParameters.VisualType == 0) {
        if (VisualParameters.GroupVisiual) {
            res = await dbbase.GetModelSql(205);
        } else {
            res = await dbbase.GetModelSql(202);
        }
    } else if (linkParameters.VisualType == 1) {
        if (linkParameters.GroupVisiual) {
            res = await dbbase.GetModelSql(206);
        } else {
            res = await dbbase.GetModelSql(204);
        }
    } else if (linkParameters.VisualType == 2) {
        if (linkParameters.GroupVisiual) {
            res = await dbbase.GetModelSql(207);
        } else {
            res = await dbbase.GetModelSql(203);
        }
    }
    let encodesql = res["gpsqltemplate"];
    let orderby = res["orderby"];
    console.log({linkParameters});
    let sql = GetAnalysisOtherTable(
        Aes.decrypt(encodesql),
        orderby,
        linkParameters.Ajid,
        Cond,
        filter
    );
    if (sql != undefined && sql != null && sql != "") {
        return await dbbase.QueryCustom(sql, linkParameters.Ajid);
    }
    return null;
}

//模型sql格式化（资金穿透） condtion:过滤页面选择的时间，filter:TradeMoney + "," + TradeCount;或者MinPhoneNum+ "," + MinPhoneTime;
function GetAnalysisOtherTable(
    itemSql,
    sql_OrderBy,
    caseId,
    condtion = "",
    filter = ""
) {
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
        this.IsHuiZhong = true; //ID7DVySXdb
        this.IsExpand = true; //b7ND1m16cx
        this.TradeCount = null;
        this.TradeMoney = null;
        this.IsFenShu = null;
        this.IsMinXi = null;
        this.MinPhoneTime = null;
        this.MinPhoneNum = null;
        this.GroupVisiual = null;
        this.VisualKind = null;
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
            this.ToNode = new Node(
                row[dsf],
                row["jydfzkh"],
                row["jydfzjhm"],
                row["jydfmc"]
            );
        } else {
            this.ToKey = jyf;
            this.ToNode = new Node(row[jyf], row["cxkh"], row["jyzjhm"], row["jymc"]);
            this.FromKey = dsf;
            this.FromNode = new Node(
                row[dsf],
                row["jydfzkh"],
                row["jydfzjhm"],
                row["jydfmc"]
            );
        }
        this.ToKeyValue = this.ToNode.data;
        this.FromKeyValue = this.FromNode.data;
        this.list_0 = null
    }

    ToString() {
        return this.FromKeyValue + "->" + ToKeyValue + "," + this.Money;
    }

    GroupedItems() {
        if (this.list_0 === null || this.list_0 === undefined) {
            this.list_0 = [];
            this.list_0.push(this);
        }
        return this.list_0;
    };

    Group(data) {
        this.GroupedItems().push(data);
    };

}

function Node(dat, kh1, zjhm1, mc1) {
    this.data = dat;
    this.kh = kh1;
    this.zjhm = zjhm1;
    this.mc = mc1;
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
        //this.Obj=Obj;
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

function DetailDataProvider() {
    this.base;
    this.init = function (paras) {
        this.base = new BaseDataProvider();
        this.base.init(paras);
    };
    this.GetGroupSqlTemplate = function () {
        return (
            "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkhgroup else jydfzkhgroup end cxkh, case when jdbz = '出' then jymcgroup else jydfmcgroup end jymc, case WHEN jdbz = '出' THEN jyzjhmgroup ELSE jydfzjhmgroup END jyzjhm, case when jdbz = '出' then jydfzkhgroup else cxkhgroup end jydfzkh, case when jdbz = '出' then jydfmcgroup else jymcgroup end jydfmc, case WHEN jdbz = '出' THEN jydfzjhmgroup ELSE jyzjhmgroup END jydfzjhm from " +
            Default.GetBankDetailTableSumSql("mz_bank_records") +
            " where ajid = " +
            this.base.Paras.Ajid +
            " and jysj is not null $parm2$ $parm2$ $parm4$ ORDER BY jymc"
        ).replace(/\$AJID\$/g, this.base.Paras.Ajid);
    };
    this.GetSqlTemplate = function () {
        return (
            "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkh else jydfzkh end cxkh, case when jdbz = '出' then jymc else jydfmc end jymc, case WHEN jdbz = '出' THEN jyzjhm ELSE jydfzjhm END jyzjhm, case when jdbz = '出' then jydfzkh else cxkh end jydfzkh, case when jdbz = '出' then jydfmc else jymc end jydfmc, case WHEN jdbz = '出' THEN jydfzjhm ELSE jyzjhm END jydfzjhm from mz_bank_records  where ajid = " +
            this.base.Paras.Ajid +
            " and jysj is not null $parm2$ $parm3$ $parm4$ ORDER BY jymc "
        );
    };
    this.GetDataTableInternal = async function () {
        let arg_E0_0 = this.base.Paras.GroupVisiual
            ? this.GetGroupSqlTemplate()
            : this.GetSqlTemplate();
        let text = "";
        let text2 = "";
        let dateTimeFilter = this.base.GetDateTimeFilter();
        if (this.base.Paras.MinJyje != undefined && this.base.Paras.MinJyje > 0.0) {
            text = "and jyje>=" + this.base.Paras.MinJyje;
        }
        if (this.base.Paras.CxType == "kh") {
            text2 = "and COALESCE(cxkh,'')!='' and COALESCE(jydfzkh,'')!=''";
        } else if (this.base.Paras.CxType == "mc") {
            text2 = "and COALESCE(jymc,'')!='' and COALESCE(jydfmc,'')!=''";
        } else if (this.base.Paras.CxType == "zjhm") {
            text2 = "and COALESCE(jyzjhm,'')!='' and COALESCE(jydfzjhm,'')!=''";
        }
        let sql = arg_E0_0
            .replace(/\$parm2\$/g, dateTimeFilter)
            .replace(/\$parm3\$/g, text)
            .replace(/\$parm4\$/g, text2);
        if (!Default.IsNullOrEmpty(sql)) {
            return await dbbase.QueryCustom(sql, this.base.Paras.Ajid);
        }
    };
    this.TableDataToDictionary = function (dt) {
        let dictionary = {}; //new Default.Dictionary();//{string, RowData}
        for (let i = 0; i < dt.length; i++) {
            let rowData = new RowData(
                this.base.Paras.Fx,
                this.base.JYF,
                this.base.DSF,
                dt[i]
            );
            if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
                dictionary[rowData.FromKeyValue].Group(rowData);
            } else {
                dictionary[rowData.FromKeyValue] = rowData;
            }
        }
        return dictionary;
    };
}

function BaseSumOrDiffDataProvider() {
    this.base;
    this.init = function (paras) {
        this.base = new BaseDataProvider();
        this.base.init(paras);
    };
    this.CreateShowWindowParameter = function () {
        let showWindowParameter = new ShowWindowParameter();
        if (this.base.Paras.CxType == "kh") {
            showWindowParameter.VisualType = 0;
        } else if (this.base.Paras.CxType == "mc") {
            showWindowParameter.VisualType = 2;
        } else {
            showWindowParameter.VisualType = 1;
        }
        showWindowParameter.GroupVisiual = this.base.Paras.GroupVisiual;
        showWindowParameter.TradeMoney = this.base.Paras.MinJyje;
        showWindowParameter.TradeCount = this.base.Paras.TradeCount;
        return showWindowParameter;
    };
    this.GetDataTableInternal = async function () {
        let visualParameters = this.CreateShowWindowParameter();
        let dateTimeFilter = this.base.GetDateTimeFilter();

        return await GetVisualModelData(
            this.base.Paras,
            visualParameters,
            dateTimeFilter
        );
    };
    this.GetItem = function (dataRow_0, string_2) {
        if (!dataRow_0.hasOwnProperty(string_2)) {
            return "";
        }
        if (dataRow_0[string_2] == null || dataRow_0[string_2] == undefined) {
            return "";
        }
        return dataRow_0[string_2];
    };
    this.SetRowData = function (
        sumordiffDBRow,
        needRevert,
        jyje,
        tradeCount,
        ids
    ) {
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
            if (this.base.Paras.CxType == "kh") {
                num = 0;
            } else if (this.base.Paras.CxType == "mc") {
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
            if (i == num) {
                text += "group";
            }
            outRow[array[i]] = this.GetItem(sumordiffDBRow, text);
        }
        for (let j = 0; j < array2.length; j++) {
            let text2 = needRevert ? array[j] : array2[j];
            if (j == num) {
                text2 += "group";
            }
            outRow[array2[j]] = this.GetItem(sumordiffDBRow, text2);
        }
        return outRow;
    };
}

function SumDataProvider() {
    this.base;
    this.init = function (paras) {
        this.base = new BaseSumOrDiffDataProvider();
        this.base.init(paras);
    };
    this.CreateShowWindowParameter = function () {
        let expr_06 = this.base.CreateShowWindowParameter();
        expr_06.IsHuiZhong = true;
        return expr_06;
    };
    this.GetDataTableInternal = async function () {
        return await this.base.GetDataTableInternal();
    };
    this.TableDataToDictionary = function (dt) {
        let dictionary = {}; //new Default.Dictionary();//{string, RowData}
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
                if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
                    dictionary[rowData.FromKeyValue].Group(rowData);
                } else {
                    dictionary[rowData.FromKeyValue] = rowData;
                }
            }
        }
        return dictionary;
    };
}

function DiffDataProvider() {
    this.base;
    this.init = function (paras) {
        this.base = new BaseSumOrDiffDataProvider();
        this.base.init(paras);
    };
    this.CreateShowWindowParameter = function () {
        let expr_06 = this.base.CreateShowWindowParameter();
        expr_06.IsHuiZhong = false;
        return expr_06;
    };
    this.GetDataTableInternal = async function () {
        return await this.base.GetDataTableInternal();
    };
    this.TableDataToDictionary = function (dt) {
        let dictionary = {}; //new Default.Dictionary();//{string, RowData}
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
                    text += Default.IsNullOrEmpty(dataRow["jids"])
                        ? ""
                        : "," + dataRow["jids"];
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
                    dictionary[rowData.FromKeyValue].Group(rowData);
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
        return instance.DoDork()
    };

    factory(source, dict) {
        let instance;
        if (this.Paras.LinkType === LinkPathType.link) {
            instance = new LinkChildModel(source, dict, this.Paras);
        } else {
            instance = new CircleOrEndChildModel(source, dict, this.Paras);
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

    ContainsKey(key) {
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

    ContainsKey(key) {
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
        if (this.nodeModelCollection.ContainsKey(fromKeyValue)) {
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
        if (this.nodeModelCollection.ContainsKey(toKeyValue)) {
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
        return this.linkModelCollection.ContainsKey(string_0);
    }

    generateInOutLinks(linkModel) {
        let from = linkModel.From;
        let to = linkModel.To;
        from.OutLinks.Add(linkModel);
        to.InLinks.Add(linkModel);
        this.linkModelCollection.Add(linkModel);
    }

    NajXrfOjp8(linkModel_0, linkModel_1, bool_0 = false) {
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
            (this.linkParameters.MinRatio <= 0.0 ||
                tradeMoney / tradeMoney2 >= this.linkParameters.MinRatio) &&
            (this.linkParameters.MaxRatio <= 0.0 ||
                tradeMoney / tradeMoney2 <= this.linkParameters.MaxRatio)
        );
    }
}

////////////////////////////childclass LinkChildModel///////////////////////////////////////////////////////
class LinkChildModel {
    constructor(source, dict, params) {
        this.base = new BaseChildModel();
        this.base.init(source, dict, params);
    }

    DoDork() {
        this.GenerateNetwork(this.base.linkParameters.Source);
        this.CheckMinDepth();
        return this.GenerateResultData();
    };

    GenerateNetwork(source) {
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
        console.log(links)
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

    CheckMinDepth() {
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
        for (let i in nodeModel.OutLinks.Items) {
            let current = nodeModel.OutLinks.Items[i];
            hashSet[current.To.getUniqueKey()] = current.To;
        }
        for (let i in hashSet) {
            let current2 = hashSet[i];
            if (stack.data.findIndex((node) => node.getUniqueKey() === current2.getUniqueKey()) < 0) {
                stack.push(current2);
                this.iteratorCheckDepth(current2, stack);
                stack.pop();
            }
        }
    };

    generateLinkModelList(nodeModel, linkModel) {
        let items = this.base.dictionary[nodeModel.getUniqueKey()].GroupedItems();
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
                let flag = linkModel === undefined || linkModel === null || this.base.NajXrfOjp8(linkModel, netlinkModel, false);
                if (flag) {
                    this.base.addNodeModelToCollection(netlinkModel.To);
                    this.base.generateInOutLinks(netlinkModel);
                    list.push(netlinkModel);
                }
            }
        }
        return list;
    };

    GenerateResultData() {
        let dictionary = {}; //string,NodeModel
        let dictionary2 = {}; //string,LinkModel
        let dictionary3 = {}; //string,LinkModel
        for (let i in this.base.nodeModelCollection.Items) {
            let value = this.base.nodeModelCollection.Items[i];
            if (
                value.IsMinDepth !== undefined &&
                value.IsMinDepth != null &&
                value.IsMinDepth
            ) {
                if (!dictionary.hasOwnProperty(value.getUniqueKey())) {
                    dictionary[value.getUniqueKey()] = value;
                }
                for (let j in value.InLinks.Items) {
                    if (!dictionary3.hasOwnProperty(j)) {
                        dictionary3[j] = value.InLinks.Items[j];
                    }
                }
                for (let k in value.OutLinks.Items) {
                    if (!dictionary3.hasOwnProperty(k)) {
                        dictionary3[k] = value.OutLinks.Items[k];
                    }
                }
            }
        }
        for (let i in dictionary3) {
            if (!dictionary2.hasOwnProperty(i)) {
                let value2 = dictionary3[i];
                if (
                    dictionary.hasOwnProperty(value2.From.getUniqueKey()) &&
                    dictionary.hasOwnProperty(value2.To.getUniqueKey())
                ) {
                    dictionary2[value2.getUniqueKey()] = value2;
                }
            }
        }
        return {Nodedictionary: dictionary, Linkdictionary: dictionary2};
    };
}

////////////////////////////childclass CircleOrEndChildModel///////////////////////////////////////////////////////
class CircleOrEndChildModel {
    constructor(source, dict, params) {
        this.base = new BaseChildModel();
        this.base.init(source, dict, params);
    }

    DoDork() {
        this.GenerateNetwork(this.base.linkParameters.Source);
        this.CheckMinDepth();
        return this.GenerateResultData();
    };

    GenerateNetwork(source) {
        if (!this.base.dictionary.hasOwnProperty(source)) {
            return;
        }
        let nodeModel = this.base.makeFromNodeModel(this.base.dictionary[source]);
        nodeModel.IsRoot = true;
        this.base.Root = nodeModel;
        this.base.addNodeModelToCollection(nodeModel);
        let stack_ = new Default.Stack();
        let hashSet_ = [];
        let string_ = this.base.linkParameters.LinkType === LinkPathType.circle ? source : this.base.linkParameters.Target;
        this.method_14(nodeModel, string_, stack_, hashSet_);
    };

    method_14(nodeModel_1, string_0, stack_0, hashSet_0) {
        let count = stack_0.size();
        if (count > 0) {
            if (nodeModel_1.getUniqueKey() === string_0) {
                if (count >= this.base.linkParameters.Mindepth && count <= this.base.linkParameters.Depth) {
                    for (let i = 0; i < count; i++) {
                        let expr_49 = stack_0.data[i];
                        expr_49.From.IsToTarget = true;
                        expr_49.To.IsToTarget = true;
                        expr_49.IsTargetValid = true;
                    }
                }
                return;
            }
            if (nodeModel_1.IsRoot) {
                return;
            }
        }
        if (this.base.linkParameters.Depth > 0 && count >= this.base.linkParameters.Depth) {
            return;
        }
        if (!this.base.dictionary.hasOwnProperty(nodeModel_1.getUniqueKey())) {
            return;
        }
        let linkModel_ = count === 0 ? null : stack_0.peek();
        let m18_res = this.method_18(nodeModel_1, linkModel_);
        for (let i = 0; i < m18_res.length; ++i) {
            let current = m18_res[i];
            if (!hashSet_0.includes(current.getUniqueKey())) {
                hashSet_0.push(current.getUniqueKey());
                let to = current.To;
                stack_0.push(current);
                this.method_14(to, string_0, stack_0, hashSet_0);
                stack_0.pop();
                let index = hashSet_0.indexOf(current.getUniqueKey());
                if (index >= 0) {
                    hashSet_0.splice(index, 1);
                }
            }
        }
    };

    CheckMinDepth() {
        if (this.base.Root === undefined || this.base.Root === null) {
            return;
        }
        let stack = new Default.Stack();
        stack.push(this.base.Root);
        this.iteratorCheckDepth(this.base.Root, stack);
        stack.pop();
    };

    iteratorCheckDepth(nodeModel_1, stack_0) {
        let num = stack_0.size() - 1;
        if (num > 0 && nodeModel_1.IsRoot) {
            if (num >= this.base.linkParameters.Mindepth && num <= this.base.linkParameters.Depth) {
                for (let i = 0; i < stack_0.size(); i++) {
                    stack_0.data[i].IsMinDepth = true;
                }
            }
            return;
        }
        if (num >= this.base.linkParameters.Depth) {
            for (let i = 0; i < stack_0.size(); i++) {
                stack_0.data[i].IsMinDepth = true;
            }
            return;
        }
        if (nodeModel_1.OutLinks.Count() === 0) {
            if (num >= this.base.linkParameters.Mindepth) {
                for (let i = 0; i < stack_0.size(); i++) {
                    stack_0.data[i].IsMinDepth = true;
                }
            }
            return;
        }
        let hashSet = {}; //NodeModel
        for (let i in nodeModel_1.OutLinks.Items) {
            let current = nodeModel_1.OutLinks.Items[i];
            if (
                current.IsTargetValid !== undefined &&
                current.IsTargetValid !== null &&
                current.IsTargetValid
            ) {
                hashSet[current.To.getUniqueKey()] = current.To;
            }
        }
        for (let i in hashSet) {
            let current2 = hashSet[i];
            if (current2.IsRoot) {
                if (
                    num < this.base.linkParameters.Mindepth ||
                    num > this.base.linkParameters.Depth
                ) {
                    continue;
                }
                for (let j = 0; j < stack_0.size(); j++) {
                    stack_0.data[j].IsMinDepth = true;
                }
                continue;
            }
            if (
                stack_0.data.findIndex(
                    (node) => node.getUniqueKey() === current2.getUniqueKey()
                ) < 0
            ) {
                stack_0.push(current2);
                this.iteratorCheckDepth(current2, stack_0);
                stack_0.pop();
            }
        }
    };

    method_18(nodeModel, linkModel_0) {
        let items = this.base.dictionary[nodeModel.getUniqueKey()].GroupedItems();
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
                let linkModel = new LinkModel(this.base.linkParameters);
                linkModel.From = nodeModel;
                linkModel.To = this.base.makeToNodeModel(current);
                linkModel.TradeMoney = current.Money;
                linkModel.TradeTime = current.Time;
                linkModel.TradeCount = current.Count;
                linkModel.IDS = current.IDS;
                linkModel.UniqueKey = text;
                let flag = linkModel_0 === undefined || linkModel_0 === null || this.base.NajXrfOjp8(linkModel_0, linkModel, false);
                if (flag) {
                    this.base.addNodeModelToCollection(linkModel.To);
                    this.base.generateInOutLinks(linkModel);
                    list.push(linkModel);
                }
            }
        }
        return list;
    };

    GenerateResultData() {
        let dictionary = {}; //NodeModel
        let dictionary2 = {}; //LinkModel
        let dictionary3 = {}; //LinkModel
        for (let i in this.base.nodeModelCollection.Items) {
            let value = this.base.nodeModelCollection.Items[i];
            if (value.IsMinDepth && value.IsToTarget) {
                if (!dictionary.hasOwnProperty(value.getUniqueKey())) {
                    dictionary[value.getUniqueKey()] = value;
                }
                for (let j in value.InLinks.Items) {
                    let current2 = value.InLinks.Items[j];
                    if (current2.IsTargetValid && !dictionary3.hasOwnProperty(j)) {
                        dictionary3[j] = current2;
                    }
                }
                for (let k in value.OutLinks.Items) {
                    let current3 = value.OutLinks.Items[k];
                    if (current3.IsTargetValid && !dictionary3.hasOwnProperty(k)
                    ) {
                        dictionary3[k] = current3;
                    }
                }
            }
        }
        for (let i in dictionary3) {
            if (!dictionary2.hasOwnProperty(i)) {
                let value2 = dictionary3[i];
                if (
                    dictionary.hasOwnProperty(value2.From.getUniqueKey()) &&
                    dictionary.hasOwnProperty(value2.To.getUniqueKey())
                ) {
                    dictionary2[value2.getUniqueKey()] = value2;
                }
            }
        }
        return {Nodedictionary: dictionary, Linkdictionary: dictionary2};
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

    ToString() {
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
        this.IDS;
        this.From;
        this.To;
        this.TradeMoney;
        this.TradeTime;
        this.TradeCount;
        this.UniqueKey;
        this.linkParameters = linkParameters;
    }

    method_0() {
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
            this.method_0();
        }
        return this.UniqueKey;
    };

    ToString() {
        return (
            this.From.ToString() +
            "->" +
            this.To.ToString() +
            this.dataTime() +
            " " +
            this.TradeMoney
        );
    };

    fromId() {
        return this.From.UniqueKey;
    };

    toId() {
        return this.To.UniqueKey;
    };

    dataTime() {
        if (this.linkParameters.DataItemType == DataItemType.Detail) {
            return this.TradeTime;
        }
        return this.TradeCount + "笔交易";
    };
}

async function StartComputeInternal(Paras, IsMocking = false) {
    let baseDataProvider = CreateProvider(Paras);
    let dt = await baseDataProvider.GetDataTableInternal();
    let dict = baseDataProvider.TableDataToDictionary(dt.rows);

    let basePathFinder = new BasePathFinder(Paras);
    let res = basePathFinder.Run(dict);

    let links = [];
    let nodes = [];
    for (let key in res.Nodedictionary) {
        let current = res.Nodedictionary[key];
        nodes.push({
            CardNo: key,
            FieldName: current.FieldName,
            IdentityNo: current.IdentityNo,
            IsRoot: current.IsRoot,
            UniqueKey: current.UniqueKey,
            Username: current.Username,
        });
        //console.log(key)
    }
    for (let key in res.Linkdictionary) {
        let current = res.Linkdictionary[key];
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
     *
     *
     * @param {模型类型：包括链路、环路、两端} linkType
     * @param {维度类型：} weiDuType
     * @param {查询类型：} searchType
     *
     * @param {} ajid
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
        let retdata = await StartComputeInternal(linkParameters);
        return retdata;
    },
};
