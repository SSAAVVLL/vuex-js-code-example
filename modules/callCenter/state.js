import {callCenterVars} from '../../../constants/vuexVariables'

const state = {
  [callCenterVars.tabIndexSelectedBrand]: null,
  [callCenterVars.order]: null,
  [callCenterVars.selectedBrand]: null,
  [callCenterVars.discountOptions]: [],
  [callCenterVars.configOrderHoldTime]: 10,
  [callCenterVars.showedModalAdditionalProducts]: false,
  [callCenterVars.productInEditing]: null,
  [callCenterVars.showWarningModal]: false,
  [callCenterVars.prevTypeDiscount]: null,
  [callCenterVars.prevSumDiscount]: 0,
  [callCenterVars.objectWarningModal]: null,
  [callCenterVars.blockChangeSumOfDiscount]: false,
  [callCenterVars.orderProds]: [],
  [callCenterVars.promocodes]: [],
  [callCenterVars.usePromocodeSum]: false,
  [callCenterVars.activatedPromocodeGood]: false,
  [callCenterVars.promocodeGoodValue]: null,
  [callCenterVars.promocodeBrand]: null,
  [callCenterVars.productsBrandOriginMap]: new Map(),
  [callCenterVars.mapProducts]: new Map(),
  [callCenterVars.mapAdditionalGoods]: new Map()
  //[callCenterVars.blockedDiscountSum]: false
}
export default state
