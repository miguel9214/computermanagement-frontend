import { createStore } from 'vuex'

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    user: null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    setUser(state, user) {
      state.user = user
    },
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
    }
  },
  actions: {
    async fetchUser({ commit, state }) {
      const res = await fetch('https://tudominio.com/api/me', {
        headers: {
          Authorization: `Bearer ${state.token}`
        }
      })
      const data = await res.json()
      commit('setUser', data)
    }
  },
})
