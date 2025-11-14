<template>
   <Upload ref="uploadRef" @confirm="handleUploadConfirm"></Upload>
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
    <div v-if="directoryFiles && directoryFiles.sub.length > 0" @contextmenu.prevent="handleEmptyContextMenu">
      <div v-if="viewMode === 'list'" class="list-view">
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
      <div v-else class="grid-view">
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

    <el-dropdown ref="dropdownRef" :virtual-ref="triggerRef" :show-arrow="false" :popper-options="{
      modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
    }" virtual-triggering trigger="contextmenu" placement="bottom-start">
      <template #dropdown v-if="!contextMenu.item">
        <el-dropdown-menu>
          <el-dropdown-item :icon="DocumentCopy" :disabled="!clipboard" @click="handlePaste">粘贴</el-dropdown-item>
          <el-dropdown-item :icon="FolderAdd" @click="handleCreateFolder"> 新建文件夹 </el-dropdown-item>
          <el-dropdown-item :icon="FolderAdd" @click="uploadRef.open()">上传文档</el-dropdown-item>

        </el-dropdown-menu>

      </template>
      <template #dropdown v-else>
        <el-dropdown-menu>
          <el-dropdown-item :icon="View" @click="handleOpen(contextMenu.item)">打开</el-dropdown-item>
          <el-dropdown-item :icon="Edit" @click="handleRename(contextMenu.item)"> 重命名 </el-dropdown-item>
          <el-dropdown-item :icon="Sort" @click="handleSetSortOrder(contextMenu.item)">设置排序号</el-dropdown-item>
          <el-dropdown-item :icon="CopyDocument" @click="handleCopy(contextMenu.item)">复制</el-dropdown-item>
          <el-dropdown-item :icon="Scissor" @click="handleCut(contextMenu.item)">剪切</el-dropdown-item>
          <el-dropdown-item :icon="DocumentCopy" :disabled="!clipboard" @click="handlePaste">粘贴</el-dropdown-item>
          <el-dropdown-item :icon="FolderAdd" @click="handleCreateFolder"> 新建文件夹 </el-dropdown-item>
          <el-dropdown-item :icon="Delete" @click="handleDelete(contextMenu.item)">删除</el-dropdown-item>
        </el-dropdown-menu>

      </template>
    </el-dropdown>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
const dropdownRef = ref()
const dialogFormVisible = ref(false)
const uploadRef = ref()
const handleUploadConfirm = (data) => {
 getDirectoryFiles(currentPath[currentPath.length-1].id)
}
const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
})

const triggerRef = ref({
  getBoundingClientRect: () => position.value,
})
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
import { directoryInfo, newDirectory, deleteDirectory } from "@/api/fileManager/file";
import Upload from '@/components/Upload/Upload.vue';
// 当前路径 - 用于面包屑导航
const currentPath = ref([]);
const { send: getDirectoryFiles, data: directoryFiles, onSuccess: getDirectoryFilesSuccess } = useRequest(directoryInfo);
const { send: senddeleteDirectory, onSuccess: deleteDirectorySuccess } = useRequest(deleteDirectory, { immediate: false });

deleteDirectorySuccess((data) => {
  directoryFiles.value.sub = directoryFiles.value.sub.filter((item) => item.id !== data.args[0])

  ElMessage.success(`删除成功,一共删除${data.data.deletedDirectories}个文件夹，${data.data.deletedFiles}个文件`);
})
getDirectoryFilesSuccess((data) => {
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




const editingId = ref(null);
const editingName = ref('');
const clipboard = ref(null);
const editInput = ref(null);
const draggedItem = ref(null);  // 当前拖拽的项
const dragOverFolder = ref(null);  // 鼠标悬停的文件夹
const dragEnterTimer = ref(null);  // 延迟进入文件夹的定时器



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
  dropdownRef.value?.handleClose()
};


const contextMenu = ref({
  item: null,
})
const handleEmptyContextMenu = (e) => {
  // 检查是否点击在文件项上
  const target = e.target;
  const isFileItem = target.closest('.file-item') || target.closest('.grid-item');

  if (!isFileItem) {
    const { clientX, clientY } = e
    position.value = DOMRect.fromRect({
      x: clientX,
      y: clientY,
    })
    contextMenu.value = { item: false }

    dropdownRef.value?.handleOpen()

  };
}

const handleContextMenu = (e, item) => {
  const { clientX, clientY } = event
  position.value = DOMRect.fromRect({
    x: clientX,
    y: clientY,
  })
  event.preventDefault()
  contextMenu.value = { item }
  dropdownRef.value?.handleOpen()
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
   
    ElMessage.success('重命名成功');
  }
  editingId.value = null;
};

const handleDelete = async (item) => {
  try {
    closeContextMenu();

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
    await senddeleteDirectory(item.id)

  } catch {
    // 用户取消
  }
};
const { data: createFolder, send: sendCreateFolder, onSuccess: createFolderSuccess } = useRequest(newDirectory, {
  immediate: false
})
createFolderSuccess((data) => {
  const { data: data1 } = data
  directoryFiles.value.sub.unshift({ id: data1.id, name: data1.name, type: 'directory' });
})

const handleCreateFolder = async () => {
  try {
    const { value } = await ElMessageBox.prompt('来取个什么名字吧？', '新建文件夹', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',

    })

    const data = await sendCreateFolder({
      directoryId: currentPath.value[currentPath.value.length - 1].id,
      directoryName: value
    })


  } catch (error) {
    console.log(error)
  }
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
    

      // if (currentIndex !== -1) {
      //   // 移除当前项
      //   const [movedItem] = files.value.splice(currentIndex, 1);
      //   // 插入到新位置
      //   files.value.splice(newOrder - 1, 0, movedItem);

      //   // TODO: 调用设置排序API
      //   console.log('设置排序:', item.id, value, '路径:', getCurrentPathString());
      //   ElMessage.success('排序设置成功');
      // }
    }
  } catch {
    // 用户取消
  }
  closeContextMenu();
};

// VueDraggable 事件处理
const onDragStart = (evt) => {
  draggedItem.value = directoryFiles.value.sub[evt.oldIndex];
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
  min-height: 65vh;
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