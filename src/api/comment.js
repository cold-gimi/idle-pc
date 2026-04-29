import request from '@/utils/request'

export function getCommentStatistics() {
  return request({
    url: '/comments/statistics',
    method: 'get'
  })
}

export function getCommentList(params) {
  return request({
    url: '/comments',
    method: 'get',
    params
  })
}

export function getCommentDetail(id) {
  return request({
    url: `/comments/${id}`,
    method: 'get'
  })
}

export function approveComment(id) {
  return request({
    url: `/comments/${id}/approve`,
    method: 'put'
  })
}

export function rejectComment(id) {
  return request({
    url: `/comments/${id}/reject`,
    method: 'put'
  })
}

export function deleteComment(id) {
  return request({
    url: `/comments/${id}`,
    method: 'delete'
  })
}

export function batchDeleteComments(ids) {
  return request({
    url: '/comments/batch-delete',
    method: 'post',
    data: { ids }
  })
}

export function banUser(userId) {
  return request({
    url: `/users/${userId}/ban`,
    method: 'put'
  })
}
