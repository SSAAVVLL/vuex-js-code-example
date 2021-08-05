<template>
    <b-form-group horizontal class="mb-1 mr-4" label="Сотрудник:">
        <b-form-select :value="selectedWorker" @input="changedWorker" :options="workerOptions">
        </b-form-select>
    </b-form-group>
</template>

<script>
import ACT from '../constants/vuexActions'
export default {
  name: 'RestPointFilter',
  props: {
    namespace: {
      type: String,
      required: true
    }
  },
  methods: {
    changedWorker (newVal) {
      this[ACT.UPDATE_SELECTED_WORKER](newVal)
    },
    [ACT.UPDATE_SELECTED_WORKER] (payload) {
      this.$store.dispatch(`${this.namespace}/${ACT.UPDATE_SELECTED_WORKER}`, payload)
    }
  },
  computed: {
    workerOptions () {
      return this.$store.getters[`${this.namespace}/workerOptions`]
    },
    selectedWorker () {
      return this.$store.getters[`${this.namespace}/selectedWorker`]
    }
  }
}
</script>

<style scoped>

</style>
