import ACT from '../../constants/vuexActions'
import MUT from '../../constants/vuexMutations'
import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'
import moduleOrderWorkshopStats from '../submodules/orderWorkshopStats'
import moduleMotivateWorkerStats from '../submodules/motivateWorkerStats'

const moduleAdmin = {
  namespaced: true,
  state: {},
  actions: {},
  modules: {
    statsOrderWorkshop: moduleOrderWorkshopStats,
    callCenterStats: moduleMotivateWorkerStats('call_center'),
    cookerMotivate: moduleMotivateWorkerStats('cooker')
  }
}
// const moduleAdmin = {
//   state: {
//
//     statsTimeOrder: null,
//     typeWorkshops: [],
//     statsWorkshops: [],
//     restPoints: [],
//     selectedRestPoint: null
//   },
//   actions: {
//     async [ACT.UPDATE_DATE_FROM_TO] ({commit, dispatch, state}, payload) {
//       if (state.typeWorkshops.length === 0) {
//         await dispatch(ACT.GET_TYPES_WORKSHOP)
//         await dispatch(ACT.GET_REST_POINTS)
//       }
//       // console.log(state.typeWorkshops.length)
//       commit(MUT.SET_DATE_FROM_TO, payload)
//       dispatch(ACT.GET_ORDER_STATS)
//       dispatch(ACT.GET_WORKSHOP_STATS)
//     },
//     [ACT.GET_ORDER_STATS] ({commit, state, getters}) {
//       apolloClient.query({
//         query: graphqlStats.statsOrder,
//         variables: {
//           dateFrom: getters.dateFromForQuery,
//           dateTo: getters.dateToForQuery,
//           idRestPoint: getters.selectedRestPointForQuery
//         }
//       }).then(res => {
//         commit(MUT.SET_STATS_TIME_ORDER, {
//           title: 'Статистика по заказам',
//           stats: res.data.statsStageOrder.nodes
//         })
//       })
//     },
//     [ACT.GET_WORKSHOP_STATS] ({commit, state, getters}) {
//       let workshopPromises = []
//       state.typeWorkshops.forEach(type => {
//         let promise = apolloClient.query({
//           query: graphqlStats.statsWorkshop,
//           variables: {
//             dateFrom: getters.dateFromForQuery,
//             dateTo: getters.dateToForQuery,
//             idTypeWorkshop: type.id,
//             idRestPoint: getters.selectedRestPointForQuery
//           }
//         })
//         workshopPromises.push(promise)
//       })
//       let workshopStats = []
//       Promise.all(workshopPromises).then(res => {
//         res.forEach((item, ind) => {
//           let statObj = {
//             title: state.typeWorkshops[ind].name,
//             stats: item.data.statsStageWorkshop.nodes
//           }
//           workshopStats.push(statObj)
//         })
//         commit(MUT.SET_STATS_WORKSHOPS, workshopStats)
//       }).catch(eror => {
//         console.log(eror)
//       })
//     },
//     [ACT.GET_TYPES_WORKSHOP] ({commit}) {
//       return apolloClient.query({
//         query: graphqlStats.typesWorkshop
//       }).then(res => {
//         commit(MUT.SET_TYPES_WORKSHOP, res.data.allTypeWorkshops.nodes)
//       })
//     },
//     [ACT.GET_REST_POINTS] ({commit}) {
//       return apolloClient.query({
//         query: graphqlStats.restPoints
//       }).then(res => {
//         commit(MUT.SET_REST_POINTS, res.data.allRestPoints.nodes)
//       })
//     },
//     [ACT.UPDATE_SELECTED_RESTPOINT] ({commit, dispatch}, payload) {
//       commit(MUT.SET_SELECTED_RESTPOINT, payload)
//       dispatch(ACT.GET_ORDER_STATS)
//       dispatch(ACT.GET_WORKSHOP_STATS)
//     }
//   },
//   mutations: {
//     [MUT.SET_DATE_FROM_TO] (state, payload) {
//       state.filterDateFrom = payload.dateFrom
//       state.filterDateTo = payload.dateTo
//     },
//     [MUT.SET_STATS_TIME_ORDER] (state, stats) {
//       state.statsTimeOrder = stats
//     },
//     [MUT.SET_TYPES_WORKSHOP] (state, types) {
//       state.typeWorkshops = types
//     },
//     [MUT.SET_STATS_WORKSHOPS] (state, payload) {
//       state.statsWorkshops = payload
//     },
//     [MUT.SET_REST_POINTS] (state, payload) {
//       state.restPoints = payload
//     },
//     [MUT.SET_SELECTED_RESTPOINT] (state, payload) {
//       state.selectedRestPoint = payload
//     }
//   },
//   getters: {
//     filterDateFrom (state) {
//       return new Date(state.filterDateFrom)
//     },
//     dateFromForQuery (state) {
//       return state.filterDateFrom ? state.filterDateFrom.format('YYYY-MM-DD') : null
//     },
//     filterDateTo (state) {
//       return new Date(state.filterDateTo)
//     },
//     dateToForQuery (state) {
//       return state.filterDateTo ? state.filterDateTo.format('YYYY-MM-DD') : null
//     },
//     statsOrder (state) {
//       return state.statsTimeOrder
//     },
//     statsWorkshop (state) {
//       return state.statsWorkshops
//     },
//     statsStages (state) {
//       let resStats = []
//       if (state.statsTimeOrder !== null) {
//         resStats.push(state.statsTimeOrder)
//       }
//       resStats = resStats.concat(state.statsWorkshops)
//       return resStats
//     },
//     restPointOptions (state) {
//       let resArray = []
//       resArray.push(emptySelectRestPoint)
//       let pointsFromDB = state.restPoints.map(el => {
//         return {
//           value: el,
//           text: el.address
//         }
//       })
//       return resArray.concat(pointsFromDB)
//     },
//     filterRestPoint (state) {
//       return state.selectedRestPoint
//     },
//     selectedRestPointForQuery (state) {
//       return state.selectedRestPoint ? state.selectedRestPoint.id : state.selectedRestPoint
//     }
//   }
// }

export default moduleAdmin
