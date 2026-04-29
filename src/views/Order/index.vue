<template>
  <div class="page-container">
    <div class="stats-cards">
      <div class="stat-card" @click="handleStatClick('today')">
        <div class="stat-icon today-icon">
          <i class="el-icon-s-order"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.today }}</div>
          <div class="stat-label">今日订单</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('pending')">
        <div class="stat-icon pending-icon">
          <i class="el-icon-time"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.pending }}</div>
          <div class="stat-label">待付款</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('completed')">
        <div class="stat-icon completed-icon">
          <i class="el-icon-success"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card" @click="handleStatClick('refund')">
        <div class="stat-icon refund-icon">
          <i class="el-icon-refresh-left"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statData.refund }}</div>
          <div class="stat-label">退款申请</div>
        </div>
      </div>
    </div>

    <div class="filter-container">
      <el-row :gutter="20">
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
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">订单状态：</span>
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option label="待付款" value="pending" />
              <el-option label="已付款" value="paid" />
              <el-option label="已完成" value="completed" />
              <el-option label="已退款" value="refunded" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">订单号：</span>
            <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter.native="handleQuery" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">商品名称：</span>
            <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable @keyup.enter.native="handleQuery" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">买家：</span>
            <el-input v-model="queryParams.buyer" placeholder="请输入买家名称" clearable @keyup.enter.native="handleQuery" />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="filter-item filter-buttons">
            <el-button type="primary" icon="el-icon-search" @click="handleQuery" :loading="searchLoading">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            <el-button type="success" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="tabs-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="待付款" name="pending">
          <span slot="label">待付款 <span class="tab-count">{{ tabCounts.pending }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已付款" name="paid">
          <span slot="label">已付款 <span class="tab-count">{{ tabCounts.paid }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <span slot="label">已完成 <span class="tab-count">{{ tabCounts.completed }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已退款" name="refunded">
          <span slot="label">已退款 <span class="tab-count">{{ tabCounts.refunded }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled">
          <span slot="label">已取消 <span class="tab-count">{{ tabCounts.cancelled }}</span></span>
        </el-tab-pane>
        <el-tab-pane label="全部" name="all">
          <span slot="label">全部 <span class="tab-count">{{ tabCounts.all }}</span></span>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="table-container">
      <el-table :data="orderList" v-loading="loading" stripe style="width: 100%" :header-cell-style="{ backgroundColor: '#f8fafc', color: '#606266' }">
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="buyer" label="买家" width="120" show-overflow-tooltip />
        <el-table-column prop="seller" label="卖家" width="120" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120">
          <template slot-scope="scope">
            <span class="amount-text">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small" effect="light" :round="true">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleDetail(scope.row)">详情</el-button>
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" size="small" class="text-orange" @click="handleCancel(scope.row)">取消订单</el-button>
            </template>
            <template v-if="scope.row.status === 'paid'">
              <el-button type="text" size="small" class="text-green" @click="handleConfirm(scope.row)">确认完成</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleRefund(scope.row)">退款</el-button>
            </template>
            <template v-if="scope.row.status === 'refund'">
              <el-button type="text" size="small" class="text-green" @click="handleApproveRefund(scope.row)">同意</el-button>
              <el-button type="text" size="small" class="text-red" @click="handleRejectRefund(scope.row)">拒绝</el-button>
            </template>
            <template v-if="scope.row.status === 'completed'">
              <el-button type="text" size="small" class="text-red" @click="handleRefund(scope.row)">申请退款</el-button>
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

    <el-dialog title="订单详情" :visible.sync="detailVisible" width="700px" :close-on-click-modal="false">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)" size="small" effect="light" :round="true">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="商品价格">¥{{ currentOrder.amount }}</el-descriptions-item>
        <el-descriptions-item label="买家">{{ currentOrder.buyer }}</el-descriptions-item>
        <el-descriptions-item label="卖家">{{ currentOrder.seller }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="订单备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="取消订单" :visible.sync="cancelVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="取消原因">
          <el-input
            v-model="cancelReason"
            type="textarea"
            :rows="4"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCancel" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="退款申请" :visible.sync="refundVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="退款金额">
          <el-input-number v-model="refundAmount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input
            v-model="refundReason"
            type="textarea"
            :rows="4"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refundVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund" :loading="submitLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
export default {
  name: 'Order',
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
        dateRange: [],
        status: '',
        orderNo: '',
        productName: '',
        buyer: ''
      },
      orderList: [],
      statData: {
        today: 28,
        pending: 12,
        completed: 156,
        refund: 3
      },
      tabCounts: {
        pending: 12,
        paid: 45,
        completed: 156,
        refunded: 8,
        cancelled: 5,
        all: 226
      },
      statusMap: {
        pending: '待付款',
        paid: '已付款',
        completed: '已完成',
        refund: '退款中',
        refunded: '已退款',
        cancelled: '已取消'
      },
      statusTypeMap: {
        pending: 'warning',
        paid: 'primary',
        completed: 'success',
        refund: 'danger',
        refunded: 'info',
        cancelled: 'info'
      },
      detailVisible: false,
      cancelVisible: false,
      refundVisible: false,
      currentOrder: {},
      cancelReason: '',
      refundAmount: 0,
      refundReason: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      setTimeout(() => {
        this.orderList = this.generateMockData()
        this.total = this.tabCounts[this.activeTab]
        this.loading = false
      }, 500)
    },
    generateMockData() {
      const statuses = ['pending', 'paid', 'completed', 'refunded', 'cancelled', 'refund']
      const products = ['iPhone 13 Pro Max', 'MacBook Pro 16寸', '索尼 WH-1000XM4 耳机', '任天堂 Switch OLED', '小米 12 Ultra', 'iPad Air 5', 'AirPods Pro 2', '华为 Mate 50 Pro']
      const buyers = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
      const sellers = ['商家A', '商家B', '商家C', '商家D']
      const paymentMethods = ['微信支付', '支付宝', '银行卡']
      
      const data = []
      for (let i = 0; i < 10; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        if (this.activeTab !== 'all' && status !== this.activeTab) continue
        
        data.push({
          id: i + 1,
          orderNo: `ORD${Date.now()}${String(i).padStart(4, '0')}`,
          productName: products[Math.floor(Math.random() * products.length)],
          buyer: buyers[Math.floor(Math.random() * buyers.length)],
          seller: sellers[Math.floor(Math.random() * sellers.length)],
          amount: (Math.random() * 10000 + 100).toFixed(2),
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: status,
          createTime: this.getRandomDate(),
          remark: Math.random() > 0.5 ? '请尽快发货' : ''
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
    handleStatClick(type) {
      const tabMap = {
        today: 'all',
        pending: 'pending',
        completed: 'completed',
        refund: 'refunded'
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
        dateRange: [],
        status: '',
        orderNo: '',
        productName: '',
        buyer: ''
      }
      this.activeTab = 'all'
      this.getList()
    },
    handleExport() {
      this.$message.success('正在导出Excel...')
      
      const exportData = this.orderList.map(item => ({
        '订单号': item.orderNo,
        '商品名称': item.productName,
        '买家': item.buyer,
        '卖家': item.seller,
        '金额': `¥${item.amount}`,
        '支付方式': item.paymentMethod,
        '状态': this.getStatusText(item.status),
        '下单时间': item.createTime
      }))
      
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '订单列表')
      
      const today = new Date()
      const dateStr = today.getFullYear() + 
        String(today.getMonth() + 1).padStart(2, '0') + 
        String(today.getDate()).padStart(2, '0')
      
      XLSX.writeFile(workbook, `订单列表_${dateStr}.xlsx`)
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
      this.currentOrder = row
      this.detailVisible = true
    },
    handleCancel(row) {
      this.currentOrder = row
      this.cancelReason = ''
      this.cancelVisible = true
    },
    confirmCancel() {
      if (!this.cancelReason.trim()) {
        this.$message.warning('请输入取消原因')
        return
      }
      this.submitLoading = true
      setTimeout(() => {
        this.$message.success('订单已取消')
        this.cancelVisible = false
        this.submitLoading = false
        this.getList()
      }, 500)
    },
    handleConfirm(row) {
      this.$confirm('确认该订单已完成吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('订单已确认完成')
        this.getList()
      }).catch(() => {})
    },
    handleRefund(row) {
      this.currentOrder = row
      this.refundAmount = parseFloat(row.amount)
      this.refundReason = ''
      this.refundVisible = true
    },
    confirmRefund() {
      if (!this.refundReason.trim()) {
        this.$message.warning('请输入退款原因')
        return
      }
      this.submitLoading = true
      setTimeout(() => {
        this.$message.success('退款申请已提交')
        this.refundVisible = false
        this.submitLoading = false
        this.getList()
      }, 500)
    },
    handleApproveRefund(row) {
      this.$confirm('确定同意该退款申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('已同意退款')
        this.getList()
      }).catch(() => {})
    },
    handleRejectRefund(row) {
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝原因'
      }).then(({ value }) => {
        this.$message.success('已拒绝退款')
        this.getList()
      }).catch(() => {})
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

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
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
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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

.today-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.completed-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.refund-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
  width: 70px;
  min-width: 70px;
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

.amount-text {
  font-weight: 600;
  color: #f56c6c;
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
