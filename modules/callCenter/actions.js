import {callCenterACT} from '../../../constants/vuexActions'
import {callCenterGetters} from '../../../constants/vuexGetters'
import apolloClient from '../../../apolloClient'
import clientQueries from '../../../graphql/clientQueries'
import {callCenterMUT, orderMUT} from '../../../constants/vuexMutations'
import {callCenterVars} from '../../../constants/vuexVariables'
import {TYPE_DISCOUNT} from '../../../constants/keywords'
import Vue from 'vue'
import configQueries from '../../../graphql/config'
import orderMeta from '../../../graphql/ordersMeta'

const actions = {
  async [callCenterACT.REQUEST_CLIENT] ({state, commit, getters}) {
    let phone = getters[callCenterGetters.CLIENT_PHONE_RAW]
    let idBrand = getters[callCenterGetters.BRAND_ID]
    if (phone && idBrand) {
      if (phone.length === 17) {
        await apolloClient.query({
          query: clientQueries.FIND_CLIENT,
          fetchPolicy: 'network-only',
          variables: {
            idBrand: idBrand,
            phone: phone
          }
        }).then(res => {
          commit(orderMUT.SET_CLIENT, res.data.findClient)
        })
      } else {
        if (state.order && state.order.client !== null) {
          commit(orderMUT.SET_CLIENT, null)
        }
      }
    }
  },
  async [callCenterACT.UPDATE_CLIENT_COMMENT] ({state, commit}, payload) {
    await apolloClient.mutate({
      mutation: clientQueries.UPDATE_COMMENT,
      variables: {
        clientId: state.order.client.id,
        comment: payload || ''
      }
    }).then(res => {
      // console.log('updated')
    })
  },
  async [callCenterACT.CREATE_CLIENT_PROFILE] ({commit, getters}, payload) {
    let phone = getters[callCenterGetters.CLIENT_PHONE]
    let idBrand = getters[callCenterGetters.BRAND_ID]
    let name = payload
    // don't create client for Takeshi
    if (idBrand !== 3) {
      await apolloClient.mutate({
        mutation: clientQueries.CREATE_PROFILE,
        variables: {
          idBrand: idBrand,
          name: name,
          phone: phone
        }
      }).then(res => {
        commit(orderMUT.SET_CLIENT, res.data.createClient.client)
      })
    }
  },
  [callCenterACT.UPDATE_ORDER_DISCOUNT] ({state, commit, getters}, {typeDiscountKeyword, sumDiscount}) {
    let discountType = state[callCenterVars.discountOptions].find(item => item.keyword === typeDiscountKeyword)
    // let isBlockedPromocode = (typeDiscountKeyword === TYPE_DISCOUNT.PROMO && state[callCenterVars.usePromocodeSum])
    let isBlockedPromocode = (typeDiscountKeyword === TYPE_DISCOUNT.PROMO)
    if (isBlockedPromocode || discountType.defaultValue !== null) {
      sumDiscount = ((!discountType.defaultValue && isBlockedPromocode) ? sumDiscount : discountType.defaultValue)
      commit(callCenterMUT.BLOCK_DISCOUNT_VALUE_CHANGE, true)
    } else {
      commit(callCenterMUT.BLOCK_DISCOUNT_VALUE_CHANGE, false)
    }
    commit(callCenterMUT.SET_ORDER_DISCOUNT, {typeDiscount: discountType, sumDiscount: sumDiscount})
  },
  [callCenterACT.UPDATE_ORDER_ADDRESS] ({commit}, payload) {
    commit(callCenterMUT.SET_ORDER_ADDRESS, payload)
  },
  [callCenterACT.CLIENT_UPDATED] ({state, commit, dispatch, getters}) {
    let newValue = getters[`${callCenterGetters.CLIENT_CURRENT_ORDER}`]
    if (newValue && !this.readonly) {
      let isAccepted = getters[`${callCenterGetters.IS_ACCEPTED_ORDER}`]
      let isDiscount = getters[`${callCenterGetters.IS_ORDER_WITH_DISCOUNT}`]
      // set discount value only if order is new and haven't discount
      if (newValue.discount && !isAccepted && !isDiscount) {
        // dispatch(`${callCenterACT.UPDATE_ORDER_DISCOUNT}`, {
        //   typeDiscountKeyword: TYPE_DISCOUNT.PERCENT,
        //   sumDiscount: newValue.discount
        // })
        Vue.notify({
          group: 'callCenterInfo',
          title: `У клиента есть скидка ${newValue.discount}%`,
          text: ''
        })
      }
      if (newValue.comment) {
        Vue.notify({
          group: 'callCenterInfo',
          type: 'warn',
          duration: 10000,
          title: `У клиента указан комментарий`,
          text: newValue.comment
        })
      }
    }
    // if (newValue === null && !state.order.id) {
    //   dispatch(`${callCenterACT.UPDATE_ORDER_DISCOUNT}`, {
    //     typeDiscountKeyword: TYPE_DISCOUNT.WITHOUT,
    //     sumDiscount: 0
    //   })
    // }
  },
  [callCenterACT.GET_CONFIG_ORDER_HOLD_TIME] ({state, commit}) {
    apolloClient.query({
      query: configQueries.getConfigRecord,
      variables: {
        param: 'time_order_callcenter_processing'
      }
    }).then(res => {
      commit(callCenterMUT.SET_CONFIG_ORDER_HOLD_TIME, res.data.allConfigs.nodes[0].value)
    })
  },
  [callCenterACT.GET_DISCOUNT_OPTIONS] ({state, commit}) {
    apolloClient.query({
      query: orderMeta.TYPES_DISCOUNT
    }).then(res => {
      let types = res.data.getTypesDiscount.nodes
      commit(callCenterMUT.SET_DISCOUNT_OPTIONS, types)
    })
  },
  [callCenterACT.SET_ORDER_DISCOUNT] ({state, commit, getters, dispatch}, {typeDiscount}) {
    if (state.order) {
      let statusKeyword = typeDiscount.keyword
      let prevStatusKeyword = getters[callCenterGetters.ORDER_TYPE_DISCOUNT].keyword
      if (prevStatusKeyword === TYPE_DISCOUNT.PROMO) {
        commit(callCenterMUT.SHOW_WARNING_MODAL, {
          text: 'Вы действительно хотите отменить введённый промокод?',
          result: [
            {
              action: callCenterACT.UPDATE_ORDER_DISCOUNT,
              payload: {
                typeDiscountKeyword: statusKeyword,
                sumDiscount: 0
              }
            },
            {
              action: callCenterACT.SET_ORDER_PROMOCODE,
              payload: null
            }
          ]
        })
      } else if (prevStatusKeyword === TYPE_DISCOUNT.BONUSES_DD || prevStatusKeyword === TYPE_DISCOUNT.POINTS) {
        commit(callCenterMUT.SHOW_WARNING_MODAL, {
          text: 'Вы действительно хотите отменить действие списанных бонусов?',
          result: [
            {
              action: callCenterACT.UPDATE_ORDER_DISCOUNT,
              payload: {
                typeDiscountKeyword: statusKeyword,
                sumDiscount: 0
              }
            }
          ]
        })
      } else {
        dispatch(callCenterACT.UPDATE_ORDER_DISCOUNT, {
          typeDiscountKeyword: typeDiscount.keyword,
          sumDiscount: 0
        })
      }
    }
  },
  [callCenterACT.RESULT_WARNING_MODAL] ({state, commit, dispatch}, answer) {
    if (answer === true) {
      state[callCenterVars.objectWarningModal].result.forEach(item => {
        if (item.action) {
          dispatch(item.action, item.payload)
        }
      })
    }
    commit(callCenterMUT.HIDE_WARNING_MODAL)
  },
  [callCenterACT.SET_CURRENT_ORDER] ({state, commit, dispatch}, order) {
    commit(orderMUT.SET_CURRENT_ORDER, order)
    if (order !== null) {
      commit(callCenterMUT.ACTIVATE_PROMOCODE_GOOD, {activate: false})
      commit(callCenterMUT.SET_USE_PROMOCODE_SUM, false)
      if (order.discountType) {
        if (order.discountType.keyword === TYPE_DISCOUNT.PROMO && order.id) {
          commit(callCenterMUT.SET_USE_PROMOCODE_SUM, true)
        }
      }
      dispatch(callCenterACT.UPDATE_ORDER_DISCOUNT, {
        typeDiscountKeyword: order.discountType.keyword,
        sumDiscount: order.discountValue
      })
      dispatch(callCenterACT.SET_ORDER_PROMOCODE, order.promocode)
    }
  },
  async [callCenterACT.REQUEST_PROMOCODES] ({state, commit}) {
    apolloClient.query({
      query: orderMeta.LIST_PROMOCODES
    }).then(res => {
      commit(callCenterMUT.SET_PROMOCODES, res.data.getActivePromocodes.nodes)
    })
  },
  [callCenterACT.SET_ORDER_PROMOCODE] ({state, dispatch, commit, getters}, promocode) {
    let calculatedPromocode = state[callCenterVars.usePromocodeSum]
    if (!calculatedPromocode && promocode) {
    // if (promocode) {
      let promoResult = JSON.parse(promocode.result)
      let type = promoResult[0].type
      let value = promoResult[0].value
      if (type === 'good') {
        commit(callCenterMUT.ACTIVATE_PROMOCODE_GOOD, {activate: true, value: value, brandId: promocode.idBrand})
      } else {
        commit(callCenterMUT.ACTIVATE_PROMOCODE_GOOD, {activate: false})
      }
    } else {
      commit(callCenterMUT.ACTIVATE_PROMOCODE_GOOD, {activate: false})
    }
    commit(callCenterMUT.SET_SELECTED_PROMOCODE, promocode)
    let currentTypeDiscountKeyword = getters[callCenterGetters.ORDER_TYPE_DISCOUNT_KEYWORD]
    if (promocode) {
      let typeDiscount = state[callCenterVars.discountOptions].find(it => it.keyword === TYPE_DISCOUNT.PROMO)
      if (currentTypeDiscountKeyword === TYPE_DISCOUNT.PROMO) {
        commit(callCenterMUT.DELETE_PROMOCODE_ITEM)
        dispatch(callCenterACT.CHECK_PROMOCODE_GOOD)
      }
      if (currentTypeDiscountKeyword !== typeDiscount.keyword) {
        dispatch(callCenterACT.SET_ORDER_DISCOUNT, {typeDiscount: typeDiscount, sumDiscount: 0})
      }
    } else if (currentTypeDiscountKeyword === TYPE_DISCOUNT.PROMO) {
      dispatch(callCenterACT.UPDATE_ORDER_DISCOUNT, {typeDiscountKeyword: TYPE_DISCOUNT.WITHOUT, sumDiscount: 0})
    }
  },
  [callCenterACT.ADD_PRODUCT_BY_ID_ORIGIN] ({state, getters, commit}, {brandId, productId, promocodeItem}) {
    let mapProds = state[callCenterVars.productsBrandOriginMap]
    let prod = mapProds.get(brandId + '|' + productId)
    if (promocodeItem) {
      prod.promocodeItem = promocodeItem
      prod.pricePoints = 0
      prod.cost = 0
      prod.idProduct = prod.id
    }
    commit(callCenterMUT.ADD_PRODUCT_TO_ORDER, prod)
  },
  [callCenterACT.ADD_PROMOCODE_GOOD] ({state, getters, dispatch}) {
    let brandId = state[callCenterVars.promocodeBrand]
    let productId = state[callCenterVars.promocodeGoodValue]
    let currentBrand = getters[callCenterGetters.BRAND_ID]
    if (currentBrand === brandId) {
      dispatch(callCenterACT.ADD_PRODUCT_BY_ID_ORIGIN, {brandId, productId, promocodeItem: true})
    }
  },
  [callCenterACT.CHECK_PROMOCODE_GOOD] ({state, dispatch, getters, commit}) {
    let promocodeItem = getters[callCenterGetters.ORDER_PROMOCODE_ITEM]
    let sumProducts = getters[callCenterGetters.SUM_OF_PRODUCTS_WIHOUT_SALE_PRODS]
    let minSumPromocode = getters[callCenterGetters.PROMOCODE_MIN_SUM]
    if (sumProducts >= minSumPromocode) {
      if (!promocodeItem) {
        dispatch(callCenterACT.ADD_PROMOCODE_GOOD)
      }
    } else {
      if (promocodeItem) {
        commit(callCenterMUT.DELETE_PROMOCODE_ITEM)
      }
    }
  }
}

export default actions
