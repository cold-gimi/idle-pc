import Vue from 'vue'
import Vuex from 'vuex'
import request from '@/utils/request'

Vue.use(Vuex)

const allMenuList = [
  {
    id: 1,
    name: '首页',
    path: '/dashboard',
    icon: 'el-icon-s-home',
    roles: ['admin', 'user']
  },
  {
    id: 2,
    name: '文章管理',
    path: '/article',
    icon: 'el-icon-document',
    roles: ['admin', 'user']
  },
  {
    id: 3,
    name: '审核管理',
    path: '/audit',
    icon: 'el-icon-check',
    roles: ['admin']
  },
  {
    id: 4,
    name: '商品列表',
    path: '/product',
    icon: 'el-icon-goods',
    roles: ['admin']
  },
  {
    id: 5,
    name: '功能权限中心',
    path: '/permission',
    icon: 'el-icon-s-tools',
    roles: ['admin'],
    children: [
      {
        id: 51,
        name: '数据字典管理',
        path: '/permission/dictionary',
        icon: 'el-icon-notebook-2',
        roles: ['admin']
      }
    ]
  }
]

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isFullscreen: false,
    sidebar: {
      opened: localStorage.getItem('sidebarStatus') ? !!+localStorage.getItem('sidebarStatus') : true,
      withoutAnimation: false
    },
    theme: {
      menuNavigation: localStorage.getItem('menuNavigation') || 'sidebar',
      themeStyle: localStorage.getItem('themeStyle') || 'light',
      themeColor: localStorage.getItem('themeColor') || '#409EFF',
      grayMode: localStorage.getItem('grayMode') === 'true',
      showWatermark: localStorage.getItem('showWatermark') === 'true'
    }
  },
  getters: {
    token: state => state.token,
    userInfo: state => state.userInfo,
    isFullscreen: state => state.isFullscreen,
    sidebar: state => state.sidebar,
    menuList: state => {
      const userRole = state.userInfo.role || 'user'
      return allMenuList.reduce((acc, menu) => {
        if (!menu.roles.includes(userRole)) {
          return acc
        }
        const newMenu = { ...menu }
        if (newMenu.children && newMenu.children.length > 0) {
          newMenu.children = newMenu.children.filter(child => child.roles.includes(userRole))
          if (newMenu.children.length === 0) {
            return acc
          }
        }
        acc.push(newMenu)
        return acc
      }, [])
    },
    isAdmin: state => {
      return state.userInfo.role === 'admin'
    },
    userRole: state => {
      return state.userInfo.role || 'user'
    },
    theme: state => state.theme,
    menuNavigation: state => state.theme.menuNavigation,
    themeStyle: state => state.theme.themeStyle,
    themeColor: state => state.theme.themeColor,
    grayMode: state => state.theme.grayMode,
    showWatermark: state => state.theme.showWatermark
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
    },
    SET_MENU_NAVIGATION: (state, menuNavigation) => {
      state.theme.menuNavigation = menuNavigation
      localStorage.setItem('menuNavigation', menuNavigation)
    },
    SET_THEME_STYLE: (state, themeStyle) => {
      state.theme.themeStyle = themeStyle
      localStorage.setItem('themeStyle', themeStyle)
    },
    SET_THEME_COLOR: (state, themeColor) => {
      state.theme.themeColor = themeColor
      localStorage.setItem('themeColor', themeColor)
    },
    SET_GRAY_MODE: (state, grayMode) => {
      state.theme.grayMode = grayMode
      localStorage.setItem('grayMode', grayMode)
    },
    SET_SHOW_WATERMARK: (state, showWatermark) => {
      state.theme.showWatermark = showWatermark
      localStorage.setItem('showWatermark', showWatermark)
    }
  },
  actions: {
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        request.post('/auth/login', {
          username: userInfo.username,
          password: userInfo.password
        })
          .then(res => {
            const token = res.token || res.data?.token
            const userInfoWithRole = {
              username: userInfo.username,
              role: res.role || res.data?.role || (userInfo.username === 'admin' ? 'admin' : 'user')
            }
            commit('SET_TOKEN', token)
            commit('SET_USER_INFO', userInfoWithRole)
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
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
    },
    setMenuNavigation({ commit }, menuNavigation) {
      commit('SET_MENU_NAVIGATION', menuNavigation)
    },
    setThemeStyle({ commit }, themeStyle) {
      commit('SET_THEME_STYLE', themeStyle)
    },
    setThemeColor({ commit }, themeColor) {
      commit('SET_THEME_COLOR', themeColor)
    },
    setGrayMode({ commit }, grayMode) {
      commit('SET_GRAY_MODE', grayMode)
    },
    setShowWatermark({ commit }, showWatermark) {
      commit('SET_SHOW_WATERMARK', showWatermark)
    }
  }
})
