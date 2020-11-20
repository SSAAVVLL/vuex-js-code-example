import MUT from '../../constants/vuexMutations'
import ACT from '../../constants/vuexActions'
// import { workerCallCenterStatsACT as wACT } from '../../constants/vuexActions'
import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'

const emptySelectDeliveryType = {
  value: null,
  text: 'Все'
}

const moduleDeliveryTypeFilter = {
  namespaced: false,
  state () {
    return {
      selectedDeliveryType: null,
      deliveryTypes: []
    }
  },
  actions: {
    [ACT.GET_DELIVERY_TYPES] ({commit}) {
      return apolloClient.query({
        query: graphqlStats.deliveryTypes
      }).then(res => {
        commit(MUT.SET_DELIVERY_TYPES, res.data.allTypeDeliveries.nodes)
      })
    },
    [ACT.UPDATE_SELECTED_DELIVERY_TYPE] ({commit, dispatch}, payload) {
      commit(MUT.SET_SELECTED_DELIVERY_TYPE, payload)
      dispatch(ACT.FILTER_UPDATED)
    }
  },
  mutations: {
    [MUT.SET_DELIVERY_TYPES] (state, payload) {
      state.deliveryTypes = payload
    },
    [MUT.SET_SELECTED_DELIVERY_TYPE] (state, payload) {
      state.selectedDeliveryType = payload
    }
  },
  getters: {
    deliveryTypeOptions (state) {
      let resArray = []
      resArray.push(emptySelectDeliveryType)
      let deliveryTypesFromDB = state.deliveryTypes.map(el => {
        return {
          value: el,
          text: el.name
        }
      })
      return resArray.concat(deliveryTypesFromDB)
    },
    filterDeliveryType (state) {
      return state.selectedDeliveryType
    },
    selectedDeliveryTypeForQuery (state) {
      return state.selectedDeliveryType ? state.selectedDeliveryType.id : state.selectedDeliveryType
    }
  }
}

export default moduleDeliveryTypeFilter
