import request from '@/utils/request'

export function getMemberList(params) {
  return request({
    url: '/members',
    method: 'get',
    params
  })
}

export function getMemberDetail(id) {
  return request({
    url: `/members/${id}`,
    method: 'get'
  })
}

export function createMember(data) {
  return request({
    url: '/members',
    method: 'post',
    data
  })
}

export function updateMember(id, data) {
  return request({
    url: `/members/${id}`,
    method: 'put',
    data
  })
}

export function deleteMember(id) {
  return request({
    url: `/members/${id}`,
    method: 'delete'
  })
}

export function batchDeleteMembers(ids) {
  return request({
    url: '/members/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

export function approveMember(id) {
  return request({
    url: `/members/${id}/approve`,
    method: 'put'
  })
}

export function rejectMember(id, data) {
  return request({
    url: `/members/${id}/reject`,
    method: 'put',
    data
  })
}

export function batchApproveMembers(ids) {
  return request({
    url: '/members/batch-approve',
    method: 'put',
    data: { ids }
  })
}

export function importMembers(data) {
  return request({
    url: '/members/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getMemberStats() {
  return request({
    url: '/members/stats/overview',
    method: 'get'
  })
}
