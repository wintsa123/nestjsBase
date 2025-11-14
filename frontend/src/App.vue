<template>
  <div class="app-container">
    <router-view />
  </div>
  <!-- <Upload></Upload> -->
</template>

<script setup lang="ts">
// No setup needed at this level
</script>

<style>
.app-container {
  width: 100%;
  min-height: 100vh;
}

/* Reset some basic elements */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Global link styles */
a {
  text-decoration: none;
  color: #409EFF;
}

a:hover {
  color: #79bbff;
}
</style>
