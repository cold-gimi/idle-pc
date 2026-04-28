<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">数据字典管理</h3>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增字典</el-button>
      </div>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">字典名称：</span>
        <el-input v-model="queryParams.name" placeholder="请输入字典名称" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">字典Key：</span>
        <el-input v-model="queryParams.dictKey" placeholder="请输入字典Key" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">状态：</span>
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="dictList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="字典名称" min-width="200" />
        <el-table-column prop="dictKey" label="字典Key" min-width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handleViewDetail(scope.row)">{{ scope.row.dictKey }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              :class="scope.row.status === '1' ? 'text-orange' : 'text-green'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
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
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典Key" prop="dictKey">
          <el-input v-model="form.dictKey" placeholder="请输入字典Key" :disabled="!isAdd" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入字典描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Dictionary',
  data() {
    return {
      loading: false,
      submitLoading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        dictKey: '',
        status: ''
      },
      dictList: [],
      dialogVisible: false,
      dialogTitle: '',
      isAdd: false,
      form: {
        id: undefined,
        name: '',
        dictKey: '',
        status: '1',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入字典名称', trigger: 'blur' },
          { min: 2, max: 100, message: '字典名称长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        dictKey: [
          { required: true, message: '请输入字典Key', trigger: 'blur' },
          { min: 2, max: 100, message: '字典Key长度在 2 到 100 个字符', trigger: 'blur' }
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
          { id: 1, name: '性别', dictKey: 'gender', description: '用户性别字典', status: '1', createTime: '2024-04-25 10:30:00' },
          { id: 2, name: '状态', dictKey: 'status', description: '通用状态字典', status: '1', createTime: '2024-04-24 15:20:00' },
          { id: 3, name: '商品分类', dictKey: 'product_category', description: '商品分类字典', status: '1', createTime: '2024-04-23 09:15:00' },
          { id: 4, name: '订单状态', dictKey: 'order_status', description: '订单状态字典', status: '0', createTime: '2024-04-22 14:45:00' },
          { id: 5, name: '支付方式', dictKey: 'payment_method', description: '支付方式字典', status: '1', createTime: '2024-04-21 11:30:00' },
          { id: 6, name: '用户等级', dictKey: 'user_level', description: '用户等级字典', status: '1', createTime: '2024-04-20 16:45:00' },
          { id: 7, name: '文章类型', dictKey: 'article_type', description: '文章类型字典', status: '0', createTime: '2024-04-19 08:30:00' },
          { id: 8, name: '审核状态', dictKey: 'audit_status', description: '审核状态字典', status: '1', createTime: '2024-04-18 13:20:00' }
        ]

        let filtered = mockData
        if (this.queryParams.name) {
          filtered = filtered.filter(item => item.name.includes(this.queryParams.name))
        }
        if (this.queryParams.dictKey) {
          filtered = filtered.filter(item => item.dictKey.includes(this.queryParams.dictKey))
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status)
        }

        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const end = start + this.queryParams.pageSize
        
        this.dictList = filtered.slice(start, end)
        this.total = filtered.length
        this.loading = false
      }, 500)
    },
    getStatusText(status) {
      const statusMap = {
        '1': '启用',
        '0': '禁用'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const typeMap = {
        '1': 'success',
        '0': 'info'
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
        dictKey: '',
        status: ''
      }
      this.getList()
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
      this.dialogTitle = '新增字典'
      this.form = {
        id: undefined,
        name: '',
        dictKey: '',
        status: '1',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isAdd = false
      this.dialogTitle = '编辑字典'
      this.form = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleViewDetail(row) {
      this.$router.push(`/permission/dictionary/detail/${row.dictKey}`)
    },
    handleToggleStatus(row) {
      const newStatus = row.status === '1' ? '0' : '1'
      const statusText = newStatus === '1' ? '启用' : '禁用'
      this.$confirm(`是否确认${statusText}该字典?`, '提示', {
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
      this.$confirm('是否确认删除该字典?', '警告', {
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