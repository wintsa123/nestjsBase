import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './assets/style.css'

const app = createApp(App)

// Register Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
   .use(router)
   .use(ElementPlus)
   .mount('#app')
