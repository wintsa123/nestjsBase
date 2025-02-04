<template>
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.path"
    >
      <template #title>
        <i :class="item.icon"></i>
        <span>{{ item.name }}</span>
      </template>
      <menu-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
      />
    </el-sub-menu>
    <el-menu-item
      v-else
      :index="item.path"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </el-menu-item>
  </template>
  
  <script setup>
  defineProps({
    item: {
      type: Object,
      required: true,
    },
  });
  </script>