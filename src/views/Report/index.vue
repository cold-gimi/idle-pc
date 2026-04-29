<template>
  <div class="page-container">
    <div class="stats-cards">
      <div class="stat-card" @click="handleStatClick('pending')">
        <div class="stat-icon pending-icon">
          <i class="el-icon-time"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.pending }}</div>
          <div class="stat-label">待处理举报</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('month')">
        <div class="stat-icon month-icon">
          <i class="el-icon-plus"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.month }}</div>
          <div class="stat-label">本月新增</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('processed')">
        <div class="stat-icon processed-icon">
          <i class="el-icon-success"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.processed }}</div>
          <div class="stat-label">已处理</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('rate')">
        <div class="stat-icon rate-icon">
          <i class="el-icon-pie-chart"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.rate }}%</div>
          <div class="stat-label">处理率</div>
        </div>
      </div>
    </div>

    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">举报类型：</span>
            <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
              <el-option label="违规内容" value="violation" />
              <el-option label="虚假信息" value="fake" />
              <el-option label="骚扰行为" value="harassment" />
              <el-option label="其他" value="other" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">状态：</span>
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已处理" value="processed" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">时间范围：</span>
            <el-date-picker
              v-model="queryParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              style="width: 100%;"
            />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">举报人：</span>
            <el-input v-model="queryParams.reporter" placeholder="请输入举报人" clearable @keyup.enter.native="handleQuery" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">被举报人：</span>
            <el-input v-model="queryParams.reported" placeholder="请输入被举报人" clearable @keyup.enter.native="handleQuery" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item filter-buttons">
            <el-button type="primary" icon="el-icon-search" @click="handleQuery" :loading="searchLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            <el-button type="success" icon="el-icon-download" @click="handleExport">导出报表</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="tabs-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="待处理" name="pending">
          <span slot="label">待处理 <span class="tab-count">{{ tabCounts.pending }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="处理中" name="processing">
          <span slot="label">处理中 <span class="tab-count">{{ tabCounts.processing }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已处理" name="processed">
          <span slot="label">已处理 <span class="tab-count">{{ tabCounts.processed }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已驳回" name="rejected">
          <span slot="label">已驳回 <span class="tab-count">{{ tabCounts.rejected }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="全部" name="all">
          <span slot="label">全部 <span class="tab-count">{{ tabCounts.all }}</span></span>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="table-container">
      <el-table :data="reportList" v-loading="loading" stripe style="width: 100%" :header-cell-style="{ backgroundColor: '#f8fafc', color: '#606266' }">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-descriptions :column="2" border size="small" class="detail-descriptions">
              <el-descriptions-item label="举报ID">{{ props.row.id }}</el-descriptions-item>
              <el-descriptions-item label="举报编号">{{ props.row.reportNo }}</el-descriptions-item>
              <el-descriptions-item label="举报人">{{ props.row.reporter }}</el-descriptions-item>
              <el-descriptions-item label="被举报人">{{ props.row.reported }}</el-descriptions-item>
              <el-descriptions-item label="举报类型">{{ getTypeText(props.row.type) }}</el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusType(props.row.status)" size="small" effect="light" :round="true">
                  {{ getStatusText(props.row.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="举报时间">{{ props.row.createTime }}</el-descriptions-item>
              <el-descriptions-item label="处理时间">{{ props.row.processTime || '未处理' }}</el-descriptions-item>
              <el-descriptions-item label="举报内容" :span="2">{{ props.row.content }}</el-descriptions-item>
              <el-descriptions-item label="处理备注" :span="2">{{ props.row.remark || '暂无' }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column prop="reportNo" label="举报编号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="reporter" label="举报人" width="120" show-overflow-tooltip />
        <el-table-column prop="reported" label="被举报人" width="120" show-overflow-tooltip />
        <el-table-column prop="type" label="举报类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small" effect="light" :round="true">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="举报内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light" :round="true">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="举报时间" width="170" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleDetail(scope.row)">查看明细</el-button>
            <template v-if="scope.row.status === 'pending' || scope.row.status === 'processing'">
              <el-button type="text" size="small" class="text-orange" @click="handleReject(scope.row)">驳回举报</el-button>
              <el-button type="text" size="small" class="text-blue" @click="handleWarn(scope.row)">警告用户</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleBan(scope.row)">封禁账号</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
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
    </div>

    <el-dialog title="举报详情" :visible.sync="detailVisible" width="700px" :close-on-click-modal="false">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="举报ID">{{ currentReport.id }}</el-descriptions-item>
        <el-descriptions-item label="举报编号">{{ currentReport.reportNo }}</el-descriptions-item>
        <el-descriptions-item label="举报人">{{ currentReport.reporter }}</el-descriptions-item>
        <el-descriptions-item label="被举报人">{{ currentReport.reported }}</el-descriptions-item>
        <el-descriptions-item label="举报类型">{{ getTypeText(currentReport.type) }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(currentReport.status)" size="small" effect="light" :round="true">
            {{ getStatusText(currentReport.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="举报时间">{{ currentReport.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentReport.processTime || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="举报内容" :span="2">{{ currentReport.content }}</el-descriptions-item>
        <el-descriptions-item label="处理备注" :span="2">{{ currentReport.remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="驳回举报" :visible.sync="rejectVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="驳回原因">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="警告用户" :visible.sync="warnVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="警告内容">
          <el-input
            v-model="warnContent"
            type="textarea"
            :rows="4"
            placeholder="请输入警告内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="warnVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmWarn" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="封禁账号" :visible.sync="banVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="封禁原因">
          <el-input
            v-model="banReason"
            type="textarea"
            :rows="4"
            placeholder="请输入封禁原因"
          />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-select v-model="banDuration" placeholder="请选择封禁时长" style="width: 100%;">
            <el-option label="1天" value="1" />
            <el-option label="3天" value="3" />
            <el-option label="7天" value="7" />
            <el-option label="30天" value="30" />
            <el-option label="永久" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="banVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBan" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'Report',
  data() {
    return {
      loading: false,
      submitLoading: false,
      searchLoading: false,
      total: 0,
      activeTab: 'pending',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: '',
        status: '',
        dateRange: [],
        reporter: '',
        reported: ''
      },
      reportList: [],
      statData: {
        pending: 15,
        month: 42,
        processed: 128,
        rate: 85
      },
      tabCounts: {
        pending: 15,
        processing: 8,
        processed: 128,
        rejected: 12,
        all: 163
      },
      statusMap: {
        pending: '待处理',
        processing: '处理中',
        processed: '已处理',
        rejected: '已驳回'
      },
      statusTypeMap: {
        pending: 'warning',
        processing: 'primary',
        processed: 'success',
        rejected: 'danger'
      },
      typeMap: {
        violation: '违规内容',
        fake: '虚假信息',
        harassment: '骚扰行为',
        other: '其他'
      },
      typeTagTypeMap: {
        violation: 'danger',
        fake: 'warning',
        harassment: 'primary',
        other: 'info'
      },
      detailVisible: false,
      rejectVisible: false,
      warnVisible: false,
      banVisible: false,
      currentReport: {},
      rejectReason: '',
      warnContent: '',
      banReason: '',
      banDuration: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      setTimeout(() => {
        this.reportList = this.generateMockData()
        this.total = this.tabCounts[this.activeTab]
        this.loading = false
      }, 500)
    },
    generateMockData() {
      const statuses = ['pending', 'processing', 'processed', 'rejected']
      const types = ['violation', 'fake', 'harassment', 'other']
      const reporters = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
      const reporteds = ['用户A', '用户B', '用户C', '用户D', '用户E', '用户F', '用户G', '用户H']
      const contents = [
        '发布违规内容，违反平台规定',
        '发布虚假信息，涉嫌诈骗',
        '频繁发送骚扰消息',
        '发布违法内容',
        '恶意举报他人',
        '其他违规行为'
      ]

      const data = []
      for (let i = 0; i < 10; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        if (this.activeTab !== 'all' && status !== this.activeTab) continue

        data.push({
          id: i + 1,
          reportNo: `RPT${Date.now()}${String(i).padStart(4, '0')}`,
          reporter: reporters[Math.floor(Math.random() * reporters.length)],
          reported: reporteds[Math.floor(Math.random() * reporteds.length)],
          type: types[Math.floor(Math.random() * types.length)],
          content: contents[Math.floor(Math.random() * contents.length)],
          status: status,
          createTime: this.getRandomDate(),
          processTime: status !== 'pending' ? this.getRandomDate() : '',
          remark: Math.random() > 0.5 ? '已按平台规定处理' : ''
        })
      }
      return data
    },
    getRandomDate() {
      const now = new Date()
      const days = Math.floor(Math.random() * 30)
      now.setDate(now.getDate() - days)
      return now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    },
    getStatusText(status) {
      return this.statusMap[status] || status
    },
    getStatusType(status) {
      return this.statusTypeMap[status] || 'info'
    },
    getTypeText(type) {
      return this.typeMap[type] || type
    },
    getTypeTagType(type) {
      return this.typeTagTypeMap[type] || 'info'
    },
    handleStatClick(type) {
      const tabMap = {
        pending: 'pending',
        month: 'all',
        processed: 'processed',
        rate: 'all'
      }
      this.activeTab = tabMap[type] || 'all'
      this.getList()
    },
    handleTabClick() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleQuery() {
      if (this.searchLoading) return
      this.searchLoading = true
      this.queryParams.pageNum = 1
      this.getList()
      setTimeout(() => {
        this.searchLoading = false
      }, 500)
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        type: '',
        status: '',
        dateRange: [],
        reporter: '',
        reported: ''
      }
      this.activeTab = 'all'
      this.getList()
    },
    handleExport() {
      this.$message.success('正在导出报表...')

      const exportData = this.reportList.map(item => ({
        '举报编号': item.reportNo,
        '举报人': item.reporter,
        '被举报人': item.reported,
        '举报类型': this.getTypeText(item.type),
        '举报内容': item.content,
        '状态': this.getStatusText(item.status),
        '举报时间': item.createTime,
        '处理时间': item.processTime || '未处理',
        '处理备注': item.remark || '暂无'
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '举报列表')

      const today = new Date()
      const dateStr = today.getFullYear() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')

      XLSX.writeFile(workbook, `举报列表_${dateStr}.xlsx`)
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    handleDetail(row) {
      this.currentReport = row
      this.detailVisible = true
    },
    handleReject(row) {
      this.currentReport = row
      this.rejectReason = ''
      this.rejectVisible = true
    },
    confirmReject() {
      if (!this.rejectReason.trim()) {
        this.$message.warning('请输入驳回原因')
        return
      }
      this.submitLoading = true
      setTimeout(() => {
        this.$message.success('举报已驳回')
        this.rejectVisible = false
        this.submitLoading = false
        this.getList()
      }, 500)
    },
    handleWarn(row) {
      this.currentReport = row
      this.warnContent = ''
      this.warnVisible = true
    },
    confirmWarn() {
      if (!this.warnContent.trim()) {
        this.$message.warning('请输入警告内容')
        return
      }
      this.submitLoading = true
      setTimeout(() => {
        this.$message.success('用户已警告')
        this.warnVisible = false
        this.submitLoading = false
        this.getList()
      }, 500)
    },
    handleBan(row) {
      this.currentReport = row
      this.banReason = ''
      this.banDuration = ''
      this.banVisible = true
    },
    confirmBan() {
      if (!this.banReason.trim()) {
        this.$message.warning('请输入封禁原因')
        return
      }
      if (!this.banDuration) {
        this.$message.warning('请选择封禁时长')
        return
      }
      this.submitLoading = true
      setTimeout(() => {
        this.$message.success('账号已封禁')
        this.banVisible = false
        this.submitLoading = false
        this.getList()
      }, 500)
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
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
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card:nth-child(1)::before {
  background: linear-gradient(90deg, #ff6b6b, #ffa502);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, #a55eea, #8854d0);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #20bf6b, #0fb9b1);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #4b7bec, #3867d6);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon i {
  font-size: 28px;
  color: #fff;
}

.pending-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
}

.month-icon {
  background: linear-gradient(135deg, #a55eea 0%, #8854d0 100%);
}

.processed-icon {
  background: linear-gradient(135deg, #20bf6b 0%, #0fb9b1 100%);
}

.rate-icon {
  background: linear-gradient(135deg, #4b7bec 0%, #3867d6 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

.filter-container {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.filter-container:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.filter-item .el-date-picker,
.filter-item .el-select,
.filter-item .el-input {
  flex: 1;
}

.filter-buttons {
  justify-content: flex-end;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  white-space: nowrap;
  width: 80px;
  min-width: 80px;
  font-weight: 500;
  text-align: right;
}

.tabs-container {
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.tabs-container ::v-deep .el-tabs__header {
  margin: 0;
  padding: 0;
}

.tabs-container ::v-deep .el-tabs__nav-wrap::after {
  display: none;
}

.tabs-container ::v-deep .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 60px;
  line-height: 60px;
  transition: all 0.3s ease;
}

.tabs-container ::v-deep .el-tabs__item.is-active {
  color: var(--theme-color, #409EFF);
}

.tabs-container ::v-deep .el-tabs__active-bar {
  background-color: var(--theme-color, #409EFF);
  height: 3px;
  border-radius: 2px;
}

.tab-count {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
  font-weight: 600;
}

.table-container {
  background: #fff;
  border-radius: 0 0 16px 16px;
  padding: 0 20px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-container ::v-deep .el-table {
  border-radius: 12px;
  overflow: hidden;
}

.table-container ::v-deep .el-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #303133;
  padding: 16px 0;
}

.table-container ::v-deep .el-table td {
  padding: 16px 0;
}

.table-container ::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafbfc;
}

.table-container ::v-deep .el-table__row:hover > td {
  background-color: #f5f7fa !important;
}

.detail-descriptions {
  margin: 10px 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
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

.text-blue {
  color: #409eff !important;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 1600px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>