<template >
  <div class="all-slider" :style="{ height: contentViewHeight + 'px'}">
    <keep-alive>
      <model-list-view
        v-if="(currentTableData && currentTableData.showRightView&& currentTableData.modelTreeList)"
      ></model-list-view>
    </keep-alive>
    <model-view v-if="(currentTableData &&currentTableData.showRightView&& currentTableData.mpids)"></model-view>
  </div>
</template>

<script >
import { mapState, mapGetters } from "vuex";
import ModelView from "./child/ModelView";
import ModelListView from "./child/ModelListView";
export default {
  mounted() {},
  computed: {
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  components: {
    "model-list-view": ModelListView,
    "model-view": ModelView,
  },
};
</script>

<style scoped>
.all-slider {
  /* position: relative; */
  box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5);
  -webkit-user-select: none;
}
</style>
