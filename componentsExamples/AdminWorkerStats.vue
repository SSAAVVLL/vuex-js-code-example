<template>
  <div>
    <date-filter :namespace="namespace"></date-filter>
    <b-row class="mt-3">
      <b-col lg="6">
        <worker-filter :namespace="namespace"></worker-filter>
      </b-col>
    </b-row>
    <WorkerStats  :namespace="namespace"></WorkerStats>
  </div>
</template>

<script>
import WorkerStats from './WorkerStats'
import DateFilter from './DateFilter'
import WorkerFilter from './WorkerFilter'
export default {
  name: 'AdminWorkerStats',
  components: {
    WorkerStats,
    DateFilter,
    WorkerFilter
  },
  data () {
    return {
      namespace: 'admin/callCenterStats'
    }
  }
}
</script>

<style scoped>

</style>
