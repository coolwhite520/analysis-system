<template>
  <div>
    <el-row class="title">
      <el-col :span="2" style="text-align: center">
        <span @click="handleClickShowRightSlider" class="close iconfont">{{
          currentTableData.isShowRightSlider ? "&#xe626;" : "&#xe668;"
        }}</span>
      </el-col>
      <el-col :span="20">
        <div>
          <span class="iconfont">&#xe61c;&nbsp;&nbsp;&nbsp;模型参数</span>
        </div>
      </el-col>
      <el-col :span="2">
        <span @click="handleClickClose" class="close iconfont">&#xe634;</span>
      </el-col>
    </el-row>
    <div
      class="childModel"
      :style="{
        height: contentViewHeight - 40 * 2 - 15 + 'px',
        overflow: 'auto',
      }"
    >
      <div>
        <el-row>
          <div class="modelTitle">模型名称：</div>
          <div class="modelDescribe">{{ title }}</div>
        </el-row>
        <el-row>
          <div class="modelTitle">模型用途：</div>
          <div class="modelDescribe">{{ describe }}</div>
        </el-row>
        <el-row>
          <div class="modelTitle">模型数据：</div>
          <div
            v-if="currentTableData.mpids.includes('34')"
            class="modelDescribe"
          >
            根据筛选条件,取得资金用途分析视图
          </div>
          <div v-else class="modelDescribe">
            根据筛选条件,取得{{ resultRowCount }}条记录。
          </div>
        </el-row>

        <el-row>
          <div v-show="currentTableData.mpids.length > 0" class="modelTitle">
            参数设置：
          </div>
          <div class="modelDescribe">
            <div v-show="currentTableData.mpids.includes('1')">
              <div class="childTitle">交易账卡号：</div>
              <div>
                <el-input
                  placeholder="请输入交易账卡号"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_JYZKH"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('2')">
              <div class="childTitle">交易对手账卡号：</div>
              <div>
                <el-input
                  placeholder="请输入对方交易账卡号"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_JYDFZKH"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('3')">
              <div class="childTitle">关键人员：</div>
              <div>
                <el-input
                  placeholder="请输入交易名称"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_JYMC"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('4')">
              <div class="childTitle">对手关键人员：</div>
              <div>
                <el-input
                  placeholder="请输入对方交易名称"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_DFMC"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('5')">
              <div class="childTitle">交易证照号码：</div>
              <div>
                <el-input
                  placeholder="请输入交易证照号码"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_JYZJHM"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('6')">
              <div class="childTitle">交易对手证照号码：</div>
              <div>
                <el-input
                  placeholder="请输入交易对手证照号码"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KEY_PERSIONS_JYDFZJHM"
                ></el-input>
                <span>多个请用逗号隔</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('7')">
              <div class="childTitle">获利金额：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入获利金额"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.HLJE"
                ></el-input>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('8')">
              <div class="childTitle">关联账户数阀值：</div>
              <div>
                <el-input
                  placeholder="请输入关联账户数阀值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.GLDDZHS"
                ></el-input>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('9')">
              <div class="childTitle">最小交易额 大于等于：</div>
              <div>
                <el-input
                  placeholder="请输入最小交易额"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JYZE_MINValue"
                ></el-input>
                <span>元</span>
              </div>
            </div>
            <div v-show="currentTableData.mpids.includes('10')">
              <div class="childTitle">交易金额：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.JYZEConditionAccord"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 40%"
                >
                  <el-option
                    v-for="item in listst_jyje"
                    :key="item.JYZEConditionAccord"
                    :label="item.JYZECondition"
                    :value="item.JYZEConditionAccord"
                  ></el-option>
                </el-select>
                <el-input
                  size="mini"
                  style="width: 40%"
                  placeholder="请输入交易金额"
                  v-model="selectCondition.JYZEValue"
                ></el-input>
                <span>元</span>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('11')"
              class="selectionItem"
            >
              <div class="childTitle">交易总额：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.JYZEConditionAccord"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 40%"
                >
                  <el-option
                    v-for="item in listst_jyje"
                    :key="item.JYZEConditionAccord"
                    :label="item.JYZECondition"
                    :value="item.JYZEConditionAccord"
                  ></el-option>
                </el-select>
                <el-input
                  size="mini"
                  style="width: 40%"
                  placeholder="请输入交易总额"
                  v-model="selectCondition.JYZEValue"
                ></el-input>
                <span>元</span>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('12')"
              class="selectionItem"
            >
              <div class="childTitle">交易笔数：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  style="width: 40%"
                  v-model="selectCondition.JYCSConditionAccord"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in listst_jycs"
                    :key="item.JYZEConditionAccord"
                    :label="item.JYZECondition"
                    :value="item.JYZEConditionAccord"
                  ></el-option>
                </el-select>
                <el-input
                  size="mini"
                  style="width: 40%"
                  placeholder="请输入交易笔数"
                  v-model="selectCondition.JYCSValue"
                ></el-input>
                <span>笔</span>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('13')"
              class="selectionItem"
            >
              <div class="childTitle">时间间隔：</div>
              <div>
                <el-input
                  placeholder="请输入时间间隔"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JC_SJJG"
                ></el-input>
                <span>小时</span>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('14')"
              class="selectionItem"
            >
              <div class="childTitle">时间段：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.SJD"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 40%"
                >
                  <el-option
                    v-for="item in list_sjds"
                    :key="item.SJD"
                    :label="item.SJD_CN"
                    :value="item.SJD"
                  ></el-option>
                </el-select>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('15')"
              class="selectionItem"
            >
              <div class="childTitle">时间段：</div>
              <div>
                <el-input
                  placeholder="请输入最小值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JYSJ_START"
                ></el-input>
              </div>
              <div class="childTitle">至</div>
              <div>
                <el-input
                  placeholder="请输入最大值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JYSJ_END"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('16')"
              class="selectionItem"
            >
              <div class="childTitle">交易出进比最小值：</div>
              <div>
                <el-input
                  placeholder="请输入最小值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JCB_MIN"
                ></el-input>
              </div>
              <div class="childTitle">最大值：</div>
              <div>
                <el-input
                  placeholder="请输入最大值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JCB_MAX"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('18')"
              class="selectionItem"
            >
              <div class="childTitle">注册地点关联公司数量：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入公司数量"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.ZCDDGLGSSL"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('19')"
              class="selectionItem"
            >
              <div class="childTitle">报税人关联公司数量：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入公司数量"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.BSRGLGSSL"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('20')"
              class="selectionItem"
            >
              <div class="childTitle">财务负责人关联公司数量：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入公司数量"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.CWFZRGLGSSL"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('21')"
              class="selectionItem"
            >
              <div class="childTitle">销项税金额合计：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入金额合计"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.XXSJEHJ"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('22')"
              class="selectionItem"
            >
              <div class="childTitle">可疑主体证照号码：</div>
              <div>
                <el-input
                  placeholder="请输入可疑主体证照号码"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.KYZT"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('17')"
              class="selectionItem"
            >
              <div class="childTitle">收付金额占比：</div>
              <div>
                <span>大于等于</span>
                <el-input
                  placeholder="请输入收付金额占比"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.SFJEZB"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('23')"
              class="selectionItem"
            >
              <div class="childTitle">进出总次数比</div>
              <div>
                <span>最小值：</span>
                <el-input
                  placeholder="请输入最小值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JCZCSB_MIN"
                ></el-input>
              </div>
              <div>
                <span>最大值：</span>
                <el-input
                  placeholder="请输入最大值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JCZCSB_MAX"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('24')"
              class="selectionItem"
            >
              <div class="childTitle">收付金额比</div>
              <div>
                <span>最小值：</span>
                <el-input
                  placeholder="请输入最小值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.SFJEB_MIN"
                ></el-input>
              </div>
              <div>
                <span>最大值：</span>
                <el-input
                  placeholder="请输入最大值"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.SFJEB_MAX"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('25')"
              class="selectionItem"
            >
              <div class="childTitle">销方公司关联不同购方公司数量：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入公司数量"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.GFSHSL"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('26')"
              class="selectionItem"
            >
              <div class="childTitle">购方公司关联不同销方公司数量：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入公司数量"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.XFSHSL"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('27')"
              class="selectionItem"
            >
              <div class="childTitle">存续最小开票时间：</div>
              <div>
                <span>大于</span>
                <el-input
                  placeholder="请输入存续最小开票时间"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.ZXKPSJ"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('28')"
              class="selectionItem"
            >
              <div class="childTitle">时间：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.MINH"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in HourList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  v-model="selectCondition.MINM"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in MinuteList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  v-model="selectCondition.MINS"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in MinuteList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
              <span>至</span>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.MAXH"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in HourList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  v-model="selectCondition.MAXM"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in MinuteList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
                <el-select
                  size="mini"
                  v-model="selectCondition.MAXS"
                  placeholder="请选择"
                  @visible-change="visibleChange"
                  style="width: 25%"
                >
                  <el-option
                    v-for="item in MinuteList"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('29')"
              class="selectionItem"
            >
              <div class="childTitle">交易金额：</div>
              <div>
                <span>大于等于</span>
                <el-input
                  placeholder="请输入交易金额"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.JYZEValue"
                ></el-input>
              </div>
            </div>
            <!-- 30 这个是个？ ？？？？？？？下面的不是哦-->
            <div
              v-show="currentTableData.mpids.includes('30')"
              class="selectionItem"
            >
              <div class="childTitle">{{ MoneyIntervalDes }}</div>
              <div style="text-align: center; margin-top: 20px">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleClickMoneySection"
                  >金额区间设置</el-button
                >
              </div>
            </div>

            <div
              v-show="currentTableData.mpids.includes('31')"
              class="selectionItem"
            >
              <div class="childTitle">时间段：</div>
              <el-date-picker
                size="mini"
                v-model="selectCondition.MinDate"
                type="date"
                placeholder="选择日期"
                style="width: 60%"
              ></el-date-picker>
              <span>至</span>
              <el-date-picker
                style="width: 60%"
                size="mini"
                v-model="selectCondition.MaxDate"
                type="date"
                placeholder="选择日期"
              ></el-date-picker>
            </div>

            <div
              v-show="currentTableData.mpids.includes('32')"
              class="selectionItem"
            >
              <div class="childTitle">团伙划分：</div>
              <div class="childSelection">
                <el-select
                  size="mini"
                  v-model="selectCondition.SelectThType.ThId"
                  placeholder="请选择"
                  @change="handleChangeThSelect"
                  style="width: 80%"
                >
                  <el-option
                    v-for="item in list_thtype"
                    :key="item.ThId"
                    :label="item.ThName"
                    :value="item.ThId"
                  ></el-option>
                </el-select>
              </div>
            </div>

            <div
              v-show="currentTableData.mpids.includes('33')"
              class="selectionItem"
            >
              <div class="childTitle">
                分类维度：{{ selectCondition.String_0 }} 共{{
                  selectCondition.String_0.split(",").length
                }}个
              </div>
              <div style="text-align: center; margin-top: 15px">
                <el-button
                  size="mini"
                  type="primary"
                  @click="
                    () => {
                      this.$store.commit(
                        'DialogPopWnd/SET_SHOWWEISETTINGVISIBLE',
                        true
                      );
                    }
                  "
                  >设置分类维度</el-button
                >
              </div>
              <div class="childTitle" v-if="false">
                统计维度：{{ selectCondition.String_0 }} 共{{
                  selectCondition.String_0.split(",").length
                }}个
              </div>
              <div style="text-align: center; margin-top: 15px" v-if="false">
                <el-button size="mini" type="primary">设置统计维度</el-button>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('34')"
              class="selectionItem"
            >
              <!-- 资金用途分析 -->
              <!-- <div class="childTitle">
              资金用途：<el-button type="text" size="mini">管理分类</el-button>
            </div> -->
              <div class="childTitle">
                图形类别：
                <el-select
                  placeholder="请选择"
                  size="mini"
                  style="width: 60%"
                  v-model="selectCondition.fundUsePicType"
                  @change="handleChangeFundUsePicType"
                >
                  <el-option
                    v-for="item in [
                      { value: 'pie', label: '饼状图' },
                      { value: 'sandkey', label: '流向图' },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </div>
              <!-- <div class="childTitle">
              图表标签：
              <el-checkbox v-model="selectCondition.fundUseChecked" size="mini"
                >显示标签</el-checkbox
              >
            </div> -->
            </div>
            <div
              v-show="currentTableData.mpids.includes('38')"
              class="selectionItem"
            >
              <div class="childTitle">权重 (符合条件的进账笔数/总进账)</div>
              <div>
                <span>大于等于：</span>
                <el-input
                  placeholder="请输入权重"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.QZ"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('39')"
              class="selectionItem"
            >
              <div class="childTitle">过渡进账总笔数</div>
              <div>
                <span>大于等于：</span>
                <el-input
                  placeholder="请输入过渡进账总笔数"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.ZXGDZBS"
                ></el-input>
              </div>
            </div>
            <div
              v-show="currentTableData.mpids.includes('40')"
              class="selectionItem"
            >
              <div class="childTitle">过渡进账总笔数</div>
              <div>
                <span>大于等于：</span>
                <el-input
                  placeholder="请输入进账总笔数"
                  style="width: 40%"
                  size="mini"
                  v-model="selectCondition.ZXJZZBS"
                ></el-input>
              </div>
            </div>

            <div
              v-show="
                currentTableData.mpids.length > 0 &&
                !currentTableData.mpids.includes('30') &&
                !currentTableData.mpids.includes('33')
              "
              style="margin-top: 40px; text-align: center"
            >
              <el-button
                size="mini"
                @click="handleClickSaveCondition"
                v-if="false"
                >保存条件</el-button
              >
              <el-button
                size="mini"
                type="primary"
                @click="handleClickExecCondition"
                >执行条件</el-button
              >
            </div>
          </div>
        </el-row>
      </div>
    </div>
    <!-- <el-row class="foot">
      <el-col :span="24">
        <div>
          <span class="iconfont">&nbsp;</span>
        </div>
      </el-col>
    </el-row>-->
    <money-dalog v-if="showMoneySectionDialog"></money-dalog>
    <weidu-dialog v-if="showWeiSettingVisible"></weidu-dialog>
  </div>
</template>

<script>
import aes from "@/utils/aes";
import { mapState, mapGetters } from "vuex";
import MoneyDialog from "@/pages/dialog/moneySectionSetting/moneySectionDialog.vue";
import WeiDuDialog from "@/pages/dialog/zjTouShiModel/weiduSetting.vue";
export default {
  components: {
    "money-dalog": MoneyDialog,
    "weidu-dialog": WeiDuDialog,
  },
  data() {
    return {
      selectCondition: "",
      HourList: [],
      MinuteList: [],
      listst_jyje: [],
      listst_jycs: [],
      list_condition: [
        {
          JYZECondition: "大于",
          JYZEConditionAccord: ">",
        },
        {
          JYZECondition: "小于",
          JYZEConditionAccord: "<",
        },
        {
          JYZECondition: "等于",
          JYZEConditionAccord: "=",
        },
        {
          JYZECondition: "不等于",
          JYZEConditionAccord: "!=",
        },
        {
          JYZECondition: "大于等于",
          JYZEConditionAccord: ">=",
        },
        {
          JYZECondition: "小于等于",
          JYZEConditionAccord: "<=",
        },
      ],

      list_sjds: [
        {
          SJD_CN: "年，YYYY",
          SJD: "YYYY",
        },
        {
          SJD_CN: "月，YYYY-MM",
          SJD: "YYYY-MM",
        },
        {
          SJD_CN: "日，YYYY-MM-DD",
          SJD: "YYYY-MM-DD",
        },
        {
          SJD_CN: "时，YYYY-MM-DD HH ",
          SJD: "YYYY-MM-DD HH",
        },
        {
          SJD_CN: "分，YYYY-MM-DD HH:MM",
          SJD: "YYYY-MM-DD HH:MM",
        },
        {
          SJD_CN: "秒，YYYY-MM-DD HH:MM:SS",
          SJD: "YYYY-MM-DD HH:MM:SS",
        },
      ],
      list_listjyjes: [
        {
          XSMZPro: "交易金额",
          XSMZ: "JYJE",
        },
        ,
        {
          XSMZPro: "交易总次数",
          XSMZ: "ALLCOUNT",
        },
        {
          XSMZPro: "进账次数",
          XSMZ: "INCOUNT",
        },
        {
          XSMZPro: "进账金额",
          XSMZ: "INJE",
        },
        {
          XSMZPro: "出账次数",
          XSMZ: "OUTCOUNT",
        },
        {
          XSMZPro: "出账金额",
          XSMZ: "OUTJE",
        },
      ],

      // 团体类型数组
      list_thtype: [
        {
          Index: 1,
          ThId: "JYMCGROUP",
          ThName: "按主体名称划分",
          DsThId: "JYDFMCGROUP",
          ThMemberCntId: "JYMCGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFMCGROUPMEMBERCOUNT",
        },
        {
          Index: 2,
          ThId: "JYZJHMGROUP",
          ThName: "按证照号码划分",
          DsThId: "JYDFZJHMGROUP",
          ThMemberCntId: "JYZJHMGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFZJHMGROUPMEMBERCOUNT",
        },
        {
          Index: 3,
          ThId: "CXKHGROUP",
          ThName: "按账卡号划分",
          DsThId: "JYDFZKHGROUP",
          ThMemberCntId: "CXKHGROUPMEMBERCOUNT",
          DsThMemberCntId: "JYDFZKHGROUPMEMBERCOUNT",
        },
      ],
      //设置默认统计维度
      defaultSelectDataTable: [
        {
          CFIELD: "CXZH",
          CNAME: "交易账号",
          DATA_TYPE: 0, //VARCHAR
          SHOWABLE: "Y",
          COLUMN_TYPE: 0, //NONE
        },
        {
          CFIELD: "JYDFZKH",
          CNAME: "对手账号",
          DATA_TYPE: 0,
          SHOWABLE: "Y",
          COLUMN_TYPE: 0,
        },
        {
          CFIELD: "JDBZ",
          CNAME: "借贷标志",
          DATA_TYPE: 0,
          SHOWABLE: "Y",
          COLUMN_TYPE: 0,
        },
      ],
    };
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("DialogPopWnd", [
      "showMoneySectionDialog",
      "showWeiSettingVisible",
    ]),
    MoneyIntervalDes() {
      let text = "";
      let arrMoneyInterval = this.currentTableData.selectCondition.MoneyIntervalStr.split(
        ","
      );
      text += "交易区间：";
      for (let i = 0; i < arrMoneyInterval.length; i++) {
        if (i === 0) {
          text = text + arrMoneyInterval[i].toString() + "万以下,";
        } else if (i === arrMoneyInterval.length - 1) {
          text = text + arrMoneyInterval[i - 1].toString() + "万以上";
        } else {
          text = text.concat(
            arrMoneyInterval[i - 1].toString(),
            "万-",
            arrMoneyInterval[i].toString(),
            "万,"
          );
        }
      }
      return text;
    },
    resultRowCount() {
      return this.currentTableData.sum;
    },
    title() {
      return this.currentTableData.title;
    },
    describe() {
      return this.currentTableData.describe;
    },
  },
  watch: {
    "currentTableData.pageIndex": {
      handler(newValue, oldValue) {
        console.log(this.currentTableData.pageIndex);
        // this.$forceUpdate();
        this.selectCondition = JSON.parse(
          JSON.stringify(this.currentTableData.selectCondition)
        );
      },
      immediate: false,
      deep: true,
    },
  },
  async beforeMount() {
    // 交易金额区间描述
    this.selectCondition = JSON.parse(
      JSON.stringify(this.currentTableData.selectCondition)
    );
    for (let i = 0; i < 24; i++) {
      if (i.toString().length === 1) {
        this.HourList.push("0" + String(i));
      } else {
        this.HourList.push(String(i));
      }
    }
    for (let i = 0; i < 60; i++) {
      if (i.toString().length === 1) {
        this.MinuteList.push("0" + String(i));
      } else {
        this.MinuteList.push(String(i));
      }
    }
    this.listst_jyje = JSON.parse(JSON.stringify(this.list_condition));
    this.listst_jycs = JSON.parse(JSON.stringify(this.list_condition));
  },
  methods: {
    async handleChangeFundUsePicType(newType) {
      await this.$store.commit("ShowTable/UPDATE_MODEL_SELECTION", {
        pageIndex: this.currentTableData.pageIndex,
        selectCondition: this.selectCondition,
      });
    },
    handleChangeThSelect(currentValue) {
      for (let item of this.list_thtype) {
        if (item.ThId === currentValue) {
          this.selectCondition.SelectThType = JSON.parse(JSON.stringify(item));
          break;
        }
      }
    },

    //
    visibleChange(value) {},
    async handleClickExecCondition() {
      // 先更新currentTable的过滤条件
      await this.$store.commit("ShowTable/UPDATE_MODEL_SELECTION", {
        pageIndex: this.currentTableData.pageIndex,
        selectCondition: this.selectCondition,
      });
      await this.$store.dispatch(this.currentTableData.dispatchName, {
        ...this.currentTableData,
        offset: 0,
        count: 30,
      });
    },
    handleClickShowRightSlider() {
      this.$store.commit("ShowTable/SWITCH_ISSHOWRIGHTSLIDER");
    },
    async handleClickSaveCondition() {
      this.$store.commit("ShowTable/UPDATE_MODEL_SELECTION", {
        pageIndex: this.currentTableData.pageIndex,
        selectCondition: this.selectCondition,
      });
      this.$message({
        type: "success",
        message: "保存条件成功",
      });
    },
    handleClickMoneySection() {
      this.$store.commit("DialogPopWnd/SET_SHOWMONEYSECTIONDIALOG", true);
    },
    handleClickClose() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "model-view",
        action: "remove",
      });
    },
    getNowFormatDate(type = 0) {
      let date = new Date();
      let seperator1 = "-";
      let seperator2 = ":";
      let month = date.getMonth() + 1;
      let strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      if (type == 1) {
        return (
          date.getFullYear() +
          seperator1 +
          month +
          seperator1 +
          strDate +
          " " +
          date.getHours() +
          seperator2 +
          date.getMinutes() +
          seperator2 +
          date.getSeconds()
        );
      }
      return date.getFullYear() + seperator1 + month + seperator1 + strDate;
    },
  },
};

//  class="childModel"
//   :style="{zIndex: 9999,
//   position:'absolute',
//   top: 0+'px',
//   left: position.left+'px',
//   height: position.height + 'px',
//   width: position.width+'px'}"
</script>
<style scoped>
.childModel {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  -webkit-user-select: none;
}
.title {
  height: 40px;
  text-align: center;
  background-color: #384e6e;
  color: white;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}
.close {
  font-size: 10px;
}
.close:hover {
  color: gray;
  cursor: pointer;
}
.modelTitle {
  margin-top: 20px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 13px;
}
.modelDescribe {
  margin-top: 10px;
  margin-left: 20px;
  font-size: 11px;
  color: gray;
}
.selectionItem {
  margin-top: 10px;
  margin-bottom: 10px;
}
.childSelection {
  margin-top: 5px;
  margin-bottom: 5px;
}
.childTitle {
  margin-top: 10px;
}
.foot {
  height: 40px;
  text-align: center;
  background-color: #f5f7fa;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7ec;
}

/deep/.el-checkbox__label {
  font-size: 10px;
  padding-left: 5px;
  color: #3c4e6b;
}
</style>