import request from '@/utils/request'
import {
  mockGetArticleList,
  mockGetArticleDetail,
  mockCreateArticle,
  mockUpdateArticle,
  mockDeleteArticle,
  mockGetCategoryList,
  mockCreateCategory,
  mockUpdateCategory,
  mockDeleteCategory
} from '@/mock/article'

const USE_MOCK = false

export function getArticleList(params) {
  if (USE_MOCK) {
    return mockGetArticleList(params)
  }
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

export function getArticleDetail(id) {
  if (USE_MOCK) {
    return mockGetArticleDetail(id)
  }
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

export function createArticle(data) {
  if (USE_MOCK) {
    return mockCreateArticle(data)
  }
  return request({
    url: '/articles',
    method: 'post',
    data
  })
}

export function updateArticle(id, data) {
  if (USE_MOCK) {
    return mockUpdateArticle(id, data)
  }
  return request({
    url: `/articles/${id}`,
    method: 'put',
    data
  })
}

export function deleteArticle(id) {
  if (USE_MOCK) {
    return mockDeleteArticle(id)
  }
  return request({
    url: `/articles/${id}`,
    method: 'delete'
  })
}

export function getCategoryList() {
  if (USE_MOCK) {
    return mockGetCategoryList()
  }
  return request({
    url: '/articles/categories',
    method: 'get'
  })
}

export function createCategory(data) {
  if (USE_MOCK) {
    return mockCreateCategory(data)
  }
  return request({
    url: '/articles/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  if (USE_MOCK) {
    return mockUpdateCategory(id, data)
  }
  return request({
    url: `/articles/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  if (USE_MOCK) {
    return mockDeleteCategory(id)
  }
  return request({
    url: `/articles/categories/${id}`,
    method: 'delete'
  })
}
