<template>
  <div class="stats-page">
    <div class="page-header">
      <h3 class="page-title">数据统计</h3>
    </div>

    <div class="stats-cards-section">
      <div class="stats-cards-grid">
        <div class="stat-card card-gradient-1" @mouseenter="onCardHover(0)" @mouseleave="onCardLeave(0)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">今日发布</div>
              <div class="card-value">{{ todayStats.publish.value }}</div>
              <div class="card-trend" :class="getTrendClass(todayStats.publish.trend)">
                <i :class="getTrendIcon(todayStats.publish.trend)"></i>
                <span>{{ Math.abs(todayStats.publish.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-s-promotion card-icon"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-gradient-2" @mouseenter="onCardHover(1)" @mouseleave="onCardLeave(1)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">今日成交</div>
              <div class="card-value">{{ todayStats.transaction.value }}</div>
              <div class="card-trend" :class="getTrendClass(todayStats.transaction.trend)">
                <i :class="getTrendIcon(todayStats.transaction.trend)"></i>
                <span>{{ Math.abs(todayStats.transaction.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-success card-icon"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-gradient-3" @mouseenter="onCardHover(2)" @mouseleave="onCardLeave(2)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">今日新增用户</div>
              <div class="card-value">{{ todayStats.newUser.value }}</div>
              <div class="card-trend" :class="getTrendClass(todayStats.newUser.trend)">
                <i :class="getTrendIcon(todayStats.newUser.trend)"></i>
                <span>{{ Math.abs(todayStats.newUser.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-user-solid card-icon"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-gradient-4" @mouseenter="onCardHover(3)" @mouseleave="onCardLeave(3)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">活跃商品</div>
              <div class="card-value">{{ todayStats.activeProduct.value }}</div>
              <div class="card-trend" :class="getTrendClass(todayStats.activeProduct.trend)">
                <i :class="getTrendIcon(todayStats.activeProduct.trend)"></i>
                <span>{{ Math.abs(todayStats.activeProduct.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-goods card-icon"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-gradient-5" @mouseenter="onCardHover(4)" @mouseleave="onCardLeave(4)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">成交率</div>
              <div class="card-value">{{ todayStats.transactionRate.value }}%</div>
              <div class="card-trend" :class="getTrendClass(todayStats.transactionRate.trend)">
                <i :class="getTrendIcon(todayStats.transactionRate.trend)"></i>
                <span>{{ Math.abs(todayStats.transactionRate.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-pie-chart card-icon"></i>
            </div>
          </div>
        </div>

        <div class="stat-card card-gradient-6" @mouseenter="onCardHover(5)" @mouseleave="onCardLeave(5)">
          <div class="card-content">
            <div class="card-info">
              <div class="card-label">平均客单价</div>
              <div class="card-value">¥{{ todayStats.avgOrder.value }}</div>
              <div class="card-trend" :class="getTrendClass(todayStats.avgOrder.trend)">
                <i :class="getTrendIcon(todayStats.avgOrder.trend)"></i>
                <span>{{ Math.abs(todayStats.avgOrder.percent) }}%</span>
                <span class="trend-text">较昨日</span>
              </div>
            </div>
            <div class="card-icon-wrapper">
              <i class="el-icon-wallet card-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">发布量与成交量趋势</span>
              <div class="date-switcher">
                <el-radio-group v-model="dateRangeType" size="small" @change="handleDateRangeChange">
                  <el-radio-button label="7">近7天</el-radio-button>
                  <el-radio-button label="30">近30天</el-radio-button>
                  <el-radio-button label="365">近1年</el-radio-button>
                  <el-radio-button label="custom">自定义</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-if="dateRangeType === 'custom'"
                  v-model="customDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="margin-left: 10px; width: 240px;"
                  size="small"
                  @change="handleCustomDateChange"
                />
              </div>
            </div>
            <div ref="lineChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">商品分类发布 TOP5</span>
            </div>
            <div ref="barChart1" class="chart-container"></div>
          </el-card>

          <el-card class="chart-card" shadow="hover" style="margin-top: 20px;">
            <div slot="header" class="chart-header">
              <span class="chart-title">用户地区分布 TOP5</span>
            </div>
            <div ref="barChart2" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="bottom-section" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">月度成交额走势</span>
            </div>
            <div ref="monthlyChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span class="chart-title">用户行为数据</span>
            </div>
            <div class="behavior-table-container">
              <el-table :data="behaviorData" style="width: 100%" :header-cell-style="{ backgroundColor: '#f8fafc', color: '#606266' }">
                <el-table-column prop="month" label="月份" width="100"></el-table-column>
                <el-table-column prop="activeUsers" label="活跃用户">
                  <template slot-scope="scope">
                    <span class="number-highlight">{{ scope.row.activeUsers }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="pageViews" label="页面浏览量">
                  <template slot-scope="scope">
                    <span class="number-highlight">{{ scope.row.pageViews }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="conversionRate" label="转化率">
                  <template slot-scope="scope">
                    <span :class="scope.row.conversionRate >= 3 ? 'trend-up' : 'trend-down'">
                      {{ scope.row.conversionRate }}%
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="mom" label="环比">
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
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Statistics',
  data() {
    return {
      todayStats: {
        publish: { value: 128, trend: 'up', percent: 12.5 },
        transaction: { value: 86, trend: 'up', percent: 8.3 },
        newUser: { value: 56, trend: 'down', percent: 5.2 },
        activeProduct: { value: 1256, trend: 'up', percent: 3.8 },
        transactionRate: { value: 67.2, trend: 'up', percent: 2.5 },
        avgOrder: { value: 368, trend: 'down', percent: 1.2 }
      },
      dateRangeType: '7',
      customDateRange: [],
      lineChart: null,
      barChart1: null,
      barChart2: null,
      monthlyChart: null,
      hoveredCardIndex: -1,
      behaviorData: [
        { month: '1月', activeUsers: 12580, pageViews: 45890, conversionRate: 3.2, mom: 2.5 },
        { month: '2月', activeUsers: 14260, pageViews: 52340, conversionRate: 3.5, mom: 4.2 },
        { month: '3月', activeUsers: 16890, pageViews: 68720, conversionRate: 4.1, mom: 8.6 },
        { month: '4月', activeUsers: 18920, pageViews: 75430, conversionRate: 3.8, mom: -1.2 },
        { month: '5月', activeUsers: 21450, pageViews: 89650, conversionRate: 4.5, mom: 6.3 },
        { month: '6月', activeUsers: 23890, pageViews: 98760, conversionRate: 4.8, mom: 3.1 }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.lineChart) this.lineChart.dispose()
    if (this.barChart1) this.barChart1.dispose()
    if (this.barChart2) this.barChart2.dispose()
    if (this.monthlyChart) this.monthlyChart.dispose()
  },
  methods: {
    getTrendClass(trend) {
      return trend === 'up' ? 'trend-up' : 'trend-down'
    },
    getTrendIcon(trend) {
      return trend === 'up' ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
    },
    onCardHover(index) {
      this.hoveredCardIndex = index
    },
    onCardLeave() {
      this.hoveredCardIndex = -1
    },
    handleDateRangeChange() {
      this.updateLineChart()
    },
    handleCustomDateChange() {
      this.updateLineChart()
    },
    handleResize() {
      if (this.lineChart) this.lineChart.resize()
      if (this.barChart1) this.barChart1.resize()
      if (this.barChart2) this.barChart2.resize()
      if (this.monthlyChart) this.monthlyChart.resize()
    },
    initCharts() {
      this.initLineChart()
      this.initBarChart1()
      this.initBarChart2()
      this.initMonthlyChart()
    },
    initLineChart() {
      const chartDom = this.$refs.lineChart
      if (!chartDom) return
      
      this.lineChart = echarts.init(chartDom)
      this.updateLineChart()
    },
    updateLineChart() {
      if (!this.lineChart) return
      
      const days = parseInt(this.dateRangeType) || 7
      const dates = this.generateDateLabels(days)
      const publishData = this.generateRandomData(dates.length, 50, 150)
      const transactionData = this.generateRandomData(dates.length, 30, 100)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e4e7ed',
          borderWidth: 1,
          textStyle: {
            color: '#303133'
          },
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['发布量', '成交量'],
          top: 0,
          textStyle: {
            color: '#606266'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: {
            lineStyle: {
              color: '#dcdfe6'
            }
          },
          axisLabel: {
            color: '#909399'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#f0f2f5',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#909399'
          }
        },
        series: [
          {
            name: '发布量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
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
            itemStyle: {
              color: '#667eea',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                  { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                ]
              }
            },
            data: publishData
          },
          {
            name: '成交量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#f093fb' },
                  { offset: 1, color: '#f5576c' }
                ]
              }
            },
            itemStyle: {
              color: '#f5576c',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(245, 87, 108, 0.3)' },
                  { offset: 1, color: 'rgba(245, 87, 108, 0.05)' }
                ]
              }
            },
            data: transactionData
          }
        ]
      }
      
      this.lineChart.setOption(option, { notMerge: true })
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
    initMonthlyChart() {
      const chartDom = this.$refs.monthlyChart
      if (!chartDom) return
      
      this.monthlyChart = echarts.init(chartDom)
      
      const months = ['1月', '2月', '3月', '4月', '5月', '6月']
      const amounts = [125800, 186500, 258900, 325600, 389200, 456800]
      const momData = [2.5, 4.2, 8.6, -1.2, 6.3, 3.1]
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = params[0].axisValue + '<br/>'
            params.forEach(param => {
              if (param.seriesName === '成交额') {
                result += `${param.marker} ${param.seriesName}: ¥${param.value.toLocaleString()}<br/>`
              } else {
                const icon = param.value >= 0 ? '↑' : '↓'
                result += `${param.marker} ${param.seriesName}: ${icon}${Math.abs(param.value)}%<br/>`
              }
            })
            return result
          }
        },
        legend: {
          data: ['成交额', '环比'],
          top: 0,
          textStyle: {
            color: '#606266'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLine: {
            lineStyle: {
              color: '#dcdfe6'
            }
          },
          axisLabel: {
            color: '#909399'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '成交额',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: '#f0f2f5',
                type: 'dashed'
              }
            },
            axisLabel: {
              color: '#909399',
              formatter: function(value) {
                return (value / 10000) + '万'
              }
            }
          },
          {
            type: 'value',
            name: '环比',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#909399',
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '成交额',
            type: 'bar',
            barWidth: '35%',
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#667eea' },
                  { offset: 1, color: '#764ba2' }
                ]
              }
            },
            data: amounts
          },
          {
            name: '环比',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'diamond',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#f5576c'
            },
            itemStyle: {
              color: function(params) {
                return params.value >= 0 ? '#67c23a' : '#f56c6c'
              }
            },
            data: momData
          }
        ]
      }
      
      this.monthlyChart.setOption(option)
    },
    generateDateLabels(count) {
      const labels = []
      const now = new Date()
      
      for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        
        if (count > 30) {
          labels.push((date.getMonth() + 1) + '/' + date.getDate())
        } else {
          labels.push(date.getMonth() + 1 + '月' + date.getDate() + '日')
        }
      }
      
      return labels
    },
    generateRandomData(count, min, max) {
      const data = []
      for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min)
      }
      return data
    }
  }
}
</script>

<style scoped>
.stats-page {
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

.stats-cards-section {
  margin-bottom: 20px;
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.stat-card {
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.card-trend {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.card-trend i {
  margin-right: 4px;
}

.card-trend.trend-up {
  color: #c7ffd5;
}

.card-trend.trend-down {
  color: #ffd1d1;
}

.trend-text {
  margin-left: 4px;
  opacity: 0.8;
}

.card-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.card-icon {
  font-size: 28px;
  color: #fff;
}

.card-gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-gradient-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-gradient-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-gradient-4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-gradient-5 {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-gradient-6 {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.card-gradient-6 .card-label,
.card-gradient-6 .card-value,
.card-gradient-6 .card-trend,
.card-gradient-6 .card-icon {
  color: #303133;
}

.charts-section {
  margin-bottom: 20px;
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

.date-switcher {
  display: flex;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

#lineChart {
  height: 350px;
}

#barChart1,
#barChart2 {
  height: 220px;
}

#monthlyChart {
  height: 300px;
}

.behavior-table-container {
  max-height: 300px;
  overflow-y: auto;
}

.behavior-table-container ::v-deep .el-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #303133;
  padding: 14px 0;
}

.behavior-table-container ::v-deep .el-table td {
  padding: 14px 0;
}

.behavior-table-container ::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafbfc;
}

.behavior-table-container ::v-deep .el-table__row:hover > td {
  background-color: #f5f7fa !important;
}

.number-highlight {
  font-weight: 600;
  color: #303133;
}

.trend-up {
  color: #67c23a;
  font-weight: 600;
}

.trend-down {
  color: #f56c6c;
  font-weight: 600;
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

@media (max-width: 1600px) {
  .stats-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .stats-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
