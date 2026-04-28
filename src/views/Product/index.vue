<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">商品列表</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增商品</el-button>
      </div>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">商品名称：</span>
        <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">分类：</span>
        <el-select v-model="queryParams.category" placeholder="请选择分类" clearable style="width: 150px;">
          <el-option
            v-for="category in categoryList"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">成色：</span>
        <el-select v-model="queryParams.condition" placeholder="请选择成色" clearable style="width: 150px;">
          <el-option
            v-for="item in conditionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">状态：</span>
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="已上架" value="on" />
          <el-option label="已下架" value="off" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="productList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template slot-scope="scope">
            <div class="thumbnail-container" v-if="scope.row.images && scope.row.images.length > 0">
              <el-image
                :src="scope.row.images[0]"
                :preview-src-list="scope.row.images"
                fit="cover"
                class="product-thumbnail"
              />
              <span v-if="scope.row.images.length > 1" class="image-count">+{{ scope.row.images.length - 1 }}</span>
            </div>
            <span v-else class="no-image">无图</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="condition" label="成色" width="100">
          <template slot-scope="scope">
            <el-tag :type="getConditionType(scope.row.condition)" size="small">
              {{ getConditionText(scope.row.condition) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="tradeMethod" label="交易方式" width="100">
          <template slot-scope="scope">
            {{ getTradeMethodText(scope.row.tradeMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              :class="scope.row.status === 'on' ? 'text-orange' : 'text-green'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'on' ? '下架' : '上架' }}
            </el-button>
            <el-button type="text" size="small" class="text-red" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="form.category"
            placeholder="请选择分类"
            style="width: 100%;"
            filterable
            allow-create
            default-first-option
            @change="handleCategoryChange"
          >
            <el-option
              v-for="category in categoryList"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="成色" prop="condition">
          <el-select v-model="form.condition" placeholder="请选择成色" style="width: 100%;">
            <el-option
              v-for="item in conditionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="交易方式" prop="tradeMethod">
          <el-radio-group v-model="form.tradeMethod">
            <el-radio label="pickup">自提</el-radio>
            <el-radio label="shipping">邮寄</el-radio>
            <el-radio label="both">自提+邮寄</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入自提位置" />
        </el-form-item>
        <el-form-item label="商品图片" prop="images">
          <el-upload
            class="image-uploader"
            :action="uploadAction"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :file-list="form.images"
            :limit="9"
            list-type="picture-card"
            :on-exceed="handleUploadExceed"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <i class="el-icon-plus"></i>
            <div class="el-upload__tip" slot="tip">最多上传9张图片</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="on">上架</el-radio>
            <el-radio label="off">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="商品详情" :visible.sync="detailVisible" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentProduct.id }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentProduct.category }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentProduct.price }}</el-descriptions-item>
        <el-descriptions-item label="成色">
          <el-tag :type="getConditionType(currentProduct.condition)" size="small">
            {{ getConditionText(currentProduct.condition) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="交易方式">{{ getTradeMethodText(currentProduct.tradeMethod) }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ currentProduct.location || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentProduct.status)">{{ getStatusText(currentProduct.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentProduct.createTime }}</el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2" v-if="currentProduct.images && currentProduct.images.length > 0">
          <div class="detail-images">
            <el-image
              v-for="(img, index) in currentProduct.images"
              :key="index"
              :src="img"
              :preview-src-list="currentProduct.images"
              fit="cover"
              class="detail-image"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentProduct.description }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Product',
  data() {
    return {
      loading: false,
      submitLoading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        category: '',
        condition: '',
        status: ''
      },
      productList: [],
      categoryList: [
        '电子产品',
        '家用电器',
        '手机数码',
        '服装鞋帽',
        '图书文具',
        '美妆护肤',
        '运动户外',
        '家居用品',
        '其他'
      ],
      conditionOptions: [
        { label: '全新', value: 'new' },
        { label: '99新', value: 'like_new' },
        { label: '95新', value: 'excellent' },
        { label: '9成新', value: 'good' },
        { label: '8成新', value: 'fair' },
        { label: '7成新及以下', value: 'poor' }
      ],
      tradeMethodOptions: [
        { label: '自提', value: 'pickup' },
        { label: '邮寄', value: 'shipping' },
        { label: '自提+邮寄', value: 'both' }
      ],
      uploadAction: '/api/upload',
      dialogVisible: false,
      dialogTitle: '',
      isAdd: false,
      detailVisible: false,
      currentProduct: {},
      form: {
        id: undefined,
        name: '',
        category: '',
        price: 0,
        condition: '',
        tradeMethod: 'pickup',
        location: '',
        images: [],
        status: 'on',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        condition: [
          { required: true, message: '请选择成色', trigger: 'change' }
        ],
        tradeMethod: [
          { required: true, message: '请选择交易方式', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入自提位置', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      setTimeout(() => {
        const mockData = [
          { id: 1, name: 'iPhone 13 Pro Max 256G 远峰蓝', category: '手机数码', price: 6999, condition: 'excellent', tradeMethod: 'both', location: '北京市朝阳区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2013%20Pro%20Max%20smartphone%20blue%20color%20product%20photo&image_size=square_hd', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20back%20view%20camera%20detail%20close%20up&image_size=square_hd'], status: 'on', createTime: '2024-04-25 10:30:00', description: '95新，使用一年，无磕碰，电池健康度92%' },
          { id: 2, name: 'MacBook Pro 14寸 M1 Pro', category: '电子产品', price: 12999, condition: 'new', tradeMethod: 'pickup', location: '上海市浦东新区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Pro%2014%20inch%20laptop%20silver%20product%20photo&image_size=square_hd'], status: 'off', createTime: '2024-04-24 15:20:00', description: '全新未拆封，公司奖品，低价出' },
          { id: 3, name: '索尼 WH-1000XM4 无线耳机', category: '电子产品', price: 1299, condition: 'like_new', tradeMethod: 'both', location: '广州市天河区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sony%20WH-1000XM4%20wireless%20headphones%20black%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-23 09:15:00', description: '99新，配件齐全，音质超好' },
          { id: 4, name: 'iPad Pro 11寸 2021款', category: '电子产品', price: 4999, condition: 'good', tradeMethod: 'shipping', location: '深圳市南山区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPad%20Pro%2011%20inch%20tablet%20silver%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-22 14:45:00', description: '8成新，屏幕有轻微划痕' },
          { id: 5, name: '任天堂 Switch OLED', category: '电子产品', price: 2299, condition: 'excellent', tradeMethod: 'both', location: '杭州市西湖区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nintendo%20Switch%20OLED%20white%20gaming%20console%20product%20photo&image_size=square_hd'], status: 'off', createTime: '2024-04-21 11:30:00', description: '95新，带三个游戏卡带' },
          { id: 6, name: '戴森 V15 无线吸尘器', category: '家用电器', price: 3999, condition: 'new', tradeMethod: 'pickup', location: '成都市武侯区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dyson%20V15%20wireless%20vacuum%20cleaner%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-20 16:45:00', description: '全新未拆封，官网购买' },
          { id: 7, name: '华为 Mate 40 Pro', category: '手机数码', price: 4599, condition: 'good', tradeMethod: 'both', location: '南京市鼓楼区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huawei%20Mate%2040%20Pro%20smartphone%20black%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-19 08:30:00', description: '9成新，使用半年' },
          { id: 8, name: 'AirPods Pro 2', category: '电子产品', price: 1399, condition: 'like_new', tradeMethod: 'shipping', location: '武汉市江汉区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AirPods%20Pro%202%20wireless%20earbuds%20white%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-18 13:20:00', description: '99新，国行正品' },
          { id: 9, name: '机械键盘 樱桃红轴', category: '电子产品', price: 599, condition: 'fair', tradeMethod: 'both', location: '重庆市渝中区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mechanical%20keyboard%20Cherry%20MX%20Red%20switches%20product%20photo&image_size=square_hd'], status: 'off', createTime: '2024-04-17 09:45:00', description: '8成新，按键正常' },
          { id: 10, name: '小米手环 7 Pro', category: '电子产品', price: 299, condition: 'excellent', tradeMethod: 'pickup', location: '苏州市工业园区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiaomi%20Mi%20Band%207%20Pro%20smart%20watch%20black%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-16 14:10:00', description: '95新，功能正常' },
          { id: 11, name: '耐克 Air Jordan 1 运动鞋', category: '运动户外', price: 899, condition: 'good', tradeMethod: 'both', location: '西安市雁塔区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nike%20Air%20Jordan%201%20sneakers%20shoes%20red%20black%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-15 10:20:00', description: '42码，9成新，只穿过几次' },
          { id: 12, name: '雅诗兰黛小棕瓶精华', category: '美妆护肤', price: 599, condition: 'new', tradeMethod: 'shipping', location: '郑州市金水区', images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Estee%20Lauder%20Advanced%20Night%20Repair%20serum%20bottle%20product%20photo&image_size=square_hd'], status: 'on', createTime: '2024-04-14 16:30:00', description: '全新未拆封，专柜正品' }
        ]

        let filtered = mockData
        if (this.queryParams.name) {
          filtered = filtered.filter(item => item.name.includes(this.queryParams.name))
        }
        if (this.queryParams.category) {
          filtered = filtered.filter(item => item.category === this.queryParams.category)
        }
        if (this.queryParams.condition) {
          filtered = filtered.filter(item => item.condition === this.queryParams.condition)
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status)
        }

        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const end = start + this.queryParams.pageSize
        
        this.productList = filtered.slice(start, end)
        this.total = filtered.length
        this.loading = false
      }, 500)
    },
    getStatusText(status) {
      const statusMap = {
        on: '已上架',
        off: '已下架'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const typeMap = {
        on: 'success',
        off: 'info'
      }
      return typeMap[status] || 'info'
    },
    getConditionText(condition) {
      const conditionMap = {
        new: '全新',
        like_new: '99新',
        excellent: '95新',
        good: '9成新',
        fair: '8成新',
        poor: '7成新及以下'
      }
      return conditionMap[condition] || condition
    },
    getConditionType(condition) {
      const typeMap = {
        new: 'success',
        like_new: 'success',
        excellent: 'primary',
        good: 'warning',
        fair: 'warning',
        poor: 'danger'
      }
      return typeMap[condition] || 'info'
    },
    getTradeMethodText(tradeMethod) {
      const tradeMethodMap = {
        pickup: '自提',
        shipping: '邮寄',
        both: '自提+邮寄'
      }
      return tradeMethodMap[tradeMethod] || tradeMethod
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        category: '',
        condition: '',
        status: ''
      }
      this.getList()
    },
    handleCategoryChange(value) {
      if (value && !this.categoryList.includes(value)) {
        this.categoryList.push(value)
      }
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    handleAdd() {
      this.isAdd = true
      this.dialogTitle = '新增商品'
      this.form = {
        id: undefined,
        name: '',
        category: '',
        price: 0,
        condition: '',
        tradeMethod: 'pickup',
        location: '',
        images: [],
        status: 'on',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isAdd = false
      this.dialogTitle = '编辑商品'
      this.form = Object.assign({}, row, {
        images: row.images ? row.images.map((url, index) => ({
          name: `image-${index}`,
          url: url
        })) : []
      })
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleView(row) {
      this.currentProduct = row
      this.detailVisible = true
    },
    handleToggleStatus(row) {
      const newStatus = row.status === 'on' ? 'off' : 'on'
      const statusText = newStatus === 'on' ? '上架' : '下架'
      this.$confirm(`是否确认${statusText}该商品?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = newStatus
        this.$message.success(`${statusText}成功`)
        this.getList()
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('是否确认删除该商品?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.getList()
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            if (this.isAdd) {
              this.$message.success('新增成功')
            } else {
              this.$message.success('修改成功')
            }
            this.dialogVisible = false
            this.submitLoading = false
            this.getList()
          }, 500)
        }
      })
    },
    handleUploadSuccess(response, file, fileList) {
      this.form.images = fileList.map(f => f.url || f.response?.url)
    },
    handleUploadRemove(file, fileList) {
      this.form.images = fileList.map(f => f.url || f.response?.url)
    },
    handleUploadExceed(files, fileList) {
      this.$message.warning('最多只能上传9张图片')
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.text-red {
  color: #f56c6c;
}
.text-green {
  color: #67c23a;
}
.text-orange {
  color: #e6a23c;
}
.header-buttons {
  display: flex;
  gap: 10px;
}
.thumbnail-container {
  position: relative;
  width: 60px;
  height: 60px;
}
.product-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}
.image-count {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px 0 4px 0;
}
.no-image {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}
.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.detail-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}
.image-uploader {
  width: 100%;
}
/deep/ .el-upload--picture-card {
  width: 80px;
  height: 80px;
  line-height: 80px;
}
/deep/ .el-upload-list--picture-card .el-upload-list__item {
  width: 80px;
  height: 80px;
}
</style>
