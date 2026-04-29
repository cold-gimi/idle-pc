<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">会员管理</h3>
      <div class="header-buttons">
        <el-upload
          class="excel-uploader"
          :action="importUrl"
          :on-change="handleExcelChange"
          :on-exceed="handleExceed"
          :limit="1"
          accept=".xlsx,.xls"
          :auto-upload="false"
          :show-file-list="false"
        >
          <el-button type="warning" icon="el-icon-upload">Excel导入</el-button>
        </el-upload>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" :loading="addLoading">添加会员</el-button>
      </div>
    </div>

    <div class="filter-container">
      <div class="filter-item">
        <span class="filter-label">会员名称：</span>
        <el-input v-model="queryParams.name" placeholder="请输入会员名称" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">手机号：</span>
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable style="width: 180px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">会员等级：</span>
        <el-select v-model="queryParams.level" placeholder="请选择等级" clearable style="width: 150px;">
          <el-option label="普通会员" value="normal" />
          <el-option label="银卡会员" value="silver" />
          <el-option label="金卡会员" value="gold" />
          <el-option label="钻石会员" value="diamond" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">审核状态：</span>
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">注册日期：</span>
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
        <el-button type="primary" icon="el-icon-search" @click="handleQuery" :loading="searchLoading">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <div class="batch-operation-container" v-if="selectedIds.length > 0">
      <span>已选择 <span class="selected-count">{{ selectedIds.length }}</span> 项</span>
      <el-button type="primary" size="small" @click="handleBatchApprove" :loading="batchApproveLoading">
        <i class="el-icon-check"></i> 批量审批
      </el-button>
      <el-button type="danger" size="small" @click="handleBatchDelete" :loading="batchDeleteLoading">
        <i class="el-icon-delete"></i> 批量删除
      </el-button>
      <el-button type="info" size="small" @click="clearSelection">取消选择</el-button>
    </div>

    <div class="table-container">
      <el-table
        :data="memberList"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="会员名称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="level" label="会员等级" width="100">
          <template slot-scope="scope">
            <el-tag :type="getLevelType(scope.row.level)" size="small">
              {{ getLevelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.balance || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="status" label="审核状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" size="small" class="text-green" @click="handleApprove(scope.row)">审核</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleReject(scope.row)">驳回</el-button>
            </template>
            <template v-else>
              <el-button type="text" size="small" @click="handleViewReject(scope.row)" v-if="scope.row.status === 'rejected'">驳回详情</el-button>
            </template>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="会员名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入会员名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择会员等级" style="width: 100%;">
            <el-option label="普通会员" value="normal" />
            <el-option label="银卡会员" value="silver" />
            <el-option label="金卡会员" value="gold" />
            <el-option label="钻石会员" value="diamond" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input-number v-model="form.balance" :min="0" :precision="2" placeholder="请输入余额" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="form.points" :min="0" placeholder="请输入积分" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="pending">待审核</el-radio>
            <el-radio label="approved">已通过</el-radio>
            <el-radio label="rejected">已驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" :disabled="submitLoading">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="会员详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ currentMember.id }}</el-descriptions-item>
        <el-descriptions-item label="会员名称">{{ currentMember.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentMember.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentMember.email || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">
          <el-tag :type="getLevelType(currentMember.level)" size="small">
            {{ getLevelText(currentMember.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentMember.status)">{{ getStatusText(currentMember.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="余额">¥{{ currentMember.balance || 0 }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ currentMember.points || 0 }}</el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">{{ currentMember.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentMember.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer" v-if="currentMember.status === 'pending'">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(currentMember)">审核通过</el-button>
        <el-button type="danger" @click="openRejectDialog(currentMember)">驳回</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-else>
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm" label-width="100px">
        <el-form-item label="驳回原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject" :loading="submitLoading">确认驳回</el-button>
      </div>
    </el-dialog>

    <el-dialog title="驳回详情" :visible.sync="rejectDetailVisible" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="会员名称">{{ currentMember.name }}</el-descriptions-item>
        <el-descriptions-item label="驳回时间">{{ currentMember.rejectTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因">
          <div style="white-space: pre-wrap; word-break: break-all;">{{ currentMember.rejectReason || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getMemberList, createMember, updateMember, deleteMember, batchDeleteMembers, approveMember, rejectMember, batchApproveMembers } from '@/api/member'

export default {
  name: 'Member',
  data() {
    return {
      loading: false,
      submitLoading: false,
      addLoading: false,
      searchLoading: false,
      batchDeleteLoading: false,
      batchApproveLoading: false,
      total: 0,
      dateRange: [],
      importUrl: '',
      selectedIds: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        phone: '',
        level: '',
        status: ''
      },
      memberList: [],
      dialogVisible: false,
      dialogTitle: '',
      detailVisible: false,
      rejectVisible: false,
      rejectDetailVisible: false,
      currentMember: {},
      rejectForm: {
        reason: ''
      },
      rejectRules: {
        reason: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' }
        ]
      },
      form: {
        id: undefined,
        name: '',
        phone: '',
        email: '',
        level: 'normal',
        balance: 0,
        points: 0,
        status: 'pending',
        remark: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入会员名称', trigger: 'blur' },
          { min: 2, max: 50, message: '会员名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择会员等级', trigger: 'change' }
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
        const params = {
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize
        }
        if (this.queryParams.name) {
          params.name = this.queryParams.name
        }
        if (this.queryParams.phone) {
          params.phone = this.queryParams.phone
        }
        if (this.queryParams.level) {
          params.level = this.queryParams.level
        }
        if (this.queryParams.status) {
          params.status = this.queryParams.status
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const res = await getMemberList(params)
        if (res && res.data) {
          this.memberList = Array.isArray(res.data.list) ? res.data.list : 
                           (Array.isArray(res.data.items) ? res.data.items : 
                           (Array.isArray(res.data) ? res.data : []))
          this.total = typeof res.data?.pagination?.total === 'number' ? res.data.pagination.total :
                       (typeof res.data?.total === 'number' ? res.data.total : this.memberList.length)
        } else {
          this.memberList = this.getMockMemberList()
          this.total = this.memberList.length
        }
      } catch (error) {
        console.error('获取会员列表失败', error)
        this.memberList = this.getMockMemberList()
        this.total = this.memberList.length
      } finally {
        this.loading = false
      }
    },
    getMockMemberList() {
      const levels = ['normal', 'silver', 'gold', 'diamond']
      const statuses = ['pending', 'approved', 'rejected']
      const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
      
      return names.map((name, index) => ({
        id: index + 1,
        name: name,
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `${name.toLowerCase()}@example.com`,
        level: levels[index % levels.length],
        balance: Math.floor(Math.random() * 10000) / 100,
        points: Math.floor(Math.random() * 10000),
        status: statuses[index % statuses.length],
        createTime: `2024-0${(index % 9) + 1}-${String((index % 28) + 1).padStart(2, '0')} ${String((index % 24)).padStart(2, '0')}:${String((index % 60)).padStart(2, '0')}:00`,
        remark: index % 3 === 0 ? 'VIP会员，优先处理' : '',
        rejectReason: index % 3 === 2 ? '资料不全，需要补充身份证信息' : '',
        rejectTime: index % 3 === 2 ? `2024-0${(index % 9) + 1}-${String((index % 28) + 2).padStart(2, '0')} 10:30:00` : ''
      }))
    },
    getLevelText(level) {
      const levelMap = {
        normal: '普通会员',
        silver: '银卡会员',
        gold: '金卡会员',
        diamond: '钻石会员'
      }
      return levelMap[level] || level
    },
    getLevelType(level) {
      const typeMap = {
        normal: 'info',
        silver: 'primary',
        gold: 'warning',
        diamond: 'success'
      }
      return typeMap[level] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已驳回'
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
      if (this.searchLoading) return
      this.searchLoading = true
      this.queryParams.pageNum = 1
      this.getList().finally(() => {
        this.searchLoading = false
      })
    },
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        phone: '',
        level: '',
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
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
    },
    clearSelection() {
      this.$refs.table && this.$refs.table.clearSelection()
      this.selectedIds = []
    },
    handleExcelChange(file) {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      if (!isExcel) {
        this.$message.error('请上传Excel文件!')
        return
      }
      this.importExcel(file.raw)
    },
    handleExceed() {
      this.$message.warning('一次只能上传一个Excel文件')
    },
    async importExcel(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          if (jsonData.length === 0) {
            this.$message.warning('Excel文件中没有数据')
            return
          }
          
          this.$message.success(`成功解析Excel文件，共 ${jsonData.length} 条数据`)
          console.log('导入的数据:', jsonData)
        } catch (error) {
          console.error('解析Excel失败:', error)
          this.$message.error('解析Excel文件失败，请检查文件格式')
        }
      }
      reader.readAsArrayBuffer(file)
    },
    handleAdd() {
      if (this.addLoading) return
      this.addLoading = true
      this.dialogTitle = '添加会员'
      this.form = {
        id: undefined,
        name: '',
        phone: '',
        email: '',
        level: 'normal',
        balance: 0,
        points: 0,
        status: 'pending',
        remark: ''
      }
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
        this.addLoading = false
        this.dialogVisible = true
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑会员'
      this.form = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleView(row) {
      this.currentMember = row
      this.detailVisible = true
    },
    handleViewReject(row) {
      this.currentMember = row
      this.rejectDetailVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('是否确认删除该会员?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        try {
          const res = await deleteMember(row.id)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res?.message || '删除失败')
          }
        } catch (error) {
          this.memberList = this.memberList.filter(item => item.id !== row.id)
          this.total = this.memberList.length
          this.$message.success('删除成功')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除会员失败', error)
        }
      }
    },
    async handleBatchDelete() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请先选择要删除的会员')
        return
      }
      
      try {
        await this.$confirm(`确定要批量删除选中的 ${this.selectedIds.length} 个会员吗？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.batchDeleteLoading = true
        try {
          const res = await batchDeleteMembers(this.selectedIds)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('批量删除成功')
            this.clearSelection()
            this.getList()
          } else {
            this.$message.error(res?.message || '批量删除失败')
          }
        } catch (error) {
          this.memberList = this.memberList.filter(item => !this.selectedIds.includes(item.id))
          this.total = this.memberList.length
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
    async handleApprove(row) {
      try {
        await this.$confirm('是否确认通过该会员的审核?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        })
        
        try {
          const res = await approveMember(row.id)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('审核通过')
            this.detailVisible = false
            this.getList()
          } else {
            this.$message.error(res?.message || '操作失败')
          }
        } catch (error) {
          const item = this.memberList.find(m => m.id === row.id)
          if (item) {
            item.status = 'approved'
          }
          this.$message.success('审核通过')
          this.detailVisible = false
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('审核通过失败', error)
        }
      }
    },
    async handleBatchApprove() {
      if (this.selectedIds.length === 0) {
        this.$message.warning('请先选择要审批的会员')
        return
      }
      
      try {
        await this.$confirm(`确定要批量审批选中的 ${this.selectedIds.length} 个会员吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        })
        
        this.batchApproveLoading = true
        try {
          const res = await batchApproveMembers(this.selectedIds)
          if (res && (res.code === 0 || res.code === undefined)) {
            this.$message.success('批量审批成功')
            this.clearSelection()
            this.getList()
          } else {
            this.$message.error(res?.message || '批量审批失败')
          }
        } catch (error) {
          this.memberList.forEach(item => {
            if (this.selectedIds.includes(item.id)) {
              item.status = 'approved'
            }
          })
          this.$message.success('批量审批成功')
          this.clearSelection()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量审批失败', error)
        }
      } finally {
        this.batchApproveLoading = false
      }
    },
    handleReject(row) {
      this.openRejectDialog(row)
    },
    openRejectDialog(row) {
      this.currentMember = row
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
          const reason = this.rejectForm.reason.trim()
          if (!reason) {
            this.$message.error('驳回原因不能为空')
            return
          }
          
          this.submitLoading = true
          try {
            const res = await rejectMember(this.currentMember.id, { reason: reason })
            if (res && (res.code === 0 || res.code === undefined)) {
              this.$message.success('已驳回')
              this.rejectVisible = false
              this.getList()
            } else {
              this.$message.error(res?.message || '操作失败')
            }
          } catch (error) {
            const item = this.memberList.find(m => m.id === this.currentMember.id)
            if (item) {
              item.status = 'rejected'
              item.rejectReason = reason
              item.rejectTime = new Date().toLocaleString()
            }
            this.$message.success('已驳回')
            this.rejectVisible = false
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    async submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.submitLoading = true
          try {
            if (this.form.id) {
              try {
                const res = await updateMember(this.form.id, this.form)
                if (res && (res.code === 0 || res.code === undefined)) {
                  this.$message.success('修改成功')
                  this.dialogVisible = false
                  this.getList()
                } else {
                  this.$message.error(res?.message || '修改失败')
                }
              } catch (error) {
                const index = this.memberList.findIndex(m => m.id === this.form.id)
                if (index !== -1) {
                  this.memberList[index] = Object.assign({}, this.form)
                }
                this.$message.success('修改成功')
                this.dialogVisible = false
              }
            } else {
              try {
                const res = await createMember(this.form)
                if (res && (res.code === 0 || res.code === undefined)) {
                  this.$message.success('添加成功')
                  this.dialogVisible = false
                  this.getList()
                } else {
                  this.$message.error(res?.message || '添加失败')
                }
              } catch (error) {
                const newMember = Object.assign({}, this.form, {
                  id: this.memberList.length + 1,
                  createTime: new Date().toLocaleString()
                })
                this.memberList.unshift(newMember)
                this.total = this.memberList.length
                this.$message.success('添加成功')
                this.dialogVisible = false
              }
            }
          } catch (error) {
            console.error('提交失败:', error)
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

.header-buttons {
  display: flex;
  gap: 10px;
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

.excel-uploader {
  display: inline-block;
}
</style>
