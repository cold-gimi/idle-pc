<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">文章管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增文章</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAddCategory">新增分类</el-button>
      </div>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">标题：</span>
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">状态：</span>
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="pending" />
          <el-option label="已发布" value="published" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">日期：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 240px;"
        />
      </div>
      <div class="filter-item">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="articleList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
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
          <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="pending">待审核</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="文章详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentArticle.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentArticle.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentArticle.author }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentArticle.category }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentArticle.price }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentArticle.status)">{{ getStatusText(currentArticle.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentArticle.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentArticle.description }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增分类" :visible.sync="categoryDialogVisible" width="400px">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryForm" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategoryForm" :loading="categorySubmitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Article',
  data() {
    return {
      loading: false,
      submitLoading: false,
      total: 0,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        status: ''
      },
      articleList: [],
      dialogVisible: false,
      dialogTitle: '',
      isAdd: false,
      detailVisible: false,
      currentArticle: {},
      categoryList: [
        '电子产品',
        '家用电器',
        '手机数码',
        '服装鞋帽',
        '图书文具',
        '其他'
      ],
      form: {
        id: undefined,
        title: '',
        author: '',
        category: '',
        price: 0,
        status: 'draft',
        description: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ]
      },
      categoryDialogVisible: false,
      categorySubmitLoading: false,
      categoryForm: {
        name: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
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

        let filtered = mockData
        if (this.queryParams.title) {
          filtered = filtered.filter(item => item.title.includes(this.queryParams.title))
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status)
        }
        if (this.dateRange && this.dateRange.length === 2) {
          const [startDate, endDate] = this.dateRange
          filtered = filtered.filter(item => {
            const itemDate = item.createTime.split(' ')[0]
            return itemDate >= startDate && itemDate <= endDate
          })
        }

        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const end = start + this.queryParams.pageSize
        
        this.articleList = filtered.slice(start, end)
        this.total = filtered.length
        this.loading = false
      }, 500)
    },
    getStatusText(status) {
      const statusMap = {
        draft: '草稿',
        pending: '待审核',
        published: '已发布',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const typeMap = {
        draft: 'info',
        pending: 'warning',
        published: 'success',
        rejected: 'danger'
      }
      return typeMap[status] || 'info'
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '',
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
      this.dialogTitle = '新增文章'
      this.form = {
        id: undefined,
        title: '',
        author: '',
        category: '',
        price: 0,
        status: 'draft',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isAdd = false
      this.dialogTitle = '编辑文章'
      this.form = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleView(row) {
      this.currentArticle = row
      this.detailVisible = true
    },
    handleDelete(row) {
      this.$confirm('是否确认删除该文章?', '警告', {
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
    handleAddCategory() {
      this.categoryForm = {
        name: ''
      }
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.resetFields()
      })
      this.categoryDialogVisible = true
    },
    submitCategoryForm() {
      this.$refs.categoryForm.validate(valid => {
        if (valid) {
          const categoryName = this.categoryForm.name.trim()
          if (this.categoryList.includes(categoryName)) {
            this.$message.error('该分类已存在')
            return
          }
          this.categorySubmitLoading = true
          setTimeout(() => {
            this.categoryList.push(categoryName)
            this.$message.success('新增分类成功')
            this.categoryDialogVisible = false
            this.categorySubmitLoading = false
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
.header-buttons {
  display: flex;
  gap: 10px;
}
</style>
