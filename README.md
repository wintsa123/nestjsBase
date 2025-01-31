


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
- **后端**
  - <img src="https://nestjs.com/img/logo-small.svg" width="20" alt="NestJS Logo"> [NestJS 10](https://nestjs.com/)
  - <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="20" alt="PostgreSQL Logo"> [PostgreSQL](https://www.postgresql.org/)
  - <img src="https://www.prisma.io/docs/img/favicon.png" width="20" alt="Prisma Logo"> [Prisma ORM](https://www.prisma.io/)
  - <img src="https://jwt.io/img/pic_logo.svg" width="20" alt="JWT Logo"> [JWT (JSON Web Tokens)](https://jwt.io/) 验证

- **前端**
  - <img src="https://vuejs.org/images/logo.png" width="20" alt="Vue Logo"> [Vue 3](https://vuejs.org/)
  - <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20" alt="TypeScript Logo"> [TypeScript](https://www.typescriptlang.org/)
  - <img src="https://element-plus.org/images/element-plus-logo-small.svg" width="20" alt="Element Plus Logo"> [Element Plus](https://element-plus.org/)
  - <img src="https://alova.js.org/img/favicon.ico" width="20" alt="alovaJs Logo"> [alovaJs v3](https://alova.js.org/)

## 功能特性
- 用户注册与登录与退出
- JWT 验证
- 前后端分离架构
- 使用Prisma ORM进行数据库操作
- 响应式前端设计
- 使用alovaJs v3进行请求管理
- 后端接口统一部署到api文件夹，方便管理，并且使用swagger进行接口文档生成
- 使用该模板可以快速搭建基础后端和前端项目，并且前后端已经适配了用户jwt验证和无感刷新。
- 使用pnpm管理

## 快速开始

### 环境要求
- Node.js (推荐版本 >= 16.x)
- PostgreSQL
- pnpm或者yarn

### 安装步骤
1. **克隆仓库**
- git clone xxx.git && cd ..
- cd backend
- pnpm install

- cd frontend
- pnpm install

2. **配置环境变量**
-  配置数据库
- 复制.env.example文件为.env，并填写你的PostgreSQL数据库连接信息。

3. **运行项目**
-  在backend运行 `npx prisma migrate dev --name init` 命令初始化数据库
-  在backend和frontend目录 运行 `pnpm run dev` 命令启动前后端应用。

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