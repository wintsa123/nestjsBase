<template>
  <div class="development-plan">
    <el-card class="plan-card">
      <template #header>
        <div class="card-header">
          <h2>开发计划</h2>
        </div>
      </template>

      <el-table :data="tableData" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" border
        style="width: 100%">
        <el-table-column prop="name" label="开发需求名称">
        </el-table-column>
        <el-table-column prop="status" label="开发状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plannedTime" label="安排时间" width="180">
        </el-table-column>
        <el-table-column prop="developer" label="开发人员">
        </el-table-column>
        <el-table-column prop="completionTime" label="完成时间" width="180">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface DevelopmentTask {
  id: string
  name: string
  status: '未开始' | '进行中' | '完成'
  plannedTime: string
  developer: string
  completionTime: string
  children?: DevelopmentTask[]
}
function updateParentStatus(rows: any[]) {
  rows.forEach(row => {
    if (row.children && row.children.length > 0) {
      const allCompleted = row.children.every((child: any) => child.status === '完成');
      const allInProgress = row.children.every((child: any) => child.status === '进行中');
      const hasCompleted = row.children.some((child: any) => child.status === '完成');
      const hasInProgress = row.children.some((child: any) => child.status === '进行中');

      if (allCompleted) {
        row.status = '完成';
      } else if (allInProgress) {
        row.status = '进行中';
      } else if (hasCompleted || hasInProgress) {
        row.status = '进行中'; // 子节点状态不一致时，父节点设置为“进行中”
      } else {
        row.status = '未开始';
      }
    }
  });
  return rows;
}
const tableData = ref<DevelopmentTask[]>(updateParentStatus([
  {
    id: '1',
    name: '用户认证系统',
    status: '',
    plannedTime: '',
    developer: 'wintsa',
    completionTime: '',
    children: [
      {
        id: '1-1',
        name: '用户注册',
        status: '完成',
        plannedTime: '2025/2/1',
        developer: 'wintsa',
        completionTime: '2025/2/2'
      },
      {
        id: '1-2',
        name: '用户登录',
        status: '完成',
        plannedTime: '2025/2/2',
        developer: 'wintsa',
        completionTime: '2025/2/2'
      },
      {
        id: '1-3',
        name: '邀请用户加入族谱',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '1-4',
        name: '用户无感刷新以及用户退出的token失效',
        status: '完成',
        plannedTime: '2025/2/2',
        developer: 'wintsa',
        completionTime: '2025/2/2'
      },
      {
        id: '1-5',
        name: '更新用户的名称信息',
        status: '未开始',
        plannedTime: '',
        developer: 'wintsa',
        completionTime: ''
      }
    ]
  },
  {
    id: '2',
    name: '族谱管理',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: [
      {
        id: '2-1',
        name: '添加/修改家族成员信息',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '2-2',
        name: '显示成员间的关系连接',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '2-3',
        name: '显示称谓关系',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '2-4',
        name: '自定义修改称谓',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '2-5',
        name: '族谱分为主线和支线展示',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      }
    ]
  },
  {
    id: '3',
    name: '通知系统',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: [
      {
        id: '3-1',
        name: '通过微信/短信/邮箱方式发送通知',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '3-2',
        name: '喜事/坏事通知，群发通知',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      }
    ]
  },
  {
    id: '4',
    name: '社区系统',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: [
      {
        id: '4-1',
        name: '人生总结和野史功能',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      }
    ]
  },
  {
    id: '5',
    name: '族史功能',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: [
      {
        id: '5-1',
        name: '记录个人对家族的贡献',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '5-2',
        name: '总结个人对家族的贡献，家族兴旺或衰败',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      }
    ]
  },
  {
    id: '6',
    name: '与已故之人视频聊天',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: []
  },
  {
    id: '7',
    name: 'AI人脸相册',
    status: '未开始',
    plannedTime: '',
    developer: '',
    completionTime: '',
    children: []
  }
]))


const getStatusType = (status: string) => {
  switch (status) {
    case '完成':
      return 'success'
    case '进行中':
      return 'warning'
    case '未开始':
      return 'info'
    default:
      return ''
  }
}
</script>

<style scoped>
.development-plan {
  padding: 20px;
}

.plan-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
