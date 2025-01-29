# 电子族谱系统

一个现代化的电子族谱管理系统，基于Vue 3 + NestJS10 + 数据库：PostgreSQL构建。

## 主要功能

1. 用户认证系统
   - 用户注册
   - 用户登录
   - 邀请用户加入族谱

2. 族谱管理
   - 添加/修改家族成员信息
   - 显示成员间的关系连接
   - 显示称谓关系
   - 自定义修改称谓
   - 族谱分为主线和支线展示

3. 通知系统
   - 通过微信/短信/邮箱方式发送通知
   - 喜事/坏事通知，群发通知

4. 社区系统
   - 人生总结和野史功能

5. 族史功能
   - 可以记录某个人对家族的贡献，然后总结出来，做了xx事，家族兴旺，家族衰败xxxxxxxx

6. 与已故之人视频聊天
## 技术栈

- 前端：Vue 3 + TypeScript + Vite
- 后端：NestJS + TypeScript
- 数据库：PostgreSQL
- UI框架：Element Plus

## 项目结构

```
电子族谱/
├── frontend/          # Vue 3 前端项目
└── backend/           # NestJS 后端项目
      └── src/          # 项目源码目录
         └── api/        # API 目录
            └── api.module.ts  # API 模块入口
            └── user   # 用户管理模块
              └── user.module.ts  # 用户管理模块
              └── user.controller.ts # 用户控制器
              └── user.service.ts # 用户服务
            └── tmp-redis# redis模块
              └── tmp-redis.controller.ts # redis控制器
              └── tmp-redis.service.ts # redis服务
              └── tmp-redis.module.ts # redis模块
         └── main.ts    # NestJS 应用入口
         └── app.module.ts # 应用模块
         └── socket # socket模块
         └── plugin # 插件模块
         └── interceptors # 拦截器模块
         └── filters # 过滤器模块
         └── guard # 守卫模块
         └── decorators # 装饰器模块
```