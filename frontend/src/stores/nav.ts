import { defineStore } from 'pinia';
import { markRaw, type Component } from 'vue'; // 引入 markRaw
import router from '@/router';
import type { RouteRecordNormalized } from 'vue-router';
interface MenuItem {
  path: string;
  name: string;
  icon: Component | null;
  sortid: number;
  children: MenuItem[];
}
interface MenuStore {
  menuItems: MenuItem[];
  isCollapse: boolean;
  generateMenuFromRoutes: () => void;
  filterNavRoutes: (
    routes: RouteRecordNormalized[], 
    parentPath?: string
  ) => MenuItem[];
}

export const useMenuStore = defineStore<string, MenuStore>('menu', {
  state: () => ({
    menuItems: [],
    isCollapse: true,
  }),
  actions: {
    generateMenuFromRoutes() {
      const routes = router.getRoutes();
      this.menuItems = this.filterNavRoutes(routes);
    },
    
    filterNavRoutes(routes: any, parentPath = '')  {
      return routes
        .filter((route: any) => route.meta?.nav)
        .sort((a: any, b: any) => a.meta.sortid - b.meta.sortid)
        .map((route: any) => {
          const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
          
          // 关键修改：使用 markRaw 处理图标组件
          return {
            path: fullPath,
            name: route.meta.title || route.name,
            icon: route.meta.icon ? markRaw(route.meta.icon) : null, // 这里添加 markRaw
            sortid: route.meta.sortid,
            children: route.children 
              ? this.filterNavRoutes(route.children, fullPath)
              : [],
          };
        });
    },
  },
  persist: {
    serializer: {
      deserialize: (raw: string) => {
        const data = JSON.parse(raw);
        
        // 显式定义 processItems 的类型
        const processItems = (items: any[]): MenuItem[] => {
          return items.map(item => ({
            path: item.path,
            name: item.name,
            icon: item.icon ? markRaw(item.icon) : null,
            sortid: item.sortid,
            children: item.children ? processItems(item.children) : []
          })) as MenuItem[]; // 类型断言
        };

        return {
          ...data,
          menuItems: processItems(data.menuItems || [])
        };
      }
    }
  }
});