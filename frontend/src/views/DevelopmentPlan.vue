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
      // 对子节点进行排序
      row.children.sort((a: any, b: any) => {
        const statusOrder = { '完成': 1, '进行中': 2, '未开始': 3 }; // 定义排序优先级
        //@ts-ignore
        return statusOrder[a.status] - statusOrder[b.status];
      });

      // 更新父节点状态
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
        name: '用户无感刷新以及用户退出的token失效',
        status: '完成',
        plannedTime: '2025/2/2',
        developer: 'wintsa',
        completionTime: '2025/2/2'
      },
      {
        id: '1-5',
        name: '更新用户的基础信息',
        status: '未开始',
        plannedTime: '',
        developer: 'wintsa',
        completionTime: ''
      },
      {
        id: '1-6',
        name: '正式上线后，刷新token改用httponly,cookie传输',
        status: '未开始',
        plannedTime: '',
        developer: 'wintsa',
        completionTime: ''
      }
    ]
  },
   {
    id: '2',
    name: '文档管理',
    status: '',
    plannedTime: '',
    developer: 'wintsa',
    completionTime: '',
    children: [
      {
        id: '1-1',
        name: '文档上传',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      },
      {
        id: '1-2',
        name: '文档替换',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      },
     ,
      {
        id: '1-3',
        name: '文档重命名',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      },  {
        id: '1-3',
        name: '文档分类',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      }, {
        id: '1-3',
        name: '文档删除',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      },
   , {
        id: '1-3',
        name: '文档下载',
        status: '进行中',
        plannedTime: '2025/10/30',
        developer: 'wintsa',
        completionTime: ''
      },
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
        name: '通过微信/短信/邮箱方式发送共享连接',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      }
    ]
  },


  {
    id: '8',
    name: 'UI设计美化优化',
    status: '',
    plannedTime: '',
    developer: 'wintsa',
    completionTime: '',
    children: [
      {
        id: '8-1',
        name: 'header栏',
        status: '进行中',
        plannedTime: '2025/2/5',
        developer: 'wintsa',
        completionTime: ''
      },
      {
        id: '8-2',
        name: 'aside栏的颜色搭配',
        status: '完成',
        plannedTime: '2025/2/5',
        developer: 'wintsa',
        completionTime: '2025/2/19'
      },
      {
        id: '8-3',
        name: '注册和登录页面切换的动画过渡效果',
        status: '未开始',
        plannedTime: '',
        developer: '',
        completionTime: ''
      },
      {
        id: '8-5',
        name: 'aside栏的收缩功能',
        status: '完成',
        plannedTime: '2025/2/4',
        developer: 'wintsa',
        completionTime: '2025/2/11'
      },]
  }]).sort((a: any, b: any) => {
        const statusOrder = { '完成': 1, '进行中': 2, '未开始': 3 }; // 定义排序优先级
        //@ts-ignore
        return statusOrder[a.status] - statusOrder[b.status];
      }))


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
