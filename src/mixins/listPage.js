export default {
  data() {
    return {
      loading: false,
      submitLoading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      list: [],
      dialogVisible: false,
      dialogTitle: '',
      isAdd: false,
      form: {},
      rules: {}
    }
  },
  methods: {
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        ...this.getDefaultQueryParams()
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
    handleDelete(row) {
      this.$confirm(this.getDeleteConfirmText(), '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteItem(row)
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          setTimeout(() => {
            this.saveItem()
            this.dialogVisible = false
            this.submitLoading = false
            this.getList()
          }, 500)
        }
      })
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
    getDeleteConfirmText() {
      return '是否确认删除该项?'
    },
    getStatusText(status, statusMap = {}) {
      return statusMap[status] || status
    },
    getStatusType(status, typeMap = {}) {
      return typeMap[status] || 'info'
    },
    getList() {
      console.warn('getList method should be implemented in component')
    },
    saveItem() {
      console.warn('saveItem method should be implemented in component')
    },
    deleteItem(row) {
      console.warn('deleteItem method should be implemented in component')
    }
  }
}
