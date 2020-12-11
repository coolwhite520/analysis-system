<template></template>

<script>
import Model from "@/pages/db/Models.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
  },
  async mounted() {},
};
</script>