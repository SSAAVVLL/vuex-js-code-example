import {motivateAccountingVars, overallWorkshopStatsVars as vars} from '../../constants/vuexVariables'
import {overallWorkshopStatsAct as acts} from '../../constants/vuexActions'
import {motivateAccountingMUT, overallWorkshopStatMUT as Mut} from '../../constants/vuexMutations'
import {overallWorkshopStatsGetters as gettersC} from '../../constants/vuexGetters'
import apolloClient from '../../apolloClient'
import motivateAccountingQueries from '../../constants/graphqlAccounting'
import graphqlStats from '../../constants/graphqlStats'
import moment from 'moment'

const getCurrentHour = () => {
  return parseInt(moment().format('H'))
}

/**
 * Convert structure hours by worker to worker by hours (columns)
 * */
const rotateStat = ({minHour, currentHour, stats}) => {
  let newStats = []
  stats.forEach(itemWorker => {
    let itemWorkerCopy = {...itemWorker}
    // let statObj = {}
    let totalEarn = 0
    let totalEarnMotivate = 0
    itemWorker.stats.forEach(itemHour => {
      let key = (itemHour.date !== moment().format('YYYY-MM-DD')) ? (itemHour.hour) : (itemHour.hour + 't')
      if (itemHour.date === moment().format('YYYY-MM-DD')) {
        totalEarn += parseInt(parseFloat(itemHour.sumPercentageOfTurnover) + itemHour.hourlyRate)
      }
      totalEarnMotivate += parseInt(parseFloat(itemHour.sumPercentageOfTurnover))
      itemWorkerCopy[key] = {
        reward: (parseFloat(itemHour.sumPercentageOfTurnover) + itemHour.hourlyRate * itemHour.hoursOnWork),
        hourly: itemHour.hourlyRate,
        turnover: itemHour.turnover,
        percentTarget: itemHour.percentTarget
      }
    })
    itemWorkerCopy['total'] = totalEarn
    itemWorkerCopy['totalEarnMotivate'] = totalEarnMotivate
    // itemWorkerCopy.stats = [statObj]
    newStats.push(itemWorkerCopy)
  })
  return newStats
}

const moduleOverallStatsWorkshop = {
  namespaced: true,
  state: {
    [vars.workersOnWork]: [],
    [vars.statsWorkers]: [],
    [vars.minHour]: 0,
    [vars.motivatePercents]: [],
    [vars.totalTurnover]: 0,
    [vars.totalEarnMotivate]: 0,
    [vars.requestedDay]: moment().format('YYYY-MM-DD')
  },
  actions: {
    [acts.CHANGE_CURRENT_DATE] ({commit, dispatch}, payload) {
      commit(Mut.SET_REQUESTED_DATE, payload)
      dispatch(acts.REQUEST_STATS_WORKSHOP)
    },
    [acts.REQUEST_TOTAL_TURNOVER] ({commit, getters}) {
      let stats = getters[gettersC.TABLE_STATS]
      let total = 0
      let totalEarnMotivate = 0
      stats.forEach((item) => {
        totalEarnMotivate += item.totalEarnMotivate
      })
      let columnStats = getters[gettersC.TABLE_COLUMNS]
      columnStats.forEach((item) => {
        total = Math.max(item.maxTurnover, total)
      })
      commit(Mut.SET_TOTAL_TURNOVER, total)
      commit(Mut.SET_TOTAL_MOTIVATE_TURNOVER, totalEarnMotivate)
    },
    [acts.REQUEST_TURNOVER_PERCENTS] ({commit}) {
      apolloClient.query({
        query: motivateAccountingQueries.LIST_MOTIVATE_PERCENTS,
        fetchPolicy: 'network-only'
      }).then(res => {
        let listMotivatePercents = res.data.tableMotivateCookPercents.nodes
        commit(Mut.SET_MOTIVATE_PERCENTS_LIST, listMotivatePercents)
      })
    },
    [acts.REQUEST_WORKER_LIST] ({commit, dispatch}) {
      apolloClient.query({
        query: motivateAccountingQueries.LIST_ACCOUNTING_WORKERS,
        fetchPolicy: 'network-only'
      }).then(res => {
        let listCurrentWorkers = res.data.accountingWorkersGetlist.nodes
        commit(Mut.SET_WORKERS_LIST, listCurrentWorkers)
        dispatch(acts.REQUEST_STATS_WORKSHOP)
      })
    },
    [acts.REQUEST_STATS_WORKSHOP] ({state, commit, dispatch}) {
      state[vars.workersOnWork].forEach(worker => {
        let promise = apolloClient.query({
          query: graphqlStats.cookerMotivateStats,
          variables: {
            dateFrom: moment().subtract(1, 'day').format('YYYY-MM-DD'),
            dateTo: moment().format('YYYY-MM-DD'),
            idWorker: worker.idWorker
          }
        }).then(res => {
          commit(Mut.ADD_WORKERS_STATS, {idWorker: worker.workerByIdWorker.lastName + ' ' + worker.workerByIdWorker.firstName, stats: res.data.calcCookerMotivate.nodes})
          dispatch(acts.REQUEST_TOTAL_TURNOVER)
        })
      })
    }
  },
  mutations: {
    [Mut.SET_REQUESTED_DATE] (state, payload) {
      state[vars.requestedDay] = payload
    },
    [Mut.SET_TOTAL_MOTIVATE_TURNOVER] (state, payload) {
      state[vars.totalEarnMotivate] = payload
    },
    [Mut.SET_TOTAL_TURNOVER] (state, payload) {
      state[vars.totalTurnover] = payload
    },
    [Mut.SET_WORKERS_LIST] (state, payload) {
      state[vars.workersOnWork] = payload
    },
    [Mut.SET_MOTIVATE_PERCENTS_LIST] (state, payload) {
      state[vars.motivatePercents] = payload
    },
    [Mut.ADD_WORKERS_STATS] (state, payload) {
      let existedIndex = state[vars.statsWorkers].findIndex((item) => item.idWorker === payload.idWorker)
      if (existedIndex !== -1) {
        state[vars.statsWorkers][existedIndex].stats = payload.stats
      } else {
        state[vars.statsWorkers].push(payload)
      }
    },
    [Mut.SET_MIN_HOUR] (state, payload) {
      state[vars.minHour] = payload
    }
  },
  getters: {
    [gettersC.TOTAL_EARN_MOTIVATE] (state) {
      return state[vars.totalEarnMotivate]
    },
    [gettersC.TABLE_OVERALL] (state, getters) {
      return state[vars.statsWorkers]
    },
    [gettersC.TABLE_STATS] (state, getters) {
      let currentHour = getCurrentHour()
      let minHour = 23
      let tasks = []
      state[vars.statsWorkers].forEach(stat => {
        stat.stats.forEach(item => {
          if (currentHour <= 5) {
            if (item.date === moment().subtract(1, 'day').format('YYYY-MM-DD')) {
              minHour = Math.min(parseInt(item.hour), minHour)
            }
          } else {
            if (item.date === moment().format('YYYY-MM-DD')) {
              minHour = Math.min(parseInt(item.hour), minHour)
            }
          }
        })
      })
      // commit(Mut.SET_MIN_HOUR, minHour)
      if (currentHour <= 5) {
        state[vars.statsWorkers].forEach(stat => {
          let copyStat = stat
          let newStats = []
          copyStat.stats.forEach(it => {
            if (
              (it.date === moment().subtract(1, 'day').format('YYYY-MM-DD') && minHour <= parseInt(it.hour)) ||
              (it.date !== moment().subtract(1, 'day').format('YYYY-MM-DD'))
            ) {
              newStats.push(it)
            }
          })
          copyStat.stats = newStats
          tasks.push(copyStat)
        })
      } else {
        state[vars.statsWorkers].forEach(stat => {
          let copyStat = stat
          let newStats = []
          copyStat.stats.forEach(it => {
            if (
              (it.date === moment().format('YYYY-MM-DD') && minHour <= parseInt(it.hour))
            ) {
              newStats.push(it)
            }
          })
          copyStat.stats = newStats
          tasks.push(copyStat)
        })
      }
      return rotateStat({minHour, currentHour, stats: tasks})
    },
    [gettersC.TABLE_STATS_M] (state, getters) {
      let max = state[vars.totalTurnover]
      let stat = []
      state[vars.motivatePercents].forEach(percent => {
        if (percent.percentTarget !== '0') {
          let sum = max / 100 * percent.rewardPercent
          let percentObj = {
            percent_sections: percent.percentTarget + ' - ' + percent.percentMax,
            percent: percent.rewardPercent,
            profit: Math.round(sum)
          }
          stat.push(percentObj)
        }
      })
      return stat || null
    },
    [gettersC.TABLE_COLUMNS] (state, getters) {
      let stats = getters[gettersC.TABLE_STATS]
      let currentHour = getCurrentHour()
      let minHour = 5
      let columns = null
      // if (currentHour <= 5) {

      // } else {
      let length = 24 - minHour
      let sumTurnover = 0
      columns = Array.apply(null, Array(length)).map(() => {
        let maxTurnover = 0
        let maxPercent = 0
        let variantColumn = ''
        stats.forEach(item => {
          let statObj = item[minHour + 't']
          if (statObj) {
            maxTurnover = Math.max(maxTurnover, statObj.turnover)
            maxPercent = Math.max(maxPercent, statObj.percentTarget)
          }
        })
        sumTurnover += maxTurnover
        if (maxPercent < 70) {
          variantColumn = 'danger'
        } else if (maxPercent >= 70 && maxPercent <= 80) {
          variantColumn = 'warning'
        } else {
          variantColumn = 'success'
        }
        return {
          label: minHour.toString(),
          key: minHour++ + 't',
          maxTurnover: maxTurnover,
          maxPercent: maxPercent,
          variant: variantColumn
        }
      })
      // }
      return columns.concat({label: 'Итого', key: 'total', maxTurnover: sumTurnover})
    }
  },
  modules: {

  }
}

export default moduleOverallStatsWorkshop
