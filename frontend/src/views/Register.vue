<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" class="register-button">
            注册
          </el-button>
        </el-form-item>

        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { register } from '@/api/user/user'
import { useRequest } from 'alova/client'

const { loading, send: registerFn }: any = useRequest((params) => register(params), { immediate: false })

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
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
  username: [
    { required: true, message: '请输入手机号或者邮箱', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { validator: validateEmailOrPhone, trigger: 'blur' }

  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {

    const phoneRegex = /^1[3-9]\d{9}$/;

    // 邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!phoneRegex.test(registerForm.username) && !emailRegex.test(registerForm.username)) {
      throw new Error('请输入有效的手机号或邮箱')
    }

    if (registerForm.confirmPassword !== registerForm.password) {
      throw new Error('两次输入密码不一致!')
    }
    const params = {
      [registerForm.username.includes('@') ? 'email' : 'phone']: registerForm.username,
      password: registerForm.password
    };
    registerFn(params)
  } catch (error: any) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.register-card {
  width: 400px;
  padding: 20px;
}

.register-button {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}
</style>
