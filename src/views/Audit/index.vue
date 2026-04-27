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
      <div class="filter-item">
        <span class="filter-label">标题：</span>
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px;" @keyup.enter.native="handleQuery" />
      </div>
      <div class="filter-item">
        <span class="filter-label">类型：</span>
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable style="width: 150px;">
          <el-option label="电子产品" value="电子产品" />
          <el-option label="家用电器" value="家用电器" />
          <el-option label="手机数码" value="手机数码" />
          <el-option label="服装鞋帽" value="服装鞋帽" />
          <el-option label="图书文具" value="图书文具" />
          <el-option label="其他" value="其他" />
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
      <el-table :data="auditList" v-loading="loading" stripe style="width: 100%">
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
        <el-table-column label="操作" width="250" fixed="right">
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

    <el-dialog title="拒绝原因" :visible.sync="rejectVisible" width="500px">
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
        <el-button type="danger" @click="submitReject" :loading="submitLoading">确认拒绝</el-button>
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
export default {
  name: 'Audit',
  data() {
    return {
      loading: false,
      submitLoading: false,
      total: 0,
      activeTab: 'pending',
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        status: '',
        type: ''
      },
      auditList: [],
      dialogVisible: false,
      dialogTitle: '',
      detailVisible: false,
      rejectVisible: false,
      currentAudit: {},
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
    getList() {
      this.loading = true
      setTimeout(() => {
        const mockData = [
          { id: 1, title: 'MacBook Pro 14寸 M1 Pro', submitter: '李四', type: '电子产品', price: 12999, status: 'pending', submitTime: '2024-04-25 10:30:00', description: '全新未拆封，公司奖品，低价出' },
          { id: 2, title: '戴森 V15 无线吸尘器', submitter: '周八', type: '家用电器', price: 3999, status: 'pending', submitTime: '2024-04-24 15:20:00', description: '全新未拆封，官网购买' },
          { id: 3, title: 'iPhone 15 Pro 钛金属', submitter: '钱九', type: '手机数码', price: 8999, status: 'pending', submitTime: '2024-04-23 09:15:00', description: '99新，使用一个月' },
          { id: 4, title: 'iPad Pro 11寸 2021款', submitter: '赵六', type: '电子产品', price: 4999, status: 'rejected', submitTime: '2024-04-22 14:45:00', description: '8成新，屏幕有轻微划痕', auditOpinion: '屏幕划痕照片不清晰，请重新上传' },
          { id: 5, title: 'AirPods Pro 2', submitter: '郑十', type: '电子产品', price: 1399, status: 'approved', submitTime: '2024-04-21 11:30:00', description: '99新，国行正品', auditOpinion: '审核通过' },
          { id: 6, title: '小米手环 7 Pro', submitter: '陈二', type: '电子产品', price: 299, status: 'approved', submitTime: '2024-04-20 16:45:00', description: '95新，功能正常', auditOpinion: '审核通过' },
          { id: 7, title: 'Switch OLED 游戏机', submitter: '王十一', type: '电子产品', price: 2299, status: 'approved', submitTime: '2024-04-19 08:30:00', description: '95新，带游戏卡带', auditOpinion: '审核通过' },
          { id: 8, title: '戴森吹风机 HD08', submitter: '李十二', type: '家用电器', price: 2599, status: 'rejected', submitTime: '2024-04-18 13:20:00', description: '9成新，配件齐全', auditOpinion: '价格过高，请调整后重新提交' },
          { id: 9, title: 'iPad Air 5', submitter: '张十三', type: '电子产品', price: 3999, status: 'pending', submitTime: '2024-04-17 09:45:00', description: '99新，使用半年' },
          { id: 10, title: '华为 Watch GT 3', submitter: '刘十四', type: '电子产品', price: 899, status: 'pending', submitTime: '2024-04-16 14:10:00', description: '95新，功能正常' }
        ]

        let filtered = mockData
        if (this.queryParams.title) {
          filtered = filtered.filter(item => item.title.includes(this.queryParams.title))
        }
        if (this.queryParams.status) {
          filtered = filtered.filter(item => item.status === this.queryParams.status)
        }
        if (this.queryParams.type) {
          filtered = filtered.filter(item => item.type === this.queryParams.type)
        }
        if (this.dateRange && this.dateRange.length === 2) {
          const [startDate, endDate] = this.dateRange
          filtered = filtered.filter(item => {
            const itemDate = item.submitTime.split(' ')[0]
            return itemDate >= startDate && itemDate <= endDate
          })
        }

        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        const end = start + this.queryParams.pageSize
        
        this.auditList = filtered.slice(start, end)
        this.total = filtered.length
        this.loading = false
      }, 500)
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
    handleView(row) {
      this.currentAudit = row
      this.detailVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑审核'
      this.form = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('是否确认删除该审核记录?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleApprove(row) {
      this.$confirm('是否确认通过该审核?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(() => {
        this.$message.success('审核通过')
        this.detailVisible = false
        this.getList()
      }).catch(() => {})
    },
    handleReject(row) {
      this.openRejectDialog(row)
    },
    openRejectDialog(row) {
      this.currentAudit = row
      this.rejectForm = { reason: '' }
      this.detailVisible = false
      this.$nextTick(() => {
        this.$refs.rejectForm && this.$refs.rejectForm.resetFields()
      })
      this.rejectVisible = true
    },
    submitReject() {
      this.$refs.rejectForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            this.$message.success('已拒绝')
            this.rejectVisible = false
            this.submitLoading = false
            this.getList()
          }, 500)
        }
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            this.$message.success('修改成功')
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
.text-green {
  color: #67c23a;
}

.text-red {
  color: #f56c6c;
}
</style>
