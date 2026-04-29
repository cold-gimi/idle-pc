import axios from 'axios'

let vueInstance = null

export function setVueInstance(vm) {
  vueInstance = vm
}

function showMessage(type, message) {
  if (vueInstance && vueInstance.$message) {
    vueInstance.$message[type](message)
  } else {
    console[ type === 'error' ? 'error' : 'log' ](`[${type.toUpperCase()}]`, message)
  }
}

function navigateTo(path) {
  if (vueInstance && vueInstance.$router) {
    vueInstance.$router.push(path)
  } else {
    console.warn('Router not available, cannot navigate to:', path)
  }
}

const service = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    console.log(`[Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data || '')
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
    console.log(`[Response] ${response.config.method.toUpperCase()} ${response.config.url}`, res)
    
    if (res.code !== 0 && res.code !== undefined) {
      showMessage('error', res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Response error:', error)
    let message = '请求失败'
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          navigateTo('/login')
          break
        case 403:
          message = data?.message || '拒绝访问'
          break
        case 404:
          message = `请求地址不存在: ${error.config.url}`
          break
        case 500:
          message = data?.message || '服务器内部错误'
          break
        default:
          message = data?.message || `请求错误 (${status})`
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接或服务器是否启动'
    } else if (error.message) {
      message = error.message
    }
    
    showMessage('error', message)
    return Promise.reject(error)
  }
)

export default service
