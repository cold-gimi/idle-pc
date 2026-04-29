<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">二手闲置管理端</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            @keyup.enter.native="handleLogin"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%;">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入用户名' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    ...mapActions(['login']),
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.login(this.loginForm)
            .then(() => {
              this.$message.success('登录成功')
              this.$router.push({ path: '/' })
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
