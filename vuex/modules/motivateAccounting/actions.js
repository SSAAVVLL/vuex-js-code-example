import {motivateAccountingACT as acts} from '../../../constants/vuexActions'
import apolloClient from '../../../apolloClient'
import motivateAccountingQueries from '../../../constants/graphqlAccounting'
import {motivateAccountingMUT} from '../../../constants/vuexMutations'

const actions = {
  [acts.REQUEST_CURRENT_WORKERS_LIST] ({state, commit}) {
    apolloClient.query({
      query: motivateAccountingQueries.LIST_ACCOUNTING_WORKERS,
      fetchPolicy: 'network-only'
    }).then(res => {
      let listCurrentWorkers = res.data.accountingWorkersGetlist.nodes
      commit(motivateAccountingMUT.SET_WORKERS_ON_WORK_LIST, listCurrentWorkers)
    })
  }
}
export default actions
