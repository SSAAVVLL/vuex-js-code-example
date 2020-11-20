import MUT from '../../constants/vuexMutations'
import ACT from '../../constants/vuexActions'

// import { workerCallCenterStatsACT as wACT } from '../../constants/vuexActions'

import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'

const emptySelectRestPoint = {
  value: null,
  text: 'Все'
}

const moduleRestPointFilter = {
  namespaced: false,
  state () {
    return {
      selectedRestPoint: null,
      restPoints: []
    }
  },
  actions: {
    [ACT.GET_REST_POINTS] ({commit}) {
      return apolloClient.query({
        query: graphqlStats.restPoints
      }).then(res => {
        commit(MUT.SET_REST_POINTS, res.data.allRestPoints.nodes)
      })
    },
    [ACT.UPDATE_SELECTED_RESTPOINT] ({commit, dispatch}, payload) {
      commit(MUT.SET_SELECTED_RESTPOINT, payload)
      dispatch(ACT.FILTER_UPDATED)
    }
  },
  mutations: {
    [MUT.SET_REST_POINTS] (state, payload) {
      state.restPoints = payload
    },
    [MUT.SET_SELECTED_RESTPOINT] (state, payload) {
      state.selectedRestPoint = payload
    }
  },
  getters: {
    restPointOptions (state) {
      let resArray = []
      resArray.push(emptySelectRestPoint)
      let pointsFromDB = state.restPoints.map(el => {
        return {
          value: el,
          text: el.address
        }
      })
      return resArray.concat(pointsFromDB)
    },
    filterRestPoint (state) {
      return state.selectedRestPoint
    },
    selectedRestPointForQuery (state) {
      return state.selectedRestPoint ? state.selectedRestPoint.id : state.selectedRestPoint
    }
  }
}

export default moduleRestPointFilter
