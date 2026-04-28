const mockCategories = [
  { id: 1, name: '电子产品', createdAt: '2024-04-20 10:30:00' },
  { id: 2, name: '家用电器', createdAt: '2024-04-21 14:20:00' },
  { id: 3, name: '手机数码', createdAt: '2024-04-22 09:15:00' },
  { id: 4, name: '服装鞋帽', createdAt: '2024-04-23 16:45:00' },
  { id: 5, name: '图书文具', createdAt: '2024-04-24 11:30:00' }
]

const mockArticles = [
  { id: 1, title: 'iPhone 13 Pro Max 256G 远峰蓝', author: '张三', categoryId: 3, categoryName: '手机数码', price: 6999, status: 'published', description: '95新，使用一年，无磕碰，电池健康度92%', createdAt: '2024-04-25 10:30:00' },
  { id: 2, title: 'MacBook Pro 14寸 M1 Pro', author: '李四', categoryId: 1, categoryName: '电子产品', price: 12999, status: 'draft', description: '全新未拆封，公司奖品，低价出', createdAt: '2024-04-24 15:20:00' },
  { id: 3, title: '索尼 WH-1000XM4 无线耳机', author: '王五', categoryId: 1, categoryName: '电子产品', price: 1299, status: 'pending', description: '99新，配件齐全，音质超好', createdAt: '2024-04-23 09:15:00' },
  { id: 4, title: 'iPad Pro 11寸 2021款', author: '赵六', categoryId: 1, categoryName: '电子产品', price: 4999, status: 'published', description: '8成新，屏幕有轻微划痕', createdAt: '2024-04-22 14:45:00' },
  { id: 5, title: '任天堂 Switch OLED', author: '钱七', categoryId: 1, categoryName: '电子产品', price: 2299, status: 'rejected', description: '95新，带三个游戏卡带', createdAt: '2024-04-21 11:30:00' },
  { id: 6, title: '戴森 V15 无线吸尘器', author: '孙八', categoryId: 2, categoryName: '家用电器', price: 3999, status: 'published', description: '全新未拆封，官网购买', createdAt: '2024-04-20 16:45:00' },
  { id: 7, title: '华为 Mate 40 Pro', author: '周九', categoryId: 3, categoryName: '手机数码', price: 4599, status: 'published', description: '9成新，使用半年', createdAt: '2024-04-19 08:30:00' },
  { id: 8, title: 'AirPods Pro 2', author: '吴十', categoryId: 1, categoryName: '电子产品', price: 1399, status: 'published', description: '99新，国行正品', createdAt: '2024-04-18 13:20:00' },
  { id: 9, title: '机械键盘 樱桃红轴', author: '郑十一', categoryId: 1, categoryName: '电子产品', price: 599, status: 'draft', description: '8成新，按键正常', createdAt: '2024-04-17 09:45:00' },
  { id: 10, title: '小米手环 7 Pro', author: '王十二', categoryId: 1, categoryName: '电子产品', price: 299, status: 'published', description: '95新，功能正常', createdAt: '2024-04-16 14:10:00' },
  { id: 11, title: '耐克 Air Jordan 1 运动鞋', author: '李十三', categoryId: 4, categoryName: '服装鞋帽', price: 899, status: 'published', description: '42码，9成新，只穿过几次', createdAt: '2024-04-15 10:20:00' },
  { id: 12, title: 'JavaScript高级程序设计 第4版', author: '张十四', categoryId: 5, categoryName: '图书文具', price: 59, status: 'published', description: '9成新，无笔记', createdAt: '2024-04-14 16:30:00' }
]

let nextArticleId = 13
let nextCategoryId = 6

export function mockGetArticleList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockArticles]
      
      if (params.title) {
        filtered = filtered.filter(item => item.title.includes(params.title))
      }
      if (params.categoryId) {
        filtered = filtered.filter(item => item.categoryId === params.categoryId)
      }
      if (params.status) {
        filtered = filtered.filter(item => item.status === params.status)
      }
      if (params.startDate && params.endDate) {
        filtered = filtered.filter(item => {
          const date = item.createdAt.split(' ')[0]
          return date >= params.startDate && date <= params.endDate
        })
      }

      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      
      const result = {
        code: 0,
        data: {
          list: filtered.slice(start, end),
          pagination: {
            total: filtered.length,
            page: page,
            pageSize: pageSize
          }
        }
      }
      resolve(result)
    }, 500)
  })
}

export function mockGetArticleDetail(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const article = mockArticles.find(a => a.id === parseInt(id))
      if (article) {
        resolve({
          code: 0,
          data: article
        })
      } else {
        reject(new Error('文章不存在'))
      }
    }, 300)
  })
}

export function mockCreateArticle(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = mockCategories.find(c => c.id === data.categoryId)
      const newArticle = {
        id: nextArticleId++,
        title: data.title,
        author: data.author,
        categoryId: data.categoryId,
        categoryName: category ? category.name : '',
        price: data.price,
        status: data.status,
        description: data.description,
        createdAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-')
      }
      mockArticles.unshift(newArticle)
      resolve({
        code: 0,
        data: newArticle
      })
    }, 500)
  })
}

export function mockUpdateArticle(id, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockArticles.findIndex(a => a.id === parseInt(id))
      if (index !== -1) {
        const category = mockCategories.find(c => c.id === data.categoryId)
        mockArticles[index] = {
          ...mockArticles[index],
          title: data.title,
          author: data.author,
          categoryId: data.categoryId,
          categoryName: category ? category.name : mockArticles[index].categoryName,
          price: data.price,
          status: data.status,
          description: data.description
        }
        resolve({
          code: 0,
          data: mockArticles[index]
        })
      } else {
        reject(new Error('文章不存在'))
      }
    }, 500)
  })
}

export function mockDeleteArticle(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockArticles.findIndex(a => a.id === parseInt(id))
      if (index !== -1) {
        mockArticles.splice(index, 1)
        resolve({
          code: 0,
          message: '删除成功'
        })
      } else {
        reject(new Error('文章不存在'))
      }
    }, 300)
  })
}

export function mockGetCategoryList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: [...mockCategories]
      })
    }, 300)
  })
}

export function mockCreateCategory(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCategory = {
        id: nextCategoryId++,
        name: data.name,
        createdAt: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-')
      }
      mockCategories.push(newCategory)
      resolve({
        code: 0,
        data: newCategory
      })
    }, 500)
  })
}

export function mockUpdateCategory(id, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCategories.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCategories[index] = {
          ...mockCategories[index],
          name: data.name
        }
        mockArticles.forEach(article => {
          if (article.categoryId === parseInt(id)) {
            article.categoryName = data.name
          }
        })
        resolve({
          code: 0,
          data: mockCategories[index]
        })
      } else {
        reject(new Error('分类不存在'))
      }
    }, 500)
  })
}

export function mockDeleteCategory(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockCategories.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCategories.splice(index, 1)
        mockArticles.forEach(article => {
          if (article.categoryId === parseInt(id)) {
            article.categoryId = undefined
            article.categoryName = ''
          }
        })
        resolve({
          code: 0,
          message: '删除成功'
        })
      } else {
        reject(new Error('分类不存在'))
      }
    }, 300)
  })
}
