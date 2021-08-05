<template>
    <div>
        <navbar-header></navbar-header>
        <b-container class="mt-3">
          <b-tabs content-class="mt-3">
            <b-tab title="Статистика по заказам" active>
              <b-row>
                <b-col xs="12">
                  <date-filter :namespace="namespace"></date-filter>
                </b-col>
              </b-row>
              <b-row class="mt-3">
                <b-col md="6">
                  <rest-point-filter :namespace="namespace"></rest-point-filter>
                </b-col>
                <b-col md="6">
                  <delivery-type-filter :namespace="namespace"></delivery-type-filter>
                </b-col>
              </b-row>
              <h4 class="mt-3">Совокупная статистика</h4>
              <b-row class="stats-blocks mt-3">
                <b-col md="3" class="stats-col" v-for="statStage in statsStages" :key="statStage.title">
                  <stats-order-block :stats="statStage" class="stats-item"></stats-order-block>
                </b-col>
              </b-row>
              <b-row class="mt-4">
                <b-col xs="12">
                  <table-detailed-stats-workshop :vuexNamespace="namespace" :stats="statsWorkshopsCooked"></table-detailed-stats-workshop>
                </b-col>
              </b-row>
            </b-tab>
            <b-tab title="Выполнение заказов">

              <stats-order-completion></stats-order-completion>
            </b-tab>
            <b-tab title="Статистика по сотрудникам кол-центра">
              <AdminWorkerStats></AdminWorkerStats>
            </b-tab>
            <b-tab title="Мотивация поваров">
              <motivate-cook-stats></motivate-cook-stats>
            </b-tab>
          </b-tabs>
        </b-container>
        <!--<CourierStatistic class="body"></CourierStatistic>-->
    </div>
</template>

<script>
import TableDetailedStatsWorkshop from '../components/TableDetailedStatsWorkshop'
import NavbarHeader from '@/components/NavbarHeader'
import DateFilter from '../components/DateFilter'
import StatsOrderBlock from '../components/StatsOrderBlock'
import RestPointFilter from '../components/RestPointFilter'
import DeliveryTypeFilter from '../components/DeliveryTypeFilter'
import AdminWorkerStats from '../components/AdminWorkerStats'
import ACT, {orderWorkshopACT as owACT} from '../constants/vuexActions'
import {orderWorkshopGetters} from '../constants/vuexGetters'
import MotivateCookStats from '../components/MotivateCookStats'
import StatsOrderCompletion from '../components/StatsOrderCompletion'

export default {
  name: 'StatsAdminLayout',
  data () {
    return {
      namespace: 'admin/statsOrderWorkshop'
    }
  },
  created () {
    this.$store.dispatch(`${this.namespace}/${owACT.REQUEST_INIT_DATA}`).then(res => {
      this.$store.dispatch(`${this.namespace}/${ACT.REQUEST_STATS}`)
    })
  },
  components: {
    StatsOrderCompletion,
    MotivateCookStats,
    NavbarHeader,
    DateFilter,
    StatsOrderBlock,
    RestPointFilter,
    DeliveryTypeFilter,
    AdminWorkerStats,
    TableDetailedStatsWorkshop
  },
  computed: {
    statsStages () {
      return this.$store.getters[`${this.namespace}/statsStages`]
    },
    statsWorkshopsCooked () {
      return this.$store.getters[`${this.namespace}/${orderWorkshopGetters.STATS_WORKSHOPS}`]
    }
  }
}
</script>

<style scoped>
    .stats-blocks {
        align-items: stretch;
    }
    .stats-col {
        display: flex;
        flex-direction: column;
    }
    .stats-item {
        flex-grow: 1;
    }
</style>
