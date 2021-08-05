<template>
        <div class="wrap-filter">
            <b-button-group class="mr-3">
                <b-button v-for="period in periods" @click="selectPeriod(period)" :disabled="period.disabled" :key="period.value" :variant="periodButtonType(period)">{{period.title}}</b-button>
            </b-button-group>
            <b-form-group label-cols="2" horizontal  label="c:" class="mb-0 ml-2">
                <datepicker :language="ru" :monday-first="true" @input="changedDateFrom" :value="filterDateFrom" input-class="form-control datepicker"></datepicker>
            </b-form-group>
            <b-form-group label-cols="2" horizontal label="по:" class="mb-0 ml-2">
                <datepicker :language="ru" :monday-first="true" @input="changedDateTo" :value="filterDateTo" input-class="form-control datepicker"></datepicker>
            </b-form-group>
        </div>
</template>

<script>
import {ru} from 'vuejs-datepicker/dist/locale'
import PERIOD_NAMES from '../constants/periodNames'
import ACTIONS from '../constants/vuexActions'
export default {
  name: 'DateFilter',
  data () {
    return {
      periods: [
        {
          title: 'Сегодня',
          value: PERIOD_NAMES.today,
          offsetStart: {},
          offsetEnd: {}
        },
        {
          title: 'Вчера',
          value: PERIOD_NAMES.yesterday,
          offsetStart: {
            days: 1
          },
          offsetEnd: {
            days: 1
          }
        },
        {
          title: 'Неделя',
          value: PERIOD_NAMES.week,
          offsetStart: {
            weeks: 1
          },
          offsetEnd: {
          }
        },
        {
          title: 'Месяц',
          value: PERIOD_NAMES.mouth,
          offsetStart: {
            months: 1
          },
          offsetEnd: {

          }
        },
        {
          title: 'Год',
          value: PERIOD_NAMES.year,
          offsetStart: {
            years: 1
          },
          offsetEnd: {

          }
        },
        {
          title: 'Период',
          disabled: true,
          value: PERIOD_NAMES.period
        }
      ],
      selectedPeriod: PERIOD_NAMES.today,
      PERIOD_NAMES,
      ru
    }
  },
  props: {
    namespace: {
      type: String,
      required: true
    }
  },
  methods: {
    periodButtonType (period) {
      return (period.value === this.selectedPeriod) ? 'info' : 'outline-info'
    },
    selectPeriod (period) {
      this.selectedPeriod = period.value
      let dateFrom = this.$moment()
      Object.keys(period.offsetStart).map(key => {
        dateFrom.subtract(period.offsetStart[key], key)
      })
      let dateTo = this.$moment()
      Object.keys(period.offsetStart).map(key => {
        dateTo.subtract(period.offsetEnd[key], key)
      })
      this[ACTIONS.UPDATE_DATE_FROM_TO]({dateFrom, dateTo})
    },
    changedDateFrom (date) {
      this.changeDateManual()
      let dateFrom = this.$moment(date)
      let dateTo = this.$moment(this.filterDateTo)
      this[ACTIONS.UPDATE_DATE_FROM_TO]({dateFrom, dateTo})
    },
    changedDateTo (date) {
      this.changeDateManual()
      let dateFrom = this.$moment(this.filterDateFrom)
      let dateTo = this.$moment(date)
      this[ACTIONS.UPDATE_DATE_FROM_TO]({dateFrom, dateTo})
    },
    changeDateManual () {
      this.selectedPeriod = PERIOD_NAMES.period
    },
    [ACTIONS.UPDATE_DATE_FROM_TO] (payload) {
      this.$store.dispatch(`${this.namespace}/${ACTIONS.UPDATE_DATE_FROM_TO}`, payload)
    }
  },
  computed: {
    filterDateFrom () {
      return this.$store.getters[`${this.namespace}/filterDateFrom`]
    },
    filterDateTo () {
      return this.$store.getters[`${this.namespace}/filterDateTo`]
    }
  },
  created () {
    let selectedPeriodObj = this.periods.find(el => el.value === this.selectedPeriod)
    // let selectedPeriod = this.periods.forEach(el => {console.log(el)})
    this.selectPeriod(selectedPeriodObj)
  }
}
</script>

<style scoped>
    .wrap-filter {
        display:flex;
        align-items: center;
    }
</style>
