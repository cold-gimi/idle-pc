<template>
  <div class="layout-container" :class="['menu-' + localSettings.menuNavigation, 'theme-' + localSettings.themeStyle]">
    <el-container v-if="localSettings.menuNavigation === 'sidebar'" key="sidebar-layout">
      <el-aside :width="sidebarWidth" class="sidebar-aside">
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
          :background-color="sidebarBgColor"
          :text-color="sidebarTextColor"
          :active-text-color="sidebarActiveColor"
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
        <el-header class="main-header">
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
                  <i class="el-icon-setting"></i> 布局设置
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
    
    <el-container v-else-if="localSettings.menuNavigation === 'top'" key="top-layout">
      <el-header class="top-nav-header">
        <div class="top-nav-left">
          <div class="logo-container-top">
            <span class="logo-text">二手闲置管理端</span>
          </div>
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :background-color="headerBgColor"
            :text-color="headerTextColor"
            :active-text-color="headerActiveColor"
            router
            class="top-nav-menu"
          >
            <el-menu-item
              v-for="menu in menuList"
              :key="menu.id"
              :index="menu.path"
            >
              <i :class="menu.icon"></i>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="top-nav-right">
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
                <i class="el-icon-setting"></i> 布局设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-container">
        <div class="breadcrumb-container-top">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.name !== 'Dashboard'">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <router-view />
      </el-main>
    </el-container>
    <el-drawer
      title="布局设置"
      :visible.sync="settingsDrawerVisible"
      :before-close="handleCloseSettings"
      size="380px"
      :custom-class="settingsDrawerClass"
    >
      <div class="settings-container">
        <div class="settings-card">
          <div class="card-header">
            <i class="el-icon-menu card-icon"></i>
            <h3 class="section-title">菜单导航</h3>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <span class="setting-label">菜单导航方式</span>
              <div class="navigation-options">
                <div
                  class="nav-option"
                  :class="{ active: localSettings.menuNavigation === 'sidebar' }"
                  @click="localSettings.menuNavigation = 'sidebar'; handleMenuNavigationChange('sidebar')"
                >
                  <div class="nav-preview sidebar-preview">
                    <div class="preview-sidebar"></div>
                    <div class="preview-main"></div>
                  </div>
                  <span class="nav-label">侧边栏</span>
                </div>
                <div
                  class="nav-option"
                  :class="{ active: localSettings.menuNavigation === 'top' }"
                  @click="localSettings.menuNavigation = 'top'; handleMenuNavigationChange('top')"
                >
                  <div class="nav-preview top-preview">
                    <div class="preview-header"></div>
                    <div class="preview-main"></div>
                  </div>
                  <span class="nav-label">顶部</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-card">
          <div class="card-header">
            <i class="el-icon-brush card-icon"></i>
            <h3 class="section-title">主题风格</h3>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <span class="setting-label">主题风格</span>
              <div class="theme-options">
                <div
                  class="theme-option"
                  :class="{ active: localSettings.themeStyle === 'light' }"
                  @click="localSettings.themeStyle = 'light'; handleThemeStyleChange('light')"
                >
                  <div class="theme-preview light-preview">
                    <div class="preview-bar"></div>
                    <div class="preview-body"></div>
                  </div>
                  <span class="theme-label">浅色</span>
                </div>
                <div
                  class="theme-option"
                  :class="{ active: localSettings.themeStyle === 'dark' }"
                  @click="localSettings.themeStyle = 'dark'; handleThemeStyleChange('dark')"
                >
                  <div class="theme-preview dark-preview">
                    <div class="preview-bar"></div>
                    <div class="preview-body"></div>
                  </div>
                  <span class="theme-label">深色</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-card">
          <div class="card-header">
            <i class="el-icon-collection card-icon"></i>
            <h3 class="section-title">主题颜色</h3>
          </div>
          <div class="card-content">
            <div class="setting-item">
              <span class="setting-label">主题颜色</span>
              <div class="color-picker-container">
                <div
                  v-for="color in themeColors"
                  :key="color.value"
                  class="color-item-wrapper"
                  @click="handleThemeColorChange(color.value)"
                  :title="color.name"
                >
                  <div
                    class="color-item"
                    :class="{ active: localSettings.themeColor === color.value }"
                    :style="{ backgroundColor: color.value }"
                  >
                    <i v-if="localSettings.themeColor === color.value" class="el-icon-check check-icon"></i>
                  </div>
                  <span class="color-name">{{ color.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-card">
          <div class="card-header">
            <i class="el-icon-setting card-icon"></i>
            <h3 class="section-title">其他设置</h3>
          </div>
          <div class="card-content">
            <div class="setting-item-row">
              <div class="setting-info">
                <i class="el-icon-s-grid setting-icon"></i>
                <div class="setting-text">
                  <span class="setting-label">灰色模式</span>
                  <span class="setting-desc">以灰色调显示页面</span>
                </div>
              </div>
              <el-switch
                v-model="localSettings.grayMode"
                @change="handleGrayModeChange"
              ></el-switch>
            </div>
            <div class="setting-item-row">
              <div class="setting-info">
                <i class="el-icon-tickets setting-icon"></i>
                <div class="setting-text">
                  <span class="setting-label">显示水印</span>
                  <span class="setting-desc">页面显示用户水印</span>
                </div>
              </div>
              <el-switch
                v-model="localSettings.showWatermark"
                @change="handleShowWatermarkChange"
              ></el-switch>
            </div>
          </div>
        </div>
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
    },
    sidebarBgColor() {
      return this.localSettings.themeStyle === 'dark' ? '#0f0f23' : '#304156'
    },
    sidebarTextColor() {
      return this.localSettings.themeStyle === 'dark' ? '#bfcbd9' : '#bfcbd9'
    },
    sidebarActiveColor() {
      return this.localSettings.themeColor
    },
    headerBgColor() {
      return this.localSettings.themeStyle === 'dark' ? '#16213e' : '#ffffff'
    },
    headerTextColor() {
      return this.localSettings.themeStyle === 'dark' ? '#e0e0e0' : '#606266'
    },
    headerActiveColor() {
      return this.localSettings.themeColor
    },
    settingsDrawerClass() {
      return `settings-drawer ${this.localSettings.themeStyle === 'dark' ? 'theme-dark' : 'theme-light'}`
    }
  },
  created() {
    this.initSettings()
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    ...mapActions(['toggleSideBar', 'toggleFullscreen', 'logout', 'setMenuNavigation', 'setThemeStyle', 'setThemeColor', 'setGrayMode', 'setShowWatermark']),
    initSettings() {
      this.localSettings = {
        menuNavigation: this.menuNavigation,
        themeStyle: this.themeStyle,
        themeColor: this.themeColor,
        grayMode: this.grayMode,
        showWatermark: this.showWatermark
      }
      this.applyThemeColor(this.localSettings.themeColor)
      this.applyThemeStyle(this.localSettings.themeStyle)
      if (this.localSettings.grayMode) {
        this.applyGrayMode(true)
      }
      if (this.localSettings.showWatermark) {
        this.applyWatermark(true)
      }
    },
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

.sidebar-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.main-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.top-nav-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px !important;
  line-height: 60px !important;
}

.top-nav-left {
  display: flex;
  align-items: center;
}

.logo-container-top {
  margin-right: 30px;
}

.logo-container-top .logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-color, #409EFF);
}

.top-nav-menu {
  border-bottom: none;
}

.top-nav-right {
  display: flex;
  align-items: center;
}

.breadcrumb-container-top {
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.settings-container {
  padding: 10px 5px;
}

.settings-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%);
  border-bottom: 1px solid #f0f2f5;
}

.card-icon {
  font-size: 20px;
  color: var(--theme-color, #409EFF);
  margin-right: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-content {
  padding: 16px 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.navigation-options {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.nav-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.nav-option:hover {
  border-color: #c0c4cc;
  background: #fafafa;
}

.nav-option.active {
  border-color: var(--theme-color, #409EFF);
  background: rgba(64, 158, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.nav-preview {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}

.sidebar-preview {
  flex-direction: row;
}

.sidebar-preview .preview-sidebar {
  width: 20px;
  background: #304156;
}

.sidebar-preview .preview-main {
  flex: 1;
  background: #f0f2f5;
}

.top-preview {
  flex-direction: column;
}

.top-preview .preview-header {
  height: 12px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.top-preview .preview-main {
  flex: 1;
  background: #f0f2f5;
}

.nav-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.nav-option.active .nav-label {
  color: var(--theme-color, #409EFF);
  font-weight: 500;
}

.theme-options {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.theme-option:hover {
  border-color: #c0c4cc;
  background: #fafafa;
}

.theme-option.active {
  border-color: var(--theme-color, #409EFF);
  background: rgba(64, 158, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.theme-preview {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
}

.light-preview {
  background: #fff;
}

.light-preview .preview-bar {
  height: 12px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.light-preview .preview-body {
  flex: 1;
  background: #f0f2f5;
}

.dark-preview {
  background: #1a1a2e;
}

.dark-preview .preview-bar {
  height: 12px;
  background: #16213e;
  border-bottom: 1px solid #2a3a5a;
}

.dark-preview .preview-body {
  flex: 1;
  background: #0f0f23;
}

.theme-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.theme-option.active .theme-label {
  color: var(--theme-color, #409EFF);
  font-weight: 500;
}

.color-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-item-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-item-wrapper:hover {
  transform: translateY(-2px);
}

.color-item {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-item.active {
  border-color: #303133;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.check-icon {
  color: #fff;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.color-name {
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
}

.color-item-wrapper:hover .color-name {
  color: #606266;
}

.setting-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f2f5;
}

.setting-item-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info {
  display: flex;
  align-items: center;
}

.setting-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-color, #409EFF);
  font-size: 18px;
  margin-right: 12px;
}

.setting-text {
  display: flex;
  flex-direction: column;
}

.setting-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.settings-drawer .el-drawer__header {
  margin-bottom: 16px;
  padding: 20px 20px 0;
}

.settings-drawer .el-drawer__body {
  padding: 0 20px 20px;
}

.settings-drawer .el-drawer__header span {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>

<style>
:root {
  --theme-color: #409EFF;
}

.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.layout-container {
  height: 100vh;
}

.layout-container.theme-dark {
  background-color: #1a1a2e;
  color: #e0e0e0;
}

.layout-container.theme-dark .main-header,
.layout-container.theme-dark .top-nav-header {
  background-color: #16213e !important;
}

.layout-container.theme-dark .sidebar-aside {
  background-color: #0f0f23 !important;
}

.layout-container.theme-dark .el-menu {
  background-color: #0f0f23 !important;
}

.layout-container.theme-dark .setting-label,
.layout-container.theme-dark .section-title {
  color: #e0e0e0;
}

.layout-container.theme-dark .search-results {
  background-color: #16213e;
  border-color: #2a3a5a;
}

.layout-container.theme-dark .search-result-item:hover {
  background-color: #2a3a5a;
}

.layout-container.theme-dark .search-result-item i {
  color: #e0e0e0;
}

.settings-drawer.theme-dark {
  background-color: #1a1a2e;
}

.settings-drawer.theme-dark .el-drawer__header span {
  color: #e0e0e0;
}

.settings-drawer.theme-dark .settings-card {
  background: #16213e;
  border: 1px solid #2a3a5a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.settings-drawer.theme-dark .settings-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.settings-drawer.theme-dark .card-header {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  border-bottom: 1px solid #2a3a5a;
}

.settings-drawer.theme-dark .section-title {
  color: #e0e0e0;
}

.settings-drawer.theme-dark .setting-label {
  color: #a0a0a0;
}

.settings-drawer.theme-dark .nav-option {
  background: #1a1a2e;
  border-color: #2a3a5a;
}

.settings-drawer.theme-dark .nav-option:hover {
  border-color: #3a4a6a;
  background: #1e1e3a;
}

.settings-drawer.theme-dark .nav-option.active {
  border-color: var(--theme-color, #409EFF);
  background: rgba(64, 158, 255, 0.1);
}

.settings-drawer.theme-dark .theme-option {
  background: #1a1a2e;
  border-color: #2a3a5a;
}

.settings-drawer.theme-dark .theme-option:hover {
  border-color: #3a4a6a;
  background: #1e1e3a;
}

.settings-drawer.theme-dark .theme-option.active {
  border-color: var(--theme-color, #409EFF);
  background: rgba(64, 158, 255, 0.1);
}

.settings-drawer.theme-dark .setting-item-row {
  border-bottom: 1px solid #2a3a5a;
}

.settings-drawer.theme-dark .setting-icon {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%);
}

.settings-drawer.theme-dark .setting-desc {
  color: #707070;
}

.settings-drawer.theme-dark .color-name {
  color: #707070;
}

.settings-drawer.theme-dark .color-item-wrapper:hover .color-name {
  color: #a0a0a0;
}

.el-menu--horizontal > .el-menu-item.is-active {
  background-color: transparent !important;
  color: var(--theme-color) !important;
  border-bottom: 2px solid var(--theme-color) !important;
}

.el-radio__input.is-checked .el-radio__inner {
  border-color: var(--theme-color);
  background: var(--theme-color);
}

.el-radio__input.is-checked + .el-radio__label {
  color: var(--theme-color);
}

.el-switch.is-checked .el-switch__core {
  border-color: var(--theme-color);
  background-color: var(--theme-color);
}

.el-button--primary {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
}

.el-button--primary:hover,
.el-button--primary:focus {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
  opacity: 0.9;
}

.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--theme-color);
}

.el-breadcrumb__inner.is-link,
.el-breadcrumb__inner a {
  color: var(--theme-color);
}
</style>
