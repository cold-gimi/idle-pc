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
            v-for="menu in menuList"
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
            <div class="search-container">
              <el-input
                v-model="headerSearchKeyword"
                placeholder="搜索菜单"
                prefix-icon="el-icon-search"
                class="search-input"
                clearable
                @focus="showSearchResults = true"
                @input="handleMenuSearch"
              />
              <div v-if="showSearchResults && filteredMenuList.length > 0" class="search-results">
                <div
                  v-for="menu in filteredMenuList"
                  :key="menu.id"
                  class="search-result-item"
                  @click="navigateToMenu(menu)"
                >
                  <i :class="menu.icon"></i>
                  <span>{{ menu.name }}</span>
                </div>
              </div>
            </div>
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
                <el-dropdown-item command="settings">
                  <i class="el-icon-setting"></i> 设置
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
    <el-drawer
      title="系统设置"
      :visible.sync="settingsDrawerVisible"
      :before-close="handleCloseSettings"
      size="360px"
    >
      <div class="settings-container">
        <el-tabs v-model="activeSettingTab">
          <el-tab-pane label="菜单导航" name="navigation">
            <div class="setting-item">
              <span class="setting-label">菜单导航方式</span>
              <el-radio-group v-model="localSettings.menuNavigation" @change="handleMenuNavigationChange">
                <el-radio-button label="sidebar">侧边栏</el-radio-button>
                <el-radio-button label="top">顶部</el-radio-button>
              </el-radio-group>
            </div>
          </el-tab-pane>
          <el-tab-pane label="主题风格" name="theme">
            <div class="setting-item">
              <span class="setting-label">主题风格</span>
              <el-radio-group v-model="localSettings.themeStyle" @change="handleThemeStyleChange">
                <el-radio-button label="light">浅色</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
              </el-radio-group>
            </div>
          </el-tab-pane>
          <el-tab-pane label="主题颜色" name="color">
            <div class="setting-item">
              <span class="setting-label">主题颜色</span>
              <div class="color-picker-container">
                <div
                  v-for="color in themeColors"
                  :key="color.value"
                  class="color-item"
                  :class="{ active: localSettings.themeColor === color.value }"
                  :style="{ backgroundColor: color.value }"
                  @click="handleThemeColorChange(color.value)"
                ></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="其他设置" name="other">
            <div class="setting-item">
              <span class="setting-label">灰色模式</span>
              <el-switch
                v-model="localSettings.grayMode"
                active-text="开启"
                inactive-text="关闭"
                @change="handleGrayModeChange"
              ></el-switch>
            </div>
            <div class="setting-item">
              <span class="setting-label">显示水印</span>
              <el-switch
                v-model="localSettings.showWatermark"
                active-text="开启"
                inactive-text="关闭"
                @change="handleShowWatermarkChange"
              ></el-switch>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Layout',
  data() {
    return {
      headerSearchKeyword: '',
      isFullscreen: false,
      showSearchResults: false,
      filteredMenuList: [],
      settingsDrawerVisible: false,
      activeSettingTab: 'navigation',
      localSettings: {
        menuNavigation: 'sidebar',
        themeStyle: 'light',
        themeColor: '#409EFF',
        grayMode: false,
        showWatermark: false
      },
      themeColors: [
        { name: '默认蓝', value: '#409EFF' },
        { name: '玫瑰红', value: '#F56C6C' },
        { name: '橘子橙', value: '#E6A23C' },
        { name: '橄榄绿', value: '#67C23A' },
        { name: '薄荷绿', value: '#20B2AA' },
        { name: '紫色', value: '#9B59B6' },
        { name: '粉色', value: '#FF69B4' },
        { name: '青色', value: '#00BFFF' }
      ]
    }
  },
  computed: {
    ...mapState({
      sidebar: state => state.sidebar
    }),
    ...mapGetters(['userInfo', 'menuList', 'theme', 'menuNavigation', 'themeStyle', 'themeColor', 'grayMode', 'showWatermark']),
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
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    ...mapActions(['toggleSideBar', 'toggleFullscreen', 'logout', 'setMenuNavigation', 'setThemeStyle', 'setThemeColor', 'setGrayMode', 'setShowWatermark']),
    handleClickOutside(event) {
      if (!this.$el.querySelector('.search-container').contains(event.target)) {
        this.showSearchResults = false
      }
    },
    handleMenuSearch() {
      if (!this.headerSearchKeyword) {
        this.filteredMenuList = []
        this.showSearchResults = false
        return
      }
      const keyword = this.headerSearchKeyword.toLowerCase()
      this.filteredMenuList = this.menuList.filter(menu =>
        menu.name.toLowerCase().includes(keyword)
      )
      this.showSearchResults = true
    },
    navigateToMenu(menu) {
      this.showSearchResults = false
      this.headerSearchKeyword = ''
      this.$router.push(menu.path)
    },
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
      } else if (command === 'settings') {
        this.openSettingsDrawer()
      }
    },
    openSettingsDrawer() {
      this.localSettings = {
        menuNavigation: this.menuNavigation,
        themeStyle: this.themeStyle,
        themeColor: this.themeColor,
        grayMode: this.grayMode,
        showWatermark: this.showWatermark
      }
      this.settingsDrawerVisible = true
    },
    handleCloseSettings(done) {
      done()
    },
    handleMenuNavigationChange(value) {
      this.setMenuNavigation(value)
      this.$message.success('菜单导航方式已更新')
    },
    handleThemeStyleChange(value) {
      this.setThemeStyle(value)
      this.applyThemeStyle(value)
      this.$message.success('主题风格已更新')
    },
    handleThemeColorChange(value) {
      this.localSettings.themeColor = value
      this.setThemeColor(value)
      this.applyThemeColor(value)
      this.$message.success('主题颜色已更新')
    },
    handleGrayModeChange(value) {
      this.setGrayMode(value)
      this.applyGrayMode(value)
      this.$message.success(value ? '灰色模式已开启' : '灰色模式已关闭')
    },
    handleShowWatermarkChange(value) {
      this.setShowWatermark(value)
      this.applyWatermark(value)
      this.$message.success(value ? '水印已开启' : '水印已关闭')
    },
    applyThemeStyle(style) {
      const body = document.body
      if (style === 'dark') {
        body.classList.add('dark-theme')
      } else {
        body.classList.remove('dark-theme')
      }
    },
    applyThemeColor(color) {
      document.documentElement.style.setProperty('--theme-color', color)
    },
    applyGrayMode(enabled) {
      const html = document.documentElement
      if (enabled) {
        html.style.filter = 'grayscale(100%)'
        html.style.webkitFilter = 'grayscale(100%)'
      } else {
        html.style.filter = ''
        html.style.webkitFilter = ''
      }
    },
    applyWatermark(enabled) {
      let watermarkElement = document.getElementById('watermark')
      if (enabled) {
        if (!watermarkElement) {
          watermarkElement = document.createElement('div')
          watermarkElement.id = 'watermark'
          watermarkElement.className = 'watermark-container'
          document.body.appendChild(watermarkElement)
        }
        this.generateWatermark(watermarkElement)
      } else {
        if (watermarkElement) {
          watermarkElement.remove()
        }
      }
    },
    generateWatermark(container) {
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 150
      const ctx = canvas.getContext('2d')
      ctx.rotate(-20 * Math.PI / 180)
      ctx.font = '16px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillText(this.userInfo.username || '用户', 30, 100)
      ctx.fillText(new Date().toLocaleDateString(), 30, 130)
      const watermarkUrl = canvas.toDataURL('image/png')
      container.style.backgroundImage = `url(${watermarkUrl})`
      container.style.backgroundRepeat = 'repeat'
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

.search-container {
  position: relative;
  display: inline-block;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f7fa;
}

.search-result-item i {
  margin-right: 8px;
  color: #606266;
}

.settings-container {
  padding: 20px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-label {
  font-size: 14px;
  color: #606266;
}

.color-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: #303133;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}
</style>

<style>
.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.dark-theme {
  background-color: #1a1a2e;
  color: #e0e0e0;
}

.dark-theme .el-header {
  background-color: #16213e !important;
}

.dark-theme .el-aside {
  background-color: #0f0f23 !important;
}

.dark-theme .el-menu {
  background-color: #0f0f23 !important;
}
</style>
