import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isFullscreen: false,
    sidebar: {
      opened: localStorage.getItem('sidebarStatus') ? !!+localStorage.getItem('sidebarStatus') : true,
      withoutAnimation: false
    },
    menuList: [
      {
        id: 1,
        name: '首页',
        path: '/dashboard',
        icon: 'el-icon-s-home'
      },
      {
        id: 2,
        name: '文章管理',
        path: '/article',
        icon: 'el-icon-document'
      },
      {
        id: 3,
        name: '审核管理',
        path: '/audit',
        icon: 'el-icon-check'
      }
    ]
  },
  getters: {
    token: state => state.token,
    userInfo: state => state.userInfo,
    isFullscreen: state => state.isFullscreen,
    sidebar: state => state.sidebar,
    menuList: state => state.menuList
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    SET_FULLSCREEN: (state, isFullscreen) => {
      state.isFullscreen = isFullscreen
    },
    TOGGLE_SIDEBAR: state => {
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
      if (state.sidebar.opened) {
        localStorage.setItem('sidebarStatus', 1)
      } else {
        localStorage.setItem('sidebarStatus', 0)
      }
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      localStorage.setItem('sidebarStatus', 0)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    LOGOUT: state => {
      state.token = ''
      state.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  },
  actions: {
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const token = 'mock-token-' + Date.now()
          commit('SET_TOKEN', token)
          commit('SET_USER_INFO', userInfo)
          resolve()
        }, 500)
      })
    },
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('LOGOUT')
        resolve()
      })
    },
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleFullscreen({ commit, state }) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`)
        })
        commit('SET_FULLSCREEN', true)
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
        commit('SET_FULLSCREEN', false)
      }
    }
  }
})
