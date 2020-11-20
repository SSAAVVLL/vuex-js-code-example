import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import state from './state'

const moduleMotivateAccounting = {
  namespaced: true,
  state () {
    return state
  },
  actions: actions,
  mutations: mutations,
  getters: getters,
  modules: {
  }
}

export default moduleMotivateAccounting
