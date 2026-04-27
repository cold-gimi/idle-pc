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
        <el-table-column prop="name" label="商品名称" min-width="250" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false">
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
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :precision="0" placeholder="请输入库存" style="width: 100%;" />
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

    <el-dialog title="商品详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentProduct.id }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentProduct.category }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentProduct.price }}</el-descriptions-item>
        <el-descriptions-item label="库存">{{ currentProduct.stock }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentProduct.status)">{{ getStatusText(currentProduct.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentProduct.createTime }}</el-descriptions-item>
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
        stock: 0,
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
        stock: [
          { required: true, message: '请输入库存', trigger: 'blur' }
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

        let filtered = mockData
        if (this.queryParams.name) {
          filtered = filtered.filter(item => item.name.includes(this.queryParams.name))
        }
        if (this.queryParams.category) {
          filtered = filtered.filter(item => item.category === this.queryParams.category)
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
        stock: 0,
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
      this.form = Object.assign({}, row)
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
</style>
