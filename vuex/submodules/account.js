// import {accountACT} from '../../constants/vuexActions'
// import {accountMUT} from '../../constants/vuexMutations'
// import {USER_ROLE_GUEST} from '../../constants/roles'
// import jwtDecode from 'jwt-decode'
//
// const moduleLoginData = {
//   state () {
//     return {
//       jwtToken: null,
//       jwtParsed: null
//     }
//   },
//   actions: {
//     [accountACT.LOGIN] () {
//     },
//     [accountACT.LOGOUT] () {
//       localStorage.removeItem('jwt')
//       // this._vm.$
//     },
//     [accountACT.VALIDATE_RELEVANCE_TOKEN] ({state, dispatch}) {
//       if (state.jwtToken && state.jwtParsed) {
//         if (state.jwtParsed.exp < this._vm.$moment().unix()) {
//           dispatch(accountACT.LOGOUT)
//         }
//       }
//     },
//     [accountACT.CHECK_RELEVANCE_TOKEN] ({state}, tokenParsed) {
//       return tokenParsed.exp > this._vm.$moment().unix()
//     },
//     async [accountACT.DECODE_TOKEN] ({commit, dispatch}, token) {
//       let jwtParsed = null
//       try {
//         jwtParsed = jwtDecode(token)
//         let isTokenRelevance = await dispatch(accountACT.CHECK_RELEVANCE_TOKEN, jwtParsed)
//         if (isTokenRelevance) {
//           return jwtParsed
//         }
//       } catch (e) {
//         console.error('Invalid jwt token')
//       }
//       return null
//     },
//     async [accountACT.IDENTIFY_USER_ROLE] ({dispatch, commit}) {
//       let token = localStorage.getItem('jwt')
//       await dispatch(accountACT.DECODE_TOKEN, token).then(decodedToken => {
//         if (decodedToken !== null) {
//           commit(accountMUT.SET_TOKEN, token)
//           commit(accountMUT.SET_TOKEN_PARSED, decodedToken)
//           this._vm.$user.set({ role: decodedToken.role })
//         } else {
//           this._vm.$user.set({ role: USER_ROLE_GUEST })
//         }
//       })
//
//     }
//   },
//   mutations: {
//     [accountMUT.SET_TOKEN] (state, payload) {
//       state.jwtToken = payload
//     },
//     [accountMUT.SET_TOKEN_PARSED] (state, payload) {
//       state.jwtParsed = payload
//     }
//   },
//   getters: {}
// }
//
// export default moduleLoginData
