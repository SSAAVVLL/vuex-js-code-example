import MUT from '../../constants/vuexMutations'
import ACT from '../../constants/vuexActions'

const moduleDateFilter = {
  namespaced: false,
  state () {
    return {
      filterDateFrom: null,
      filterDateTo: null
    }
  },
  actions: {
    [ACT.UPDATE_DATE_FROM_TO] ({commit, dispatch, state}, payload) {
      commit(MUT.SET_DATE_FROM_TO, payload)
      dispatch(ACT.DATE_UPDATED)
    }
  },
  mutations: {
    [MUT.SET_DATE_FROM_TO] (state, payload) {
      state.filterDateFrom = payload.dateFrom
      state.filterDateTo = payload.dateTo
    }
  },
  getters: {
    filterDateFrom (state) {
      return new Date(state.filterDateFrom)
    },
    filterDateTo (state) {
      return new Date(state.filterDateTo)
    },
    dateFromForQuery (state) {
      return state.filterDateFrom ? state.filterDateFrom.format('YYYY-MM-DD') : null
    },
    dateToForQuery (state) {
      return state.filterDateTo ? state.filterDateTo.format('YYYY-MM-DD') : null
    }
  }
}

export default moduleDateFilter
