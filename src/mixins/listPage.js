export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      searchLoading: false,
      deleteLoading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      list: [],
      selectedItems: [],
      statusMap: {},
      statusTypeMap: {},
      dialogVisible: false,
      dialogTitle: '',
      detailVisible: false,
      isAdd: false,
      form: {},
      rules: {},
      currentItem: {},
      dateRange: []
    }
  },
  methods: {
    initPage() {
      this.getList()
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
      const defaultParams = {
        pageNum: 1,
        pageSize: 10,
        ...this.getDefaultQueryParams()
      }
      this.queryParams = defaultParams
      this.dateRange = []
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
    handleSelectionChange(val) {
      this.selectedItems = val
    },
    handleAdd() {
      this.isAdd = true
      this.dialogTitle = this.getAddTitle()
      this.form = this.getDefaultForm()
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.resetFields()
      })
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isAdd = false
      this.dialogTitle = this.getEditTitle()
      this.form = Object.assign({}, row)
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
      this.dialogVisible = true
    },
    handleDetail(row) {
      this.currentItem = row
      this.detailVisible = true
    },
    handleDelete(row) {
      const deleteConfirmText = this.getDeleteConfirmText(row)
      this.$confirm(deleteConfirmText, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteItem(row)
      }).catch(() => {})
    },
    handleBatchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请先选择要删除的项')
        return
      }
      this.$confirm(`是否确认删除选中的 ${this.selectedItems.length} 项?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.batchDeleteItems(this.selectedItems)
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.submitLoading = true
          try {
            await this.saveItem()
            this.dialogVisible = false
            this.$message.success(this.isAdd ? '新增成功' : '修改成功')
            this.getList()
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error(error.message || (this.isAdd ? '新增失败' : '修改失败'))
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    getStatusText(status) {
      return this.statusMap[status] || status
    },
    getStatusType(status) {
      return this.statusTypeMap[status] || 'info'
    },
    getDefaultQueryParams() {
      return {}
    },
    getDefaultForm() {
      return {}
    },
    getAddTitle() {
      return '新增'
    },
    getEditTitle() {
      return '编辑'
    },
    getDeleteConfirmText(row) {
      return '是否确认删除该项?'
    },
    getList() {
      console.warn('getList method should be implemented in component')
      return Promise.resolve()
    },
    saveItem() {
      console.warn('saveItem method should be implemented in component')
      return Promise.resolve()
    },
    deleteItem(row) {
      console.warn('deleteItem method should be implemented in component')
      return Promise.resolve()
    },
    batchDeleteItems(items) {
      console.warn('batchDeleteItems method should be implemented in component')
      return Promise.resolve()
    },
    handleExport() {
      this.$message.warning('导出功能需要在具体组件中实现')
    }
  }
}
