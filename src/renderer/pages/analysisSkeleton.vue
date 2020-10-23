<template>
  <div
    :style="{
      marginTop: mainViewHeight / 2 - 120 + 'px',
      marginBottom: mainViewHeight / 2 + 120 + 'px',
      textAlign: 'center',
    }"
  >
    <!-- 动画的url地址：https://www.cnblogs.com/lhb25/p/loading-spinners-animated-with-css3.html -->
    <div class="spinner">
      <div class="cube1"></div>
      <div class="cube2"></div>
    </div>
    <p style="color: gray; margin-top: 20px">数据载入中...</p>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  // 这个页面是预加载的页面
  computed: {
    ...mapState("AppPageSwitch", ["mainViewHeight"]),
  },
};
</script>
<style  scoped>
.spinner {
  margin: 100px auto;
  width: 32px;
  height: 32px;
  position: relative;
}

.cube1,
.cube2 {
  background-color: #3c4e6b;
  width: 30px;
  height: 30px;
  position: absolute;
  top: 0;
  left: 0;

  -webkit-animation: cubemove 1.8s infinite ease-in-out;
  animation: cubemove 1.8s infinite ease-in-out;
}

.cube2 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

@-webkit-keyframes cubemove {
  25% {
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  }
  50% {
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  }
  75% {
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg)
      scale(0.5);
  }
  100% {
    -webkit-transform: rotate(-360deg);
  }
}

@keyframes cubemove {
  25% {
    transform: translateX(42px) rotate(-90deg) scale(0.5);
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  }
  50% {
    transform: translateX(42px) translateY(42px) rotate(-179deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);
  }
  50.1% {
    transform: translateX(42px) translateY(42px) rotate(-180deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  }
  75% {
    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg)
      scale(0.5);
  }
  100% {
    transform: rotate(-360deg);
    -webkit-transform: rotate(-360deg);
  }
}
</style>