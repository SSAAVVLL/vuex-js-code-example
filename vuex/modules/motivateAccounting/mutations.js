import {motivateAccountingMUT} from '../../../constants/vuexMutations'
import {motivateAccountingVars} from '../../../constants/vuexVariables'

const mutations = {
  [motivateAccountingMUT.SET_WORKERS_ON_WORK_LIST] (state, payload) {
    state[motivateAccountingVars.listWorkersOnWork] = payload
  }
}
export default mutations
