import request from '@/utils/request'

export function getAuditList(params) {
  return request({
    url: '/audits',
    method: 'get',
    params
  })
}

export function getAuditDetail(id) {
  return request({
    url: `/audits/${id}`,
    method: 'get'
  })
}

export function createAudit(data) {
  return request({
    url: '/audits',
    method: 'post',
    data
  })
}

export function updateAudit(id, data) {
  return request({
    url: `/audits/${id}`,
    method: 'put',
    data
  })
}

export function deleteAudit(id) {
  return request({
    url: `/audits/${id}`,
    method: 'delete'
  })
}

export function approveAudit(id) {
  return request({
    url: `/audits/${id}/approve`,
    method: 'put'
  })
}

export function rejectAudit(id, data) {
  return request({
    url: `/audits/${id}/reject`,
    method: 'put',
    data
  })
}

export function getAuditStats() {
  return request({
    url: '/audits/stats/overview',
    method: 'get'
  })
}

export function batchDeleteAudits(ids) {
  return request({
    url: '/audits/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

export function batchApproveAudits(ids) {
  return request({
    url: '/audits/batch-approve',
    method: 'put',
    data: { ids }
  })
}

export function batchRejectAudits(ids, data) {
  return request({
    url: '/audits/batch-reject',
    method: 'put',
    data: { ids, ...data }
  })
}
