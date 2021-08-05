<template>
  <div>
    <b-table class="mt-3 table-stats" :fields="fields" :items="workerStatsTable"  show-empty empty-text="Подтверждённых работником заказов за выбранный период не найдено" striped foot-clone>
      <template slot="[date]" slot-scope="data">
        {{$moment(data.value).format('DD.MM.YYYY')}}
      </template>
      <template slot="[]" slot-scope="data">
        {{data.value.toFixed(2)}}
      </template>
      <template slot="FOOT[date]" slot-scope="data">
        Итого:
      </template>
      <template slot="FOOT[price]" slot-scope="data">
        {{workerStatsSummary.price.toFixed(2)}}
      </template>
      <template slot="FOOT[priceMotivate]" slot-scope="data">
        {{workerStatsSummary.priceMotivate.toFixed(2)}}
      </template>
      <template slot="FOOT[total]" slot-scope="data">
        {{workerStatsSummary.total.toFixed(2)}}
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'WorkerStats',
  components: {},
  props: {
    namespace: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      fields: [
        {
          key: 'date',
          label: 'Дата'
        },
        {
          key: 'price',
          label: 'Процент от продаж'
        },
        {
          key: 'priceMotivate',
          label: 'Сумма с акций'
        },
        {
          key: 'total',
          label: 'Итого'
        }
      ],
      items: [
      ]
    }
  },
  created () {
  },
  computed: {
    workerStatsTable () {
      return this.$store.getters[`${this.namespace}/workerStatsTable`]
    },
    workerStatsSummary () {
      return this.$store.getters[`${this.namespace}/workerStatsSummary`]
    }
  }
}
</script>

<style scoped>
  /*.table-stats {*/
  /*  max-height: 500px;*/
  /*}*/
</style>
