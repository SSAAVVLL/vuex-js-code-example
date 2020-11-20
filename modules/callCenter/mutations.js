import {callCenterMUT, orderMUT} from '../../../constants/vuexMutations'
import Vue from 'vue'
import {callCenterVars} from '../../../constants/vuexVariables'

const mutations = {
  [orderMUT.SET_CURRENT_ORDER] (state, payload) {
    state.order = payload
  },
  [orderMUT.SET_CLIENT] (state, payload) {
    if (state.order) {
      Vue.set(state.order, 'client', payload)
    }
  },
  [orderMUT.SET_ORDER_TYPE_DISCOUNT] (state, payload) {
    if (state.order) {
      Vue.set(state.order, 'discountType', payload)
    }
  },
  [orderMUT.SET_ORDER_SUM_DISCOUNT] (state, payload) {
    if (state.order) {
      state.order.discountValue = payload
    }
  },
  [callCenterMUT.SET_BRAND] (state, payload) {
    state.selectedBrand = payload
  },
  [callCenterMUT.SET_TAB_INDEX_BRAND] (state, payload) {
    state.tabIndexSelectedBrand = payload
  },
  [callCenterMUT.SET_ORDER_DISCOUNT] (state, {typeDiscount, sumDiscount}) {
    Vue.set(state.order, 'discountType', typeDiscount)
    Vue.set(state.order, 'discountValue', sumDiscount)
  },
  [callCenterMUT.SET_DISCOUNT_OPTIONS] (state, payload) {
    state[callCenterVars.discountOptions] = payload
  },
  [callCenterMUT.SET_ORDER_ADDRESS] (state, payload) {
    if (state.order) {
      for (let key in payload) {
        state.order[key] = payload[key]
      }
    }
  },
  [callCenterMUT.SET_CONFIG_ORDER_HOLD_TIME] (state, payload) {
    state[callCenterVars.configOrderHoldTime] = payload
  },
  [callCenterMUT.SWITCH_MODAL_ADDITIONAL_PRODUCT] (state, payload) {
    state[callCenterVars.showedModalAdditionalProducts] = payload
  },
  [callCenterMUT.SET_PRODUCT_IN_EDITING] (state, payload) {
    state[callCenterVars.productInEditing] = payload
  },
  [callCenterMUT.SHOW_WARNING_MODAL] (state, payload) {
    state[callCenterVars.objectWarningModal] = payload
    state[callCenterVars.showWarningModal] = true
  },
  [callCenterMUT.SET_PREV_TYPE_DISCOUNT] (state, payload) {
    state[callCenterVars.prevTypeDiscount] = Object.assign({}, payload)
  },
  [callCenterMUT.SET_PREV_SUM_DISCOUNT] (state, payload) {
    state[callCenterVars.prevSumDiscount] = [payload]
  },
  [callCenterMUT.HIDE_WARNING_MODAL] (state) {
    state[callCenterVars.showWarningModal] = false
    state[callCenterVars.objectWarningModal] = null
  },
  [callCenterMUT.BLOCK_DISCOUNT_VALUE_CHANGE] (state, block) {
    state[callCenterVars.blockChangeSumOfDiscount] = block
  },
  [callCenterMUT.SET_ORDER_PRODUCTS] (state, payload) {
    state[callCenterVars.orderProds] = payload
  },
  [callCenterMUT.SET_PROMOCODES] (state, payload) {
    state[callCenterVars.promocodes] = payload
  },
  [callCenterMUT.SET_SELECTED_PROMOCODE] (state, payload) {
    if (state.order) {
      Vue.set(state.order, 'promocode', payload)
    }
  },
  [callCenterMUT.SET_USE_PROMOCODE_SUM] (state, payload) {
    state[callCenterVars.usePromocodeSum] = payload
  },
  [callCenterMUT.ACTIVATE_PROMOCODE_GOOD] (state, {activate, value, brandId}) {
    if (activate) {
      state[callCenterVars.promocodeGoodValue] = value
      state[callCenterVars.promocodeBrand] = brandId
    } else {
      state[callCenterVars.promocodeGoodValue] = null
      state[callCenterVars.promocodeBrand] = brandId
    }
    state[callCenterVars.activatedPromocodeGood] = activate
  },
  [callCenterMUT.DELETE_PROMOCODE_ITEM] (state, payload) {
    let prods = state[callCenterVars.orderProds]
    let index = prods.findIndex((it) => it.promocodeItem)
    if (index >= 0) {
      prods = prods.splice(index, 1)
    }
  },
  [callCenterMUT.SET_BRAND_ORIGIN_PRODS_MAP] (state, payload) {
    state[callCenterVars.productsBrandOriginMap] = payload
  },
  [callCenterMUT.ADD_PRODUCT_TO_ORDER] (state, prod) {
    let orderProds = state[callCenterVars.orderProds]
    let allDop = state[callCenterVars.mapAdditionalGoods]
    let prodsMap = state[callCenterVars.mapProducts]
    prod = Object.assign({}, {prod: prod}, prod)
    delete prod.id
    delete prod.burger
    delete prod.pizzaSize
    if (prod.prod.burger) {
      prod.smallSize = true
    }
    if (allDop.get(prod.idCategory)) {
      prod.mainProd = prodsMap.get(prod.idProduct)
      prod.group = null
      prod.groupProds = []
    }
    orderProds.push(Object.assign({index: 0, count: 1}, prod))
  },
  [callCenterMUT.SET_MAP_PRODUCTS] (state, payload) {
    state[callCenterVars.mapProducts] = payload
  },
  [callCenterMUT.SET_MAP_ADDITIONAL_PRODUCTS] (state, payload) {
    state[callCenterVars.mapAdditionalGoods] = payload
  }
}

export default mutations
