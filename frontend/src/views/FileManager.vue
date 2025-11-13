<template>
  <div class="file-manager" @click="closeContextMenu" @contextmenu.prevent="handleEmptyContextMenu">
    <div class="header">
      <div class="header-top">
        <h1>文件管理器</h1>
        <div class="header-actions">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="list">列表模式</el-radio-button>
            <el-radio-button label="grid">平铺模式</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleCreateFolder">
            <el-icon>
              <FolderAdd />
            </el-icon>
            新建文件夹
          </el-button>
        </div>
      </div>

      <!-- 面包屑导航 -->
      <div class="breadcrumb-area">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item @click="navigateToPath(0)" class="breadcrumb-clickable">
            <div class="breadcrumb-home"> <el-icon>
                <HomeFilled />
              </el-icon><span v-if="currentPath.length > 0">{{ currentPath[0].name }}</span></div>

          </el-breadcrumb-item>
          <el-breadcrumb-item v-for="(item, index) in currentPath.slice(1)" :key="index"
            @click="index + 1 < currentPath.length - 1 && navigateToPath(index + 1)"
            :class="{ 'breadcrumb-clickable': index < currentPath.length - 1 }">
            {{ item.name }}
          </el-breadcrumb-item>

        </el-breadcrumb>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-if="directoryFiles && directoryFiles.sub.length > 0">
      <div v-if="viewMode === 'list'" class="list-view" @contextmenu.prevent="handleEmptyContextMenu">
        <VueDraggable v-model="directoryFiles.sub" ghostClass="ghost" :animation="150" @start="onDragStart"
          @end="onDragEnd" @update="onDragChange">
          <div v-for="item in directoryFiles.sub" :key="item.id" @contextmenu.prevent="handleContextMenu($event, item)"
            @dblclick="handleOpen(item)" :class="['file-item', { 'drag-over-folder': dragOverFolder?.id === item.id }]">
            <div class="file-content">
              <div class="drag-handle">
                <el-icon :size="20" style="cursor: move; color: #9ca3af;">
                  <Rank />
                </el-icon>
              </div>

              <el-icon :size="24" :color="item.type === 'directory' ? '#f59e0b' : '#3b82f6'">
                <Folder v-if="item.type === 'directory'" />
                <Document v-else />
              </el-icon>

              <el-input v-if="editingId === item.id" v-model="editingName" ref="editInput" @blur="confirmRename"
                @keyup.enter="confirmRename" @keyup.esc="editingId = null" size="small" class="rename-input" />
              <span v-else class="file-name">{{ item.name }}</span>

            </div>


          </div>
        </VueDraggable>
      </div>

      <!-- 平铺模式 -->
      <div v-else class="grid-view" @contextmenu.prevent="handleEmptyContextMenu">
        <VueDraggable v-model="directoryFiles.sub" ghostClass="ghost" class="grid-container" :animation="300"
          @start="onDragStart" @end="onDragEnd" @update="onDragChange">
          <div v-for="item in directoryFiles.sub" :key="item.id" @contextmenu.prevent="handleContextMenu($event, item)"
            @dblclick="handleOpen(item)" :class="['grid-item', { 'drag-over-folder': dragOverFolder?.id === item.id }]">
            <div class="grid-drag-handle">
              <el-icon :size="16" style="cursor: move; color: #9ca3af;">
                <Rank />
              </el-icon>
            </div>

            <div class="grid-icon">
              <el-icon :size="64" :color="item.type === 'directory' ? '#f59e0b' : '#3b82f6'">
                <Folder v-if="item.type === 'directory'" />
                <Document v-else />
              </el-icon>
            </div>

            <el-input v-if="editingId === item.id" v-model="editingName" ref="editInput" @blur="confirmRename"
              @keyup.enter="confirmRename" @keyup.esc="editingId = null" size="small" class="grid-rename-input" />
            <div v-else class="grid-name">{{ item.name }}</div>
          </div>
        </VueDraggable>
      </div>
    </div>


    <!-- 右键菜单 -->
    <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop>
      <!-- 空白区域右键菜单 -->
      <template v-if="!contextMenu.item">
        <div class="menu-item" :class="{ disabled: !clipboard }" @click="handlePaste">
          <el-icon>
            <DocumentCopy />
          </el-icon>
          <span>粘贴</span>
        </div>
        <div class="menu-item" @click="handleCreateFolder">
          <el-icon>
            <FolderAdd />
          </el-icon>
          <span>新建文件夹</span>
        </div>
        <div class="menu-item" @click="handleCreateFolder">
          <el-icon>
            <FolderAdd />
          </el-icon>
          <span>上传文件</span>
        </div>
      </template>

      <!-- 文件/文件夹右键菜单 -->
      <template v-else>
        <div class="menu-item" @click="handleOpen(contextMenu.item)">
          <el-icon>
            <View />
          </el-icon>
          <span>打开</span>
        </div>
        <div class="menu-item" @click="handleRename(contextMenu.item)">
          <el-icon>
            <Edit />
          </el-icon>
          <span>重命名</span>
        </div>
        <div class="menu-item" @click="handleSetSortOrder(contextMenu.item)">
          <el-icon>
            <Sort />
          </el-icon>
          <span>设置排序号</span>
        </div>
        <el-divider style="margin: 4px 0" />
        <div class="menu-item" @click="handleCopy(contextMenu.item)">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span>复制</span>
        </div>
        <div class="menu-item" @click="handleCut(contextMenu.item)">
          <el-icon>
            <Scissor />
          </el-icon> <span>剪切</span>
        </div>
        <div class="menu-item" :class="{ disabled: !clipboard }" @click="handlePaste">
          <el-icon>
            <DocumentCopy />
          </el-icon>
          <span>粘贴</span>
        </div>
        <div class="menu-item" @click="handleCreateFolder">
          <el-icon>
            <FolderAdd />
          </el-icon>
          <span>新建文件夹</span>
        </div>
        <el-divider style="margin: 4px 0" />
        <div class="menu-item danger" @click="handleDelete(contextMenu.item)">
          <el-icon>
            <Delete />
          </el-icon>
          <span>删除</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import {
  Folder,
  Scissor,
  Document,
  MoreFilled,
  FolderAdd,
  Edit,
  Delete,
  View,
  CopyDocument,
  DocumentCopy,
  Sort,
  HomeFilled,
  Rank
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { directoryInfo } from "@/api/fileManager/file";
// 当前路径 - 用于面包屑导航
const currentPath = ref([]);
const { send: getDirectoryFiles, data: directoryFiles, onSuccess } = useRequest(directoryInfo);


onSuccess((data) => {
  const newItem = { id: data.data.id, name: data.data.name }

  const existingIndex = currentPath.value.findIndex(
    (item) => item.id === newItem.id
  )

  if (existingIndex === -1) {
    // 不存在 => 前进（push）
    currentPath.value.push(newItem)
  } else {
    // 已存在 => 回退（截断到当前位置）
    currentPath.value = currentPath.value.slice(0, existingIndex + 1)
  }
})
const viewMode = ref('list');



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
const files = ref([...allFiles.value['/']]);

const contextMenu = ref({ show: false, x: 0, y: 0, item: null });
const editingId = ref(null);
const editingName = ref('');
const clipboard = ref(null);
const editInput = ref(null);
const draggedItem = ref(null);  // 当前拖拽的项
const dragOverFolder = ref(null);  // 鼠标悬停的文件夹
const dragEnterTimer = ref(null);  // 延迟进入文件夹的定时器

// 监听文件列表变化，更新排序号
watch(files, (newFiles) => {
  newFiles.forEach((file, index) => {
    file.sortOrder = index + 1;
  });
}, { deep: true });

// 获取当前路径字符串
const getCurrentPathString = () => {
  if (currentPath.value.length === 0) return '/';
  return '/' + currentPath.value.map(p => p.name).join('/');
};

// 导航到指定路径
const navigateToPath = (index) => {
  const currentNode = currentPath.value[index]
  // TODO: 调用API加载对应路径的文件
  getDirectoryFiles(currentNode.id)
};

const closeContextMenu = () => {
  contextMenu.value = { show: false, x: 0, y: 0, item: null };
};

// 空白区域右键菜单
const handleEmptyContextMenu = (e) => {
  // 检查是否点击在文件项上
  const target = e.target;
  const isFileItem = target.closest('.file-item') || target.closest('.grid-item');

  if (!isFileItem) {
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY,
      item: null  // null 表示空白区域
    };
  }
};

const handleContextMenu = (e, item) => {
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    item: item
  };
};

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
    const item = files.value.find(f => f.id === editingId.value);
    if (item) {
      item.name = editingName.value;
    }
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
  if (item.type === 'directory') {
    // 进入文件夹
    getDirectoryFiles(item.id)


    // TODO: 调用API加载文件夹内容
    console.log('打开文件夹:', item);
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
      const newOrder = parseInt(value);
      const currentIndex = files.value.findIndex(f => f.id === item.id);

      if (currentIndex !== -1) {
        // 移除当前项
        const [movedItem] = files.value.splice(currentIndex, 1);
        // 插入到新位置
        files.value.splice(newOrder - 1, 0, movedItem);

        // TODO: 调用设置排序API
        console.log('设置排序:', item.id, value, '路径:', getCurrentPathString());
        ElMessage.success('排序设置成功');
      }
    }
  } catch {
    // 用户取消
  }
  closeContextMenu();
};

// VueDraggable 事件处理
const onDragStart = (evt) => {
  draggedItem.value = files.value[evt.oldIndex];
  console.log('开始拖拽:', draggedItem.value);
};

const onDragEnd = (evt) => {
  console.log('拖拽结束');
  draggedItem.value = null;
  dragOverFolder.value = null;

  // 清除定时器
  if (dragEnterTimer.value) {
    clearTimeout(dragEnterTimer.value);
    dragEnterTimer.value = null;
  }
};

const onDragChange = (evt) => {
  // TODO: 调用保存排序API
  console.log('排序变化:', files.value.map(f => ({ id: f.id, sortOrder: f.sortOrder })));
  ElMessage.success('排序已更新');
};

// 拖拽进入文件夹
const handleDragEnterFolder = (e, item) => {
  if (!draggedItem.value || draggedItem.value.id === item.id || item.type !== 'folder') {
    return;
  }

  e.preventDefault();
  dragOverFolder.value = item;

  // 清除之前的定时器
  if (dragEnterTimer.value) {
    clearTimeout(dragEnterTimer.value);
  }


};

const handleDragLeaveFolder = (e, item) => {
  if (dragOverFolder.value?.id === item.id) {
    dragOverFolder.value = null;
  }

  // 清除定时器
  if (dragEnterTimer.value) {
    clearTimeout(dragEnterTimer.value);
    dragEnterTimer.value = null;
  }
};

const handleDropIntoFolder = (e, item) => {
  e.preventDefault();
  e.stopPropagation();

  // 清除定时器
  if (dragEnterTimer.value) {
    clearTimeout(dragEnterTimer.value);
    dragEnterTimer.value = null;
  }

  if (draggedItem.value && item.type === 'folder' && draggedItem.value.id !== item.id) {
    // TODO: 调用移动到文件夹API
    console.log('移动文件到文件夹:', draggedItem.value, '→', item);

    // 从当前列表移除
    files.value = files.value.filter(f => f.id !== draggedItem.value.id);

    ElMessage.success(`已移动到 ${item.name}`);
  }

  dragOverFolder.value = null;
};
</script>

<style scoped>
.file-manager {
  min-height: 100vh;
  padding: 20px;
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
  background: white;
}

.file-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.file-item.drag-over-folder {
  border-color: #67c23a;
  background: #f0f9ff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

/* VueDraggable 类名 */
.ghost {
  opacity: 0.4;
  background: #f0f9ff;
  border-color: #3b82f6;
}

.chosen {
  opacity: 0.8;
  border-color: #3b82f6;
}

.dragging {
  opacity: 0.5;
  transform: rotate(3deg);
}

.file-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 4px;
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
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  /* transition: all 0.2s ease; */
  background: white;
  position: relative;
}

.grid-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grid-item.drag-over-folder {
  border-color: #67c23a;
  background: #f0f9ff;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(103, 194, 58, 0.3);
}

.grid-drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px;
  cursor: move;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-item:hover .grid-drag-handle {
  opacity: 1;
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

.breadcrumb-home {
  display: flex;

}
</style>