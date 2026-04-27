import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '首页', icon: 'el-icon-s-home' }
      },
      {
        path: 'article',
        name: 'Article',
        component: () => import('@/views/Article/index.vue'),
        meta: { title: '文章管理', icon: 'el-icon-document' }
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/views/Audit/index.vue'),
        meta: { title: '审核管理', icon: 'el-icon-check' }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '二手闲置管理端'
  
  const token = store.getters.token
  
  if (to.path === '/login') {
    if (token) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})

export default router
