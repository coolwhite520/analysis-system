<template>
    <el-dialog v-dialogDrag :close-on-click-modal="false" class="standard-data-dialog" :append-to-body="true"
        :visible="showWhichUiDialogVisible" width="30%" @close="handleClose" :modal="true">
        <div slot="title" class="dialog-title">
            <i class="iconfont" style="color: white; font-size: 30px">&#xe62b;</i>
            <span class="title-text" style="color: white">{{ title }}</span>
            <div class="button-right">
                <span class="title-close" @click="handleClose"></span>
            </div>
        </div>
        <div class="content">
            <div class="tip">
                计算结果：节点({{ preCalNodeCount }}个)、边({{ preCalLinkCount }}条)。使用当前程序渲染可能会影响程序性能，建议使用扩展图形化工具进行渲染。
            </div>
            <div class="buttons">
                <el-button @click="clickMainRender" :loading="loadingCur">当前程序渲染</el-button>
                <el-button type="success" @click="clickExternalRender" :loading="loadingEx">扩展程序渲染</el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script>
const url = 'http://localhost:1234/v1/';
import { mapState } from "vuex";
const uuid = require("uuid");
import maker from "@/utils/makedata"
export default {
    computed: {
        ...mapState("ShowTable", ["showWhichUiDialogVisible", "graphicTableData"]),
        ...mapState("CaseDetail", ["caseBase"]),
        preCalNodeCount() {
            return this.graphicTableData.preCalNodeCount;
        },
        preCalLinkCount() {
            return this.graphicTableData.preCalLinkCount;
        },
    },
    data() {
        return {
            title: "温馨提示",
            loadingCur: false,
            loadingEx: false,
        };
    },
    methods: {
        async postNetwork(collection, title, layout, cytoscapeNetwork) {
            let _this = this;
            var postNetworkUrl = url + 'fundAnalysis?title=' + title + "&collection=" + collection + "&layout=" + layout;
            var options = {
                url: postNetworkUrl,
                headers: { 'Content-Type': 'application/json' },
                // json: true,
                body: JSON.stringify(cytoscapeNetwork)
            };
            return await this.$axios.post(postNetworkUrl, cytoscapeNetwork);
        },
        async applyLayout(suid, layout) {
            // Apply layout
            try {
                let reqUrl = url + `apply/layouts/${layout}/` + suid;
                return await this.$axios.get(reqUrl);
            } catch (error) {
                console.error(error);
            }
        },
        async applyStyle(suid) {
            let styles = [
                "default black",
                "Minimal",
                "default",
                "Big Labels",
                "Ripple",
                "PSIMI 25 Style",
                "Nested Network Style",
                "Universe",
                "BioPAX",
                "Directed",
                "Solid",
                "Sample1",
                "BioPAX_SIF"
            ];
            try {
                let reqUrl = url + `apply/styles/${encodeURIComponent(styles[12])}/` + suid;
                return await this.$axios.get(reqUrl);
            } catch (error) {
                console.error(error);
            }
        },
        async getBase64(imgUrl) {
            return new Promise((resovle, reject) => {
                if (imgUrl === "") resovle("");
                window.URL = window.URL || window.webkitURL;
                var xhr = new XMLHttpRequest();
                xhr.open("get", imgUrl, true);
                xhr.responseType = "blob";
                xhr.onload = function () {
                    if (this.status == 200) {
                        //得到一个blob对象
                        var blob = this.response;
                        console.log("blob", blob)
                        // 至关重要
                        let oFileReader = new FileReader();
                        oFileReader.onloadend = function (e) {
                            // 此处拿到的已经是base64的图片了,可以赋值做相应的处理
                            resovle(e.target.result)
                        }
                        oFileReader.readAsDataURL(blob);
                    }
                }
                xhr.send();
            })
        },
        async loadCytoscape() {
            let { nodes, links } = maker.makeData(this.graphicTableData);
            let base64png = this.graphicTableData.imgSrc ? this.graphicTableData.imgSrc : "/static/images/icons/银行卡.png"
            nodes = nodes.map((item) => {
                return {
                    data: {
                        id: item.key,
                        selected: false,
                        label: item.text
                    }
                }
            })
            links = links.map((item) => {
                return {
                    data: {
                        source: item.from,
                        target: item.to,
                        je: item.jd,
                        bs: item.bs,
                        label: item.text
                    }
                }
            })
            base64png = await this.getBase64(base64png);
            console.log(base64png)
            let netWorkData = {
                elements: {
                    nodes,
                    edges: links
                },
                base64png,
            }

            let layout = "force-directed-cl"
            let ret = await this.postNetwork("资金分析系统: 案件-" + this.caseBase.ajmc, this.graphicTableData.title, layout, netWorkData);
            console.log(ret)
        },
        async checkREstfulServerExist() {
            try {
                let reqUrl = url + `styles/count`;
                let res = await this.$axios.get(reqUrl);
                return res.status === 200;
            } catch (e) {
                return false;
            }

        },
        handleClose() {
            this.$store.commit("ShowTable/SET_SHOWWHICHUIDIALOGVISIBLE", false);
        },
        async clickExternalRender() {
            if (!await this.checkREstfulServerExist()) {
                this.$message.error({
                    message: `扩展可视化程序未启动，请启动后重试！`,
                })
                this.$store.commit("ShowTable/SET_SHOWWHICHUIDIALOGVISIBLE", false);
                return;
            }
            this.loadingEx = true;
            let obj = JSON.parse(JSON.stringify(this.graphicTableData));
            // 图
            if (this.graphicTableData.showType === 2) {
                obj.showNetwork = false;
            }
            // 上表 下图
            if (this.graphicTableData.showType === 3) {
                obj.showNetwork = false;
                this.$store.commit("ShowTable/ADD_TABLE_DATA_TO_LIST", obj);
            }
            await this.loadCytoscape();
            this.$store.commit("ShowTable/SET_SHOWWHICHUIDIALOGVISIBLE", false);
            this.loadingEx = false;
        },
        clickMainRender() {
            this.loadingCur = true;
            let obj = JSON.parse(JSON.stringify(this.graphicTableData));
            obj.showNetwork = true;
            this.$store.commit("ShowTable/ADD_TABLE_DATA_TO_LIST", obj);
            this.$store.commit("ShowTable/SET_SHOWWHICHUIDIALOGVISIBLE", false);
            this.loadingCur = false;
        }
    },
};
</script>
  
<style scoped>
.logo {
    font-size: 100px;
    text-align: center;
    color: #313f57;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tip {
    margin: 10px;
}

.buttons {
    display: flex;
    flex-direction: row;
}
</style>