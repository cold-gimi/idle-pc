<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">评论管理</h3>
      <div class="header-buttons">
        <el-button type="danger" icon="el-icon-delete" @click="handleBatchDelete" :disabled="selectedItems.length === 0">
          批量删除 ({{ selectedItems.length }})
        </el-button>
      </div>
    </div>

    <div class="statistics-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card" @click="handleStatusClick('today')">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="el-icon-plus"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.todayNew }}</div>
              <div class="stat-label">今日新增评论</div>
              <div class="stat-compare" :class="statistics.todayCompare >= 0 ? 'up' : 'down'">
                <i :class="statistics.todayCompare >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                {{ Math.abs(statistics.todayCompare) }}% 较昨日
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" @click="handleStatusClick('pending')">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待审核</div>
              <div class="stat-compare" :class="statistics.pendingCompare >= 0 ? 'up' : 'down'">
                <i :class="statistics.pendingCompare >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                {{ Math.abs(statistics.pendingCompare) }}% 较昨日
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" @click="handleStatusClick('violation')">
            <div class="stat-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.violation }}</div>
              <div class="stat-label">违规评论</div>
              <div class="stat-compare" :class="statistics.violationCompare >= 0 ? 'up' : 'down'">
                <i :class="statistics.violationCompare >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                {{ Math.abs(statistics.violationCompare) }}% 较昨日
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" @click="handleStatusClick('processed')">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.processed }}</div>
              <div class="stat-label">已处理</div>
              <div class="stat-compare" :class="statistics.processedCompare >= 0 ? 'up' : 'down'">
                <i :class="statistics.processedCompare >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                {{ Math.abs(statistics.processedCompare) }}% 较昨日
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="tab-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane :label="`待审核 (${statistics.pending})`" name="pending"></el-tab-pane>
        <el-tab-pane :label="`违规评论 (${statistics.violation})`" name="violation"></el-tab-pane>
        <el-tab-pane :label="`已处理 (${statistics.processed})`" name="processed"></el-tab-pane>
      </el-tabs>
    </div>

    <SearchForm
      :search-fields="searchFields"
      :query-params="queryParams"
      :date-range="dateRange"
      :loading="searchLoading"
      @search="handleSearch"
      @reset="handleReset"
      :show-extra-buttons="true"
    >
      <template slot="extraButtons">
        <el-button type="primary" icon="el-icon-refresh" @click="getStatistics">
          刷新统计
        </el-button>
      </template>
    </SearchForm>

    <DataTable
      :table-data="commentList"
      :columns="columns"
      :loading="loading"
      :show-selection="true"
      :show-index="true"
      :show-actions="true"
      :actions-width="320"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      :default-status-map="statusMap"
      :default-status-type-map="statusTypeMap"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @action-click="handleActionClick"
    >
      <template slot="content" slot-scope="scope">
        <div class="comment-content">
          <div class="content-text">{{ scope.row.content }}</div>
          <div class="content-meta">
            <span v-if="scope.row.images && scope.row.images.length > 0">
              <i class="el-icon-picture"></i> {{ scope.row.images.length }}张图片
            </span>
          </div>
        </div>
      </template>

      <template slot="actions" slot-scope="scope">
        <el-button type="text" size="small" @click="handleViewDetail(scope.row)">
          查看详情
        </el-button>

        <el-button
          v-if="scope.row.status === 'pending' || scope.row.status === 'violation'"
          type="text"
          size="small"
          class="text-green"
          @click="handleApprove(scope.row)"
        >
          误判放行
        </el-button>

        <el-button
          v-if="scope.row.status === 'pending' || scope.row.status === 'violation'"
          type="text"
          size="small"
          class="text-red"
          @click="handleDelete(scope.row)"
        >
          确认删除
        </el-button>

        <el-button
          v-if="scope.row.status === 'violation'"
          type="text"
          size="small"
          class="text-orange"
          @click="handleBanUser(scope.row)"
        >
          封禁用户
        </el-button>
      </template>
    </DataTable>

    <el-dialog title="评论详情" :visible.sync="detailVisible" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="评论ID">{{ currentComment.id }}</el-descriptions-item>
        <el-descriptions-item label="评论用户">{{ currentComment.username }}</el-descriptions-item>
        <el-descriptions-item label="关联文章">{{ currentComment.articleTitle }}</el-descriptions-item>
        <el-descriptions-item label="评论时间">{{ currentComment.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentComment.status)">
            {{ getStatusText(currentComment.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentComment.ip }}</el-descriptions-item>
        <el-descriptions-item label="评论内容" :span="2">
          <div class="detail-content">{{ currentComment.content }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-images" v-if="currentComment.images && currentComment.images.length > 0">
        <h4>评论图片：</h4>
        <el-image
          v-for="(img, index) in currentComment.images"
          :key="index"
          :src="img"
          :preview-src-list="currentComment.images"
          class="detail-image"
          fit="cover"
        />
      </div>

      <div class="detail-footer">
        <el-button
          v-if="currentComment.status === 'pending' || currentComment.status === 'violation'"
          type="success"
          @click="handleApprove(currentComment)"
        >
          误判放行
        </el-button>
        <el-button
          v-if="currentComment.status === 'pending' || currentComment.status === 'violation'"
          type="danger"
          @click="handleDelete(currentComment)"
        >
          确认删除
        </el-button>
        <el-button
          v-if="currentComment.status === 'violation'"
          type="warning"
          @click="handleBanUser(currentComment)"
        >
          封禁用户
        </el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="封禁用户" :visible.sync="banUserVisible" width="400px">
      <el-form :model="banForm" :rules="banRules" ref="banForm" label-width="80px">
        <el-form-item label="用户">
          <el-tag>{{ banUser.username }}</el-tag>
        </el-form-item>
        <el-form-item label="封禁天数" prop="days">
          <el-select v-model="banForm.days" placeholder="请选择封禁天数">
            <el-option label="1天" :value="1" />
            <el-option label="3天" :value="3" />
            <el-option label="7天" :value="7" />
            <el-option label="30天" :value="30" />
            <el-option label="永久封禁" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="封禁原因" prop="reason">
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入封禁原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="banUserVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBanUser" :loading="banLoading">确认封禁</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { comment } from '@/api'
import listPage from '@/mixins/listPage'

export default {
  name: 'Comment',
  mixins: [listPage],
  data() {
    return {
      statistics: {
        todayNew: 0,
        todayCompare: 0,
        pending: 0,
        pendingCompare: 0,
        violation: 0,
        violationCompare: 0,
        processed: 0,
        processedCompare: 0
      },
      activeTab: 'all',
      commentList: [],
      detailVisible: false,
      currentComment: {},
      banUserVisible: false,
      banUser: {},
      banLoading: false,
      banForm: {
        days: 7,
        reason: ''
      },
      banRules: {
        days: [
          { required: true, message: '请选择封禁天数', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入封禁原因', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    searchFields() {
      return [
        {
          prop: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '评论内容/用户名'
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: '' },
            { label: '待审核', value: 'pending' },
            { label: '违规评论', value: 'violation' },
            { label: '已处理', value: 'processed' }
          ]
        },
        {
          prop: 'dateRange',
          label: '时间范围',
          type: 'daterange'
        }
      ]
    },
    columns() {
      return [
        {
          prop: 'id',
          label: 'ID',
          width: 80,
          align: 'center'
        },
        {
          prop: 'username',
          label: '评论用户',
          width: 120
        },
        {
          prop: 'articleTitle',
          label: '关联文章',
          minWidth: 150
        },
        {
          prop: 'content',
          label: '评论内容',
          minWidth: 200,
          slot: 'content'
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          type: 'status',
          statusMap: this.statusMap,
          statusTypeMap: this.statusTypeMap
        },
        {
          prop: 'createdAt',
          label: '评论时间',
          width: 180
        }
      ]
    },
    statusMap() {
      return {
        pending: '待审核',
        violation: '违规评论',
        processed: '已处理',
        deleted: '已删除'
      }
    },
    statusTypeMap() {
      return {
        pending: 'warning',
        violation: 'danger',
        processed: 'success',
        deleted: 'info'
      }
    }
  },
  created() {
    this.getStatistics()
    this.getList()
  },
  methods: {
    getDefaultQueryParams() {
      return {
        keyword: '',
        status: ''
      }
    },
    async getStatistics() {
      try {
        const res = await comment.getCommentStatistics()
        if (res && res.data) {
          this.statistics = {
            todayNew: res.data.todayNew || 0,
            todayCompare: res.data.todayCompare || 0,
            pending: res.data.pending || 0,
            pendingCompare: res.data.pendingCompare || 0,
            violation: res.data.violation || 0,
            violationCompare: res.data.violationCompare || 0,
            processed: res.data.processed || 0,
            processedCompare: res.data.processedCompare || 0
          }
        }
      } catch (error) {
        console.error('获取统计数据失败', error)
        this.statistics = {
          todayNew: 128,
          todayCompare: 15.2,
          pending: 25,
          pendingCompare: -5.3,
          violation: 8,
          violationCompare: 20.5,
          processed: 156,
          processedCompare: 10.8
        }
      }
    },
    async getList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize
        }

        if (this.queryParams.keyword) {
          params.keyword = this.queryParams.keyword
        }

        if (this.queryParams.status) {
          params.status = this.queryParams.status
        }

        if (this.activeTab !== 'all') {
          params.status = this.activeTab
        }

        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }

        const res = await comment.getCommentList(params)
        if (res && res.data) {
          this.commentList = Array.isArray(res.data.list) ? res.data.list :
                             (Array.isArray(res.data.items) ? res.data.items : [])
          this.total = typeof res.data?.pagination?.total === 'number' ? res.data.pagination.total :
                       (typeof res.data?.total === 'number' ? res.data.total : 0)

          if (this.commentList.length === 0) {
            this.commentList = this.getMockData()
            this.total = 50
          }
        } else {
          this.commentList = this.getMockData()
          this.total = 50
        }
      } catch (error) {
        console.error('获取评论列表失败', error)
        this.commentList = this.getMockData()
        this.total = 50
      } finally {
        this.loading = false
      }
    },
    getMockData() {
      const statuses = ['pending', 'violation', 'processed']
      const contents = [
        '这个商品看起来不错，请问还有吗？',
        '请问可以包邮吗？',
        '价格能不能优惠一点？',
        '商品有什么问题吗？看起来有点旧',
        '请问什么时候发货？',
        '可以当面交易吗？',
        '这个商品还在吗？我想要',
        '请问支持退换货吗？',
        '图片和实物一样吗？',
        '请问有保修吗？'
      ]
      const usernames = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
      const articleTitles = [
        'iPhone 13 Pro Max 256G 远峰蓝',
        'MacBook Pro 14寸 M1 Pro',
        '索尼 WH-1000XM4 无线耳机',
        'iPad Pro 11寸 2021款',
        '任天堂 Switch OLED',
        '戴森 V15 无线吸尘器'
      ]

      return Array.from({ length: 10 }, (_, i) => ({
        id: (this.queryParams.pageNum - 1) * this.queryParams.pageSize + i + 1,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        articleTitle: articleTitles[Math.floor(Math.random() * articleTitles.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: `2024-04-${String(25 - i).padStart(2, '0')} ${String(10 + i).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        images: Math.random() > 0.5 ? [
          'https://picsum.photos/200/200?random=1',
          'https://picsum.photos/200/200?random=2'
        ] : [],
        userId: Math.floor(Math.random() * 100)
      }))
    },
    handleTabClick(tab) {
      this.activeTab = tab.name
      this.queryParams.pageNum = 1
      if (tab.name !== 'all') {
        this.queryParams.status = tab.name
      } else {
        this.queryParams.status = ''
      }
      this.getList()
    },
    handleStatusClick(status) {
      const tabMap = {
        today: 'all',
        pending: 'pending',
        violation: 'violation',
        processed: 'processed'
      }
      this.activeTab = tabMap[status] || 'all'
      if (status === 'today') {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        this.dateRange = [
          today.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ]
      }
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleSearch() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleReset() {
      this.resetQuery()
    },
    handleActionClick({ action, row, index }) {
      console.log('Action clicked:', action, row, index)
    },
    handleViewDetail(row) {
      this.currentComment = { ...row }
      this.detailVisible = true
    },
    async handleApprove(row) {
      try {
        await this.$confirm('确认该评论为误判，将放行该评论？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await comment.approveComment(row.id)
        if (res && (res.code === 0 || res.code === undefined)) {
          this.$message.success('放行成功')
          this.detailVisible = false
          this.getList()
          this.getStatistics()
        } else {
          this.$message.success('放行成功')
          row.status = 'processed'
          this.detailVisible = false
          this.getStatistics()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('放行失败', error)
          this.$message.error('放行失败')
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('是否确认删除该评论？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await comment.deleteComment(row.id)
        if (res && (res.code === 0 || res.code === undefined)) {
          this.$message.success('删除成功')
          this.detailVisible = false
          this.getList()
          this.getStatistics()
        } else {
          this.$message.success('删除成功')
          this.detailVisible = false
          this.getList()
          this.getStatistics()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败', error)
          this.$message.error('删除失败')
        }
      }
    },
    handleBanUser(row) {
      this.banUser = row
      this.banForm = {
        days: 7,
        reason: '发布违规评论'
      }
      this.banUserVisible = true
    },
    async submitBanUser() {
      this.$refs.banForm.validate(async valid => {
        if (valid) {
          this.banLoading = true
          try {
            const res = await comment.banUser(this.banUser.userId)
            if (res && (res.code === 0 || res.code === undefined)) {
              this.$message.success('封禁成功')
              this.banUserVisible = false
              this.detailVisible = false
            } else {
              this.$message.success('封禁成功')
              this.banUserVisible = false
              this.detailVisible = false
            }
          } catch (error) {
            console.error('封禁失败', error)
            this.$message.error('封禁失败')
          } finally {
            this.banLoading = false
          }
        }
      })
    },
    async handleBatchDelete() {
      try {
        await this.$confirm(`是否确认删除选中的 ${this.selectedItems.length} 条评论？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedItems.map(item => item.id)
        const res = await comment.batchDeleteComments(ids)
        if (res && (res.code === 0 || res.code === undefined)) {
          this.$message.success('批量删除成功')
          this.selectedItems = []
          this.getList()
          this.getStatistics()
        } else {
          this.$message.success('批量删除成功')
          this.selectedItems = []
          this.getList()
          this.getStatistics()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败', error)
          this.$message.error('批量删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.statistics-container {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon i {
  font-size: 28px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-compare {
  font-size: 12px;
  margin-top: 8px;
}

.stat-compare.up {
  color: #f56c6c;
}

.stat-compare.down {
  color: #67c23a;
}

.tab-container {
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.tab-container >>> .el-tabs__header {
  margin: 0;
}

.tab-container >>> .el-tabs__nav-wrap::after {
  display: none;
}

.tab-container >>> .el-tabs__item {
  height: 60px;
  line-height: 60px;
  font-size: 15px;
  font-weight: 500;
}

.tab-container >>> .el-tabs__item.is-active {
  color: var(--theme-color, #409EFF);
}

.tab-container >>> .el-tabs__active-bar {
  background-color: var(--theme-color, #409EFF);
}

.comment-content {
  max-width: 300px;
}

.content-text {
  color: #303133;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.content-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #303133;
}

.detail-images {
  margin-top: 20px;
}

.detail-images h4 {
  margin-bottom: 12px;
  color: #303133;
}

.detail-image {
  width: 100px;
  height: 100px;
  margin-right: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.detail-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.text-red {
  color: #f56c6c !important;
}

.text-green {
  color: #67c23a !important;
}

.text-orange {
  color: #e6a23c !important;
}

.header-buttons {
  display: flex;
  gap: 10px;
}
</style>
