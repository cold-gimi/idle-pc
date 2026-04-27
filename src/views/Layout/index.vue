<template>
  <div class="layout-container">
    <el-container>
      <el-aside :width="sidebarWidth">
        <div class="logo-container">
          <span v-if="!sidebar.opened" class="logo-text collapse-logo">
            <i class="el-icon-s-shop"></i>
          </span>
          <span v-else class="logo-text">二手闲置管理端</span>
        </div>
        <div class="menu-search" v-show="sidebar.opened">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索菜单"
            prefix-icon="el-icon-search"
            clearable
          />
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="!sidebar.opened"
          :unique-opened="true"
          :collapse-transition="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#ffffff"
          router
        >
          <el-menu-item
            v-for="menu in filteredMenuList"
            :key="menu.id"
            :index="menu.path"
          >
            <i :class="menu.icon"></i>
            <span slot="title">{{ menu.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-left">
            <i
              :class="sidebar.opened ? 'el-icon-s-fold' : 'el-icon-s-unfold'"
              class="toggle-sidebar"
              @click="toggleSideBar"
            ></i>
            <div class="breadcrumb-container">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentRoute.name !== 'Dashboard'">
                  {{ currentRoute.meta.title }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </div>
          <div class="header-right">
            <el-input
              v-model="headerSearchKeyword"
              placeholder="全局搜索"
              prefix-icon="el-icon-search"
              class="search-input"
              clearable
            />
            <i
              :class="isFullscreen ? 'el-icon-zoom-out' : 'el-icon-zoom-in'"
              @click="toggleFullscreen"
              title="全屏"
            ></i>
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <img
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                  alt="头像"
                  class="user-avatar"
                />
                <span>{{ userInfo.username || '管理员' }}</span>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">
                  <i class="el-icon-user"></i> 个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-container">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Layout',
  data() {
    return {
      searchKeyword: '',
      headerSearchKeyword: '',
      isFullscreen: false
    }
  },
  computed: {
    ...mapState({
      sidebar: state => state.sidebar,
      menuList: state => state.menuList
    }),
    ...mapGetters(['userInfo']),
    sidebarWidth() {
      return this.sidebar.opened ? '210px' : '64px'
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    currentRoute() {
      return this.$route
    },
    filteredMenuList() {
      if (!this.searchKeyword) {
        return this.menuList
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.menuList.filter(menu =>
        menu.name.toLowerCase().includes(keyword)
      )
    }
  },
  watch: {
    searchKeyword(val) {
      if (val && this.filteredMenuList.length === 1) {
        // 自动高亮唯一匹配的菜单
      }
    }
  },
  methods: {
    ...mapActions(['toggleSideBar', 'toggleFullscreen', 'logout']),
    handleCommand(command) {
      if (command === 'logout') {
        this.$confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.logout().then(() => {
            this.$message.success('退出成功')
            this.$router.push({ path: '/login' })
          })
        }).catch(() => {})
      } else if (command === 'profile') {
        this.$message.info('个人中心功能开发中')
      }
    }
  }
}
</script>

<style scoped>
.toggle-sidebar {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: transform 0.3s;
}

.toggle-sidebar:hover {
  color: #409EFF;
}
</style>
