import Vue from 'vue'
import Vuex from 'vuex'
import MUT, {orderMUT} from '../constants/vuexMutations'
import ACT from '../constants/vuexActions'
import apolloClient from '../apolloClient'
import moment from 'moment-timezone'
import graphqlStats from '../constants/graphqlStats'
import {set} from './vuexHelpers'
import moduleAdmin from './modules/admin'
import moduleCallCenter from './modules/callCenter/callCenter'
import moduleMotivateAccounting from './modules/motivateAccounting/motivateAccounting'
import createPlugin from 'logrocket-vuex'
import LogRocket from 'logrocket'
import moduleOverallStatsWorkshop from './submodules/overallStatsWorkshop'

const logrocketPlugin = createPlugin(LogRocket)

moment.locale('ru')
moment.tz.setDefault('GMT+5')

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    jwtParsed: null
  },
  actions: {
  },
  mutations: {
    [MUT.SET_JWT_PARSED]: set('jwtParsed')
  },
  getters: {
    getJwtParsed (store) {
      return store.jwtParsed
    },
    userId (store) {
      return store.jwtParsed ? store.jwtParsed.user_id : null
    }
  },
  modules: {
    callCenter: moduleCallCenter,
    admin: moduleAdmin,
    motivateAccounting: moduleMotivateAccounting,
    overallWorkshopStat: moduleOverallStatsWorkshop
  },
  plugins: [logrocketPlugin]
})
