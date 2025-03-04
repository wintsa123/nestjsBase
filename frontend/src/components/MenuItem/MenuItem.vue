<template>
  <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
    <template #title>
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </template>
    <menu-item v-for="child in item.children" :key="child.path" :item="child" />
  </el-sub-menu>
  <el-menu-item v-else :index="item.path">
    <el-icon>          <component :is="item.icon" v-if="item.icon" />
    </el-icon>
    <span>{{ item.name }}</span>
  </el-menu-item>
</template>

<script setup>
import { markRaw } from 'vue';

defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>