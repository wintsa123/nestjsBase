# 电子族谱系统

一个现代化的电子族谱管理系统，基于Vue 3 + NestJS + 数据库：PostgreSQL构建。

## 主要功能

1. 用户认证系统
   - 用户注册
   - 用户登录

2. 族谱管理
   - 添加/修改家族成员信息
   - 显示成员间的关系连接
   - 显示称谓关系
   - 自定义修改称谓

3. 邀请系统
   - 发送族谱加入邀请
   - 邀请管理

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