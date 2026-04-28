import request from '@/utils/request'
import { mockLogin } from '@/mock/auth'

const USE_MOCK = true

export function login(data) {
  if (USE_MOCK) {
    return mockLogin(data)
  }
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function logout() {
  if (USE_MOCK) {
    return Promise.resolve({ code: 0, message: '退出成功' })
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
