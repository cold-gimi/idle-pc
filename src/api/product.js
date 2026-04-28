import request from '@/utils/request'

export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

export function createProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

export function publishProduct(id) {
  return request({
    url: `/products/${id}/publish`,
    method: 'put'
  })
}

export function unpublishProduct(id) {
  return request({
    url: `/products/${id}/unpublish`,
    method: 'put'
  })
}

export function approveProduct(id) {
  return request({
    url: `/products/${id}/approve`,
    method: 'put'
  })
}

export function rejectProduct(id) {
  return request({
    url: `/products/${id}/reject`,
    method: 'put'
  })
}

export function uploadImage(data) {
  return request({
    url: '/products/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
