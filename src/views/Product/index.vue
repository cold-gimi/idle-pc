<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">商品列表</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" :loading="addLoading">新增商品</el-button>
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
        <el-button type="primary" icon="el-icon-search" @click="handleQuery" :loading="searchLoading">搜索</el-button>
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
              :loading="scope.row._toggleLoading"
            >
              {{ scope.row.status === 'on' ? '下架' : '上架' }}
            </el-button>
            <el-button type="text" size="small" class="text-red" @click="handleDelete(scope.row)" :loading="scope.row._deleteLoading">删除</el-button>
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
            :headers="uploadHeaders"
            accept="image/*"
            :disabled="uploadLoading"
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
        <el-button @click="dialogVisible = false" :disabled="submitLoading">取消</el-button>
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
import { getProductList, createProduct, updateProduct, deleteProduct, toggleProductStatus, uploadImage } from '@/api/product'

export default {
  name: 'Product',
  data() {
    return {
      loading: false,
      submitLoading: false,
      addLoading: false,
      searchLoading: false,
      uploadLoading: false,
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
        { label: '自提', value: 'pickup' }
      ],
      uploadAction: 'http://localhost:3000/api/v1/upload',
      uploadHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
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
    async getList() {
      this.loading = true
      try {
        const res = await getProductList(this.queryParams)
        this.productList = res.data?.list || res.data || []
        this.total = res.data?.total || this.productList.length
      } catch (error) {
        console.error('获取商品列表失败:', error)
      } finally {
        this.loading = false
      }
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
      if (this.searchLoading) return
      this.searchLoading = true
      this.queryParams.pageNum = 1
      this.getList().finally(() => {
        this.searchLoading = false
      })
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
      if (this.addLoading) return
      this.addLoading = true
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
        this.addLoading = false
        this.dialogVisible = true
      })
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
    async handleToggleStatus(row) {
      if (row._toggleLoading) return
      
      const newStatus = row.status === 'on' ? 'off' : 'on'
      const statusText = newStatus === 'on' ? '上架' : '下架'
      
      try {
        await this.$confirm(`是否确认${statusText}该商品?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.$set(row, '_toggleLoading', true)
        await toggleProductStatus(row.id, newStatus)
        row.status = newStatus
        this.$message.success(`${statusText}成功`)
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`${statusText}失败:`, error)
        }
      } finally {
        this.$set(row, '_toggleLoading', false)
      }
    },
    async handleDelete(row) {
      if (row._deleteLoading) return
      
      try {
        await this.$confirm('是否确认删除该商品?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.$set(row, '_deleteLoading', true)
        await deleteProduct(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      } finally {
        this.$set(row, '_deleteLoading', false)
      }
    },
    async submitForm() {
      if (this.submitLoading) return
      
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.submitLoading = true
          try {
            const submitData = {
              ...this.form,
              images: this.form.images.map(img => img.url || img)
            }
            
            if (this.isAdd) {
              await createProduct(submitData)
              this.$message.success('新增成功')
            } else {
              await updateProduct(this.form.id, submitData)
              this.$message.success('修改成功')
            }
            this.dialogVisible = false
            this.getList()
          } catch (error) {
            console.error('提交失败:', error)
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleUploadSuccess(response, file, fileList) {
      this.uploadLoading = false
      const url = response.data?.url || response.url || file.response?.data?.url || file.response?.url
      if (url) {
        file.url = url
      }
      this.form.images = fileList.map(f => ({
        name: f.name,
        url: f.url || f.response?.data?.url || f.response?.url
      }))
    },
    handleUploadRemove(file, fileList) {
      this.form.images = fileList.map(f => ({
        name: f.name,
        url: f.url || f.response?.data?.url || f.response?.url
      }))
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
      this.uploadLoading = true
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
