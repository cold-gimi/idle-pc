import SearchForm from './SearchForm/index.vue'
import DataTable from './DataTable/index.vue'

const components = [
  SearchForm,
  DataTable
]

const install = function(Vue) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export {
  SearchForm,
  DataTable,
  install
}

export default {
  install
}
