<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">文章管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddArticle">新增文章</el-button>
        <el-button type="success" icon="el-icon-s-operation" @click="handleOpenCategoryManager">分类管理</el-button>
      </div>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">标题：</span>
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">分类：</span>
        <el-select v-model="queryParams.category" placeholder="请选择分类" clearable style="width: 150px;">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        <el-table-column prop="categoryName" label="分类" width="120" />
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
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewArticle(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEditArticle(scope.row)">编辑</el-button>
            <el-button type="text" size="small" class="text-red" @click="handleDeleteArticle(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <el-dialog :title="articleDialogTitle" :visible.sync="articleDialogVisible" width="700px" :close-on-click-modal="false">
      <el-form :model="articleForm" :rules="articleRules" ref="articleForm" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="articleForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="articleForm.categoryId"
            placeholder="请选择分类"
            style="width: 100%;"
            filterable
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="articleForm.price" :min="0" :precision="2" placeholder="请输入价格" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="articleForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="pending">待审核</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="articleForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitArticleForm" :loading="articleSubmitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="文章详情" :visible.sync="articleDetailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentArticle.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentArticle.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentArticle.author }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentArticle.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentArticle.price }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentArticle.status)">{{ getStatusText(currentArticle.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentArticle.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentArticle.description }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="articleDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分类管理" :visible.sync="categoryManagerVisible" width="800px" :close-on-click-modal="false">
      <div class="category-header">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddCategory">新增分类</el-button>
      </div>
      <el-table :data="categoryList" v-loading="categoryLoading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEditCategory(scope.row)">编辑</el-button>
            <el-button type="text" size="small" class="text-red" @click="handleDeleteCategory(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="categoryDialogTitle" :visible.sync="categoryDialogVisible" width="400px" :close-on-click-modal="false">
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
import { article } from '@/api'

export default {
  name: 'Article',
  data() {
    return {
      loading: false,
      total: 0,
      dateRange: [],
      queryParams: {
        page: 1,
        pageSize: 10,
        title: '',
        category: '',
        status: ''
      },
      articleList: [],
      articleDialogVisible: false,
      articleDialogTitle: '',
      isAddArticle: false,
      articleDetailVisible: false,
      currentArticle: {},
      articleSubmitLoading: false,
      articleForm: {
        id: undefined,
        title: '',
        author: '',
        categoryId: undefined,
        price: 0,
        status: 'draft',
        description: ''
      },
      articleRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ]
      },
      categoryManagerVisible: false,
      categoryLoading: false,
      categoryList: [],
      categoryDialogVisible: false,
      categoryDialogTitle: '',
      isAddCategory: false,
      categorySubmitLoading: false,
      categoryForm: {
        id: undefined,
        name: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    categoryOptions() {
      return this.categoryList.map(item => ({
        label: item.name,
        value: item.id
      }))
    }
  },
  created() {
    this.getArticleList()
    this.getCategoryList()
  },
  methods: {
    async getArticleList() {
      this.loading = true
      try {
        const params = {
          page: this.queryParams.page,
          pageSize: this.queryParams.pageSize
        }
        if (this.queryParams.title) {
          params.title = this.queryParams.title
        }
        if (this.queryParams.category) {
          params.categoryId = this.queryParams.category
        }
        if (this.queryParams.status) {
          params.status = this.queryParams.status
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const res = await article.getArticleList(params)
        this.articleList = res.data?.list || res.data?.items || []
        this.total = res.data?.pagination?.total || res.data?.total || 0
      } catch (error) {
        console.error('获取文章列表失败', error)
        this.$message.error('获取文章列表失败')
      } finally {
        this.loading = false
      }
    },
    async getCategoryList() {
      try {
        const res = await article.getCategoryList()
        this.categoryList = res.data.list || []
      } catch (error) {
        console.error('获取分类列表失败', error)
        this.categoryList = []
        this.$message.error('获取分类列表失败')
      }
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
      this.queryParams.page = 1
      this.getArticleList()
    },
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        page: 1,
        pageSize: 10,
        title: '',
        category: '',
        status: ''
      }
      this.getArticleList()
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getArticleList()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getArticleList()
    },
    handleAddArticle() {
      this.isAddArticle = true
      this.articleDialogTitle = '新增文章'
      this.articleForm = {
        id: undefined,
        title: '',
        author: '',
        categoryId: this.categoryList.length > 0 ? this.categoryList[0].id : undefined,
        price: 0,
        status: 'draft',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.articleForm && this.$refs.articleForm.resetFields()
      })
      this.articleDialogVisible = true
    },
    handleEditArticle(row) {
      this.isAddArticle = false
      this.articleDialogTitle = '编辑文章'
      this.articleForm = {
        id: row.id,
        title: row.title,
        author: row.author,
        categoryId: row.categoryId,
        price: row.price,
        status: row.status,
        description: row.description
      }
      this.$nextTick(() => {
        this.$refs.articleForm && this.$refs.articleForm.clearValidate()
      })
      this.articleDialogVisible = true
    },
    async handleViewArticle(row) {
      try {
        const res = await article.getArticleDetail(row.id)
        this.currentArticle = res.data || {}
        if (!this.currentArticle.categoryName && this.currentArticle.categoryId) {
          const category = this.categoryList.find(c => c.id === this.currentArticle.categoryId)
          if (category) {
            this.currentArticle.categoryName = category.name
          }
        }
        this.articleDetailVisible = true
      } catch (error) {
        console.error('获取文章详情失败', error)
        this.$message.error('获取文章详情失败')
      }
    },
    async handleDeleteArticle(row) {
      try {
        await this.$confirm('是否确认删除该文章?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await article.deleteArticle(row.id)
        this.$message.success('删除成功')
        this.getArticleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除文章失败', error)
          this.$message.error('删除文章失败')
        }
      }
    },
    async submitArticleForm() {
      this.$refs.articleForm.validate(async valid => {
        if (valid) {
          this.articleSubmitLoading = true
          try {
            if (this.isAddArticle) {
              await article.createArticle(this.articleForm)
              this.$message.success('新增成功')
            } else {
              await article.updateArticle(this.articleForm.id, this.articleForm)
              this.$message.success('修改成功')
            }
            this.articleDialogVisible = false
            this.getArticleList()
          } catch (error) {
            console.error('提交失败', error)
            this.$message.error(this.isAddArticle ? '新增失败' : '修改失败')
          } finally {
            this.articleSubmitLoading = false
          }
        }
      })
    },
    handleOpenCategoryManager() {
      this.categoryManagerVisible = true
      this.getCategoryList()
    },
    handleAddCategory() {
      this.isAddCategory = true
      this.categoryDialogTitle = '新增分类'
      this.categoryForm = {
        id: undefined,
        name: ''
      }
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.resetFields()
      })
      this.categoryDialogVisible = true
    },
    handleEditCategory(row) {
      this.isAddCategory = false
      this.categoryDialogTitle = '编辑分类'
      this.categoryForm = {
        id: row.id,
        name: row.name
      }
      this.$nextTick(() => {
        this.$refs.categoryForm && this.$refs.categoryForm.clearValidate()
      })
      this.categoryDialogVisible = true
    },
    async handleDeleteCategory(row) {
      try {
        await this.$confirm('是否确认删除该分类? 删除后关联的文章分类将被清空。', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await article.deleteCategory(row.id)
        this.$message.success('删除成功')
        this.getCategoryList()
        this.getArticleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除分类失败', error)
          this.$message.error('删除分类失败')
        }
      }
    },
    async submitCategoryForm() {
      this.$refs.categoryForm.validate(async valid => {
        if (valid) {
          const categoryName = this.categoryForm.name.trim()
          const existing = this.categoryList.find(
            c => c.name === categoryName && c.id !== this.categoryForm.id
          )
          if (existing) {
            this.$message.error('该分类名称已存在')
            return
          }
          this.categorySubmitLoading = true
          try {
            if (this.isAddCategory) {
              await article.createCategory({ name: categoryName })
              this.$message.success('新增分类成功')
            } else {
              await article.updateCategory(this.categoryForm.id, { name: categoryName })
              this.$message.success('修改分类成功')
            }
            this.categoryDialogVisible = false
            this.getCategoryList()
          } catch (error) {
            console.error('提交分类失败', error)
            this.$message.error(this.isAddCategory ? '新增分类失败' : '修改分类失败')
          } finally {
            this.categorySubmitLoading = false
          }
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
.category-header {
  margin-bottom: 16px;
}
</style>
