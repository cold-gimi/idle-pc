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

    <SearchForm
      :search-fields="searchFields"
      :query-params="queryParams"
      :date-range="dateRange"
      :loading="searchLoading"
      label-width="70px"
      :show-extra-buttons="true"
      @search="onSearch"
      @reset="onReset"
    >
      <template #extraButtons>
        <el-button type="success" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
      </template>
    </SearchForm>

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

    <DataTable
      :table-data="orderList"
      :columns="tableColumns"
      :loading="loading"
      :show-actions="true"
      :actions-width="280"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      :default-status-map="statusMap"
      :default-status-type-map="statusTypeMap"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @action-click="onActionClick"
    >
      <template #amount="{ row }">
        <span class="amount-text">¥{{ row.amount }}</span>
      </template>
      <template #actions="{ row }">
        <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
        <template v-if="row.status === 'pending'">
          <el-button type="text" size="small" class="text-orange" @click="handleCancel(row)">取消订单</el-button>
        </template>
        <template v-if="row.status === 'paid'">
          <el-button type="text" size="small" class="text-green" @click="handleConfirm(row)">确认完成</el-button>
          <el-button type="text" size="small" class="text-red" @click="handleRefund(row)">退款</el-button>
        </template>
        <template v-if="row.status === 'refund'">
          <el-button type="text" size="small" class="text-green" @click="handleApproveRefund(row)">同意</el-button>
          <el-button type="text" size="small" class="text-red" @click="handleRejectRefund(row)">拒绝</el-button>
        </template>
        <template v-if="row.status === 'completed'">
          <el-button type="text" size="small" class="text-red" @click="handleRefund(row)">申请退款</el-button>
        </template>
      </template>
    </DataTable>

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

    <div class="charts-section" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">商品分类发布 TOP5</span>
            </div>
            <div ref="barChart1" class="chart-container"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">用户地区分布 TOP5</span>
            </div>
            <div ref="barChart2" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="tables-section" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">月度成交额走势</span>
            </div>
            <div class="table-wrapper">
              <el-table :data="monthlyAmountData" style="width: 100%" :header-cell-style="{ backgroundColor: '#f8fafc', color: '#606266' }">
                <el-table-column prop="month" label="月份" width="120" align="center"></el-table-column>
                <el-table-column prop="amount" label="成交额" align="center">
                  <template slot-scope="scope">
                    <span class="number-highlight">¥{{ scope.row.amount.toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="mom" label="环比" align="center">
                  <template slot-scope="scope">
                    <div class="mom-badge" :class="scope.row.mom >= 0 ? 'mom-up' : 'mom-down'">
                      <i :class="scope.row.mom >= 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                      {{ Math.abs(scope.row.mom) }}%
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">用户行为数据</span>
            </div>
            <div class="table-wrapper">
              <el-table :data="userBehaviorData" style="width: 100%" :header-cell-style="{ backgroundColor: '#f8fafc', color: '#606266' }">
                <el-table-column prop="action" label="行为类型" width="150" align="center"></el-table-column>
                <el-table-column prop="count" label="数量" align="center">
                  <template slot-scope="scope">
                    <span class="number-highlight">{{ scope.row.count.toLocaleString() }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="ratio" label="占比" align="center">
                  <template slot-scope="scope">
                    <div class="ratio-bar">
                      <div class="ratio-fill" :style="{ width: scope.row.ratio + '%' }"></div>
                      <span class="ratio-text">{{ scope.row.ratio }}%</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import * as echarts from 'echarts';
import listPageMixin from '@/mixins/listPage';
import { SearchForm, DataTable } from '@/components';

export default {
  name: 'Order',
  components: {
    SearchForm,
    DataTable
  },
  mixins: [listPageMixin],
  data() {
    return {
      activeTab: 'pending',
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
      currentOrder: {},
      cancelVisible: false,
      cancelReason: '',
      refundAmount: 0,
      refundReason: '',
      barChart1: null,
      barChart2: null,
      monthlyAmountData: [
        { month: '1月', amount: 125800, mom: 2.5 },
        { month: '2月', amount: 186500, mom: 4.2 },
        { month: '3月', amount: 258900, mom: 8.6 },
        { month: '4月', amount: 325600, mom: -1.2 },
        { month: '5月', amount: 389200, mom: 6.3 },
        { month: '6月', amount: 456800, mom: 3.1 }
      ],
      userBehaviorData: [
        { action: '浏览商品', count: 12568, ratio: 45 },
        { action: '加入购物车', count: 8956, ratio: 32 },
        { action: '提交订单', count: 4523, ratio: 16 },
        { action: '完成支付', count: 2156, ratio: 7 }
      ]
    }
  },
  computed: {
    searchFields() {
      return [
        {
          prop: 'dateRange',
          label: '时间范围',
          type: 'daterange',
          style: 'width: 240px;'
        },
        {
          prop: 'status',
          label: '订单状态',
          type: 'select',
          options: [
            { label: '待付款', value: 'pending' },
            { label: '已付款', value: 'paid' },
            { label: '已完成', value: 'completed' },
            { label: '已退款', value: 'refunded' },
            { label: '已取消', value: 'cancelled' }
          ]
        },
        {
          prop: 'orderNo',
          label: '订单号',
          type: 'input',
          placeholder: '请输入订单号'
        },
        {
          prop: 'productName',
          label: '商品名称',
          type: 'input',
          placeholder: '请输入商品名称'
        },
        {
          prop: 'buyer',
          label: '买家',
          type: 'input',
          placeholder: '请输入买家名称'
        }
      ]
    },
    tableColumns() {
      return [
        {
          prop: 'orderNo',
          label: '订单号',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'productName',
          label: '商品名称',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'buyer',
          label: '买家',
          width: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'seller',
          label: '卖家',
          width: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'amount',
          label: '金额',
          width: 120,
          slot: 'amount'
        },
        {
          prop: 'paymentMethod',
          label: '支付方式',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          type: 'status'
        },
        {
          prop: 'createTime',
          label: '下单时间',
          width: 170
        }
      ]
    }
  },
  created() {
    this.initPage()
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.barChart1) this.barChart1.dispose()
    if (this.barChart2) this.barChart2.dispose()
  },
  methods: {
    getDefaultQueryParams() {
      return {
        dateRange: [],
        status: '',
        orderNo: '',
        productName: '',
        buyer: ''
      }
    },
    handleResize() {
      if (this.barChart1) this.barChart1.resize()
      if (this.barChart2) this.barChart2.resize()
    },
    initCharts() {
      this.initBarChart1()
      this.initBarChart2()
    },
    initBarChart1() {
      const chartDom = this.$refs.barChart1
      if (!chartDom) return
      
      this.barChart1 = echarts.init(chartDom)
      
      const categoryData = [
        { name: '电子产品', value: 328 },
        { name: '服装鞋帽', value: 256 },
        { name: '家居用品', value: 198 },
        { name: '图书音像', value: 156 },
        { name: '运动户外', value: 124 }
      ]
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          data: categoryData.map(item => item.name),
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              borderRadius: [0, 8, 8, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#667eea' },
                  { offset: 1, color: '#764ba2' }
                ]
              }
            },
            label: {
              show: true,
              position: 'right',
              color: '#606266',
              fontSize: 12
            },
            data: categoryData.map(item => item.value)
          }
        ]
      }
      
      this.barChart1.setOption(option)
    },
    initBarChart2() {
      const chartDom = this.$refs.barChart2
      if (!chartDom) return
      
      this.barChart2 = echarts.init(chartDom)
      
      const regionData = [
        { name: '广东省', value: 456 },
        { name: '浙江省', value: 389 },
        { name: '江苏省', value: 312 },
        { name: '上海市', value: 278 },
        { name: '北京市', value: 245 }
      ]
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          data: regionData.map(item => item.name),
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              borderRadius: [0, 8, 8, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#4facfe' },
                  { offset: 1, color: '#00f2fe' }
                ]
              }
            },
            label: {
              show: true,
              position: 'right',
              color: '#606266',
              fontSize: 12
            },
            data: regionData.map(item => item.value)
          }
        ]
      }
      
      this.barChart2.setOption(option)
    },
    getList() {
      this.loading = true
      return new Promise((resolve) => {
        setTimeout(() => {
          this.orderList = this.generateMockData()
          this.total = this.tabCounts[this.activeTab]
          this.loading = false
          resolve()
        }, 500)
      })
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
    onSearch() {
      this.handleQuery()
    },
    onReset() {
      this.resetQuery()
      this.activeTab = 'all'
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
    onActionClick({ action, row, index }) {
      console.log('Action clicked:', action, row, index)
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

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.dialog-footer {
  text-align: right;
}

.chart-card {
  border-radius: 16px;
  overflow: hidden;
}

.chart-card ::v-deep .el-card__header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 250px;
}

.table-wrapper {
  max-height: 250px;
  overflow-y: auto;
}

.table-wrapper ::v-deep .el-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #303133;
  padding: 14px 0;
}

.table-wrapper ::v-deep .el-table td {
  padding: 14px 0;
}

.table-wrapper ::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafbfc;
}

.table-wrapper ::v-deep .el-table__row:hover > td {
  background-color: #f5f7fa !important;
}

.number-highlight {
  font-weight: 600;
  color: #303133;
}

.mom-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.mom-up {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.mom-down {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.mom-badge i {
  margin-right: 4px;
}

.ratio-bar {
  position: relative;
  height: 20px;
  background-color: #f0f2f5;
  border-radius: 10px;
  overflow: hidden;
}

.ratio-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.ratio-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  z-index: 1;
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
