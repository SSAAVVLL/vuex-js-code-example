import moduleDateFilter from '../reusablemodules/dateFilter'
import moduleRestPointFilter from '../reusablemodules/restPointFilter'
import moduleDeliveryTypeFilter from '../reusablemodules/deliveryTypeFilter'
import ACT, { workerCallCenterStatsACT as wACT, orderWorkshopACT as owACT} from '../../constants/vuexActions'
import MUT, {orderWorkshopMUT} from '../../constants/vuexMutations'
import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'
import statsOWQueries from '../../graphql/statsOrdersWorkshops'
import {orderWorkshopGetters} from '../../constants/vuexGetters'
import {orderWorkshopVars} from '../../constants/vuexVariables'
import moment from '../../moment'

const moduleOrderWorkshopStats = {
  namespaced: true,
  state: {
    statsTimeOrder: null,
    typeWorkshops: [],
    statsWorkshops: [],
    loadingOverallStatsWorkshop: true,
    [orderWorkshopVars.statsOrdersDetailed]: [],
    [orderWorkshopVars.detailsStatsInterval]: [
      {
        min: 0,
        max: 10,
        title: 'до 10м'
      },
      {
        min: 10,
        max: 20,
        title: 'до 20м'
      },
      {
        min: 20,
        max: 30,
        title: 'до 30м'
      },
      {
        min: 30,
        title: '> 30м'
      },
      {
        avg: true,
        title: 'Среднее'
      }
    ]
  },
  actions: {
    async [owACT.REQUEST_INIT_DATA] ({dispatch}) {
      await dispatch(ACT.GET_TYPES_WORKSHOP)
      await dispatch(ACT.GET_REST_POINTS)
      await dispatch(ACT.GET_DELIVERY_TYPES)
    },
    [ACT.DATE_UPDATED] ({dispatch}) {
      dispatch(ACT.REQUEST_STATS)
    },
    [ACT.FILTER_UPDATED] ({dispatch}) {
      dispatch(ACT.REQUEST_STATS)
    },
    async [ACT.REQUEST_STATS] ({commit, dispatch, state}) {
      // if (state.typeWorkshops.length === 0) {
      //   await dispatch(ACT.GET_TYPES_WORKSHOP)
      //   await dispatch(ACT.GET_REST_POINTS)
      // }
      dispatch(ACT.GET_ORDER_STATS)
      dispatch(ACT.GET_WORKSHOP_STATS)
      dispatch(owACT.GET_WORKSHOP_COOKED_STATS)
    },
    [owACT.GET_WORKSHOP_COOKED_STATS] ({state, commit, getters}) {
      commit(orderWorkshopMUT.SET_LOADING_STATS_WORKSHOP_COOKED, true)
      // let workshopPromises = []
      // state.typeWorkshops.forEach(type => {
      apolloClient.query({
        query: statsOWQueries.COOKED_TIME_WORKSHOPS,
        variables: {
          dateFrom: getters.dateFromForQuery,
          dateTo: getters.dateToForQuery,
          idRestPoint: getters.selectedRestPointForQuery,
          idDeliveryType: getters.selectedDeliveryTypeForQuery
        }
      }).then(res => {
        commit(orderWorkshopMUT.SET_STATS_WORKSHOPS_COOKED, res.data.statsWorkshopsOverall.nodes)
        commit(orderWorkshopMUT.SET_LOADING_STATS_WORKSHOP_COOKED, false)
      }).catch(error => {
        console.error(error)
        commit(orderWorkshopMUT.SET_LOADING_STATS_WORKSHOP_COOKED, false)
      })
      // workshopPromises.push(promise)
      // })
      // let workshopStats = []
      // Promise.all(workshopPromises).then(res => {
      //   res.forEach((item, ind) => {
      //     let statObj = {
      //       idTypeWorkshop: state.typeWorkshops[ind].id,
      //       title: state.typeWorkshops[ind].name,
      //       stats: item.data.statsCookingOrdersWorkshops.nodes
      //     }
      //     workshopStats.push(statObj)
      //   })
      //   commit(orderWorkshopMUT.SET_STATS_WORKSHOPS_COOKED, workshopStats)
      // }).catch(eror => {
      //   console.log(eror)
      // })
      // apolloClient.query({
      //   query: statsOWQueries.COOKED_TIME_WORKSHOPS,
      //   variables: {
      //     dateFrom: getters.dateFromForQuery,
      //     dateTo: getters.dateToForQuery,
      //     idRestPoint: getters.selectedRestPointForQuery
      //   }
      // }).then(res => {
      //   commit(orderWorkshopMUT.SET_STATS_ORDERS_OVERALL, res.data.statsCookingOrders.nodes)
      // })
    },
    [ACT.GET_TYPES_WORKSHOP] ({commit}) {
      return apolloClient.query({
        query: graphqlStats.typesWorkshop
      }).then(res => {
        commit(MUT.SET_TYPES_WORKSHOP, res.data.allTypeWorkshops.nodes)
      })
    },
    [ACT.GET_ORDER_STATS] ({commit, state, getters}) {
      apolloClient.query({
        query: graphqlStats.statsOrder,
        variables: {
          dateFrom: getters.dateFromForQuery,
          dateTo: getters.dateToForQuery,
          idRestPoint: getters.selectedRestPointForQuery,
          idTypeDelivery: getters.selectedDeliveryTypeForQuery
        }
      }).then(res => {
        commit(MUT.SET_STATS_TIME_ORDER, {
          title: 'Статистика по заказам',
          stats: res.data.statsStageOrder.nodes
        })
      })
    },
    [ACT.GET_WORKSHOP_STATS] ({commit, state, getters}) {
      let workshopPromises = []
      state.typeWorkshops.forEach(type => {
        let promise = apolloClient.query({
          query: graphqlStats.statsWorkshop,
          variables: {
            dateFrom: getters.dateFromForQuery,
            dateTo: getters.dateToForQuery,
            idTypeWorkshop: type.id,
            idRestPoint: getters.selectedRestPointForQuery,
            idTypeDelivery: getters.selectedDeliveryTypeForQuery
          }
        })
        workshopPromises.push(promise)
      })
      let workshopStats = []
      Promise.all(workshopPromises).then(res => {
        res.forEach((item, ind) => {
          let statObj = {
            title: state.typeWorkshops[ind].name,
            stats: item.data.statsStageWorkshop.nodes
          }
          workshopStats.push(statObj)
        })
        commit(MUT.SET_STATS_WORKSHOPS, workshopStats)
      }).catch(eror => {
        console.log(eror)
      })
    }
  },
  mutations: {
    [MUT.SET_STATS_TIME_ORDER] (state, stats) {
      state.statsTimeOrder = stats
    },
    [MUT.SET_TYPES_WORKSHOP] (state, types) {
      state.typeWorkshops = types
    },
    [MUT.SET_STATS_WORKSHOPS] (state, payload) {
      state.statsWorkshops = payload
    },
    [orderWorkshopMUT.SET_STATS_WORKSHOPS_COOKED] (state, payload) {
      state[orderWorkshopVars.statsOrdersDetailed] = payload
    },
    [orderWorkshopMUT.SET_LOADING_STATS_WORKSHOP_COOKED] (state, payload) {
      state[orderWorkshopVars.loadingOverallStatsWorkshop] = payload
    }
  },
  getters: {
    statsOrder (state) {
      return state.statsTimeOrder
    },
    statsWorkshop (state) {
      return state.statsWorkshops
    },
    statsStages (state) {
      let resStats = []
      if (state.statsTimeOrder !== null) {
        resStats.push(state.statsTimeOrder)
      }
      resStats = resStats.concat(state.statsWorkshops)
      return resStats
    },
    [orderWorkshopGetters.LOADING_STATS_WORKSHOPS_OVERALL] (state, getters) {
      return state[orderWorkshopVars.loadingOverallStatsWorkshop]
    },
    [orderWorkshopGetters.STATS_WORKSHOPS] (state, getters) {
      return state[orderWorkshopVars.statsOrdersDetailed]
      // let dateFrom = getters.dateFromForQuery
      // let dateTo = getters.dateToForQuery
      // // let timeSeries = []
      // let stats = []
      // let currentIndexStats = {
      //   hotWorkshop: 0,
      //   pizzaWorkshop: 0,
      //   coldWorkshop: 0
      // }
      // let workshopsKeywords = {
      //   1: 'coldWorkshop',
      //   2: 'hotWorkshop',
      //   3: 'pizzaWorkshop'
      // }
      // if (dateFrom && dateTo) {
      //   dateFrom = moment(dateFrom)
      //   dateTo = moment(dateTo)
      //   while (dateFrom.diff(dateTo, 'hours') < 24) {
      //     let hours = dateFrom.format('H')
      //     let date = dateFrom.format('YYYY-MM-DD')
      //     let statObj = {
      //       datetime: {...dateFrom},
      //       hotWorkshop: [],
      //       pizzaWorkshop: [],
      //       coldWorkshop: []
      //     }
      //     state[orderWorkshopVars.statsOrdersDetailed].forEach(workshopsStats => {
      //       let idTypeWorkshop = workshopsStats.idTypeWorkshop
      //       let workshopKeyword = workshopsKeywords[idTypeWorkshop]
      //       let condition = workshopsStats.stats[currentIndexStats[workshopKeyword]] &&
      //                       workshopsStats.stats[currentIndexStats[workshopKeyword]].date >= date &&
      //                       workshopsStats.stats[currentIndexStats[workshopKeyword]].hours >= hours
      //       while (condition) {
      //         if (
      //           workshopsStats.stats[currentIndexStats[workshopKeyword]].date === date &&
      //           workshopsStats.stats[currentIndexStats[workshopKeyword]].hours === hours
      //         ) {
      //           console.log('added')
      //           statObj[workshopKeyword].push(workshopsStats.stats[currentIndexStats[workshopKeyword]])
      //         }
      //         currentIndexStats[workshopKeyword]++
      //         condition = workshopsStats.stats[currentIndexStats[workshopKeyword]] &&
      //           workshopsStats.stats[currentIndexStats[workshopKeyword]].date >= date &&
      //           workshopsStats.stats[currentIndexStats[workshopKeyword]].hours >= hours
      //       }
      //     })
      //     let sumLengthStatsWorkshop = statObj.coldWorkshop.length +
      //                                  statObj.hotWorkshop.length +
      //                                  statObj.pizzaWorkshop.length
      //     if (sumLengthStatsWorkshop > 0) {
      //       stats.push(statObj)
      //     }
      //
      //     dateFrom.add(1, 'hour')
      //   }
      // }
      //
      //
      // // state[orderWorkshopVars.statsOrdersDetailed].forEach(workshopStats => {
      // //   workshopStats.stats.forEach(workshopStat => {
      // //     if (currentStatObject === null) {
      // //       let findedObject
      // //       stats.forEach()
      // //     }
      // //     console.log(workshopStat)
      // //   })
      // // })
      // return stats
    }
  },
  modules: {
    dateFilter: moduleDateFilter,
    restPointFilter: moduleRestPointFilter,
    deliveryTypeFilter: moduleDeliveryTypeFilter
  }
}

export default moduleOrderWorkshopStats
