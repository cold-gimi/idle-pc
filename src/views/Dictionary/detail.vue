<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" icon="el-icon-arrow-left" @click="handleBack">返回字典列表</el-button>
        <h3 class="page-title">字典详情 - {{ dictInfo.name }} ({{ dictInfo.dictKey }})</h3>
      </div>
      <div class="header-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleAddItem">新增字典项</el-button>
      </div>
    </div>

    <div class="dict-info-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="字典名称">{{ dictInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="字典Key">{{ dictInfo.dictKey }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(dictInfo.status)">{{ getStatusText(dictInfo.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="3">{{ dictInfo.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">字典项名称：</span>
        <el-input v-model="queryParams.itemName" placeholder="请输入字典项名称" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">字典项值：</span>
        <el-input v-model="queryParams.itemValue" placeholder="请输入字典项值" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
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
      <el-table :data="dictItemList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="itemName" label="字典项名称" min-width="200" />
        <el-table-column prop="itemValue" label="字典项值" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewItem(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEditItem(scope.row)">编辑</el-button>
            <el-button
              type="text"
              size="small"
              :class="scope.row.status === '1' ? 'text-orange' : 'text-green'"
              @click="handleToggleItemStatus(scope.row)"
            >
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="text" size="small" class="text-red" @click="handleDeleteItem(scope.row)">删除</el-button>
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

    <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible" width="600px" :close-on-click-modal="false">
      <el-form :model="itemForm" :rules="itemRules" ref="itemForm" label-width="100px">
        <el-form-item label="字典项名称" prop="itemName">
          <el-input v-model="itemForm.itemName" placeholder="请输入字典项名称" />
        </el-form-item>
        <el-form-item label="字典项值" prop="itemValue">
          <el-input v-model="itemForm.itemValue" placeholder="请输入字典项值" :disabled="!isAddItem" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="itemForm.sort" :min="0" :precision="0" placeholder="请输入排序" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="itemForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入字典项描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItemForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="字典项详情" :visible.sync="itemDetailVisible" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="字典项名称">{{ currentItem.itemName }}</el-descriptions-item>
        <el-descriptions-item label="字典项值">{{ currentItem.itemValue }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentItem.sort }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentItem.status)">{{ getStatusText(currentItem.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentItem.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentItem.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import listPageMixin from '@/mixins/listPage'
import { getStatusText, getStatusType } from '@/utils'
import storageService from '@/utils/storageService'

export default {
  name: 'DictionaryDetail',
  mixins: [listPageMixin],
  data() {
    return {
      dictKey: '',
      dictInfo: {
        name: '',
        dictKey: '',
        status: '1',
        description: ''
      },
      dictItemList: [],
      itemDialogVisible: false,
      itemDialogTitle: '',
      isAddItem: false,
      itemDetailVisible: false,
      currentItem: {},
      itemForm: {
        id: undefined,
        itemName: '',
        itemValue: '',
        sort: 0,
        status: '1',
        description: ''
      }
    }
  },
  computed: {
    itemRules() {
      return {
        itemName: [
          { required: true, message: '请输入字典项名称', trigger: 'blur' },
          { min: 1, max: 100, message: '字典项名称长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        itemValue: [
          { required: true, message: '请输入字典项值', trigger: 'blur' },
          { min: 1, max: 100, message: '字典项值长度在 1 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.dictKey = this.$route.params.dictKey
    this.getDictInfo()
    this.getList()
  },
  methods: {
    getDefaultQueryParams() {
      return {
        itemName: '',
        itemValue: '',
        status: ''
      }
    },
    getDictInfo() {
      const dict = storageService.getDictionaryByKey(this.dictKey)
      if (dict) {
        this.dictInfo = dict
      }
    },
    getStatusText(status) {
      return getStatusText(status, 'enabled')
    },
    getStatusType(status) {
      return getStatusType(status, 'enabled')
    },
    getList() {
      this.loading = true
      setTimeout(() => {
        let filtered = storageService.getDictItemsByKey(this.dictKey)
        
        if (this.queryParams.itemName) {
          filtered = filtered.filter(item => item.itemName.includes(this.queryParams.itemName))
        }
        if (this.queryParams.itemValue) {
          filtered = filtered.filter(item => item.itemValue.includes(this.queryParams.itemValue))
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status)
        }

        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const end = start + this.queryParams.pageSize
        
        this.dictItemList = filtered.slice(start, end)
        this.total = filtered.length
        this.loading = false
      }, 500)
    },
    handleBack() {
      this.$router.push('/permission/dictionary')
    },
    handleAddItem() {
      this.isAddItem = true
      this.itemDialogTitle = '新增字典项'
      this.itemForm = {
        id: undefined,
        itemName: '',
        itemValue: '',
        sort: 0,
        status: '1',
        description: ''
      }
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.resetFields()
      })
      this.itemDialogVisible = true
    },
    handleEditItem(row) {
      this.isAddItem = false
      this.itemDialogTitle = '编辑字典项'
      this.itemForm = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate()
      })
      this.itemDialogVisible = true
    },
    handleViewItem(row) {
      this.currentItem = row
      this.itemDetailVisible = true
    },
    handleToggleItemStatus(row) {
      const newStatus = row.status === '1' ? '0' : '1'
      const statusText = newStatus === '1' ? '启用' : '禁用'
      this.$confirm(`是否确认${statusText}该字典项?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        storageService.updateDictItem(this.dictKey, row.id, { status: newStatus })
        this.$message.success(`${statusText}成功`)
        this.getList()
      }).catch(() => {})
    },
    handleDeleteItem(row) {
      this.$confirm('是否确认删除该字典项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        storageService.deleteDictItem(this.dictKey, row.id)
        this.$message.success('删除成功')
        this.getList()
      }).catch(() => {})
    },
    submitItemForm() {
      this.$refs.itemForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            if (this.isAddItem) {
              const existing = storageService.getDictItemsByKey(this.dictKey).find(
                item => item.itemValue === this.itemForm.itemValue
              )
              if (existing) {
                this.$message.error('字典项值已存在')
                this.submitLoading = false
                return
              }
              storageService.addDictItem(this.dictKey, { ...this.itemForm })
              this.$message.success('新增成功')
            } else {
              storageService.updateDictItem(this.dictKey, this.itemForm.id, { ...this.itemForm })
              this.$message.success('修改成功')
            }
            this.itemDialogVisible = false
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
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-buttons {
  display: flex;
  gap: 10px;
}
.dict-info-card {
  margin-bottom: 20px;
}
</style>
