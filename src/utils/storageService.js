const STORAGE_KEYS = {
  DICTIONARIES: 'idle_pc_dictionaries',
  DICTIONARY_ITEMS: 'idle_pc_dictionary_items',
  PRODUCTS: 'idle_pc_products',
  ARTICLES: 'idle_pc_articles'
}

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

const initMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.DICTIONARIES)) {
    const dictionaries = [
      { id: 1, name: '性别', dictKey: 'gender', description: '用户性别字典', status: '1', createTime: '2024-04-25 10:30:00' },
      { id: 2, name: '状态', dictKey: 'status', description: '通用状态字典', status: '1', createTime: '2024-04-24 15:20:00' },
      { id: 3, name: '商品分类', dictKey: 'product_category', description: '商品分类字典', status: '1', createTime: '2024-04-23 09:15:00' },
      { id: 4, name: '订单状态', dictKey: 'order_status', description: '订单状态字典', status: '0', createTime: '2024-04-22 14:45:00' },
      { id: 5, name: '支付方式', dictKey: 'payment_method', description: '支付方式字典', status: '1', createTime: '2024-04-21 11:30:00' },
      { id: 6, name: '用户等级', dictKey: 'user_level', description: '用户等级字典', status: '1', createTime: '2024-04-20 16:45:00' },
      { id: 7, name: '文章类型', dictKey: 'article_type', description: '文章类型字典', status: '0', createTime: '2024-04-19 08:30:00' },
      { id: 8, name: '审核状态', dictKey: 'audit_status', description: '审核状态字典', status: '1', createTime: '2024-04-18 13:20:00' }
    ]
    localStorage.setItem(STORAGE_KEYS.DICTIONARIES, JSON.stringify(dictionaries))
  }

  if (!localStorage.getItem(STORAGE_KEYS.DICTIONARY_ITEMS)) {
    const dictItems = {
      'gender': [
        { id: 1, dictKey: 'gender', itemName: '男', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-25 10:30:00', description: '男性' },
        { id: 2, dictKey: 'gender', itemName: '女', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-25 10:31:00', description: '女性' },
        { id: 3, dictKey: 'gender', itemName: '未知', itemValue: '0', sort: 3, status: '0', createTime: '2024-04-25 10:32:00', description: '未知性别' }
      ],
      'status': [
        { id: 1, dictKey: 'status', itemName: '启用', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-24 15:20:00', description: '启用状态' },
        { id: 2, dictKey: 'status', itemName: '禁用', itemValue: '0', sort: 2, status: '1', createTime: '2024-04-24 15:21:00', description: '禁用状态' }
      ],
      'product_category': [
        { id: 1, dictKey: 'product_category', itemName: '电子产品', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-23 09:15:00', description: '' },
        { id: 2, dictKey: 'product_category', itemName: '家用电器', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-23 09:16:00', description: '' },
        { id: 3, dictKey: 'product_category', itemName: '手机数码', itemValue: '3', sort: 3, status: '1', createTime: '2024-04-23 09:17:00', description: '' },
        { id: 4, dictKey: 'product_category', itemName: '服装鞋帽', itemValue: '4', sort: 4, status: '1', createTime: '2024-04-23 09:18:00', description: '' },
        { id: 5, dictKey: 'product_category', itemName: '图书文具', itemValue: '5', sort: 5, status: '0', createTime: '2024-04-23 09:19:00', description: '' }
      ],
      'order_status': [
        { id: 1, dictKey: 'order_status', itemName: '待付款', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-22 14:45:00', description: '' },
        { id: 2, dictKey: 'order_status', itemName: '待发货', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-22 14:46:00', description: '' },
        { id: 3, dictKey: 'order_status', itemName: '已发货', itemValue: '3', sort: 3, status: '1', createTime: '2024-04-22 14:47:00', description: '' },
        { id: 4, dictKey: 'order_status', itemName: '已完成', itemValue: '4', sort: 4, status: '1', createTime: '2024-04-22 14:48:00', description: '' },
        { id: 5, dictKey: 'order_status', itemName: '已取消', itemValue: '5', sort: 5, status: '0', createTime: '2024-04-22 14:49:00', description: '' }
      ],
      'payment_method': [
        { id: 1, dictKey: 'payment_method', itemName: '微信支付', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-21 11:30:00', description: '' },
        { id: 2, dictKey: 'payment_method', itemName: '支付宝', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-21 11:31:00', description: '' },
        { id: 3, dictKey: 'payment_method', itemName: '银行卡', itemValue: '3', sort: 3, status: '1', createTime: '2024-04-21 11:32:00', description: '' }
      ],
      'user_level': [
        { id: 1, dictKey: 'user_level', itemName: '普通用户', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-20 16:45:00', description: '' },
        { id: 2, dictKey: 'user_level', itemName: 'VIP用户', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-20 16:46:00', description: '' },
        { id: 3, dictKey: 'user_level', itemName: 'SVIP用户', itemValue: '3', sort: 3, status: '1', createTime: '2024-04-20 16:47:00', description: '' }
      ],
      'article_type': [
        { id: 1, dictKey: 'article_type', itemName: '公告', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-19 08:30:00', description: '' },
        { id: 2, dictKey: 'article_type', itemName: '新闻', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-19 08:31:00', description: '' },
        { id: 3, dictKey: 'article_type', itemName: '活动', itemValue: '3', sort: 3, status: '0', createTime: '2024-04-19 08:32:00', description: '' }
      ],
      'audit_status': [
        { id: 1, dictKey: 'audit_status', itemName: '待审核', itemValue: '1', sort: 1, status: '1', createTime: '2024-04-18 13:20:00', description: '' },
        { id: 2, dictKey: 'audit_status', itemName: '审核通过', itemValue: '2', sort: 2, status: '1', createTime: '2024-04-18 13:21:00', description: '' },
        { id: 3, dictKey: 'audit_status', itemName: '审核拒绝', itemValue: '3', sort: 3, status: '1', createTime: '2024-04-18 13:22:00', description: '' }
      ]
    }
    localStorage.setItem(STORAGE_KEYS.DICTIONARY_ITEMS, JSON.stringify(dictItems))
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const products = [
      { id: 1, name: 'iPhone 13 Pro Max 256G 远峰蓝', category: '手机数码', price: 6999, stock: 5, status: 'on', createTime: '2024-04-25 10:30:00', description: '95新，使用一年，无磕碰，电池健康度92%' },
      { id: 2, name: 'MacBook Pro 14寸 M1 Pro', category: '电子产品', price: 12999, stock: 3, status: 'off', createTime: '2024-04-24 15:20:00', description: '全新未拆封，公司奖品，低价出' },
      { id: 3, name: '索尼 WH-1000XM4 无线耳机', category: '电子产品', price: 1299, stock: 10, status: 'on', createTime: '2024-04-23 09:15:00', description: '99新，配件齐全，音质超好' },
      { id: 4, name: 'iPad Pro 11寸 2021款', category: '电子产品', price: 4999, stock: 2, status: 'on', createTime: '2024-04-22 14:45:00', description: '8成新，屏幕有轻微划痕' },
      { id: 5, name: '任天堂 Switch OLED', category: '电子产品', price: 2299, stock: 8, status: 'off', createTime: '2024-04-21 11:30:00', description: '95新，带三个游戏卡带' },
      { id: 6, name: '戴森 V15 无线吸尘器', category: '家用电器', price: 3999, stock: 1, status: 'on', createTime: '2024-04-20 16:45:00', description: '全新未拆封，官网购买' },
      { id: 7, name: '华为 Mate 40 Pro', category: '手机数码', price: 4599, stock: 4, status: 'on', createTime: '2024-04-19 08:30:00', description: '9成新，使用半年' },
      { id: 8, name: 'AirPods Pro 2', category: '电子产品', price: 1399, stock: 15, status: 'on', createTime: '2024-04-18 13:20:00', description: '99新，国行正品' },
      { id: 9, name: '机械键盘 樱桃红轴', category: '电子产品', price: 599, stock: 20, status: 'off', createTime: '2024-04-17 09:45:00', description: '8成新，按键正常' },
      { id: 10, name: '小米手环 7 Pro', category: '电子产品', price: 299, stock: 12, status: 'on', createTime: '2024-04-16 14:10:00', description: '95新，功能正常' },
      { id: 11, name: '耐克 Air Jordan 1 运动鞋', category: '运动户外', price: 899, stock: 6, status: 'on', createTime: '2024-04-15 10:20:00', description: '42码，9成新，只穿过几次' },
      { id: 12, name: '雅诗兰黛小棕瓶精华', category: '美妆护肤', price: 599, stock: 30, status: 'on', createTime: '2024-04-14 16:30:00', description: '全新未拆封，专柜正品' }
    ]
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  }

  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    const articles = [
      { id: 1, title: 'iPhone 13 Pro Max 256G 远峰蓝', author: '张三', category: '手机数码', price: 6999, status: 'published', createTime: '2024-04-25 10:30:00', description: '95新，使用一年，无磕碰，电池健康度92%' },
      { id: 2, title: 'MacBook Pro 14寸 M1 Pro', author: '李四', category: '电子产品', price: 12999, status: 'pending', createTime: '2024-04-24 15:20:00', description: '全新未拆封，公司奖品，低价出' },
      { id: 3, title: '索尼 WH-1000XM4 无线耳机', author: '王五', category: '电子产品', price: 1299, status: 'published', createTime: '2024-04-23 09:15:00', description: '99新，配件齐全，音质超好' },
      { id: 4, title: 'iPad Pro 11寸 2021款', author: '赵六', category: '电子产品', price: 4999, status: 'rejected', createTime: '2024-04-22 14:45:00', description: '8成新，屏幕有轻微划痕' },
      { id: 5, title: '任天堂 Switch OLED', author: '孙七', category: '电子产品', price: 2299, status: 'published', createTime: '2024-04-21 11:30:00', description: '95新，带三个游戏卡带' },
      { id: 6, title: '戴森 V15 无线吸尘器', author: '周八', category: '家用电器', price: 3999, status: 'pending', createTime: '2024-04-20 16:45:00', description: '全新未拆封，官网购买' },
      { id: 7, title: '华为 Mate 40 Pro', author: '吴九', category: '手机数码', price: 4599, status: 'draft', createTime: '2024-04-19 08:30:00', description: '9成新，使用半年' },
      { id: 8, title: 'AirPods Pro 2', author: '郑十', category: '电子产品', price: 1399, status: 'published', createTime: '2024-04-18 13:20:00', description: '99新，国行正品' },
      { id: 9, title: '机械键盘 樱桃红轴', author: '冯一', category: '电子产品', price: 599, status: 'published', createTime: '2024-04-17 09:45:00', description: '8成新，按键正常' },
      { id: 10, title: '小米手环 7 Pro', author: '陈二', category: '电子产品', price: 299, status: 'pending', createTime: '2024-04-16 14:10:00', description: '95新，功能正常' }
    ]
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
  }
}

const storageService = {
  init() {
    initMockData()
  },

  getDictionaries() {
    const data = localStorage.getItem(STORAGE_KEYS.DICTIONARIES)
    return data ? JSON.parse(data) : []
  },

  saveDictionaries(dictionaries) {
    localStorage.setItem(STORAGE_KEYS.DICTIONARIES, JSON.stringify(dictionaries))
  },

  addDictionary(dictionary) {
    const dictionaries = this.getDictionaries()
    dictionary.id = generateId()
    dictionary.createTime = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    dictionaries.push(dictionary)
    this.saveDictionaries(dictionaries)
    return dictionary
  },

  updateDictionary(id, updates) {
    const dictionaries = this.getDictionaries()
    const index = dictionaries.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      dictionaries[index] = { ...dictionaries[index], ...updates }
      this.saveDictionaries(dictionaries)
      return dictionaries[index]
    }
    return null
  },

  deleteDictionary(id) {
    const dictionaries = this.getDictionaries()
    const index = dictionaries.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      const deleted = dictionaries.splice(index, 1)[0]
      this.saveDictionaries(dictionaries)
      return deleted
    }
    return null
  },

  getDictionaryByKey(dictKey) {
    const dictionaries = this.getDictionaries()
    return dictionaries.find(item => item.dictKey === dictKey)
  },

  getDictionaryItems() {
    const data = localStorage.getItem(STORAGE_KEYS.DICTIONARY_ITEMS)
    return data ? JSON.parse(data) : {}
  },

  saveDictionaryItems(items) {
    localStorage.setItem(STORAGE_KEYS.DICTIONARY_ITEMS, JSON.stringify(items))
  },

  getDictItemsByKey(dictKey) {
    const items = this.getDictionaryItems()
    return items[dictKey] || []
  },

  addDictItem(dictKey, item) {
    const items = this.getDictionaryItems()
    if (!items[dictKey]) {
      items[dictKey] = []
    }
    item.id = generateId()
    item.dictKey = dictKey
    item.createTime = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    items[dictKey].push(item)
    this.saveDictionaryItems(items)
    return item
  },

  updateDictItem(dictKey, id, updates) {
    const items = this.getDictionaryItems()
    if (!items[dictKey]) return null
    const index = items[dictKey].findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      items[dictKey][index] = { ...items[dictKey][index], ...updates }
      this.saveDictionaryItems(items)
      return items[dictKey][index]
    }
    return null
  },

  deleteDictItem(dictKey, id) {
    const items = this.getDictionaryItems()
    if (!items[dictKey]) return null
    const index = items[dictKey].findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      const deleted = items[dictKey].splice(index, 1)[0]
      this.saveDictionaryItems(items)
      return deleted
    }
    return null
  },

  getProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    return data ? JSON.parse(data) : []
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  },

  addProduct(product) {
    const products = this.getProducts()
    product.id = generateId()
    product.createTime = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    products.push(product)
    this.saveProducts(products)
    return product
  },

  updateProduct(id, updates) {
    const products = this.getProducts()
    const index = products.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      this.saveProducts(products)
      return products[index]
    }
    return null
  },

  deleteProduct(id) {
    const products = this.getProducts()
    const index = products.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      const deleted = products.splice(index, 1)[0]
      this.saveProducts(products)
      return deleted
    }
    return null
  },

  getArticles() {
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES)
    return data ? JSON.parse(data) : []
  },

  saveArticles(articles) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
  },

  addArticle(article) {
    const articles = this.getArticles()
    article.id = generateId()
    article.createTime = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
    articles.push(article)
    this.saveArticles(articles)
    return article
  },

  updateArticle(id, updates) {
    const articles = this.getArticles()
    const index = articles.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updates }
      this.saveArticles(articles)
      return articles[index]
    }
    return null
  },

  deleteArticle(id) {
    const articles = this.getArticles()
    const index = articles.findIndex(item => item.id === id || item.id == id)
    if (index !== -1) {
      const deleted = articles.splice(index, 1)[0]
      this.saveArticles(articles)
      return deleted
    }
    return null
  }
}

export default storageService
