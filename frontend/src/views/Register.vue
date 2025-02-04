<template>
  <div class="register-container">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <!-- 图片居中 -->
        <img class="mx-auto h-auto w-1/2" src="@/assets/logo.svg" alt="Your Company" style="margin: 0 auto;">

        <!-- 标题在图片下方 -->
        <h2 class="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">注册您的帐户</h2>
      </div>
    <el-card class="register-card">
      
      <el-form :model="form" :rules="rules" ref="formRef">

        <el-form-item prop="realname" label="真实姓名" label-position="top">
          <el-input v-model="form.realname" placeholder="真实姓名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="sex" label="性别" label-position="top">

          <el-radio-group v-model="form.sex" >
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="username" label="账号" label-position="top">
          <el-input v-model="form.username" placeholder="手机号或是邮箱" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password" label="密码" label-position="top">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>

        <el-form-item prop="confirmPassword" label="确认密码" label-position="top">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock"
            class="no-cursor-on-icon" />
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
import { useForm, useRequest } from 'alova/client'




const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
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
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  realname: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
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
const {
  // 提交状态
  loading,

  // 响应式的表单数据，内容由initialForm决定
  form,

  // 提交数据函数
  send: registerFn,

  // 提交成功回调绑定
  onSuccess,

  // 提交失败回调绑定
  onError,

  // 提交完成回调绑定
  onComplete
} = useForm(
  formData => {
    // 可以在此转换表单数据并提交
    const params = {
      [formData.username.includes('@') ? 'email' : 'phone']: formData.username,
      password: formData.password,
      realname: formData.realname,
      sex: formData.sex
    };
    return register(params);
  },
  {
    // 初始化表单数据
    initialForm: {
      username: '',
      password: '',
      confirmPassword: '',
      realname: '',
      sex: '',
    }
  }
);
const handleRegister = async () => {
  try {

    const phoneRegex = /^1[3-9]\d{9}$/;

    // 邮箱正则表达式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!phoneRegex.test(form.value.username) && !emailRegex.test(form.value.username)) {
      throw new Error('请输入有效的手机号或邮箱')
    }

    if (form.value.confirmPassword !== form.value.password) {
      throw new Error('两次输入密码不一致!')
    }
   
    registerFn()
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

.no-cursor-on-icon .el-input__prefix {
  pointer-events: none;
  /* 禁用图标区域的点击事件 */
}
</style>
