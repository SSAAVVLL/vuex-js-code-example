import MUT from '../../constants/vuexMutations'
import ACT from '../../constants/vuexActions'
import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'
import orderFunc from '../../functionsLib/orderFunc'

const emptySelectWorkers = {
  value: null,
  text: '-- Не выбран --'
}

const moduleWorkerFilter = {
  namespaced: false,
  state () {
    return {
      selectedWorker: null,
      workers: [],
      workerPosition: 'cooker'
    }
  },
  actions: {
    [ACT.GET_WORKERS] ({state, commit}) {
      return apolloClient.query({
        query: graphqlStats.workers,
        variables: {
          position: state.workerPosition
        }
      }).then(res => {
        commit(MUT.SET_WORKERS, res.data.allWorkers.nodes)
      })
    },
    [ACT.UPDATE_SELECTED_WORKER] ({commit, dispatch}, payload) {
      commit(MUT.SET_SELECTED_WORKER, payload)
      dispatch(ACT.WORKER_UPDATED)
    }
  },
  mutations: {
    [MUT.SET_WORKERS] (state, payload) {
      state.workers = payload
    },
    [MUT.SET_SELECTED_WORKER] (state, payload) {
      state.selectedWorker = payload
    }
  },
  getters: {
    workerOptions (state) {
      let resArray = []
      resArray.push(emptySelectWorkers)
      let workersFromDB = state.workers.map(el => {
        return {
          value: el,
          text: orderFunc.shortNameWorker(el)
        }
      })
      return resArray.concat(workersFromDB)
    },
    selectedWorker (state) {
      return state.selectedWorker
    },
    selectedWorkerQuery (state) {
      return state.selectedWorker ? state.selectedWorker.id : state.selectedWorker
    }
  }
}

export default moduleWorkerFilter
