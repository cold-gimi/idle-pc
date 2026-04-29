export const statusMap = {
  enabled: {
    '1': { text: '启用', type: 'success' },
    '0': { text: '禁用', type: 'info' }
  },
  product: {
    'on': { text: '已上架', type: 'success' },
    'off': { text: '已下架', type: 'info' }
  },
  article: {
    'draft': { text: '草稿', type: 'info' },
    'pending': { text: '待审核', type: 'warning' },
    'published': { text: '已发布', type: 'success' },
    'rejected': { text: '已拒绝', type: 'danger' }
  }
}

export const getStatusText = (status, type = 'enabled') => {
  return statusMap[type]?.[status]?.text || status
}

export const getStatusType = (status, type = 'enabled') => {
  return statusMap[type]?.[status]?.type || 'info'
}

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

export const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

export default {
  statusMap,
  getStatusText,
  getStatusType,
  formatDate,
  generateId,
  debounce,
  throttle,
  deepClone
}
