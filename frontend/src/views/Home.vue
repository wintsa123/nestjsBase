<template>
  <div class="home-container">
    <el-row justify="center" align="middle" class="welcome-section">
      <el-col :span="24" class="text-center">
        <h1>电子族谱系统</h1>
        <p class="subtitle">记录和管理您的家族历史</p>
        
        <div class="action-buttons" v-if="!userStore.token">
          <el-button type="primary" @click="$router.push('/login')" size="large">
            登录
          </el-button>
          <el-button @click="$router.push('/register')" size="large">
            注册
          </el-button>
        </div>
        
        <div v-else>
          <el-button type="primary" @click="$router.push('/family-tree')" size="large">
            进入族谱
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-row class="features-section">
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              家族成员管理
            </div>
          </template>
          轻松添加和管理家族成员信息，记录重要的生平事迹。
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              关系图谱
            </div>
          </template>
          直观展示家族成员之间的关系连接，轻松查看家族脉络。
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="feature-card">
          <template #header>
            <div class="card-header">
              <el-icon><Share /></el-icon>
              协作共建
            </div>
          </template>
          邀请家族成员共同参与，共同维护和完善家族历史。
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { User, Connection, Share } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.home-container {
  padding: 40px;
}

.welcome-section {
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin-bottom: 40px;
  padding: 60px 20px;
}

.text-center {
  text-align: center;
}

h1 {
  font-size: 3em;
  color: #303133;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 1.5em;
  color: #606266;
  margin-bottom: 40px;
}

.action-buttons {
  .el-button {
    margin: 0 10px;
  }
}

.features-section {
  margin-top: 40px;
  .el-col {
    padding: 0 15px;
  }
}

.feature-card {
  height: 100%;
  .card-header {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    
    .el-icon {
      margin-right: 8px;
      font-size: 20px;
    }
  }
}
</style>
