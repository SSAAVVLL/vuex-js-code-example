import moduleCallCenterWorkerStats from '../../submodules/motivateWorkerStats'
import {callCenterVars} from '../../../constants/vuexVariables'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import state from './state'

const moduleCallCenter = {
  namespaced: true,
  state () {
    return state
  },
  actions: actions,
  mutations: mutations,
  getters: getters,
  modules: {
    callCenterStats: moduleCallCenterWorkerStats('call_center')
  }
}

export default moduleCallCenter
