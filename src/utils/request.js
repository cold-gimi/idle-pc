import axios from 'axios'
import Vue from 'vue'

const service = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加响应拦截器，处理 code 非 0 的情况
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      Vue.prototype.$message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Response error:', error)
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          Vue.prototype.$router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || `请求错误 (${error.response.status})`
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接'
    }
    Vue.prototype.$message.error(message)
    return Promise.reject(error)
  }
)

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    console.error('Response error:', error)
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          Vue.prototype.$router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || `请求错误 (${error.response.status})`
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接'
    }
    Vue.prototype.$message.error(message)
    return Promise.reject(error)
  }
)

export default service
