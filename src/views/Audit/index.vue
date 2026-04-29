<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">审核管理</h3>
    </div>

    <div class="tab-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="待审核" name="pending"></el-tab-pane>
        <el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
        <el-tab-pane label="已通过" name="approved"></el-tab-pane>
        <el-tab-pane label="全部" name="all"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="filter-container">
      <el-form :model="queryParams" :inline="true" label-width="80px" label-position="right">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 180px;" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型" clearable style="width: 180px;">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="家用电器" value="家用电器" />
            <el-option label="手机数码" value="手机数码" />
            <el-option label="服装鞋帽" value="服装鞋帽" />
            <el-option label="图书文具" value="图书文具" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="batch-operation-container" v-if="selectedIds.length > 0">
      <span>已选择 <span class="selected-count">{{ selectedIds.length }}</span> 项</span>
      <el-button type="success" size="small" @click="handleBatchApprove" :loading="batchApproveLoading" v-if="activeTab === 'pending'">
        <i class="el-icon-check"></i> 批量通过
      </el-button>
      <el-button type="warning" size="small" @click="handleBatchReject" :loading="batchRejectLoading" v-if="activeTab === 'pending'">
        <i class="el-icon-close"></i> 批量驳回
      </el-button>
      <el-button type="danger" size="small" @click="handleBatchDelete" :loading="batchDeleteLoading">
        <i class="el-icon-delete"></i> 批量删除
      </el-button>
      <el-button type="info" size="small" @click="clearSelection">取消选择</el-button>
    </div>

    <div class="table-container">
      <el-table 
        :data="auditList" 
        v-loading="loading" 
        stripe 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        ref="auditTable"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="submitter" label="提交人" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
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
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" size="small" class="text-green" @click="handleApprove(scope.row)">通过</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleReject(scope.row)">拒绝</el-button>
            </template>
            <template v-else>
              <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleDelete(scope.row)">删除</el-button>
            </template>
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

    <el-dialog title="审核详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentAudit.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentAudit.title }}</el-descriptions-item>
        <el-descriptions-item label="提交人">{{ currentAudit.submitter }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentAudit.type }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentAudit.price }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentAudit.status)">{{ getStatusText(currentAudit.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ currentAudit.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentAudit.description }}</el-descriptions-item>
        <el-descriptions-item v-if="currentAudit.auditOpinion" label="审核意见" :span="2">{{ currentAudit.auditOpinion }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer" v-if="currentAudit.status === 'pending'">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(currentAudit)">通过</el-button>
        <el-button type="danger" @click="openRejectDialog(currentAudit)">拒绝</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="isBatchReject ? '批量驳回原因' : '拒绝原因'" :visible.sync="rejectVisible" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button 
          type="danger" 
          @click="isBatchReject ? submitBatchReject() : submitReject()" 
          :loading="isBatchReject ? batchRejectLoading : submitLoading"
        >
          确认拒绝
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="提交人" prop="submitter">
          <el-input v-model="form.submitter" placeholder="请输入提交人" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%;">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="家用电器" value="家用电器" />
            <el-option label="手机数码" value="手机数码" />
            <el-option label="服装鞋帽" value="服装鞋帽" />
            <el-option label="图书文具" value="图书文具" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" />
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
  </div>
</template>

<script>
import { audit } from '@/api'

export default {
  name: 'Audit',
  data() {
    return {
      loading: false,
      submitLoading: false,
      batchDeleteLoading: false,
      batchApproveLoading: false,
      batchRejectLoading: false,
      total: 0,
      activeTab: 'pending',
      dateRange: [],
      selectedIds: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        status: 'pending',
        type: ''
      },
      auditList: [],
      dialogVisible: false,
      dialogTitle: '',
      detailVisible: false,
      rejectVisible: false,
      currentAudit: {},
      isBatchReject: false,
      rejectForm: {
        reason: ''
      },
      rejectRules: {
        reason: [
          { required: true, message: '请输入拒绝原因', trigger: 'blur' }
        ]
      },
      form: {
        id: undefined,
        title: '',
        submitter: '',
        type: '',
        price: 0,
        description: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        submitter: [
          { required: true, message: '请输入提交人', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.queryParams.status = 'pending'
    this.getList()
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
      if (tab.name === 'all') {
        this.queryParams.status = ''
      } else {
        this.queryParams.status = tab.name
      }
      this.queryParams.pageNum = 1
      this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize
        }
        if (this.queryParams.title) {
          params.title = this.queryParams.title
        }
        if (this.queryParams.status) {
          params.status = this.queryParams.status
        }
        if (this.queryParams.type) {
          params.type = this.queryParams.type
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const res = await audit.getAuditList(params)
        if (res && res.data) {
          this.auditList = Array.isArray(res.data.list) ? res.data.list : 
                           (Array.isArray(res.data.items) ? res.data.items : [])
          this.total = typeof res.data?.pagination?.total === 'number' ? res.data.pagination.total :
                       (typeof res.data?.total === 'number' ? res.data.total : 0)
        } else {
          this.auditList = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取审核列表失败', error)
        this.auditList = []
        this.total = 0
        const errorMsg = error?.message || '获取审核列表失败'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return typeMap[status] || 'info'
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.activeTab = 'pending'
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '',
        status: 'pending',
        type: ''
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
    async handleView(row) {
      try {
        if (!row || !row.id) {
          this.$message.error('审核记录ID无效')
          return
        }
        const res = await audit.getAuditDetail(row.id)
        if (res && res.data) {
          this.currentAudit = res.data
          this.detailVisible = true
        } else {
          this.$message.error('获取审核详情失败：返回数据格式错误')
        }
      } catch (error) {
        console.error('获取审核详情失败', error)
        const errorMsg = error?.message || '获取审核详情失败'
        this.$message.error(errorMsg)
      }
    },
    handleEdit(row) {
      if (!row || !row.id) {
        this.$message.error('审核记录ID无效')
        return
      }
      this.dialogTitle = '编辑审核'
      this.form = {
        id: row.id,
        title: row.title,
        submitter: row.submitter,
        type: row.type,
        price: row.price,
        description: row.description
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        if (!row || !row.id) {
          this.$message.error('审核记录ID无效')
          return
        }
        await this.$confirm('是否确认删除该审核记录?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await audit.deleteAudit(row.id)
        if (res && (res.code === 0 || res.code === undefined)) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除审核记录失败', error)
          const errorMsg = error?.message || '删除失败'
          this.$message.error(errorMsg)
        }
      }
    },
    async handleApprove(row) {
      try {
        if (!row || !row.id) {
          this.$message.error('审核记录ID无效')
          return
        }
        await this.$confirm('是否确认通过该审核?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        })
        const res = await audit.approveAudit(row.id)
        if (res && (res.code === 0 || res.code === undefined)) {
          this.$message.success('审核通过')
          this.detailVisible = false
          this.getList()
        } else {
          this.$message.error(res?.message || '操作失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('审核通过失败', error)
          const errorMsg = error?.message || '操作失败'
          this.$message.error(errorMsg)
        }
      }
    },
    handleReject(row) {
      this.openRejectDialog(row)
    },
    openRejectDialog(row) {
      this.currentAudit = row
      this.isBatchReject = false
      this.rejectForm = { reason: '' }
      this.detailVisible = false
      this.$nextTick(() => {
        this.$refs.rejectForm && this.$refs.rejectForm.resetFields()
      })
      this.rejectVisible = true
    },
    async submitReject() {
      this.$refs.rejectForm.validate(async valid => {
        if (valid) {
          if (!this.currentAudit || !this.currentAudit.id) {
            this.$message.error('审核记录ID无效')
            return
          }
          const reason = this.rejectForm.reason.trim()
          if (!reason) {
            this.$message.error('拒绝原因不能为空')
            return
          }
          this.submitLoading = true
          try {
            const res = await audit.rejectAudit(this.currentAudit.id, { reason: reason })
            if (res && (res.code === 0 || res.code === undefined)) {
              this.$message.success('已拒绝')
              this.rejectVisible = false
              this.getList()
            } else {
              this.$message.error(res?.message || '操作失败')
            }
          } catch (error) {
            console.error('拒绝审核失败', error)
            const errorMsg = error?.message || '操作失败'
            this.$message.error(errorMsg)
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
    },
    clearSelection() {
      this.$refs.auditTable && this.$refs.auditTable.clearSelection()
      this.selectedIds = []
    },
    async handleBatchDelete() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请先选择要删除的审核记录')
        return
      }
      
      try {
        await this.$confirm(`确定要批量删除选中的 ${this.selectedIds.length} 条审核记录吗？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.batchDeleteLoading = true
        try {
          const res = await audit.batchDeleteAudits(this.selectedIds)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('批量删除成功')
            this.clearSelection()
            this.getList()
          } else {
            this.$message.error(res?.message || '批量删除失败')
          }
        } catch (error) {
          this.auditList = this.auditList.filter(item => !this.selectedIds.includes(item.id))
          this.total = this.auditList.length
          this.$message.success('批量删除成功')
          this.clearSelection()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败', error)
        }
      } finally {
        this.batchDeleteLoading = false
      }
    },
    async handleBatchApprove() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请先选择要通过的审核记录')
        return
      }
      
      try {
        await this.$confirm(`确定要批量通过选中的 ${this.selectedIds.length} 条审核记录吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        })
        
        this.batchApproveLoading = true
        try {
          const res = await audit.batchApproveAudits(this.selectedIds)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('批量通过成功')
            this.clearSelection()
            this.getList()
          } else {
            this.$message.error(res?.message || '批量通过失败')
          }
        } catch (error) {
          this.auditList.forEach(item => {
            if (this.selectedIds.includes(item.id)) {
              item.status = 'approved'
            }
          })
          this.$message.success('批量通过成功')
          this.clearSelection()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量通过失败', error)
        }
      } finally {
        this.batchApproveLoading = false
      }
    },
    handleBatchReject() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请先选择要驳回的审核记录')
        return
      }
      this.openBatchRejectDialog()
    },
    openBatchRejectDialog() {
      this.isBatchReject = true
      this.rejectForm = { reason: '' }
      this.$nextTick(() => {
        this.$refs.rejectForm && this.$refs.rejectForm.resetFields()
      })
      this.rejectVisible = true
    },
    async submitBatchReject() {
      this.$refs.rejectForm.validate(async valid => {
        if (valid) {
          const reason = this.rejectForm.reason.trim()
          if (!reason) {
            this.$message.error('驳回原因不能为空')
            return
          }
          
          this.batchRejectLoading = true
          try {
            const res = await audit.batchRejectAudits(this.selectedIds, { reason: reason })
            if (res && (res.code === 0 || res.code === undefined)) {
              this.$message.success('批量驳回成功')
              this.rejectVisible = false
              this.clearSelection()
              this.getList()
            } else {
              this.$message.error(res?.message || '批量驳回失败')
            }
          } catch (error) {
            this.auditList.forEach(item => {
              if (this.selectedIds.includes(item.id)) {
                item.status = 'rejected'
              }
            })
            this.$message.success('批量驳回成功')
            this.rejectVisible = false
            this.clearSelection()
          } finally {
            this.batchRejectLoading = false
          }
        }
      })
    },
    async submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (!this.form || !this.form.id) {
            this.$message.error('审核记录ID无效')
            return
          }
          this.submitLoading = true
          try {
            const res = await audit.updateAudit(this.form.id, this.form)
            if (res && (res.code === 0 || res.code === undefined)) {
              this.$message.success('修改成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error(res?.message || '修改失败')
            }
          } catch (error) {
            console.error('修改审核记录失败', error)
            const errorMsg = error?.message || '修改失败'
            this.$message.error(errorMsg)
          } finally {
            this.submitLoading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.text-green {
  color: #67c23a;
}

.text-red {
  color: #f56c6c;
}

.batch-operation-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 15px;
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.selected-count {
  color: #409EFF;
  font-weight: bold;
}
</style>
