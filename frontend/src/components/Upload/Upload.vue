<template>
  <el-dialog
    v-model="visible"
    title="上传文档"
    width="60vw"

    align-center
  >
    <!-- dialog 内容 -->
    <el-upload
    v-model:file-list="fileList"
    class="upload-demo"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
    multiple
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
  >
    <el-button type="primary">点击选择文档</el-button>
   
  </el-upload>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { UploadProps, UploadUserFile } from 'element-plus'

const fileList = ref<UploadUserFile[]>([
 
])

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}



const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  )
}
/** ------------ Emit 定义 ---------------- */
const emit = defineEmits<{
  (e: 'confirm', data?: any): void
}>()

/** ------------ 控制 Dialog ---------------- */
const visible = ref(true)

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

/** ------------ 点击确定 ---------------- */
const handleConfirm = () => {
  emit('confirm', { ok: true }) // 可替换为真实上传结果
  close()
}

/** ------------ 暴露给父组件的方法 ---------------- */
defineExpose({
  open
})
</script>
<style scoped>
/* Bounce Animation */
.dialog-bounce-enter-active,
.dialog-bounce-leave-active,
.dialog-bounce-enter-active .el-dialog,
.dialog-bounce-leave-active .el-dialog {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dialog-bounce-enter-from,
.dialog-bounce-leave-to {
  opacity: 0;
}

.dialog-bounce-enter-from .el-dialog,
.dialog-bounce-leave-to .el-dialog {
  transform: scale(0.3) translateY(-50px);
  opacity: 0;
}

</style>