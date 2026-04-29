<template>
  <div class="search-form">
    <el-form :model="queryParams" :inline="true" :label-width="labelWidth">
      <el-form-item v-for="item in searchFields" :key="item.prop" :label="item.label">
        <el-input
          v-if="item.type === 'input'"
          v-model="queryParams[item.prop]"
          :placeholder="item.placeholder || '请输入' + item.label"
          :clearable="item.clearable !== false"
          :style="item.style"
          @keyup.enter.native="handleQuery"
        />
        <el-select
          v-else-if="item.type === 'select'"
          v-model="queryParams[item.prop]"
          :placeholder="item.placeholder || '请选择' + item.label"
          :clearable="item.clearable !== false"
          :style="item.style"
          :filterable="item.filterable"
          :multiple="item.multiple"
        >
          <el-option
            v-for="option in item.options || []"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-date-picker
          v-else-if="item.type === 'date'"
          v-model="queryParams[item.prop]"
          :type="item.dateType || 'date'"
          :placeholder="item.placeholder || '请选择' + item.label"
          :value-format="item.valueFormat || 'yyyy-MM-dd'"
          :style="item.style"
        />
        <el-date-picker
          v-else-if="item.type === 'daterange'"
          v-model="dateRange"
          type="daterange"
          :range-separator="item.rangeSeparator || '至'"
          :start-placeholder="item.startPlaceholder || '开始日期'"
          :end-placeholder="item.endPlaceholder || '结束日期'"
          :value-format="item.valueFormat || 'yyyy-MM-dd'"
          :style="item.style"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery" :loading="loading">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">
          重置
        </el-button>
        <template v-if="showExtraButtons">
          <slot name="extraButtons"></slot>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    searchFields: {
      type: Array,
      default: () => []
    },
    queryParams: {
      type: Object,
      default: () => ({})
    },
    dateRange: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: String,
      default: '80px'
    },
    showExtraButtons: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleQuery() {
      this.$emit('search', {
        queryParams: this.queryParams,
        dateRange: this.dateRange
      })
    },
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.search-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.search-form:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-form >>> .el-form-item {
  margin-bottom: 18px;
  margin-right: 18px;
}

.search-form >>> .el-form-item__label {
  color: #606266;
  font-weight: 500;
  text-align: right;
}

.search-form >>> .el-input,
.search-form >>> .el-select,
.search-form >>> .el-date-editor {
  width: 180px;
}
</style>
