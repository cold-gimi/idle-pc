<template>
  <div class="data-table">
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        v-loading="loading"
        :stripe="stripe"
        :border="border"
        :height="height"
        :max-height="maxHeight"
        :header-cell-style="headerCellStyle"
        :row-class-name="rowClassName"
        :row-key="rowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          :width="selectionWidth"
          align="center"
        />
        <el-table-column
          v-if="showIndex"
          type="index"
          :label="indexLabel"
          :width="indexWidth"
          align="center"
        />
        <template v-for="column in columns">
          <el-table-column
            :key="column.prop || column.label"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :align="column.align"
            :show-overflow-tooltip="column.showOverflowTooltip !== false"
            :sortable="column.sortable"
          >
            <template v-if="column.slot" slot-scope="scope">
              <slot :name="column.slot" :row="scope.row" :index="scope.$index" :column="column">
              </slot>
            </template>
            <template v-else-if="column.type === 'status'" slot-scope="scope">
              <el-tag
                :type="getStatusType(scope.row[column.prop], column.statusMap)"
                size="small"
                effect="light"
                :round="column.round !== false"
              >
                {{ getStatusText(scope.row[column.prop], column.statusMap) }}
              </el-tag>
            </template>
            <template v-else-if="column.type === 'amount'" slot-scope="scope">
              <span :class="column.amountClass || 'amount-text'">
                {{ column.prefix || '¥' }}{{ scope.row[column.prop] }}
              </span>
            </template>
            <template v-else-if="column.type === 'image'" slot-scope="scope">
              <div class="image-cell" v-if="scope.row[column.prop]">
                <el-image
                  :src="Array.isArray(scope.row[column.prop]) ? scope.row[column.prop][0] : scope.row[column.prop]"
                  :preview-src-list="Array.isArray(scope.row[column.prop]) ? scope.row[column.prop] : [scope.row[column.prop]]"
                  fit="cover"
                  class="table-image"
                />
              </div>
              <span v-else class="no-image">无图</span>
            </template>
            <template v-else-if="column.type === 'tags'" slot-scope="scope">
              <el-tag
                v-for="(tag, index) in getTags(scope.row[column.prop], column.tagKey)"
                :key="index"
                :type="tag.type || column.defaultTagType || 'info'"
                size="small"
                effect="light"
                style="margin-right: 4px;"
              >
                {{ tag.label || tag }}
              </el-tag>
            </template>
            <template v-else-if="column.render" slot-scope="scope">
              <component :is="column.render(scope.row, scope.$index, column)" />
            </template>
          </el-table-column>
        </template>
        <el-table-column
          v-if="showActions"
          label="操作"
          :width="actionsWidth"
          :fixed="actionsFixed"
          align="center"
        >
          <template slot-scope="scope">
            <slot name="actions" :row="scope.row" :index="scope.$index">
              <el-button
                v-for="action in actions"
                :key="action.prop || action.label"
                type="text"
                size="small"
                :class="action.class"
                :loading="action.loading && scope.row[action.loading]"
                @click="handleAction(action, scope.row, scope.$index)"
              >
                {{ action.label }}
              </el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-wrapper" v-if="showPagination && total > 0">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    stripe: {
      type: Boolean,
      default: true
    },
    border: {
      type: Boolean,
      default: false
    },
    height: {
      type: [String, Number],
      default: null
    },
    maxHeight: {
      type: [String, Number],
      default: null
    },
    headerCellStyle: {
      type: Object,
      default: () => ({
        backgroundColor: '#f8fafc',
        color: '#606266'
      })
    },
    rowClassName: {
      type: [String, Function],
      default: ''
    },
    rowKey: {
      type: [String, Function],
      default: 'id'
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    selectionWidth: {
      type: Number,
      default: 50
    },
    showIndex: {
      type: Boolean,
      default: false
    },
    indexLabel: {
      type: String,
      default: '序号'
    },
    indexWidth: {
      type: Number,
      default: 60
    },
    showActions: {
      type: Boolean,
      default: false
    },
    actionsWidth: {
      type: [String, Number],
      default: 200
    },
    actionsFixed: {
      type: [String, Boolean],
      default: 'right'
    },
    actions: {
      type: Array,
      default: () => []
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    total: {
      type: Number,
      default: 0
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    defaultStatusMap: {
      type: Object,
      default: () => ({})
    },
    defaultStatusTypeMap: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.$emit('selection-change', val)
    },
    handleSizeChange(val) {
      this.$emit('size-change', val)
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val)
    },
    handleAction(action, row, index) {
      this.$emit('action-click', { action, row, index })
      if (action.handler) {
        action.handler(row, index)
      }
    },
    getStatusText(status, statusMap = {}) {
      const map = { ...this.defaultStatusMap, ...statusMap }
      return map[status] || status
    },
    getStatusType(status, statusTypeMap = {}) {
      const map = { ...this.defaultStatusTypeMap, ...statusTypeMap }
      return map[status] || 'info'
    },
    getTags(value, tagKey) {
      if (!value) return []
      if (Array.isArray(value)) {
        if (tagKey && typeof value[0] === 'object') {
          return value.map(item => ({
            label: item[tagKey],
            type: item.type
          }))
        }
        return value
      }
      return [value]
    }
  }
}
</script>

<style scoped>
.data-table {
  background: #fff;
  border-radius: 0 0 16px 16px;
  padding: 0 20px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-wrapper {
  padding-top: 20px;
}

.table-wrapper >>> .el-table {
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper >>> .el-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #303133;
  padding: 16px 0;
}

.table-wrapper >>> .el-table td {
  padding: 16px 0;
}

.table-wrapper >>> .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafbfc;
}

.table-wrapper >>> .el-table__row:hover > td {
  background-color: #f5f7fa !important;
}

.image-cell {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.table-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.no-image {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-wrapper {
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
</style>
