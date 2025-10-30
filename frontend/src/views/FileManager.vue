<template>
       <el-card class="plan-card"         @contextmenu.prevent=""
>
  <div class="file-manager" @click="closeContextMenu">
    <div class="header">
      <div class="header-top">
        <h1>文件管理器</h1>
        <div class="header-actions">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="list">列表模式</el-radio-button>
            <el-radio-button label="grid">平铺模式</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleCreateFolder">
            <el-icon><FolderAdd /></el-icon>
            新建文件夹
          </el-button>
        </div>
      </div>
      
      <!-- 面包屑导航 -->
      <div class="breadcrumb-area">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item @click="navigateToPath(0)" class="breadcrumb-clickable">
            <el-icon><HomeFilled /></el-icon>
            根目录
          </el-breadcrumb-item>
          <el-breadcrumb-item 
            v-for="(item, index) in currentPath" 
            :key="index"
            @click="navigateToPath(index + 1)"
            :class="{ 'breadcrumb-clickable': index < currentPath.length - 1 }"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-if="viewMode === 'list'" class="list-view"   @contextmenu.prevent="handleContextMenu($event)">
      <div
        v-for="item in sortedFiles"
        :key="item.id"
        :draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragover="handleDragOver"
        @drop="handleDrop($event, item)"
        @contextmenu.prevent="handleContextMenu($event, item)"
        @dblclick="handleOpen(item)"
        :class="['file-item', { 'dragging': draggedItem?.id === item.id }]"
      >
        <div class="file-content">
          <el-icon :size="24" :color="item.type === 'folder' ? '#f59e0b' : '#3b82f6'">
            <Folder v-if="item.type === 'folder'" />
            <Document v-else />
          </el-icon>
          
          <el-input
            v-if="editingId === item.id"
            v-model="editingName"
            ref="editInput"
            @blur="confirmRename"
            @keyup.enter="confirmRename"
            @keyup.esc="editingId = null"
            size="small"
            class="rename-input"
          />
          <span v-else class="file-name">{{ item.name }}</span>
          
          <span class="sort-order">#{{ item.sortOrder }}</span>
        </div>

        <el-button
          text
          @click.stop="handleContextMenu($event, item)"
          class="more-btn"
        >
          <el-icon><MoreFilled /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 平铺模式 -->
    <div v-else class="grid-view"   @contextmenu.prevent="">
      <div
        v-for="item in sortedFiles"
        :key="item.id"
        :draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragover="handleDragOver"
        @drop="handleDrop($event, item)"
        @contextmenu.prevent="handleContextMenu($event, item)"
        @dblclick="handleOpen(item)"
        :class="['grid-item', { 'dragging': draggedItem?.id === item.id }]"
      >
        <div class="grid-icon">
          <el-icon :size="64" :color="item.type === 'folder' ? '#f59e0b' : '#3b82f6'">
            <Folder v-if="item.type === 'folder'" />
            <Document v-else />
          </el-icon>
          <span class="grid-sort-order">#{{ item.sortOrder }}</span>
        </div>
        
        <el-input
          v-if="editingId === item.id"
          v-model="editingName"
          ref="editInput"
          @blur="confirmRename"
          @keyup.enter="confirmRename"
          @keyup.esc="editingId = null"
          size="small"
          class="grid-rename-input"
        />
        <div v-else class="grid-name">{{ item.name }}</div>
      </div>
    </div>

    <!-- 右键菜单 -->
  <div
  v-if="contextMenu.show"
  class="context-menu"
  :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
  @click.stop
>
  <template v-for="(item, index) in menuItems" :key="index">
    <!-- 分割线 -->
    <el-divider
      v-if="item.type === 'divider'"
      style="margin: 4px 0"
    />

    <!-- 普通菜单项 -->
    <div
      v-else
      class="menu-item"
      :class="[{ danger: item.danger, disabled: item.disabled }]"
      @click="!item.disabled && item.onClick(contextMenu.item)"
    >
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.label }}</span>
    </div>
  </template>
</div>

  </div></el-card>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { 
  Folder, 
  Document, 
  MoreFilled, 
  FolderAdd, 
  Edit, 
  Delete, 
  View,
  CopyDocument,
  DocumentCopy,
  Sort,KnifeFork,
  HomeFilled,UploadFilled
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
const menuItems = ref([])



const viewMode = ref('list');

// 当前路径 - 用于面包屑导航
const currentPath = ref([]);

// 所有文件数据（模拟根目录和子目录）
const allFiles = ref({
  '/': [
    { id: 1, name: '文档', type: 'folder', sortOrder: 1, children: [] },
    { id: 2, name: '图片', type: 'folder', sortOrder: 2, children: [] },
    { id: 3, name: 'README.md', type: 'file', sortOrder: 3 },
    { id: 4, name: '配置文件.json', type: 'file', sortOrder: 4 },
    { id: 5, name: '视频', type: 'folder', sortOrder: 5, children: [] },
    { id: 6, name: '音乐', type: 'folder', sortOrder: 6, children: [] },
    { id: 7, name: 'package.json', type: 'file', sortOrder: 7 },
    { id: 8, name: 'index.html', type: 'file', sortOrder: 8 },
  ],
  '/文档': [
    { id: 11, name: '工作文档.docx', type: 'file', sortOrder: 1 },
    { id: 12, name: '个人笔记.txt', type: 'file', sortOrder: 2 },
  ],
  '/图片': [
    { id: 21, name: '照片', type: 'folder', sortOrder: 1, children: [] },
    { id: 22, name: 'avatar.png', type: 'file', sortOrder: 2 },
  ],
});

// 当前显示的文件列表
const files = ref(allFiles.value['/']);

const contextMenu = ref({ show: false, x: 0, y: 0, item: null });
const editingId = ref(null);
const editingName = ref('');
const draggedItem = ref(null);
const clipboard = ref(null);
const editInput = ref(null);

const sortedFiles = computed(() => {
  return [...files.value].sort((a, b) => a.sortOrder - b.sortOrder);
});

// 获取当前路径字符串
const getCurrentPathString = () => {
  if (currentPath.value.length === 0) return '/';
  return '/' + currentPath.value.map(p => p.name).join('/');
};

// 导航到指定路径
const navigateToPath = (index) => {
  if (index === 0) {
    // 返回根目录
    currentPath.value = [];
    files.value = allFiles.value['/'];
  } else {
    // 返回到某个上级目录
    currentPath.value = currentPath.value.slice(0, index);
    const pathString = getCurrentPathString();
    files.value = allFiles.value[pathString] || [];
  }
  // TODO: 调用API加载对应路径的文件
  console.log('导航到路径:', getCurrentPathString());
};

const closeContextMenu = () => {
  contextMenu.value = { show: false, x: 0, y: 0, item: null };
};
const handlePaste = () => {
  if (clipboard.value) {
    // TODO: 调用粘贴API
    console.log('粘贴:', clipboard.value, '到路径:', getCurrentPathString());
    ElMessage.success('粘贴成功');
    if (clipboard.value.action === 'cut') {
      clipboard.value = null;
    }
  }
  closeContextMenu();
};
const handleContextMenu = (e, item) => {
  e.preventDefault()
  e.stopPropagation()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    item,
  }
  // 动态选择菜单
  menuItems.value = item ? fullMenu : blankMenu
}

const handleRename = (item) => {
  editingId.value = item.id;
  editingName.value = item.name;
  closeContextMenu();
  nextTick(() => {
    const input = editInput.value;
    if (input) {
      if (Array.isArray(input)) {
        input[0]?.focus();
      } else {
        input.focus();
      }
    }
  });
};

const confirmRename = () => {
  if (editingName.value.trim()) {
    // TODO: 调用重命名API
    console.log('重命名:', editingId.value, editingName.value);
    files.value = files.value.map(f => 
      f.id === editingId.value ? { ...f, name: editingName.value } : f
    );
    ElMessage.success('重命名成功');
  }
  editingId.value = null;
};

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${item.name}" 吗?`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // TODO: 调用删除API
    console.log('删除:', item, '路径:', getCurrentPathString());
    files.value = files.value.filter(f => f.id !== item.id);
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
  closeContextMenu();
};

const handleOpen = (item) => {
  if (item.type === 'folder') {
    // 进入文件夹
    currentPath.value.push({ id: item.id, name: item.name });
    const pathString = getCurrentPathString();
    
    // 加载文件夹内容
    if (allFiles.value[pathString]) {
      files.value = allFiles.value[pathString];
    } else {
      files.value = [];
    }
    
    // TODO: 调用API加载文件夹内容
    console.log('打开文件夹:', item, '路径:', pathString);
  } else {
    // TODO: 打开文件
    console.log('打开文件:', item, '路径:', getCurrentPathString());
    ElMessage.info(`打开文件: ${item.name}`);
  }
  closeContextMenu();
};

const handleCreateFolder = () => {
  const newFolder = {
    id: Date.now(),
    name: '新建文件夹',
    type: 'folder',
    sortOrder: files.value.length + 1,
    children: []
  };
  // TODO: 调用创建文件夹API
  console.log('创建文件夹:', newFolder, '路径:', getCurrentPathString());
  files.value.push(newFolder);
  ElMessage.success('创建文件夹成功');
  closeContextMenu();
};

const handleCopy = (item) => {
  clipboard.value = { item, action: 'copy' };
  console.log('复制:', item);
  ElMessage.success('已复制');
  closeContextMenu();
};

const handleCut = (item) => {
  clipboard.value = { item, action: 'cut' };
  console.log('剪切:', item);
  ElMessage.success('已剪切');
  closeContextMenu();
};



const handleSetSortOrder = async (item) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入排序号', '设置排序', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: item.sortOrder.toString(),
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的数字',
    });
    
    if (value) {
      // TODO: 调用设置排序API
      console.log('设置排序:', item.id, value, '路径:', getCurrentPathString());
      files.value = files.value.map(f => 
        f.id === item.id ? { ...f, sortOrder: parseInt(value) } : f
      );
      ElMessage.success('排序设置成功');
    }
  } catch {
    // 用户取消
  }
  closeContextMenu();
};

const handleDragStart = (e, item) => {
  draggedItem.value = item;
  e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (e, targetItem) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (draggedItem.value && draggedItem.value.id !== targetItem.id) {
    if (targetItem.type === 'folder') {
      // TODO: 调用移动到文件夹API
      console.log('移动到文件夹:', draggedItem.value, '→', targetItem, '当前路径:', getCurrentPathString());
      ElMessage.success(`已移动到 ${targetItem.name}`);
    } else {
      // 交换排序
      const draggedIndex = files.value.findIndex(f => f.id === draggedItem.value.id);
      const targetIndex = files.value.findIndex(f => f.id === targetItem.id);
      
      const temp = files.value[draggedIndex].sortOrder;
      files.value[draggedIndex].sortOrder = files.value[targetIndex].sortOrder;
      files.value[targetIndex].sortOrder = temp;
      
      // TODO: 调用保存排序API
      console.log('更新排序:', files.value.map(f => ({ id: f.id, sortOrder: f.sortOrder })), '路径:', getCurrentPathString());
      ElMessage.success('排序已更新');
    }
  }
  draggedItem.value = null;
};
const handleUpload = (item) => {
  console.log('上传', item);
  closeContextMenu();
};
const blankMenu = [
  {
    label: '粘贴',
    icon: DocumentCopy,
    onClick: handlePaste,
    get disabled() {
      return !clipboard.value
    },
  },
  { label: '上传', icon: UploadFilled, onClick: handleUpload },
  { label: '新建文件夹', icon: FolderAdd, onClick: handleCreateFolder },
]
// 👉 全部菜单项定义
const fullMenu = [
  { label: '打开', icon: View, onClick: handleOpen },
  { label: '重命名', icon: Edit, onClick: handleRename },
  { label: '设置排序号', icon: Sort, onClick: handleSetSortOrder },
  { type: 'divider' },
  { label: '复制', icon: CopyDocument, onClick: handleCopy },
  { label: '剪切', icon: KnifeFork, onClick: handleCut },
  {
    label: '粘贴',
    icon: DocumentCopy,
    onClick: handlePaste,
    get disabled() {
      return !clipboard.value
    },
  },
  { label: '新建文件夹', icon: FolderAdd, onClick: handleCreateFolder },
  { type: 'divider' },
  { label: '删除', icon: Delete, onClick: handleDelete, danger: true },
]

</script>

<style scoped>
.file-manager {
  min-height: 100vh;
  background-color: #f5f5f5;
  /* padding: 20px; */
}

.header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.breadcrumb-area {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.breadcrumb-clickable {
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-clickable:hover {
  color: #409eff;
}

/* 列表模式 */
.list-view {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: move;
  transition: all 0.2s;
  background: white;
}

.file-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.file-item.dragging {
  opacity: 0.5;
  border-color: #3b82f6;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-name {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.rename-input {
  flex: 1;
  max-width: 400px;
}

.sort-order {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-btn {
  color: #6b7280;
}

/* 平铺模式 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
  background: white;
  position: relative;
}

.grid-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grid-item.dragging {
  opacity: 0.5;
  border-color: #3b82f6;
}

.grid-icon {
  position: relative;
  margin-bottom: 12px;
}

.grid-sort-order {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.grid-name {
  text-align: center;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
  word-break: break-all;
  line-height: 1.4;
  max-width: 100%;
}

.grid-rename-input {
  width: 100%;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 4px;
  z-index: 9999;
  min-width: 180px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  color: #374151;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background: transparent;
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: #fee2e2;
}

.menu-item span {
  font-size: 14px;
}
</style>