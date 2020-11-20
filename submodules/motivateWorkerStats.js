import moduleDateFilter from '../reusablemodules/dateFilter'
import ACT, { workerCallCenterStatsACT as wACT } from '../../constants/vuexActions'
import apolloClient from '../../apolloClient'
import graphqlStats from '../../constants/graphqlStats'
import MUT from '../../constants/vuexMutations'
import ModuleWorkerFilter from '../reusablemodules/workerFilter'
import { cancelable } from 'cancelable-promise'

const moduleCallCenterWorkerStats = (workerPosition) => {
  let queryStats = workerPosition === 'call_center' ? graphqlStats.workerCallCenterStats : graphqlStats.cookerMotivateStats
  return {
    namespaced: true,
    state: {
      idWorker: null,
      groupByDay: false,
      workerStats: [],
      loadingQuery: false,
      queryPromises: []
    },
    actions: {
      [ACT.GROUP_BY_DAY_UPDATED]: ({commit, dispatch, state}, group) => {
        commit(MUT.SET_GROUP_BY_DAY, group)
        dispatch(ACT.GET_WORKERS_STATS)
      },
      [ACT.DATE_UPDATED]: ({commit, dispatch, state}) => {
        dispatch(ACT.GET_WORKERS_STATS)
      },
      [ACT.WORKER_UPDATED]: ({commit, dispatch, state}) => {
        dispatch(ACT.GET_WORKERS_STATS)
      },
      [ACT.GET_WORKERS_STATS]: async ({state, commit, dispatch, getters}) => {
        try {
          if (state.workerFilter.workers.length === 0) {
            await dispatch(ACT.GET_WORKERS)
          }
        } catch (e) {
          console.error(e)
        }
        commit(MUT.SET_LOADING_STATE, true)
        let promise = apolloClient.query({
          query: queryStats,
          variables: {
            dateFrom: getters.dateFromForQuery,
            dateTo: getters.dateToForQuery,
            idWorker: getters.selectedWorkerQuery ? getters.selectedWorkerQuery : null
          }
        })
        for (let i = 0; i < state.queryPromises.length; i++) {
          state.queryPromises[i].cancel()
        }
        let cancelablePromise = cancelable(promise)
        state.queryPromises.push(cancelablePromise)
        cancelablePromise.then(res => {
          let result = null
          if (workerPosition === 'call_center') {
            result = res.data.statsWorkerCallcenter.nodes
          } else if (workerPosition === 'cooker') {
            result = res.data.calcCookerMotivate.nodes
          }
          commit(MUT.SET_LOADING_STATE, false)
          commit(MUT.SET_STATS_WORKER, result)
        }).catch(err => {
          alert(err)
          commit(MUT.SET_LOADING_STATE, false)
        })
        return cancelablePromise
      }
    },
    mutations: {
      [MUT.SET_STATS_WORKER]: (state, payload) => {
        state.workerStats = payload
      },
      [MUT.SET_LOADING_STATE]: (state, payload) => {
        state.loadingQuery = payload
      },
      [MUT.SET_GROUP_BY_DAY]: (state, payload) => {
        state.groupByDay = payload
      }
    },
    getters: {
      workerStatsTable (state, getters) {
        let rowsStats = []
        if (workerPosition === 'call_center') {
          state.workerStats.forEach((stat) => {
            let prevItem = rowsStats.slice(-1)[0]
            let statObj = {
              date: new Date(stat.date),
              price: parseFloat(stat.priceMotivate) ? 0 : parseFloat(stat.price) * 0.01,
              priceMotivate: parseFloat(stat.priceMotivate)
            }
            statObj.total = statObj.price + statObj.priceMotivate
            if (prevItem && statObj.date.getTime() === prevItem.date.getTime()) {
              prevItem.price += statObj.priceMotivate ? 0 : statObj.price
              prevItem.priceMotivate += statObj.priceMotivate
              prevItem.total += statObj.total
            } else {
              rowsStats.push(statObj)
            }
          })
        } else if (workerPosition === 'cooker') {
          state.workerStats.forEach((stat) => {
            let statObj = {
              restPoint: stat.restPoint,
              date: stat.date,
              timeOpened: stat.timeOpened,
              timeClosed: stat.timeClosed,
              hoursOnWork: Number(stat.hoursOnWork),
              sumFromHours: Number(stat.sumFromHours),
              percentTarget: Number(stat.percentTarget),
              percentReward: Number(stat.percentReward),
              sumPercentageOfTurnover: Number(stat.sumPercentageOfTurnover),
              turnover: Number(stat.turnover),
              hour: stat.hour,
              totalWorkersHoursByPointDay: stat.totalWorkersHoursByPointDay
            }
            statObj.total = statObj.sumFromHours + statObj.sumPercentageOfTurnover
            rowsStats.push(statObj)
          })

          let finalObj = {}
          if (getters.groupByDay) {
            let hoursOnWork = 0
            let sumFromHours = 0
            let percentTarget = 0
            let percentReward = 0
            let sumPercentageOfTurnover = 0
            let turnover = 0
            let hour = 0
            let totalWorkersHoursByPointDay = 0
            rowsStats.forEach((el, index) => {
              const date = el.date
              if (finalObj[date]) {
                hoursOnWork += el.hoursOnWork
                sumFromHours += el.sumFromHours
                percentTarget += el.percentTarget
                percentReward += el.percentReward
                sumPercentageOfTurnover += el.sumPercentageOfTurnover
                turnover += el.turnover
                totalWorkersHoursByPointDay += el.totalWorkersHoursByPointDay

                finalObj[date].hoursOnWork = hoursOnWork
                finalObj[date].sumFromHours = sumFromHours
                finalObj[date].percentTarget = percentTarget
                finalObj[date].percentReward = percentReward
                finalObj[date].sumPercentageOfTurnover = sumPercentageOfTurnover
                finalObj[date].turnover = turnover
                finalObj[date].hour = hour
                finalObj[date].totalWorkersHoursByPointDay = totalWorkersHoursByPointDay
              } else {
                hoursOnWork = el.hoursOnWork
                sumFromHours = el.sumFromHours
                percentTarget = el.percentTarget
                percentReward = el.percentReward
                sumPercentageOfTurnover = el.sumPercentageOfTurnover
                turnover = el.turnover
                hour = 'Г'
                totalWorkersHoursByPointDay = el.totalWorkersHoursByPointDay

                el.hoursOnWork = hoursOnWork
                el.sumFromHours = sumFromHours
                el.percentTarget = percentTarget
                el.percentReward = percentReward
                el.sumPercentageOfTurnover = sumPercentageOfTurnover
                el.turnover = turnover
                el.hour = hour
                el.totalWorkersHoursByPointDay = totalWorkersHoursByPointDay
                finalObj[date] = el
              }
            })
            rowsStats = []
            for (let key in finalObj) {
              let groupItem = finalObj[key]
              let statObj = {
                restPoint: groupItem.restPoint,
                date: groupItem.date,
                timeOpened: groupItem.timeOpened,
                timeClosed: groupItem.timeClosed,
                hoursOnWork: Number(groupItem.hoursOnWork),
                sumFromHours: Number(groupItem.sumFromHours),
                percentTarget: Number(groupItem.percentTarget),
                percentReward: Number(groupItem.percentReward),
                sumPercentageOfTurnover: Number(groupItem.sumPercentageOfTurnover),
                turnover: Number(groupItem.turnover),
                hour: groupItem.hour,
                totalWorkersHoursByPointDay: groupItem.totalWorkersHoursByPointDay
              }
              statObj.total = statObj.sumFromHours + statObj.sumPercentageOfTurnover
              rowsStats.push(statObj)
            }
          }
        }
        return rowsStats
      },
      workerStatsSummary (state, getters) {
        let summary = null
        if (workerPosition === 'call_center') {
          summary = {
            price: 0,
            priceMotivate: 0,
            total: 0
          }
          getters.workerStatsTable.forEach(stat => {
            summary.price += stat.price
            summary.priceMotivate += stat.priceMotivate
            summary.total += stat.total
          })
        } else if (workerPosition === 'cooker') {
          summary = {
            hoursOnWork: 0,
            sumFromHours: 0,
            sumPercentageOfTurnover: 0,
            turnover: 0,
            total: 0
          }
          getters.workerStatsTable.forEach(stat => {
            summary.hoursOnWork += stat.hoursOnWork
            summary.sumFromHours += stat.sumFromHours
            summary.sumPercentageOfTurnover += stat.sumPercentageOfTurnover
            summary.turnover += stat.turnover
            summary.total += stat.total
          })
        }
        return summary
      },
      groupByDay (state) {
        return state.groupByDay ? state.groupByDay : false
      }
    },
    modules: {
      dateFilter: moduleDateFilter,
      workerFilter: (new ModuleWorkerFilter(workerPosition)).staticModule()
    }
  }
}

export default moduleCallCenterWorkerStats
