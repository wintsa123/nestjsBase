<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="手机号或者邮箱" prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
            登录
          </el-button>
        </el-form-item>

        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {  reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '../api/user/user'
import { useRequest } from 'alova/client'

const { loading, send: loginFn }: any = useRequest((params) => login(params),{immediate: false})

const loginForm = reactive({
  username: '',
  password: ''
})
const validateEmailOrPhone = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入手机号或者邮箱'));
    return;
  }

  // 手机号正则表达式（以中国大陆手机号为例）
  const phoneRegex = /^1[3-9]\d{9}$/;

  // 邮箱正则表达式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (phoneRegex.test(value) || emailRegex.test(value)) {
    callback(); // 验证通过
  } else {
    callback(new Error('请输入有效的手机号或邮箱')); // 验证失败
  }
};
const rules = {
  username: [{ required: true, message: '请输入手机号或者邮箱', trigger: 'blur' },{ validator: validateEmailOrPhone, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    const phoneRegex = /^1[3-9]\d{9}$/;

// 邮箱正则表达式
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!phoneRegex.test(loginForm.username) && !emailRegex.test(loginForm.username)) {
  throw new Error('请输入有效的手机号或邮箱')
}
    const params = {
      [loginForm.username.includes('@') ? 'email' : 'phone']: loginForm.username,
      password: loginForm.password
    };
    loginFn(params)
  } catch (error:any) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-button {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}
</style>
