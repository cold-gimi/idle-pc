<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">首页</h3>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="el-icon-document"></i>
            </div>
            <div class="card-info">
              <div class="card-value">{{ statistics.articleCount }}</div>
              <div class="card-label">文章总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="el-icon-check"></i>
            </div>
            <div class="card-info">
              <div class="card-value">{{ statistics.auditCount }}</div>
              <div class="card-label">待审核数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="card-info">
              <div class="card-value">{{ statistics.publishedCount }}</div>
              <div class="card-label">已发布数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="el-icon-user"></i>
            </div>
            <div class="card-info">
              <div class="card-value">{{ statistics.userCount }}</div>
              <div class="card-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>最近文章</span>
            <el-button style="float: right; padding: 3px 0;" type="text" @click="$router.push('/article')">查看更多</el-button>
          </div>
          <el-table :data="recentArticles" style="width: 100%">
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="author" label="作者" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>待审核列表</span>
            <el-button style="float: right; padding: 3px 0;" type="text" @click="$router.push('/audit')">查看更多</el-button>
          </div>
          <el-table :data="pendingAudits" style="width: 100%">
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="type" label="类型" width="100"></el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleAudit(scope.row)">审核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      statistics: {
        articleCount: 128,
        auditCount: 15,
        publishedCount: 98,
        userCount: 56
      },
      recentArticles: [
        { id: 1, title: 'iPhone 13 Pro Max 256G 远峰蓝', author: '张三', status: 'published', createTime: '2024-04-25 10:30:00' },
        { id: 2, title: 'MacBook Pro 14寸 M1 Pro', author: '李四', status: 'pending', createTime: '2024-04-24 15:20:00' },
        { id: 3, title: '索尼 WH-1000XM4 无线耳机', author: '王五', status: 'published', createTime: '2024-04-23 09:15:00' },
        { id: 4, title: 'iPad Pro 11寸 2021款', author: '赵六', status: 'rejected', createTime: '2024-04-22 14:45:00' },
        { id: 5, title: '任天堂 Switch OLED', author: '孙七', status: 'published', createTime: '2024-04-21 11:30:00' }
      ],
      pendingAudits: [
        { id: 1, title: 'MacBook Pro 14寸 M1 Pro', type: '电子产品', submitTime: '2024-04-25 10:30:00' },
        { id: 2, title: '戴森 V15 无线吸尘器', type: '家用电器', submitTime: '2024-04-24 15:20:00' },
        { id: 3, title: 'iPhone 15 Pro 钛金属', type: '手机', submitTime: '2024-04-23 09:15:00' }
      ]
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        draft: '草稿',
        pending: '待审核',
        published: '已发布',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const typeMap = {
        draft: 'info',
        pending: 'warning',
        published: 'success',
        rejected: 'danger'
      }
      return typeMap[status] || 'info'
    },
    handleAudit(row) {
      this.$message.info('跳转到审核页面处理')
      this.$router.push('/audit')
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.card-icon i {
  font-size: 28px;
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>
