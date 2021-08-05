import {callCenterGetters} from '../../../constants/vuexGetters'
import {STATUS_ORDER, TYPE_DISCOUNT, TYPE_LOGIC_DISCOUNT} from '../../../constants/keywords'
import {callCenterVars} from '../../../constants/vuexVariables'

const getters = {
  [callCenterGetters.ORDER_STATUS_KEYWORD] (state) {
    return state.order ? state.order.status.keyword : null
  },
  [callCenterGetters.CLIENT_CURRENT_ORDER] (state) {
    return state.order ? state.order.client : undefined
  },
  [callCenterGetters.CLIENT_PHONE_RAW] (state) {
    return state.order && state.order.phone ? state.order.phone : ''
  },
  [callCenterGetters.CLIENT_PHONE] (state, getters) {
    let client = getters[callCenterGetters.CLIENT_CURRENT_ORDER]
    if (client) {
      return client.phone
    } else {
      return getters[callCenterGetters.CLIENT_PHONE_RAW]
    }
  },
  [callCenterGetters.CLIENT_SETTED] (state, getters) {
    return getters[callCenterGetters.CLIENT_PHONE].length === 17
  },
  [callCenterGetters.BRAND_ID] (state) {
    return state.selectedBrand ? state.selectedBrand.id : null
  },
  [callCenterGetters.BRAND_NAME] (state) {
    return state.selectedBrand ? state.selectedBrand.name : null
  },
  [callCenterGetters.IS_ACCEPTED_ORDER] (state, getters) {
    return Boolean(state.order && state.order.status && state.order.status.keyword !== STATUS_ORDER.NEW)
  },
  [callCenterGetters.TYPE_DISCOUNT_OPTIONS_SELECT] (state) {
    return state[callCenterVars.discountOptions].map(item => {
      return {
        value: item,
        text: item.name,
        disabled: !item.active
      }
    })
  },
  [callCenterGetters.IS_ORDER_WITH_DISCOUNT] (state) {
    let isDiscount = false
    isDiscount |= state.order && state.order.promocode
    isDiscount |= state.order && state.order.discountType && state.order.discountType.keyword !== TYPE_DISCOUNT.WITHOUT
    return isDiscount
  },
  [callCenterGetters.ORDER_HOLD_TIME] (state) {
    return state[callCenterVars.configOrderHoldTime]
  },
  [callCenterGetters.ORDER_TYPE_DISCOUNT] (state) {
    if (state.order) {
      return state.order.discountType
    } else {
      return null
    }
  },
  [callCenterGetters.ORDER_TYPE_DISCOUNT_KEYWORD] (state, getters) {
    let typeDiscountObject = getters[callCenterGetters.ORDER_TYPE_DISCOUNT]
    return typeDiscountObject ? typeDiscountObject.keyword : null
  },
  [callCenterGetters.ORDER_DISCOUNT_VALUE] (state, getters) {
    return state.order ? state.order.discountValue : null
  },
  [callCenterGetters.SUM_ORDER_DISCOUNT] (state, getters) {
    let typeDiscount = getters[callCenterGetters.ORDER_TYPE_DISCOUNT]
    let sumDiscount = getters[callCenterGetters.ORDER_DISCOUNT_VALUE]
    if (typeDiscount) {
      let typeDiscountLogic = typeDiscount.logicType
      let products = null
      let discountRub = 0
      switch (typeDiscountLogic) {
        case TYPE_LOGIC_DISCOUNT.SUM:
          return (sumDiscount || 0)
        case TYPE_LOGIC_DISCOUNT.PERCENT:
          products = getters[callCenterGetters.ORDER_PRODUCTS]
          discountRub = 0
          products.forEach(it => {
            let item = it
            if (it.prod) {
              item = it.prod
            }
            let discountPercentItem = sumDiscount
            if (item.isSale) {
              discountPercentItem = 0
            } else {
              discountPercentItem = Math.min(sumDiscount, item.maxDiscount)
            }
            discountRub += it.cost * it.count * discountPercentItem / 100
          })
          return Math.ceil(discountRub)
        case TYPE_LOGIC_DISCOUNT.PICKUP_PERCENT:
          products = getters[callCenterGetters.ORDER_PRODUCTS]
          discountRub = 0
          products.forEach(it => {
            let item = it
            if (it.prod) {
              item = it.prod
            }
            let discountPercentItem = sumDiscount
            if (item.isSale) {
              discountPercentItem = Math.min(10, sumDiscount)
            } else {
              discountPercentItem = Math.min(sumDiscount, item.maxDiscount)
            }
            discountRub += parseInt(it.cost) * it.count * discountPercentItem / 100
          })
          return Math.ceil(discountRub)
        case TYPE_LOGIC_DISCOUNT.PROMOCODE:
          if (state[callCenterVars.usePromocodeSum]) {
            return sumDiscount
          } else {
            let promocode = getters[callCenterGetters.SELECTED_PROMOCODE]
            let rules = JSON.parse(promocode.rules)
            let minSum = rules[0].value
            let result = JSON.parse(promocode.result)
            let resultType = result[0].type
            let resultValue = result[0].value
            let discount = 0
            products = getters[callCenterGetters.ORDER_PRODUCTS]
            if (resultType === 'good') {
              // discount = 10
              discount = 0
            } else if (resultType === 'discount_percent') {
            //   discount = sumDiscount
            // }
              let promocodeBrand = getters[callCenterGetters.PROMOCODE_BRAND_ID]
              let selectedBrand = getters[callCenterGetters.BRAND_ID]
              let sumProducts = getters[callCenterGetters.SUM_OF_PRODUCTS]
              let minSumPromocode = getters[callCenterGetters.PROMOCODE_MIN_SUM]
              if (promocodeBrand === selectedBrand && sumProducts >= minSumPromocode) {
                let catsValue = resultValue.cats
                let allCatsDiscount = false
                let discountCats = []
                if (Array.isArray(catsValue)) {
                  discountCats = resultValue.cats.map(it => parseInt(it))
                } else {
                  if (catsValue === 'all') {
                    allCatsDiscount = true
                  }
                }
                products.forEach(it => {
                  let discountPercentItem = 0
                  let prod = it
                  if (it.prod) {
                    prod = it.prod
                  }
                  if (allCatsDiscount || discountCats.includes(prod.idOriginCat)) {
                    if (prod.isSale) {
                      discountPercentItem = 0
                    } else {
                      discountPercentItem = Math.min(resultValue.value, prod.maxDiscount)
                    }
                  }
                  discount += parseInt(it.cost) * it.count * discountPercentItem / 100
                })
              }
            }
            return Math.ceil(discount)
          }
        default:
          return 0
      }
    }
  },
  [callCenterGetters.ORDER_PRODUCTS] (state, getters) {
    if (state.order) {
      return state[callCenterVars.orderProds]
    }
  },
  [callCenterGetters.PROMOCODES_SELECT_OPTIONS] (state, getters) {
    let selectedBrand = getters[callCenterGetters.BRAND_ID]
    let promocodesArr = state[callCenterVars.promocodes].filter(item => item.idBrand === selectedBrand)
    return promocodesArr.map(item => {
      return Object.assign(
        {
          title: item.promocode + ' - ' + item.description
        },
        item
      )
    })
  },
  [callCenterGetters.SELECTED_PROMOCODE] (state) {
    if (state.order) {
      return state.order.promocode
    } else {
      return null
    }
  },
  [callCenterGetters.ORDER_PROMOCODE_ITEM] (state, getters) {
    let prods = state[callCenterVars.orderProds]
    let promocodeItem = null
    prods.forEach(it => {
      if (it.promocodeItem) {
        promocodeItem = it
      }
    })
    return promocodeItem
  },
  [callCenterGetters.SUM_OF_PRODUCTS] (state, getters) {
    let prods = state[callCenterVars.orderProds]
    return prods.reduce((sum, val) => {
      if (!val.deleted && !val.promocodeItem) {
        if (val.group === null || val.group === undefined) {
          return sum + val.cost * val.count
        } else {
          let dopSum = parseFloat(val.mainProd.cost)
          val.groupProds.forEach(dop => {
            dopSum += parseFloat(dop.cost)
          })
          return sum + dopSum * val.count
        }
      } else {
        return sum
      }
    }, 0)
  },
  [callCenterGetters.SUM_OF_PRODUCTS_WIHOUT_SALE_PRODS] (state, getters) {
    let prods = state[callCenterVars.orderProds]
    return prods.reduce((sum, val) => {
      if (!val.deleted && !val.promocodeItem && !val.isSale) {
        if (val.group === null || val.group === undefined) {
          return sum + val.cost * val.count
        } else {
          let dopSum = parseFloat(val.mainProd.cost)
          val.groupProds.forEach(dop => {
            dopSum += parseFloat(dop.cost)
          })
          return sum + dopSum * val.count
        }
      } else {
        return sum
      }
    }, 0)
  },
  [callCenterGetters.PROMOCODE_MIN_SUM] (state, getters) {
    let promocode = getters[callCenterGetters.SELECTED_PROMOCODE]
    if (promocode) {
      let rules = JSON.parse(promocode.rules)
      let minSum = rules[0].value
      return minSum
    } else {
      return 0
    }
  },
  [callCenterGetters.PROMOCODE_BRAND_ID] (state, getters) {
    let selectedPromocode = getters[callCenterGetters.SELECTED_PROMOCODE]
    if (selectedPromocode) {
      return selectedPromocode.idBrand
    }
    return null
  },
  [callCenterGetters.PROMOCODE_RESULT_TYPE] (state, getters) {
    let promocode = getters[callCenterGetters.SELECTED_PROMOCODE]
    if (promocode) {
      let result = JSON.parse(promocode.result)
      return result[0].type
    }
    return null
  }
}

export default getters
