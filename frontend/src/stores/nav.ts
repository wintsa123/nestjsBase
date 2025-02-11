import { defineStore } from 'pinia';
import router  from '@/router'; // 引入路由实例

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuItems: [],
    isCollapse: true,
  }),
  actions: {
    // 解析路由配置，生成菜单数据
    generateMenuFromRoutes() {
      const routes = router.getRoutes(); // 获取所有路由配置
      this.menuItems = this.filterNavRoutes(routes);
      console.log(this.menuItems,'1');
    },
    // 递归过滤出需要显示在导航菜单中的路由
    filterNavRoutes(routes:any, parentPath = '') {
      return routes
        .filter((route:any) => route.meta?.nav) // 过滤出 meta.nav 为 true 的路由
        .sort((a:any, b:any) => a.meta.sortid-b.meta.sortid)
        .map((route:any) => {
          const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
          return {
            path: fullPath,
            name: route.meta.title || route.name,
            icon: route.meta.icon,
            sortid: route.meta.sortid, 
            children: route.children ? this.filterNavRoutes(route.children, fullPath) : [],
          };
        })
    },
   
    persist: true // 可选，使用插件进行持久化

  },
});